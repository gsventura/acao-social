CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name TEXT NOT NULL,
  category public.item_category NOT NULL,
  quantity NUMERIC NOT NULL CHECK (quantity >= 0),
  donor_name TEXT,
  received_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  photo_url TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- All authenticated can view inventory
CREATE POLICY "Authenticated users can view inventory"
  ON public.inventory_items FOR SELECT
  TO authenticated
  USING (true);

-- All authenticated can insert inventory items
CREATE POLICY "Authenticated users can insert inventory items"
  ON public.inventory_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Only admins can update inventory items
CREATE POLICY "Admins can update inventory items"
  ON public.inventory_items FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- Only admins can delete inventory items
CREATE POLICY "Admins can delete inventory items"
  ON public.inventory_items FOR DELETE
  TO authenticated
  USING (public.is_admin());
