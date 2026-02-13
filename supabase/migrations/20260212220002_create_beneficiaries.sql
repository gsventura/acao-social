CREATE TABLE public.beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type public.beneficiary_type NOT NULL,
  document TEXT,
  address TEXT,
  contact_info TEXT,
  responsible_person TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;

-- All authenticated can view beneficiaries
CREATE POLICY "Authenticated users can view beneficiaries"
  ON public.beneficiaries FOR SELECT
  TO authenticated
  USING (true);

-- All authenticated can insert beneficiaries
CREATE POLICY "Authenticated users can insert beneficiaries"
  ON public.beneficiaries FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only admins can update beneficiaries
CREATE POLICY "Admins can update beneficiaries"
  ON public.beneficiaries FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- Only admins can delete beneficiaries
CREATE POLICY "Admins can delete beneficiaries"
  ON public.beneficiaries FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Function that masks sensitive fields for non-admins
CREATE OR REPLACE FUNCTION public.get_beneficiaries()
RETURNS SETOF public.beneficiaries AS $$
BEGIN
  IF public.is_admin() THEN
    RETURN QUERY SELECT * FROM public.beneficiaries;
  ELSE
    RETURN QUERY
      SELECT id, name, type, NULL::TEXT AS document, NULL::TEXT AS address,
             NULL::TEXT AS contact_info, responsible_person, active, created_at
      FROM public.beneficiaries;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
