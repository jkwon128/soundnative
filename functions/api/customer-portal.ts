import { jsonResponse, polarFetch, type PolarEnv } from './_polar'
import { getUserFromRequest, supabaseAdminFetch, type SupabaseEnv } from './_supabase'

interface SubscriptionRow {
  polar_customer_id: string
}

interface PolarCustomerSession {
  customer_portal_url: string
}

// POST /api/customer-portal — creates a pre-authenticated link into Polar's
// hosted Customer Portal, where the customer can cancel, update their
// payment method, or download invoices themselves. We don't build our own
// cancel flow: the portal is what satisfies "cancel the way you signed up"
// (see SUBSCRIPTION_DESIGN.md, step 6) and keeps card handling off our
// servers entirely.
export const onRequestPost: PagesFunction<PolarEnv & SupabaseEnv> = async (context) => {
  const { request, env } = context

  if (!env.POLAR_ACCESS_TOKEN) {
    return jsonResponse({ error: 'Server is missing POLAR_ACCESS_TOKEN.' }, 500)
  }

  const user = await getUserFromRequest(request, env)
  if (!user) {
    return jsonResponse({ error: '로그인이 필요합니다.' }, 401)
  }

  const lookup = await supabaseAdminFetch(
    env,
    `/subscriptions?user_id=eq.${encodeURIComponent(user.id)}&select=polar_customer_id&limit=1`,
  )
  if (!lookup.ok) {
    return jsonResponse({ error: 'Failed to look up subscription.' }, 502)
  }
  const rows = (await lookup.json().catch(() => [])) as SubscriptionRow[]
  const polarCustomerId = rows[0]?.polar_customer_id
  if (!polarCustomerId) {
    return jsonResponse({ error: '구독 내역을 찾을 수 없습니다.' }, 404)
  }

  let response: Response
  try {
    response = await polarFetch(env, '/customer-sessions/', {
      method: 'POST',
      body: JSON.stringify({ customer_id: polarCustomerId }),
    })
  } catch {
    return jsonResponse({ error: 'Failed to reach Polar API.' }, 502)
  }
  if (!response.ok) {
    const details = await response.text().catch(() => '')
    return jsonResponse({ error: 'Polar API request failed.', details }, 502)
  }

  const session = (await response.json().catch(() => undefined)) as
    | PolarCustomerSession
    | undefined
  if (!session?.customer_portal_url) {
    return jsonResponse({ error: 'Polar API returned an unexpected response.' }, 502)
  }

  return jsonResponse({ url: session.customer_portal_url }, 200)
}
