-- Permitir que qualquer usuario autenticado leia webhook_configs
-- para que o dispatch funcione independente de quem disparou o evento
CREATE POLICY "Authenticated users can read webhook configs"
  ON public.webhook_configs FOR SELECT
  TO authenticated
  USING (true);
