import { supabase } from '@/lib/supabase'

export type WebhookEvent = 'doacao_recebida' | 'doacao_entregue'

export function dispatchWebhook(
  event: WebhookEvent,
  payload: Record<string, unknown>,
): void {
  _dispatch(event, payload).catch((err) =>
    console.error('dispatchWebhook error:', err),
  )
}

async function _dispatch(
  event: WebhookEvent,
  payload: Record<string, unknown>,
) {
  const { data: configs, error } = await supabase
    .from('webhook_configs')
    .select('*')
    .eq('event_type', event)
    .eq('active', true)

  if (error || !configs || configs.length === 0) return

  const webhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data: payload,
  }

  const promises = configs.map((config) => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    return fetch(config.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookPayload),
      signal: controller.signal,
    })
      .catch((err) =>
        console.error(`Webhook to ${config.url} failed:`, err),
      )
      .finally(() => clearTimeout(timeout))
  })

  await Promise.allSettled(promises)
}
