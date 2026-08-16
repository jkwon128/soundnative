import { getDayIndex, getTodayDateString, getYesterdayDateString } from './dateUtils'

export { getDayIndex, getTodayDateString, getYesterdayDateString }

const STREAK_KEY = 'soundnative_streak'
const LAST_PLAYED_KEY = 'soundnative_lastPlayedDate'
const BEST_STREAK_KEY = 'soundnative_bestStreak'
const QUESTION_INDEX_OVERRIDE_KEY = 'soundnative_devQuestionIndexOverride'

export interface StreakState {
  streak: number
  lastPlayedDate: string | null
  // All-time high, independent of the current streak's reset — see
  // saveStreak, the only place this ever moves.
  bestStreak: number
}

export function computeNextStreak(prev: StreakState, today: string): number {
  if (prev.lastPlayedDate === today) return prev.streak
  if (prev.lastPlayedDate === getYesterdayDateString(today)) return prev.streak + 1
  return 1
}

// True if lastPlayedDate is today or yesterday — the same "still unbroken"
// condition computeNextStreak uses before deciding whether to increment,
// applied here as a read-only check instead.
function isStreakActive(lastPlayedDate: string | null, today: string): boolean {
  if (!lastPlayedDate) return false
  return lastPlayedDate === today || lastPlayedDate === getYesterdayDateString(today)
}

// The stored streak count is only ever updated on quest completion
// (see QuestScreen), so it goes stale the moment a day is missed without
// the user completing another quest to trigger a recompute. Display code
// should read this instead of the raw stored value.
export function getEffectiveStreak(): number {
  const { streak, lastPlayedDate } = loadStreak()
  return isStreakActive(lastPlayedDate, getTodayDateString()) ? streak : 0
}

export function loadStreak(): StreakState {
  try {
    const streak = Number(localStorage.getItem(STREAK_KEY) ?? '0')
    const lastPlayedDate = localStorage.getItem(LAST_PLAYED_KEY)
    const bestStreak = Number(localStorage.getItem(BEST_STREAK_KEY) ?? '0')
    return {
      streak: Number.isFinite(streak) ? streak : 0,
      lastPlayedDate,
      bestStreak: Number.isFinite(bestStreak) ? bestStreak : 0,
    }
  } catch {
    return { streak: 0, lastPlayedDate: null, bestStreak: 0 }
  }
}

// Takes streak/lastPlayedDate only (not bestStreak) — bestStreak is derived
// here from whatever's already stored, so every call site that updates the
// current streak keeps the all-time best in sync without having to know
// about it.
export function saveStreak(state: { streak: number; lastPlayedDate: string | null }): void {
  try {
    localStorage.setItem(STREAK_KEY, String(state.streak))
    if (state.lastPlayedDate) {
      localStorage.setItem(LAST_PLAYED_KEY, state.lastPlayedDate)
    }

    const storedBest = Number(localStorage.getItem(BEST_STREAK_KEY) ?? '0')
    const currentBest = Number.isFinite(storedBest) ? storedBest : 0
    localStorage.setItem(BEST_STREAK_KEY, String(Math.max(currentBest, state.streak)))
  } catch {
    // localStorage unavailable (e.g. private browsing) — ignore
  }
}

export function clearStreak(): void {
  try {
    localStorage.removeItem(STREAK_KEY)
    localStorage.removeItem(LAST_PLAYED_KEY)
    // bestStreak is intentionally left alone — it should never go down,
    // and clearing the current streak (e.g. for testing) isn't a reason to
    // erase the all-time record.
  } catch {
    // localStorage unavailable (e.g. private browsing) — ignore
  }
}

// Dev-only override so the day-indexed item shown (a session, previously a
// single question) can be forced without waiting for the real date to
// change. Not written to by normal app logic.
export function getQuestionIndexOverride(): number | null {
  try {
    const raw = localStorage.getItem(QUESTION_INDEX_OVERRIDE_KEY)
    if (raw === null) return null
    const value = Number(raw)
    return Number.isFinite(value) ? value : null
  } catch {
    return null
  }
}

export function setQuestionIndexOverride(index: number): void {
  try {
    localStorage.setItem(QUESTION_INDEX_OVERRIDE_KEY, String(index))
  } catch {
    // localStorage unavailable (e.g. private browsing) — ignore
  }
}

export function clearQuestionIndexOverride(): void {
  try {
    localStorage.removeItem(QUESTION_INDEX_OVERRIDE_KEY)
  } catch {
    // localStorage unavailable (e.g. private browsing) — ignore
  }
}

export function getCurrentQuestionIndex(totalQuestions: number): number {
  const override = getQuestionIndexOverride()
  if (override !== null) {
    return ((override % totalQuestions) + totalQuestions) % totalQuestions
  }
  return getDayIndex(getTodayDateString()) % totalQuestions
}
