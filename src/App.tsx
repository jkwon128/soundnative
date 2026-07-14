import { useState } from 'react'
import QuestScreen from './QuestScreen'
import DecodeScreen from './DecodeScreen'
import DevPanel from './DevPanel'

type Screen = 'quest' | 'decode'

function App() {
  const [screen, setScreen] = useState<Screen>('quest')
  const [questKey, setQuestKey] = useState(0)

  return (
    <>
      {screen === 'quest' ? (
        <QuestScreen key={questKey} onContinue={() => setScreen('decode')} />
      ) : (
        <DecodeScreen onBack={() => setScreen('quest')} />
      )}
      {import.meta.env.DEV && <DevPanel onStateChange={() => setQuestKey((k) => k + 1)} />}
    </>
  )
}

export default App
