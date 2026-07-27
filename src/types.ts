// Category of the user's current situation abroad, collected during
// onboarding. Combined with the other onboarding answers (goal, motivation,
// level, daily goal, profiling) into one user profile object once the whole
// onboarding flow is complete.
export type UserStatus = 'student' | 'workingHoliday' | 'immigrant' | 'expatWorker' | 'preparing'

// Self-reported level of understanding spoken native English, collected
// during onboarding. Combined into the same user profile object as
// UserStatus once the whole onboarding flow is complete.
export type EnglishLevel = 'new' | 'basicUnderstanding' | 'mostlyFluent'

// How often the user expects to visit/practice, collected during
// onboarding. Combined into the same user profile object as UserStatus
// once the whole onboarding flow is complete.
export type VisitFrequency = 'daily' | 'weekdays' | 'whenever'

// What the user wants out of the app, collected during onboarding.
// Combined into the same user profile object as UserStatus once the whole
// onboarding flow is complete.
export type LearningGoal = 'dailyLifeConfidence' | 'nativeConnection' | 'nativeLevel'

// A single entry in the user's Notes screen — either auto-captured from a
// correctly-answered quiz question, or freely written by the user.
export interface NoteEntry {
  id: string
  type: 'auto' | 'manual'
  createdAt: string // ISO date
  // type === 'auto'
  questionId?: string // quizData question id — dedup key so a re-answered question isn't saved twice
  phrase?: string
  meaning?: string
  category?: string
  memo?: string // optional note the user added on top of an auto-captured entry
  // type === 'manual'
  content?: string
}
