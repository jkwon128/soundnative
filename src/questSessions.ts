import { quizQuestions, type QuizCategory, type QuizQuestion } from './quizData'
import { SITUATION_CHIPS, loadOnboardingSituations } from './situations'
import { getDevIgnoreSituationFilter } from './questSelection'

export const SESSION_SIZE = 4

// Below this many matches, a category filter is considered too narrow to be
// usable and we fall back to the full session pool instead of showing a
// near-empty (or empty) quest screen.
const MIN_FILTERED_SESSIONS = 2

export interface QuestSession {
  category: QuizCategory
  questions: QuizQuestion[]
}

function buildSessions(): QuestSession[] {
  // Canonical category order (shared with the onboarding chips) so session
  // order is fully deterministic — same day always maps to the same session.
  const categoryOrder = SITUATION_CHIPS.map((chip) => chip.category)
  const sessions: QuestSession[] = []

  for (const category of categoryOrder) {
    const questionsInCategory = quizQuestions.filter((question) => question.category === category)
    const sessionCount = Math.floor(questionsInCategory.length / SESSION_SIZE)

    for (let i = 0; i < sessionCount; i++) {
      sessions.push({
        category,
        questions: questionsInCategory.slice(i * SESSION_SIZE, i * SESSION_SIZE + SESSION_SIZE),
      })
    }
  }

  return sessions
}

// Derived once from quizQuestions at module load. quizData.ts stays
// untouched; sessions are grouped by category (in the app's canonical
// category order) and cut into fixed-size chunks of SESSION_SIZE in array
// order — no shuffling. Any remainder under SESSION_SIZE is dropped.
export const ALL_SESSIONS: QuestSession[] = buildSessions()

export function filterSessionsByCategories(
  sessions: QuestSession[],
  categories: QuizCategory[],
): QuestSession[] {
  if (categories.length === 0) return sessions

  const filtered = sessions.filter((session) => categories.includes(session.category))
  return filtered.length < MIN_FILTERED_SESSIONS ? sessions : filtered
}

// The session pool the quest screen should actually pick from: filtered by
// the onboarding situation selection, honoring the dev "ignore filter" toggle.
export function getActiveSessions(allSessions: QuestSession[] = ALL_SESSIONS): QuestSession[] {
  if (getDevIgnoreSituationFilter()) return allSessions
  return filterSessionsByCategories(allSessions, loadOnboardingSituations())
}
