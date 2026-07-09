import { useState } from 'react'
import QuestScreen from './QuestScreen'
import DecodeScreen from './DecodeScreen'

type Screen = 'quest' | 'decode'

function App() {
  const [screen, setScreen] = useState<Screen>('quest')

  if (screen === 'quest') {
    return <QuestScreen onContinue={() => setScreen('decode')} />
  }

  return <DecodeScreen onBack={() => setScreen('quest')} />
}

export default App
