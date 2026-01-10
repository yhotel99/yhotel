set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.count_bookings_json(p_search text DEFAULT NULL::text, p_customer_id uuid DEFAULT NULL::uuid)
 RETURNS bigint
 LANGUAGE sql
 STABLE
AS $function$
  select count(*)
  from bookings b
  left join customers c on c.id = b.customer_id and c.deleted_at is null
  left join rooms r on r.id = b.room_id and r.deleted_at is null
  where b.deleted_at is null
    and (p_customer_id is null or b.customer_id = p_customer_id)
    and (
      p_search is null
      or trim(p_search) = ''
      or c.full_name ilike '%'||trim(p_search)||'%'
      or r.name ilike '%'||trim(p_search)||'%'
      or b.notes ilike '%'||trim(p_search)||'%'
    );
$function$
;

CREATE OR REPLACE FUNCTION public.search_bookings_json(p_search text DEFAULT NULL::text, p_page integer DEFAULT 1, p_limit integer DEFAULT 10, p_customer_id uuid DEFAULT NULL::uuid)
 RETURNS SETOF jsonb
 LANGUAGE sql
 STABLE
AS $function$
  select 
    to_jsonb(b) ||
    jsonb_build_object(
      'customers', jsonb_build_object(
        'full_name', c.full_name,
        'phone', c.phone
      ),
      'rooms', jsonb_build_object(
        'name', r.name
      )
    ) as data
  from bookings b
  left join customers c on c.id = b.customer_id and c.deleted_at is null
  left join rooms r on r.id = b.room_id and r.deleted_at is null
  where b.deleted_at is null
    and (p_customer_id is null or b.customer_id = p_customer_id)
    and (
      p_search is null
      or trim(p_search) = ''
      or c.full_name ilike '%'||trim(p_search)||'%'
      or r.name ilike '%'||trim(p_search)||'%'
      or b.notes ilike '%'||trim(p_search)||'%'
    )
  order by b.created_at desc
  offset (p_page - 1) * p_limit
  limit p_limit;
$function$
;


