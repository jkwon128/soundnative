import { useEffect, useState } from 'react'
import WelcomeScreen from './WelcomeScreen'
import TeaserQuiz from './TeaserQuiz'
import StatusScreen from './StatusScreen'
import LevelScreen from './LevelScreen'
import PlaceholderScreen from './PlaceholderScreen'
import type { EnglishLevel, UserStatus } from './types'

type Screen = 'welcome' | 'teaserQuiz' | 'status' | 'level' | 'placeholder'

function App() {
  const [screen, setScreen] = useState<Screen>('welcome')
  // Held in memory only. Gets merged into the full onboarding profile object
  // (goal/motivation/level/daily goal/profiling) and written to localStorage
  // once the whole onboarding flow is complete — not yet.
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null)
  const [englishLevel, setEnglishLevel] = useState<EnglishLevel | null>(null)

  useEffect(() => {
    if (import.meta.env.DEV && (userStatus || englishLevel)) {
      console.log('[onboarding] userStatus:', userStatus, 'englishLevel:', englishLevel)
    }
  }, [userStatus, englishLevel])

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
            setScreen('placeholder')
          }}
        />
      )}
      {screen === 'placeholder' && <PlaceholderScreen />}
    </>
  )
}

export default App
