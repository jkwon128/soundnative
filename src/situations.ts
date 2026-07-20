import type { QuizCategory } from './quizData'

const ONBOARDING_SITUATIONS_KEY = 'soundnative_onboardingSituations'
const ONBOARDING_LEVEL_KEY = 'soundnative_onboardingLevel'
const ONBOARDING_COMPLETED_KEY = 'soundnative_onboardingCompleted'

export type OnboardingLevel = 'gettingBy' | 'comfortable' | 'fluentIsh'

export interface SituationChip {
  label: string
  category: QuizCategory
}

// Onboarding chip ↔ quiz category mapping, shown in this order on the
// onboarding screen and used to resolve the saved selection back to labels.
export const SITUATION_CHIPS: SituationChip[] = [
  { label: '일상 심부름', category: 'errands' },
  { label: '병원·관공서', category: 'doctor' },
  { label: '직장·회의', category: 'work' },
  { label: '스몰토크', category: 'smalltalk' },
  { label: '학교', category: 'school' },
  { label: '렌트·이웃', category: 'rent' },
]

export function loadOnboardingSituations(): QuizCategory[] {
  try {
    const raw = localStorage.getItem(ONBOARDING_SITUATIONS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const validCategories = SITUATION_CHIPS.map((chip) => chip.category)
    return parsed.filter((value): value is QuizCategory => validCategories.includes(value))
  } catch {
    return []
  }
}

export function saveOnboardingSituations(situations: QuizCategory[]): void {
  try {
    localStorage.setItem(ONBOARDING_SITUATIONS_KEY, JSON.stringify(situations))
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, '1')
  } catch {
    // localStorage unavailable (e.g. private browsing) — ignore
  }
}

export function saveOnboardingLevel(level: OnboardingLevel): void {
  try {
    localStorage.setItem(ONBOARDING_LEVEL_KEY, level)
  } catch {
    // localStorage unavailable (e.g. private browsing) — ignore
  }
}

export function hasCompletedOnboarding(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_COMPLETED_KEY) === '1'
  } catch {
    return false
  }
}
