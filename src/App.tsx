import { useEffect, useState } from 'react'
import WelcomeScreen from './WelcomeScreen'
import TeaserQuiz from './TeaserQuiz'
import StatusScreen from './StatusScreen'
import LevelScreen from './LevelScreen'
import FrequencyScreen from './FrequencyScreen'
import GoalScreen from './GoalScreen'
import AuthScreen from './AuthScreen'
import PlaceholderScreen from './PlaceholderScreen'
import type { EnglishLevel, LearningGoal, UserStatus, VisitFrequency } from './types'

type Screen =
  | 'welcome'
  | 'teaserQuiz'
  | 'status'
  | 'level'
  | 'frequency'
  | 'goal'
  | 'auth'
  | 'placeholder'

function App() {
  const [screen, setScreen] = useState<Screen>('welcome')
  // Held in memory only. Gets merged into the full onboarding profile object
  // (goal/motivation/level/daily goal/profiling) and written to localStorage
  // once the whole onboarding flow is complete — not yet.
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null)
  const [englishLevel, setEnglishLevel] = useState<EnglishLevel | null>(null)
  const [visitFrequency, setVisitFrequency] = useState<VisitFrequency | null>(null)
  const [learningGoal, setLearningGoal] = useState<LearningGoal | null>(null)

  useEffect(() => {
    if (import.meta.env.DEV && (userStatus || englishLevel || visitFrequency || learningGoal)) {
      console.log(
        '[onboarding] userStatus:',
        userStatus,
        'englishLevel:',
        englishLevel,
        'visitFrequency:',
        visitFrequency,
        'learningGoal:',
        learningGoal,
      )
    }
  }, [userStatus, englishLevel, visitFrequency, learningGoal])

  return (
    <>
      {screen === 'welcome' && <WelcomeScreen onStart={() => setScreen('teaserQuiz')} />}
      {screen === 'teaserQuiz' && <TeaserQuiz onComplete={() => setScreen('status')} />}
      {screen === 'status' && (
        <StatusScreen
          onNext={(status) => {
            setUserStatus(status)
            setScreen('level')
          }}
        />
      )}
      {screen === 'level' && (
        <LevelScreen
          onNext={(level) => {
            setEnglishLevel(level)
            setScreen('frequency')
          }}
        />
      )}
      {screen === 'frequency' && (
        <FrequencyScreen
          onNext={(frequency) => {
            setVisitFrequency(frequency)
            setScreen('goal')
          }}
        />
      )}
      {screen === 'goal' && (
        <GoalScreen
          onNext={(goal) => {
            setLearningGoal(goal)
            setScreen('auth')
          }}
        />
      )}
      {screen === 'auth' && <AuthScreen onContinue={() => setScreen('placeholder')} />}
      {screen === 'placeholder' && <PlaceholderScreen />}
    </>
  )
}

export default App
