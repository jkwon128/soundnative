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
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'content-type': 'application/json',
    },
  })
}
