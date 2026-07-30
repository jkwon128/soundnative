import { jsonResponse } from './_polar'
import { getUserFromRequest, supabaseAdminFetch, type SupabaseEnv } from './_supabase'

export interface SubscriptionStatusInfo {
  // 'none' means no subscription row exists yet — the user has never
  // started a checkout, as opposed to 'canceled'/'revoked' which means they
  // have and it ended (see PricingScreen: prior subscribers aren't offered
  // another free trial's worth of truthful copy).
  status: 'none' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid'
  trialEndsAt: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
}

interface SubscriptionRow {
  status: SubscriptionStatusInfo['status']
  trial_ends_at: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
}

// GET /api/subscription-status — the single source of truth the client uses
// to decide whether to gate the app behind the paywall. Reads our own
// mirror of Polar's subscription state (kept in sync by polar-webhook.ts)
// rather than calling Polar directly, so this stays fast and cheap.
export const onRequestGet: PagesFunction<SupabaseEnv> = async (context) => {
  const { request, env } = context

  const user = await getUserFromRequest(request, env)
  if (!user) {
    return jsonResponse({ error: '로그인이 필요합니다.' }, 401)
  }

  const response = await supabaseAdminFetch(
    env,
    `/subscriptions?user_id=eq.${encodeURIComponent(user.id)}&select=status,trial_ends_at,current_period_end,cancel_at_period_end&limit=1`,
  )
  if (!response.ok) {
    const details = await response.text().catch(() => '')
    return jsonResponse({ error: 'Failed to load subscription status.', details }, 502)
  }

  const rows = (await response.json().catch(() => [])) as SubscriptionRow[]
  const row = rows[0]

  const info: SubscriptionStatusInfo = row
    ? {
        status: row.status,
        trialEndsAt: row.trial_ends_at,
        currentPeriodEnd: row.current_period_end,
        cancelAtPeriodEnd: row.cancel_at_period_end,
      }
    : { status: 'none', trialEndsAt: null, currentPeriodEnd: null, cancelAtPeriodEnd: false }

  return jsonResponse(info, 200)
}
