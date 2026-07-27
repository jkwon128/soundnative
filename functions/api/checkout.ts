import { jsonResponse, polarFetch, type PolarEnv } from './_polar'

interface PolarCheckout {
  id: string
  url: string
}

// POST /api/checkout — creates a Polar-hosted checkout session for the
// premium product and hands back the URL to redirect the customer to.
// Card handling happens entirely on Polar's hosted page; this endpoint never
// sees payment details.
export const onRequestPost: PagesFunction<PolarEnv> = async (context) => {
  const { request, env } = context

  if (!env.POLAR_ACCESS_TOKEN || !env.POLAR_PRODUCT_ID) {
    return jsonResponse(
      { error: 'Server is missing POLAR_ACCESS_TOKEN or POLAR_PRODUCT_ID.' },
      500,
    )
  }

  const origin = new URL(request.url).origin
  // On Cloudflare Workers the request reaching Polar is server-to-server, so
  // Polar would otherwise geolocate our edge node instead of the customer —
  // forwarding this lets it detect the right currency/country.
  const customerIpAddress = request.headers.get('CF-Connecting-IP') ?? undefined

  let response: Response
  try {
    response = await polarFetch(env, '/checkouts/', {
      method: 'POST',
      body: JSON.stringify({
        products: [env.POLAR_PRODUCT_ID],
        customer_ip_address: customerIpAddress,
        // Polar substitutes {CHECKOUT_ID} at redirect time so the success
        // screen can look up the final payment status.
        success_url: `${origin}/?checkout_id={CHECKOUT_ID}`,
        return_url: origin,
      }),
    })
  } catch {
    return jsonResponse({ error: 'Failed to reach Polar API.' }, 502)
  }

  if (!response.ok) {
    const details = await response.text().catch(() => '')
    return jsonResponse({ error: 'Polar API request failed.', details }, 502)
  }

  const checkout = (await response.json().catch(() => undefined)) as
    | PolarCheckout
    | undefined

  if (!checkout?.url) {
    return jsonResponse({ error: 'Polar API returned an unexpected response.' }, 502)
  }

  return jsonResponse({ url: checkout.url }, 200)
}
