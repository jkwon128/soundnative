import { useEffect, useState } from 'react'
import WelcomeScreen from './WelcomeScreen'
import TeaserQuiz from './TeaserQuiz'
import StatusScreen from './StatusScreen'
import PlaceholderScreen from './PlaceholderScreen'
import type { UserStatus } from './types'

type Screen = 'welcome' | 'teaserQuiz' | 'status' | 'placeholder'

function App() {
  const [screen, setScreen] = useState<Screen>('welcome')
  // Held in memory only. Gets merged into the full onboarding profile object
  // (goal/motivation/level/daily goal/profiling) and written to localStorage
  // once the whole onboarding flow is complete — not yet.
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null)

  useEffect(() => {
    if (import.meta.env.DEV && userStatus) {
      console.log('[onboarding] userStatus:', userStatus)
    }
  }, [userStatus])

  return (
    <>
      {screen === 'welcome' && <WelcomeScreen onStart={() => setScreen('teaserQuiz')} />}
      {screen === 'teaserQuiz' && <TeaserQuiz onComplete={() => setScreen('status')} />}
      {screen === 'status' && (
        <StatusScreen
          onNext={(status) => {
            setUserStatus(status)
            setScreen('placeholder')
          }}
        />
      )}
      {screen === 'placeholder' && <PlaceholderScreen />}
    </>
  )
}

export default App
