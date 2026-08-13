import { jsonResponse, polarFetch, type PolarEnv } from './_polar'

interface PolarCheckout {
  status: 'open' | 'expired' | 'confirmed' | 'succeeded' | 'failed'
  customer_email: string | null
  total_amount: number
  currency: string
  product: { name: string } | null
  // Set only when a trial period actually applies to this checkout — null
  // for a full-price or discounted-to-$0 purchase. See CheckoutSuccessScreen,
  // which used to infer "trial" from total_amount === 0 and got that wrong
  // once discount codes could also produce a $0 total.
  trial_end: string | null
}

interface CheckoutStatusInfo {
  status: PolarCheckout['status']
  productName: string | null
  customerEmail: string | null
  amount: number
  currency: string
  isTrial: boolean
}

// GET /api/checkout-status?checkout_id=... — lets the success screen confirm
// a redirect actually corresponds to a completed payment (Polar's checkout
// "back" button redirects to the same URL, so the client can't assume
// success just because it landed here with a checkout_id).
export const onRequestGet: PagesFunction<PolarEnv> = async (context) => {
  const { request, env } = context

  if (!env.POLAR_ACCESS_TOKEN) {
    return jsonResponse({ error: 'Server is missing POLAR_ACCESS_TOKEN.' }, 500)
  }

  const checkoutId = new URL(request.url).searchParams.get('checkout_id')
  if (!checkoutId) {
    return jsonResponse({ error: '"checkout_id" query parameter is required.' }, 400)
  }

  let response: Response
  try {
    response = await polarFetch(env, `/checkouts/${encodeURIComponent(checkoutId)}`)
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

  if (!checkout) {
    return jsonResponse({ error: 'Polar API returned an unexpected response.' }, 502)
  }

  const info: CheckoutStatusInfo = {
    status: checkout.status,
    productName: checkout.product?.name ?? null,
    customerEmail: checkout.customer_email,
    amount: checkout.total_amount,
    currency: checkout.currency,
    isTrial: checkout.trial_end !== null,
  }

  return jsonResponse(info, 200)
}
