-- Traduzir enums e valores para português

-- item_category
ALTER TYPE public.item_category RENAME VALUE 'food' TO 'alimento';
ALTER TYPE public.item_category RENAME VALUE 'clothing' TO 'roupa';
ALTER TYPE public.item_category RENAME VALUE 'furniture' TO 'movel';
ALTER TYPE public.item_category RENAME VALUE 'financial' TO 'financeiro';

-- beneficiary_type
ALTER TYPE public.beneficiary_type RENAME VALUE 'family' TO 'familia';
ALTER TYPE public.beneficiary_type RENAME VALUE 'org' TO 'organizacao';

-- webhook event_type (TEXT com CHECK constraint)
-- Precisa dropar o constraint ANTES de atualizar os dados
ALTER TABLE public.webhook_configs DROP CONSTRAINT IF EXISTS webhook_configs_event_type_check;

UPDATE public.webhook_configs SET event_type = 'doacao_recebida' WHERE event_type = 'donation_received';
UPDATE public.webhook_configs SET event_type = 'doacao_entregue' WHERE event_type = 'donation_delivered';

ALTER TABLE public.webhook_configs ADD CONSTRAINT webhook_configs_event_type_check
  CHECK (event_type IN ('doacao_recebida', 'doacao_entregue'));
