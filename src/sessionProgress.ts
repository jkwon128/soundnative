const COMPLETED_SESSIONS_KEY = 'soundnative_completedSessionIds'

export function loadCompletedSessionIds(): string[] {
  try {
    const raw = localStorage.getItem(COMPLETED_SESSIONS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((id): id is string => typeof id === 'string')
  } catch {
    return []
  }
}

export function markSessionCompleted(id: string): void {
  try {
    const completed = new Set(loadCompletedSessionIds())
    completed.add(id)
    localStorage.setItem(COMPLETED_SESSIONS_KEY, JSON.stringify([...completed]))
  } catch {
    // localStorage unavailable (e.g. private browsing) — ignore
  }
}

export function clearCompletedSessions(): void {
  try {
    localStorage.removeItem(COMPLETED_SESSIONS_KEY)
  } catch {
    // localStorage unavailable (e.g. private browsing) — ignore
  }
}
