import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export type SubscriptionStatus =
  | 'loading'
  | 'none'
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'

export interface SubscriptionState {
  status: SubscriptionStatus
  trialEndsAt: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  refetch: () => void
}

// The only two states that unlock the app — everything else (no
// subscription yet, trial/subscription ended, payment failed) routes back
// to the paywall. Kept as a plain export so App.tsx's gating and
// HomeScreen's banner copy can't drift from each other.
export function hasAccess(status: SubscriptionStatus): boolean {
  return status === 'trialing' || status === 'active'
}

interface StatusResponse {
  status: Exclude<SubscriptionStatus, 'loading'>
  trialEndsAt: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
}

function useSubscription(): SubscriptionState {
  const [status, setStatus] = useState<SubscriptionStatus>('loading')
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null)
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null)
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false)
  const [refetchToken, setRefetchToken] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) {
        if (!cancelled) setStatus('none')
        return
      }

      try {
        const response = await fetch('/api/subscription-status', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const info = (await response.json()) as StatusResponse | { error: string }
        if (!response.ok || !('status' in info)) {
          throw new Error('error' in info ? info.error : '구독 상태를 불러오지 못했습니다.')
        }
        if (!cancelled) {
          setStatus(info.status)
          setTrialEndsAt(info.trialEndsAt)
          setCurrentPeriodEnd(info.currentPeriodEnd)
          setCancelAtPeriodEnd(info.cancelAtPeriodEnd)
        }
      } catch {
        // Treat a failed lookup as "no access" rather than leaving the app
        // stuck on a loading screen — the paywall is a safe fallback and
        // the user can retry from there.
        if (!cancelled) setStatus('none')
      }
    }

    load()

    // The initial load() call above only sees whatever session exists at
    // mount time — App.tsx mounts once, before a user on the auth screen
    // has actually signed in. Without this listener, a fresh sign-in (or
    // sign-out) would never re-trigger a lookup and gating would keep
    // acting on stale ('none') status.
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange(() => load())

    return () => {
      cancelled = true
      authSubscription.unsubscribe()
    }
  }, [refetchToken])

  return {
    status,
    trialEndsAt,
    currentPeriodEnd,
    cancelAtPeriodEnd,
    refetch: () => setRefetchToken((t) => t + 1),
  }
}

export default useSubscription
