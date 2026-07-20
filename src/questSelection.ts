import type { QuizCategory, QuizQuestion } from './quizData'
import { loadOnboardingSituations } from './situations'

// Below this many matches, a category filter is considered too narrow to be
// usable and we fall back to the full question pool instead of showing a
// near-empty quest screen.
const MIN_FILTERED_QUESTIONS = 3

const DEV_IGNORE_FILTER_KEY = 'soundnative_devIgnoreSituationFilter'

export function filterQuestionsByCategories(
  questions: QuizQuestion[],
  categories: QuizCategory[],
): QuizQuestion[] {
  if (categories.length === 0) return questions

  const filtered = questions.filter((question) => categories.includes(question.category))
  return filtered.length < MIN_FILTERED_QUESTIONS ? questions : filtered
}

// Dev-only toggle so DevPanel can inspect the full pool without clearing
// the onboarding selection. Not written to by normal app logic.
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

// The question pool the quest screen should actually pick from: filtered by
// the onboarding situation selection, honoring the dev "ignore filter" toggle.
export function getActiveQuestions(allQuestions: QuizQuestion[]): QuizQuestion[] {
  if (getDevIgnoreSituationFilter()) return allQuestions
  return filterQuestionsByCategories(allQuestions, loadOnboardingSituations())
}
