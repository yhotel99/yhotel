drop function if exists "public"."count_payments"(p_search text, p_customer_id uuid);

drop function if exists "public"."search_payments"(p_search text, p_page integer, p_limit integer, p_customer_id uuid);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.count_payments(p_search text DEFAULT NULL::text, p_customer_id uuid DEFAULT NULL::uuid, p_booking_id uuid DEFAULT NULL::uuid)
 RETURNS bigint
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
  search_pattern TEXT;
  total_count BIGINT;
BEGIN
  IF p_search IS NOT NULL AND trim(p_search) <> '' THEN
    search_pattern := '%' || trim(p_search) || '%';
  ELSE
    search_pattern := NULL;
  END IF;

  SELECT COUNT(*)
  INTO total_count
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
    );

  RETURN total_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.search_payments(p_search text DEFAULT NULL::text, p_page integer DEFAULT 1, p_limit integer DEFAULT 10, p_customer_id uuid DEFAULT NULL::uuid, p_booking_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id uuid, booking_id uuid, amount numeric, payment_method public.payment_method_enum, payment_status public.payment_status_enum, paid_at timestamp with time zone, verified_at timestamp with time zone, refunded_at timestamp with time zone, created_at timestamp with time zone, updated_at timestamp with time zone, payment_type text, customers jsonb, rooms jsonb)
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
    p.payment_method,
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

CREATE OR REPLACE FUNCTION public.update_refund_request_status(p_refund_request_id uuid, p_status text, p_user_id uuid)
 RETURNS public.refund_requests
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  v_refund refund_requests;
begin
  -- 1. Lock refund request
  select *
  into v_refund
  from refund_requests
  where id = p_refund_request_id
  for update;

  if not found then
    raise exception 'Refund request không tồn tại';
  end if;

  -- 2. Validate state machine
  if p_status = 'approved' and v_refund.status <> 'pending' then
    raise exception 'Chỉ approve refund ở trạng thái pending';
  end if;

  if p_status = 'refunded' and v_refund.status <> 'approved' then
    raise exception 'Refund phải được approve trước';
  end if;

  if p_status = 'rejected' and v_refund.status <> 'pending' then
    raise exception 'Chỉ reject refund ở trạng thái pending';
  end if;

  -- 3. Update refund request
  update refund_requests
  set
    status = p_status,
    approved_by = case
      when p_status = 'approved' then p_user_id
      else approved_by
    end,
    refunded_by = case
      when p_status = 'refunded' then p_user_id
      else refunded_by
    end,
    updated_at = now()
  where id = p_refund_request_id
  returning * into v_refund;

  return v_refund;
end;
$function$
;


