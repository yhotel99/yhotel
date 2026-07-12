-- System confirm (webhook/cron) without branch access check.
-- Skip auto-cancel when bank payment was already received (payment_logs).

SET search_path = public;

CREATE OR REPLACE FUNCTION public.booking_has_received_payment(p_booking_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.payment_logs pl
    WHERE pl.booking_id = p_booking_id
      AND (
        pl.status IN ('confirmed', 'success', 'processing')
        OR (pl.status = 'error' AND pl.reason = 'Confirmation failed')
      )
  );
$$;

REVOKE ALL ON FUNCTION public.booking_has_received_payment(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.booking_has_received_payment(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.booking_has_received_payment(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.booking_has_received_payment(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.confirm_booking_system(p_booking_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM 1
  FROM public.bookings
  WHERE id = p_booking_id
    AND deleted_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.bookings
    WHERE id = p_booking_id
      AND status IN (
        'pending'::public.booking_status,
        'awaiting_payment'::public.booking_status
      )
  ) THEN
    RAISE EXCEPTION 'Booking cannot be confirmed in current status';
  END IF;

  UPDATE public.bookings
  SET status = 'confirmed'::public.booking_status
  WHERE id = p_booking_id;

  UPDATE public.payments
  SET payment_status = 'paid'::public.payment_status_enum,
      paid_at = now()
  WHERE booking_id = p_booking_id
    AND payment_status = 'pending'::public.payment_status_enum;

  -- reporting_status exists on production payments table
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'payments'
      AND column_name = 'reporting_status'
  ) THEN
    UPDATE public.payments
    SET reporting_status = 'included'
    WHERE booking_id = p_booking_id
      AND payment_status = 'paid'::public.payment_status_enum;
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'CONFIRM_BOOKING_SYSTEM_FAILED: %', SQLERRM;
END;
$$;

REVOKE ALL ON FUNCTION public.confirm_booking_system(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.confirm_booking_system(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.confirm_booking_system(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.confirm_booking_system(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.cancel_booking_system(p_booking_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.booking_has_received_payment(p_booking_id) THEN
    RAISE EXCEPTION 'BOOKING_HAS_RECEIVED_PAYMENT';
  END IF;

  PERFORM 1
  FROM public.bookings
  WHERE id = p_booking_id
    AND status = 'pending'::public.booking_status
    AND deleted_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'BOOKING_NOT_CANCELLABLE';
  END IF;

  UPDATE public.bookings
  SET status = 'cancelled'::public.booking_status
  WHERE id = p_booking_id;

  UPDATE public.payments
  SET payment_status = 'cancelled'::public.payment_status_enum
  WHERE booking_id = p_booking_id
    AND payment_status = 'pending'::public.payment_status_enum;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'CANCEL_BOOKING_SYSTEM_FAILED: %', SQLERRM;
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_expired_pending_bookings()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking_id uuid;
  v_count integer := 0;
BEGIN
  FOR v_booking_id IN
    SELECT b.id
    FROM public.bookings b
    WHERE b.status = 'pending'::public.booking_status
      AND b.deleted_at IS NULL
      AND b.created_by IS NULL
      AND b.payment_expires_at IS NOT NULL
      AND b.payment_expires_at <= now()
      AND NOT public.booking_has_received_payment(b.id)
      AND EXISTS (
        SELECT 1
        FROM public.payments p
        WHERE p.booking_id = b.id
          AND p.payment_method IN ('bank_transfer', 'onepay')
          AND p.payment_status = 'pending'::public.payment_status_enum
      )
    FOR UPDATE SKIP LOCKED
  LOOP
    PERFORM public.cancel_booking_system(v_booking_id);
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.cancel_expired_pending_bookings() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cancel_expired_pending_bookings() TO service_role;
