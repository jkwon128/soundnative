import { quizQuestions, type QuizCategory, type QuizQuestion } from './quizData'
import { SITUATION_CHIPS, loadOnboardingSituations } from './situations'
import { getDevIgnoreSituationFilter } from './questSelection'

// One question per category, every category represented every session —
// so this always equals the number of categories, not a hardcoded count.
export const SESSION_SIZE = SITUATION_CHIPS.length

// Below this many matches, a category filter is considered too narrow to be
// usable and we fall back to the full session pool instead of showing a
// near-empty (or empty) quest screen.
const MIN_FILTERED_SESSIONS = 2

// How many times to cycle through each category's full question pool when
// pre-generating sessions. Once a category's pool (currently 36 questions)
// is used up, it wraps back to its own question 0 — this just controls how
// many wraps we materialize up front. At one session/day, 20 cycles of a
// 36-question category is ~2 years of content, comfortably beyond any
// realistic amount of play.
const PREGENERATED_CYCLES = 20

export interface QuestSession {
  // Stable across re-filtering of the sessions array — derived from a
  // session's position in the pre-generated sequence, not a category, since
  // a session now spans every category. Completion tracking
  // (sessionProgress.ts) keys off this, not the array index.
  id: string
  // categories[i] === questions[i].category — kept alongside questions so
  // category-based filtering doesn't need to re-derive it.
  categories: QuizCategory[]
  questions: QuizQuestion[]
}

type QuizQuestionType = QuizQuestion['type']

const BASE_TYPE_ORDER: QuizQuestionType[] = ['meaning', 'response', 'fillBlank', 'tone']

// Reorders one category's questions so same-typed questions are spread out
// instead of clustered in quizData.ts's authoring order. Round-robins
// through the type order, taking one question per type per pass (a type
// drops out of the rotation once its pool is empty).
//
// `rotateBy` staggers which type each category starts on. Every category
// round-robins through the same 4 types, so without staggering, all 6
// categories would land on "meaning" (the most common type) in the same
// session, then all move to "response" together, etc. Rotating the start
// type by category index spreads types across a session instead.
function interleaveByType(questions: QuizQuestion[], rotateBy: number): QuizQuestion[] {
  const buckets = new Map<QuizQuestionType, QuizQuestion[]>()
  for (const type of BASE_TYPE_ORDER) buckets.set(type, [])
  for (const question of questions) buckets.get(question.type)!.push(question)

  const offset = rotateBy % BASE_TYPE_ORDER.length
  const typeOrder = [...BASE_TYPE_ORDER.slice(offset), ...BASE_TYPE_ORDER.slice(0, offset)]

  const result: QuizQuestion[] = []
  let remaining = questions.length
  while (remaining > 0) {
    for (const type of typeOrder) {
      const bucket = buckets.get(type)!
      const next = bucket.shift()
      if (next) {
        result.push(next)
        remaining--
      }
    }
  }
  return result
}

function buildSessions(): QuestSession[] {
  // Canonical category order (shared with the onboarding chips) so a
  // session's question order is fully deterministic.
  const categoryOrder = SITUATION_CHIPS.map((chip) => chip.category)

  // Each category gets its own type-interleaved, independently-cycling
  // queue. Indexing queue[i % queue.length] means a category's own repeat
  // spacing equals its full pool size — the largest spacing possible
  // without dropping content — so no separate "recently used" tracking is
  // needed to avoid a question reappearing too soon.
  //
  // Every category's type counts are skewed the same way (meaning ~2x any
  // other type), so after interleaving, every category runs out of
  // response/fillBlank/tone at roughly the same point in its own queue and
  // falls back to a run of meaning-only questions for the rest of the
  // cycle. Without further staggering, all 6 categories hit that run at the
  // same session index — a handful of sessions near the end of every cycle
  // would be 6/6 "meaning". Rotating each category's queue by an offset
  // spread evenly across its length (in addition to the type-order
  // rotation above) desyncs categories so at most one or two are ever in
  // their meaning-only tail on the same session.
  const categoryQueues = categoryOrder
    .map((category, categoryIndex) => {
      const questionsInCategory = quizQuestions.filter((question) => question.category === category)
      const interleaved = interleaveByType(questionsInCategory, categoryIndex)
      const phaseOffset = Math.floor((categoryIndex * interleaved.length) / categoryOrder.length)
      return [...interleaved.slice(phaseOffset), ...interleaved.slice(0, phaseOffset)]
    })
    .filter((queue) => queue.length > 0)

  if (categoryQueues.length === 0) return []

  const maxQueueLength = Math.max(...categoryQueues.map((queue) => queue.length))
  const sessionCount = maxQueueLength * PREGENERATED_CYCLES

  const sessions: QuestSession[] = []
  for (let i = 0; i < sessionCount; i++) {
    const questions = categoryQueues.map((queue) => queue[i % queue.length])
    sessions.push({
      id: `quest-${i}`,
      categories: questions.map((question) => question.category),
      questions,
    })
  }

  return sessions
}

// Derived once from quizQuestions at module load. quizData.ts stays
// untouched; each session draws one question per category (in the app's
// canonical category order), with per-category rotation keeping question
// types spread out within a session. See buildSessions for the cycling
// behavior once a category's pool is exhausted.
export const ALL_SESSIONS: QuestSession[] = buildSessions()

export function filterSessionsByCategories(
  sessions: QuestSession[],
  categories: QuizCategory[],
): QuestSession[] {
  if (categories.length === 0) return sessions

  const filtered = sessions.filter((session) =>
    session.categories.some((category) => categories.includes(category)),
  )
  return filtered.length < MIN_FILTERED_SESSIONS ? sessions : filtered
}

// The session pool the quest screen should actually pick from: filtered by
// the onboarding situation selection, honoring the dev "ignore filter" toggle.
export function getActiveSessions(allSessions: QuestSession[] = ALL_SESSIONS): QuestSession[] {
  if (getDevIgnoreSituationFilter()) return allSessions
  return filterSessionsByCategories(allSessions, loadOnboardingSituations())
}
