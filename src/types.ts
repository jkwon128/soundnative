// Category of the user's current situation abroad, collected during
// onboarding. Combined with the other onboarding answers (goal, motivation,
// level, daily goal, profiling) into one user profile object once the whole
// onboarding flow is complete.
export type UserStatus = 'student' | 'workingHoliday' | 'immigrant' | 'expatWorker' | 'preparing'

// Self-reported level of understanding spoken native English, collected
// during onboarding. Combined into the same user profile object as
// UserStatus once the whole onboarding flow is complete.
export type EnglishLevel = 'new' | 'basicUnderstanding' | 'mostlyFluent'
