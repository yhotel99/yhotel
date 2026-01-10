create sequence "public"."booking_code_seq";

drop function if exists "public"."create_booking_secure"(p_customer_id uuid, p_room_id uuid, p_check_in timestamp with time zone, p_check_out timestamp with time zone, p_number_of_nights integer, p_total_amount numeric, p_total_guests integer, p_notes text, p_advance_payment numeric);

drop function if exists "public"."search_payments"(p_search text, p_page integer, p_limit integer, p_customer_id uuid, p_booking_id uuid);

alter table "public"."bookings" add column "booking_code" text;

alter table "public"."payments" alter column "payment_method" drop default;

alter table "public"."payments" alter column "payment_method" set data type text using "payment_method"::text;

CREATE UNIQUE INDEX bookings_booking_code_key ON public.bookings USING btree (booking_code);

alter table "public"."bookings" add constraint "bookings_booking_code_key" UNIQUE using index "bookings_booking_code_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_booking_secure(p_customer_id uuid, p_room_id uuid, p_check_in timestamp with time zone, p_check_out timestamp with time zone, p_number_of_nights integer, p_total_amount numeric, p_payment_method text, p_total_guests integer DEFAULT 1, p_notes text DEFAULT NULL::text, p_advance_payment numeric DEFAULT 0)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
declare
  v_booking_id uuid;
  v_room_charge numeric;
  v_booking_code text;
begin
  -- Validate input
  if p_number_of_nights <= 0 then
    raise exception 'number_of_nights must be greater than 0';
  end if;

  if p_check_out <= p_check_in then
    raise exception 'check_out must be later than check_in';
  end if;

  if p_total_amount < 0 or p_advance_payment < 0 then
    raise exception 'amount must be >= 0';
  end if;

  if p_advance_payment > p_total_amount then
    raise exception 'advance_payment cannot exceed total_amount';
  end if;

  -- Check phòng trùng
  perform 1
  from bookings
  where room_id = p_room_id
    and status in ('pending','awaiting_payment','confirmed','checked_in')
    and check_in < p_check_out
    and check_out > p_check_in
  for update;

  if found then
    raise exception 'Room is not available for the selected date/time';
  end if;

  -- Generate booking_code (YH20251230000001)
  v_booking_code :=
    'YH' ||
    to_char(now(), 'YYYYMMDD') ||
    lpad(nextval('booking_code_seq')::text, 6, '0');

  -- Insert booking
  insert into bookings (
    customer_id,
    room_id,
    check_in,
    check_out,
    number_of_nights,
    total_guests,
    status,
    notes,
    total_amount,
    advance_payment,
    booking_code,
    created_at
  )
  values (
    p_customer_id,
    p_room_id,
    p_check_in,
    p_check_out,
    p_number_of_nights,
    p_total_guests,
    'pending',
    p_notes,
    p_total_amount,
    p_advance_payment,
    v_booking_code,
    now()
  )
  returning id into v_booking_id;

  -- Advance payment
  if coalesce(p_advance_payment, 0) > 0 then
    insert into payments (
      booking_id,
      amount,
      payment_type,
      payment_method,
      payment_status,
      created_at
    )
    values (
      v_booking_id,
      p_advance_payment,
      'advance_payment',
      p_payment_method,
      'pending',
      now()
    );
  end if;

  -- Room charge
  v_room_charge := p_total_amount - coalesce(p_advance_payment, 0);

  if v_room_charge > 0 then
    insert into payments (
      booking_id,
      amount,
      payment_type,
      payment_method,
      payment_status,
      created_at
    )
    values (
      v_booking_id,
      v_room_charge,
      'room_charge',
      p_payment_method,
      'pending',
      now()
    );
  end if;

  return v_booking_id;

exception
  when others then
    raise exception 'CREATE_BOOKING_FAILED: %', sqlerrm;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.search_payments(p_search text DEFAULT NULL::text, p_page integer DEFAULT 1, p_limit integer DEFAULT 10, p_customer_id uuid DEFAULT NULL::uuid, p_booking_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id uuid, booking_id uuid, amount numeric, payment_method text, payment_status public.payment_status_enum, paid_at timestamp with time zone, verified_at timestamp with time zone, refunded_at timestamp with time zone, created_at timestamp with time zone, updated_at timestamp with time zone, payment_type text, customers jsonb, rooms jsonb)
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
  search_pattern TEXT;
BEGIN
  IF p_search IS NOT NULL AND trim(p_search) <> '' THEN
    search_pattern := '%' || trim(p_search) || '%';
  ELSE
    search_pattern := NULL;
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.booking_id,
    p.amount,
    p.payment_method::text,   -- ⭐ quan trọng
    p.payment_status,
    p.paid_at,
    p.verified_at,
    p.refunded_at,
    p.created_at,
    p.updated_at,
    p.payment_type,

    jsonb_build_object(
      'full_name', c.full_name,
      'phone', c.phone
    ) AS customers,

    jsonb_build_object(
      'name', r.name
    ) AS rooms

  FROM payments p
  LEFT JOIN bookings b ON b.id = p.booking_id AND b.deleted_at IS NULL
  LEFT JOIN customers c ON c.id = b.customer_id AND c.deleted_at IS NULL
  LEFT JOIN rooms r ON r.id = b.room_id AND r.deleted_at IS NULL

  WHERE
    (p_customer_id IS NULL OR b.customer_id = p_customer_id)
    AND (p_booking_id IS NULL OR p.booking_id = p_booking_id)
    AND (
      search_pattern IS NULL
      OR p.id::text ILIKE search_pattern
      OR p.booking_id::text ILIKE search_pattern
      OR c.full_name ILIKE search_pattern
      OR r.name ILIKE search_pattern
    )

  ORDER BY p.created_at DESC
  OFFSET (p_page - 1) * p_limit
  LIMIT p_limit;
END;
$function$
;


