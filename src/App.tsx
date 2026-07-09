import { useState } from 'react'
import QuestScreen from './QuestScreen'
import DecodeScreen from './DecodeScreen'
import DevStreakPanel from './DevStreakPanel'

type Screen = 'quest' | 'decode'

function App() {
  const [screen, setScreen] = useState<Screen>('quest')

  return (
    <>
      {import.meta.env.DEV && <DevStreakPanel />}
      {screen === 'quest' ? (
        <QuestScreen onContinue={() => setScreen('decode')} />
      ) : (
        <DecodeScreen onBack={() => setScreen('quest')} />
      )}
    </>
  )
}

export default App
