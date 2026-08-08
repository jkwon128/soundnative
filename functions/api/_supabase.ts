// Shared helpers for talking to Supabase from Pages Functions.
// Underscore-prefixed files aren't treated as routes by Cloudflare Pages.

export interface SupabaseEnv {
  SUPABASE_URL: string
  // Service role key — bypasses Row Level Security. Only ever used
  // server-side (to verify a caller's access token, and from the Polar
  // webhook to write subscription rows nothing else is allowed to write).
  // Never expose this to the client.
  SUPABASE_SERVICE_ROLE_KEY: string
}

export interface AuthedUser {
  id: string
  email: string | null
}

// Verifies the caller's Supabase session from an `Authorization: Bearer
// <access_token>` header (the token supabase-js already holds client-side
// after sign-in) and returns the underlying user, or null if missing/invalid.
export async function getUserFromRequest(
  request: Request,
  env: SupabaseEnv,
): Promise<AuthedUser | null> {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.match(/^Bearer (.+)$/i)?.[1]
  if (!token) return null

  let response: Response
  try {
    response = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      },
    })
  } catch {
    return null
  }
  if (!response.ok) return null

  const user = (await response.json().catch(() => undefined)) as
    | { id?: string; email?: string | null }
    | undefined
  if (!user?.id) return null

  return { id: user.id, email: user.email ?? null }
}

// PostgREST request against the service role — bypasses RLS. Used for the
// one write path that has no user session to authorize against (the Polar
// webhook) and for admin-style upserts.
//
// The key goes on `apikey` only — Supabase's new secret keys (sb_secret_...)
// aren't JWTs, so putting one in `Authorization: Bearer` as well makes the
// platform try to parse it as a JWT and reject the request with
// "Invalid JWT". See https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys
export async function supabaseAdminFetch(
  env: SupabaseEnv,
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  return fetch(`${env.SUPABASE_URL}/rest/v1${path}`, {
    ...init,
    headers: {
      ...init.headers,
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      'content-type': 'application/json',
    },
  })
}

export type SubscriptionAccessStatus =
  | 'none'
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'

// Server-side mirror of src/useSubscription.ts's hasAccess — that file is a
// React hook (client-only), so this is a small intentional duplicate of its
// one-line predicate rather than importing React into a Pages Function.
export function hasAccess(status: SubscriptionAccessStatus): boolean {
  return status === 'trialing' || status === 'active'
}

// Looks up a user's current subscription status directly (not via HTTP to
// /api/subscription-status) — used by endpoints that need to gate on
// entitlement server-side, e.g. decode.ts's usage cap.
export async function getSubscriptionStatus(
  env: SupabaseEnv,
  userId: string,
): Promise<SubscriptionAccessStatus> {
  const response = await supabaseAdminFetch(
    env,
    `/subscriptions?user_id=eq.${encodeURIComponent(userId)}&select=status&limit=1`,
  )
  if (!response.ok) return 'none'

  const rows = (await response.json().catch(() => [])) as { status?: SubscriptionAccessStatus }[]
  return rows[0]?.status ?? 'none'
}
