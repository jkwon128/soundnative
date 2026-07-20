const STREAK_KEY = 'soundnative_streak'
const LAST_PLAYED_KEY = 'soundnative_lastPlayedDate'
const QUESTION_INDEX_OVERRIDE_KEY = 'soundnative_devQuestionIndexOverride'

export interface StreakState {
  streak: number
  lastPlayedDate: string | null
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getTodayDateString(): string {
  return formatDate(new Date())
}

export function getDayIndex(dateString: string): number {
  const [year, month, day] = dateString.split('-').map(Number)
  return Math.floor(Date.UTC(year, month - 1, day) / 86400000)
}

export function getYesterdayDateString(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() - 1)
  return formatDate(date)
}

export function computeNextStreak(prev: StreakState, today: string): number {
  if (prev.lastPlayedDate === today) return prev.streak
  if (prev.lastPlayedDate === getYesterdayDateString(today)) return prev.streak + 1
  return 1
}

export function loadStreak(): StreakState {
  try {
    const streak = Number(localStorage.getItem(STREAK_KEY) ?? '0')
    const lastPlayedDate = localStorage.getItem(LAST_PLAYED_KEY)
    return { streak: Number.isFinite(streak) ? streak : 0, lastPlayedDate }
  } catch {
    return { streak: 0, lastPlayedDate: null }
  }
}

export function saveStreak(state: StreakState): void {
  try {
    localStorage.setItem(STREAK_KEY, String(state.streak))
    if (state.lastPlayedDate) {
      localStorage.setItem(LAST_PLAYED_KEY, state.lastPlayedDate)
    }
  } catch {
    // localStorage unavailable (e.g. private browsing) — ignore
  }
}

export function clearStreak(): void {
  try {
    localStorage.removeItem(STREAK_KEY)
    localStorage.removeItem(LAST_PLAYED_KEY)
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
