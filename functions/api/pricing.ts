import { jsonResponse, polarFetch, type PolarEnv } from './_polar'

interface PolarPrice {
  amount_type: string
  price_amount?: number
  price_currency?: string
  is_archived?: boolean
}

interface PolarProduct {
  name: string
  description: string | null
  recurring_interval: 'month' | 'year' | null
  is_archived: boolean
  prices: PolarPrice[]
}

interface PricingInfo {
  name: string
  description: string | null
  amount: number
  currency: string
  recurringInterval: 'month' | 'year' | null
}

// GET /api/pricing — reads the live product/price straight from Polar's
// catalog so the UI never shows a price that could diverge from what the
// customer is actually charged at checkout.
export const onRequestGet: PagesFunction<PolarEnv> = async (context) => {
  const { env } = context

  if (!env.POLAR_ACCESS_TOKEN || !env.POLAR_PRODUCT_ID) {
    return jsonResponse(
      { error: 'Server is missing POLAR_ACCESS_TOKEN or POLAR_PRODUCT_ID.' },
      500,
    )
  }

  let response: Response
  try {
    response = await polarFetch(env, `/products/${env.POLAR_PRODUCT_ID}`)
  } catch {
    return jsonResponse({ error: 'Failed to reach Polar API.' }, 502)
  }

  if (!response.ok) {
    const details = await response.text().catch(() => '')
    return jsonResponse({ error: 'Polar API request failed.', details }, 502)
  }

  const product = (await response.json().catch(() => undefined)) as
    | PolarProduct
    | undefined

  const price = product?.prices?.find(
    (p) => !p.is_archived && p.amount_type === 'fixed' && typeof p.price_amount === 'number',
  )

  if (!product || !price || price.price_amount === undefined || !price.price_currency) {
    return jsonResponse({ error: 'Product has no active fixed price.' }, 502)
  }

  const info: PricingInfo = {
    name: product.name,
    description: product.description,
    amount: price.price_amount,
    currency: price.price_currency,
    recurringInterval: product.recurring_interval,
  }

  return jsonResponse(info, 200)
}
