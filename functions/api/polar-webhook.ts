import { jsonResponse, type PolarEnv } from './_polar'

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

// POST /api/polar-webhook — receives order/subscription lifecycle events.
// Persisting entitlements against a user record is intentionally not wired
// up yet: SoundNative doesn't have a real account/database backend behind
// AuthScreen (it's currently a dummy screen), so there's no row to attach a
// subscription status to. Once real accounts exist, `order.paid` /
// `subscription.active` / `subscription.canceled` / `subscription.revoked`
// are the events to persist.
export const onRequestPost: PagesFunction<PolarEnv> = async (context) => {
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

  let event: { type?: string }
  try {
    event = JSON.parse(body)
  } catch {
    return jsonResponse({ error: 'Webhook body must be valid JSON.' }, 400)
  }

  switch (event.type) {
    case 'order.paid':
    case 'subscription.active':
    case 'subscription.canceled':
    case 'subscription.revoked':
      console.log('[polar-webhook]', event.type)
      break
    default:
      break
  }

  return jsonResponse({ received: true }, 200)
}
