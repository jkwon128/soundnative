import { supabase } from './supabaseClient'
import type { EnglishLevel, LearningGoal, UserStatus, VisitFrequency } from './types'

export interface OnboardingProfile {
  status: UserStatus
  englishLevel: EnglishLevel
  visitFrequency: VisitFrequency
  learningGoal: LearningGoal
}

// Persists the pre-login onboarding survey answers to the user's
// user_profiles row. Call this only after signup/login has actually
// produced a session — the RLS policies on user_profiles check
// auth.uid() = user_id, so calling this before the client holds a session
// would just get rejected.
//
// Never throws: saving the profile is secondary to the account existing at
// all, so a failure here is logged and swallowed rather than surfaced to
// the caller — it must never block the signup/login flow it's called from.
export async function saveUserProfile(userId: string, profile: OnboardingProfile): Promise<void> {
  try {
    const { error } = await supabase.from('user_profiles').upsert(
      {
        user_id: userId,
        status: profile.status,
        english_level: profile.englishLevel,
        visit_frequency: profile.visitFrequency,
        learning_goal: profile.learningGoal,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
    if (error) {
      console.error('[userProfile] Failed to save onboarding profile:', error.message)
    }
  } catch (err) {
    console.error('[userProfile] Failed to save onboarding profile:', err)
  }
}

const PENDING_PROFILE_KEY = 'soundnative_pendingOnboardingProfile'

function isOnboardingProfile(value: unknown): value is OnboardingProfile {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.status === 'string' &&
    typeof v.englishLevel === 'string' &&
    typeof v.visitFrequency === 'string' &&
    typeof v.learningGoal === 'string'
  )
}

// Stashes the onboarding answers right before a flow that leaves the page
// entirely and comes back later with no memory of it — Google OAuth
// (full-page redirect to Google and back) and email confirmation (the link
// is opened whenever/wherever, usually a different tab). Both cases mean
// App.tsx remounts from scratch by the time a session exists, so the
// in-memory userStatus/englishLevel/visitFrequency/learningGoal state is
// gone — this is the only copy that survives.
export function savePendingOnboardingProfile(profile: OnboardingProfile): void {
  try {
    localStorage.setItem(PENDING_PROFILE_KEY, JSON.stringify(profile))
  } catch {
    // localStorage unavailable (e.g. private browsing) — ignore
  }
}

// Reads back and clears the stashed profile (if any) — called once a
// session shows up after one of the flows above. Consuming it on read
// means a second page load with the same leftover session never re-saves
// (or saves empty/stale data) a second time.
export function takePendingOnboardingProfile(): OnboardingProfile | null {
  try {
    const raw = localStorage.getItem(PENDING_PROFILE_KEY)
    if (!raw) return null
    localStorage.removeItem(PENDING_PROFILE_KEY)
    const parsed = JSON.parse(raw)
    return isOnboardingProfile(parsed) ? parsed : null
  } catch {
    return null
  }
}
