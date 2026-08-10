// Shared between decode.ts (which enforces the cap) and decode-usage.ts
// (which lets the client show "today's remaining count" before typing
// anything) so the limit numbers and lookup query only live in one place.
import { getSubscriptionStatus, hasAccess, supabaseAdminFetch, type SupabaseEnv } from './_supabase'

export const UNSUBSCRIBED_DAILY_LIMIT = 3
export const SUBSCRIBED_DAILY_LIMIT = 50

export function todayUtcDateString(): string {
  return new Date().toISOString().slice(0, 10)
}

export interface DecodeUsageInfo {
  used: number
  limit: number
  remaining: number
  subscribed: boolean
}

// Throws if the usage lookup itself fails (as opposed to it succeeding with
// zero rows, which just means nothing used yet today) — callers decide how
// to fail (decode.ts fails closed with a 502 rather than silently letting
// an unmetered request through; decode-usage.ts does the same rather than
// claiming a false "full remaining" count).
export async function getDecodeUsage(env: SupabaseEnv, userId: string): Promise<DecodeUsageInfo> {
  const subscribed = hasAccess(await getSubscriptionStatus(env, userId))
  const limit = subscribed ? SUBSCRIBED_DAILY_LIMIT : UNSUBSCRIBED_DAILY_LIMIT
  const usageDate = todayUtcDateString()

  const usageResponse = await supabaseAdminFetch(
    env,
    `/decode_usage?user_id=eq.${encodeURIComponent(userId)}&usage_date=eq.${usageDate}&select=count`,
  )
  if (!usageResponse.ok) {
    const details = await usageResponse.text().catch(() => '')
    throw new Error(`Failed to check Decode usage: ${details}`)
  }
  const usageRows = (await usageResponse.json().catch(() => [])) as { count?: number }[]
  const used = usageRows[0]?.count ?? 0

  return { used, limit, remaining: Math.max(0, limit - used), subscribed }
}
