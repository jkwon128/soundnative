import { useState } from 'react'
import QuestScreen from './QuestScreen'
import DecodeScreen from './DecodeScreen'
import DevPanel from './DevPanel'
import OnboardingScreen from './OnboardingScreen'
import { hasCompletedOnboarding } from './situations'

type Screen = 'onboarding' | 'quest' | 'decode'

function App() {
  const [screen, setScreen] = useState<Screen>(() =>
    hasCompletedOnboarding() ? 'quest' : 'onboarding',
  )
  const [questKey, setQuestKey] = useState(0)

  return (
    <>
      {screen === 'onboarding' && <OnboardingScreen onComplete={() => setScreen('quest')} />}
      {screen === 'quest' && (
        <QuestScreen key={questKey} onContinue={() => setScreen('decode')} />
      )}
      {screen === 'decode' && <DecodeScreen onBack={() => setScreen('quest')} />}
      {import.meta.env.DEV && <DevPanel onStateChange={() => setQuestKey((k) => k + 1)} />}
    </>
  )
}

export default App
