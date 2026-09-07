// Thin wrapper around the gtag.js snippet in index.html (measurement id
// G-G8115WZ6KG). Centralizes the purchase/subscription funnel's event names
// and params so every screen fires them the same way — see the funnel map
// in this file's exported function list: screen_view (every screen) ->
// sign_up/login -> view_item (pricing) -> begin_checkout -> purchase /
// start_trial.
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

function gtagEvent(eventName: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', eventName, params)
}

export function trackScreenView(screenName: string) {
  gtagEvent('screen_view', { screen_name: screenName })
}

export function trackSignUp(method: 'email' | 'google') {
  gtagEvent('sign_up', { method })
}

export function trackLogin(method: 'email' | 'google') {
  gtagEvent('login', { method })
}

// Fired when the email signup form sends a confirmation email instead of
// producing a session right away — the real sign_up event only fires once
// that confirmation link is used (App.tsx's getSession check), so this is
// the only signal for the "entered email, but never confirmed" drop-off.
export function trackSignUpConfirmationSent() {
  gtagEvent('sign_up_confirmation_sent', { method: 'email' })
}

export function trackPaywallView(reason: string) {
  gtagEvent('paywall_view', { reason })
}

interface PlanInfo {
  name: string
  amount: number // smallest currency unit (e.g. KRW won, USD cents)
  currency: string
  recurringInterval: 'month' | 'year' | null
}

function planToItems(plan: PlanInfo) {
  return [
    {
      item_id: plan.recurringInterval ? `subscription_${plan.recurringInterval}` : 'one_time_purchase',
      item_name: plan.name,
      price: plan.amount / 100,
    },
  ]
}

export function trackViewPricing(plan: PlanInfo) {
  gtagEvent('view_item', {
    currency: plan.currency,
    value: plan.amount / 100,
    items: planToItems(plan),
  })
}

export function trackBeginCheckout(plan: PlanInfo) {
  gtagEvent('begin_checkout', {
    currency: plan.currency,
    value: plan.amount / 100,
    items: planToItems(plan),
  })
}

export function trackPurchase(params: {
  transactionId: string
  amount: number
  currency: string
  productName: string | null
}) {
  gtagEvent('purchase', {
    transaction_id: params.transactionId,
    currency: params.currency,
    value: params.amount / 100,
    items: [{ item_name: params.productName ?? 'SoundNative 구독', price: params.amount / 100 }],
  })
}

// Custom event (GA4 has no built-in "trial started" event) — kept separate
// from purchase since no charge has actually happened yet, so it shouldn't
// count toward revenue totals.
export function trackStartTrial(params: {
  transactionId: string
  currency: string
  productName: string | null
}) {
  gtagEvent('start_trial', {
    transaction_id: params.transactionId,
    currency: params.currency,
    value: 0,
    items: [{ item_name: params.productName ?? 'SoundNative 구독' }],
  })
}

// CheckoutSuccessScreen's status fetch can re-run (StrictMode, a manual
// refresh of the /?checkout_id=... URL before it's rewritten) — this guards
// purchase/start_trial from firing more than once for the same checkout.
function checkoutTrackedKey(checkoutId: string) {
  return `sn_ga_checkout_tracked_${checkoutId}`
}

export function hasTrackedCheckout(checkoutId: string): boolean {
  try {
    return sessionStorage.getItem(checkoutTrackedKey(checkoutId)) === '1'
  } catch {
    return false
  }
}

export function markCheckoutTracked(checkoutId: string) {
  try {
    sessionStorage.setItem(checkoutTrackedKey(checkoutId), '1')
  } catch {
    // sessionStorage unavailable (private mode etc.) — non-fatal, worst
    // case this fires again on refresh.
  }
}

// AuthScreen's Google button navigates the browser away before we know
// whether the resulting session is a signup or a login — stash the intent
// here and read it back once App.tsx sees the session on return.
const PENDING_GOOGLE_AUTH_KEY = 'sn_pending_google_auth_mode'

export function stashPendingGoogleAuthMode(mode: 'signUp' | 'logIn') {
  try {
    sessionStorage.setItem(PENDING_GOOGLE_AUTH_KEY, mode)
  } catch {
    // ignore
  }
}

export function trackPendingGoogleAuth() {
  try {
    const mode = sessionStorage.getItem(PENDING_GOOGLE_AUTH_KEY)
    sessionStorage.removeItem(PENDING_GOOGLE_AUTH_KEY)
    if (mode === 'signUp') trackSignUp('google')
    else if (mode === 'logIn') trackLogin('google')
  } catch {
    // sessionStorage unavailable — nothing to recover from, skip silently.
  }
}
