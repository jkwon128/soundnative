import { jsonResponse, type PolarEnv } from './_polar'
import { supabaseAdminFetch, type SupabaseEnv } from './_supabase'

// Polar signs webhooks per the Standard Webhooks spec (the same scheme Svix
// uses): HMAC-SHA256 over `${id}.${timestamp}.${body}`, keyed by the base64
// payload of the `whsec_...` secret, compared against the space-delimited
// `v1,<sig>` values in the `webhook-signature` header.
const TIMESTAMP_TOLERANCE_SECONDS = 5 * 60

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function bytesToBase64(bytes: ArrayBuffer): string {
  let binary = ''
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function constantTimeEqual(a: string, b: string): boolean {
  const maxLength = Math.max(a.length, b.length)
  let mismatch = a.length === b.length ? 0 : 1
  for (let i = 0; i < maxLength; i++) {
    mismatch |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0)
  }
  return mismatch === 0
}

async function verifySignature(
  secret: string,
  id: string,
  timestamp: string,
  body: string,
  signatureHeader: string,
): Promise<boolean> {
  const timestampSeconds = Number(timestamp)
  if (!Number.isFinite(timestampSeconds)) return false
  const ageSeconds = Math.abs(Date.now() / 1000 - timestampSeconds)
  if (ageSeconds > TIMESTAMP_TOLERANCE_SECONDS) return false

  const secretBytes = base64ToBytes(secret.replace(/^whsec_/, ''))
  const key = await crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${id}.${timestamp}.${body}`),
  )
  const expected = bytesToBase64(signature)

  return signatureHeader
    .split(' ')
    .map((part) => part.split(',')[1])
    .filter((sig): sig is string => Boolean(sig))
    .some((sig) => constantTimeEqual(sig, expected))
}

// Subset of Polar's Subscription object that we actually persist. Fields
// are read defensively (optional chaining, no throws on a missing one)
// since this is an external API's webhook payload, not a type we control.
interface PolarSubscriptionPayload {
  id?: string
  status?: string
  customer_id?: string
  customer?: { id?: string; external_id?: string | null }
  current_period_end?: string | null
  trial_end?: string | null
  cancel_at_period_end?: boolean
}

const SUBSCRIPTION_EVENT_TYPES = new Set([
  'subscription.created',
  'subscription.updated',
  'subscription.active',
  'subscription.canceled',
  'subscription.uncanceled',
  'subscription.past_due',
  'subscription.revoked',
])

// Writes the subscription's current state to `subscriptions`, keyed by the
// Supabase user id we passed as `external_customer_id` at checkout time
// (see functions/api/checkout.ts). Entitlement is just
// `status in ('trialing', 'active')` — see src/useSubscription.ts.
async function persistSubscription(
  env: SupabaseEnv,
  data: PolarSubscriptionPayload,
): Promise<void> {
  const userId = data.customer?.external_id
  const polarCustomerId = data.customer_id ?? data.customer?.id
  if (!userId || !polarCustomerId || !data.id || !data.status) {
    // Nothing we can attach this to (e.g. a checkout that wasn't tied to a
    // logged-in account) — safe to skip rather than fail the webhook.
    return
  }

  const response = await supabaseAdminFetch(env, '/subscriptions?on_conflict=user_id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({
      user_id: userId,
      polar_customer_id: polarCustomerId,
      polar_subscription_id: data.id,
      status: data.status,
      trial_ends_at: data.status === 'trialing' ? (data.trial_end ?? data.current_period_end ?? null) : null,
      current_period_end: data.current_period_end ?? null,
      cancel_at_period_end: data.cancel_at_period_end ?? false,
      updated_at: new Date().toISOString(),
    }),
  })

  if (!response.ok) {
    const details = await response.text().catch(() => '')
    console.error('[polar-webhook] Failed to persist subscription:', details)
  }
}

// POST /api/polar-webhook — receives order/subscription lifecycle events and
// mirrors subscription state into Supabase so the app can gate access
// without calling out to Polar on every page load.
export const onRequestPost: PagesFunction<PolarEnv & SupabaseEnv> = async (context) => {
  const { request, env } = context

  if (!env.POLAR_WEBHOOK_SECRET) {
    return jsonResponse({ error: 'Server is missing POLAR_WEBHOOK_SECRET.' }, 500)
  }

  const id = request.headers.get('webhook-id')
  const timestamp = request.headers.get('webhook-timestamp')
  const signature = request.headers.get('webhook-signature')
  if (!id || !timestamp || !signature) {
    return jsonResponse({ error: 'Missing webhook signature headers.' }, 400)
  }

  const body = await request.text()

  const valid = await verifySignature(env.POLAR_WEBHOOK_SECRET, id, timestamp, body, signature)
  if (!valid) {
    return jsonResponse({ error: 'Invalid webhook signature.' }, 401)
  }

  let event: { type?: string; data?: PolarSubscriptionPayload }
  try {
    event = JSON.parse(body)
  } catch {
    return jsonResponse({ error: 'Webhook body must be valid JSON.' }, 400)
  }

  if (event.type && SUBSCRIPTION_EVENT_TYPES.has(event.type) && event.data) {
    await persistSubscription(env, event.data)
  }

  return jsonResponse({ received: true }, 200)
}
