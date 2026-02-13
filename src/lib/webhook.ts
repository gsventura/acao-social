import { supabase } from '@/lib/supabase'

export type WebhookEvent = 'donation_received' | 'donation_delivered'

export async function dispatchWebhook(
  event: WebhookEvent,
  payload: Record<string, unknown>,
) {
  const { data: configs } = await supabase
    .from('webhook_configs')
    .select('*')
    .eq('event_type', event)
    .eq('active', true)

  if (!configs || configs.length === 0) return

  const webhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data: payload,
  }

  const promises = configs.map((config) =>
    fetch(config.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookPayload),
    }).catch((err) =>
      console.error(`Webhook to ${config.url} failed:`, err),
    ),
  )

  await Promise.allSettled(promises)
}
