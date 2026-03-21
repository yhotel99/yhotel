-- RLS for vouchers: anon read (for public site validate), authenticated writes

SET search_path = public;

ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view vouchers" ON public.vouchers;
DROP POLICY IF EXISTS "Authenticated can view vouchers" ON public.vouchers;
DROP POLICY IF EXISTS "Authenticated can insert vouchers" ON public.vouchers;
DROP POLICY IF EXISTS "Authenticated can update vouchers" ON public.vouchers;
DROP POLICY IF EXISTS "Authenticated can delete vouchers" ON public.vouchers;
DROP POLICY IF EXISTS "Admin/Manager can insert vouchers" ON public.vouchers;
DROP POLICY IF EXISTS "Admin/Manager can update vouchers" ON public.vouchers;
DROP POLICY IF EXISTS "Admin/Manager can delete vouchers" ON public.vouchers;

CREATE POLICY "Public can view vouchers"
  ON public.vouchers
  FOR SELECT
  TO anon
  USING (deleted_at IS NULL);

CREATE POLICY "Authenticated can view vouchers"
  ON public.vouchers
  FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "Authenticated can insert vouchers"
  ON public.vouchers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update vouchers"
  ON public.vouchers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete vouchers"
  ON public.vouchers
  FOR DELETE
  TO authenticated
  USING (true);
