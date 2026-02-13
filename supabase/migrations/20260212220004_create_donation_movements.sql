CREATE TABLE public.donation_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id UUID NOT NULL REFERENCES public.beneficiaries(id),
  items_json JSONB NOT NULL,
  delivered_at DATE NOT NULL DEFAULT CURRENT_DATE,
  evidence_photo_url TEXT,
  delivered_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.donation_movements ENABLE ROW LEVEL SECURITY;

-- All authenticated can view movements
CREATE POLICY "Authenticated users can view movements"
  ON public.donation_movements FOR SELECT
  TO authenticated
  USING (true);

-- All authenticated can insert movements
CREATE POLICY "Authenticated users can insert movements"
  ON public.donation_movements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = delivered_by);

-- Only admins can update movements
CREATE POLICY "Admins can update movements"
  ON public.donation_movements FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- Only admins can delete movements
CREATE POLICY "Admins can delete movements"
  ON public.donation_movements FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Trigger to decrease inventory on donation movement
CREATE OR REPLACE FUNCTION public.process_donation_movement()
RETURNS TRIGGER AS $$
DECLARE
  item JSONB;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(NEW.items_json)
  LOOP
    UPDATE public.inventory_items
    SET quantity = quantity - (item->>'quantity')::NUMERIC
    WHERE id = (item->>'inventory_item_id')::UUID;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_donation_movement_created
  AFTER INSERT ON public.donation_movements
  FOR EACH ROW EXECUTE FUNCTION public.process_donation_movement();
