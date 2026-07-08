import { useState } from 'react'
import QuestScreen from './QuestScreen'
import DecodeScreen from './DecodeScreen'

type Screen = 'quest' | 'decode'

function App() {
  const [screen, setScreen] = useState<Screen>('quest')

  return (
    <div>
      <nav style={{ display: 'flex', gap: 8, justifyContent: 'center', padding: 12 }}>
        <button onClick={() => setScreen('quest')} disabled={screen === 'quest'}>
          Quest
        </button>
        <button onClick={() => setScreen('decode')} disabled={screen === 'decode'}>
          Decode
        </button>
      </nav>
      {screen === 'quest' ? <QuestScreen /> : <DecodeScreen />}
    </div>
  )
}

export default App
