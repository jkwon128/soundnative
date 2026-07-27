// Shared helpers for talking to the Polar API from Pages Functions.
// Underscore-prefixed files aren't treated as routes by Cloudflare Pages.

export interface PolarEnv {
  POLAR_ACCESS_TOKEN: string
  POLAR_PRODUCT_ID: string
  // Defaults to 'sandbox' so a missing/unset value can never accidentally
  // hit production and charge a real card.
  POLAR_SERVER?: 'sandbox' | 'production'
  POLAR_WEBHOOK_SECRET?: string
}

export function polarBaseUrl(env: PolarEnv): string {
  return env.POLAR_SERVER === 'production'
    ? 'https://api.polar.sh/v1'
    : 'https://sandbox-api.polar.sh/v1'
}

export function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

export async function polarFetch(
  env: PolarEnv,
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  return fetch(`${polarBaseUrl(env)}${path}`, {
    ...init,
    headers: {
      ...init.headers,
      Authorization: `Bearer ${env.POLAR_ACCESS_TOKEN}`,
      'content-type': 'application/json',
    },
  })
}
