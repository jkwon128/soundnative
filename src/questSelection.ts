const DEV_IGNORE_FILTER_KEY = 'soundnative_devIgnoreSituationFilter'

// Dev-only toggle so DevPanel can inspect the full session pool without
// clearing the onboarding selection. Not written to by normal app logic.
export function getDevIgnoreSituationFilter(): boolean {
  try {
    return localStorage.getItem(DEV_IGNORE_FILTER_KEY) === '1'
  } catch {
    return false
  }
}

export function setDevIgnoreSituationFilter(ignore: boolean): void {
  try {
    if (ignore) {
      localStorage.setItem(DEV_IGNORE_FILTER_KEY, '1')
    } else {
      localStorage.removeItem(DEV_IGNORE_FILTER_KEY)
    }
  } catch {
    // localStorage unavailable (e.g. private browsing) — ignore
  }
}
