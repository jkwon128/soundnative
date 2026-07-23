import { useState } from 'react'
import WelcomeScreen from './WelcomeScreen'
import TeaserQuiz from './TeaserQuiz'
import PlaceholderScreen from './PlaceholderScreen'

type Screen = 'welcome' | 'teaserQuiz' | 'placeholder'

function App() {
  const [screen, setScreen] = useState<Screen>('welcome')

  return (
    <>
      {screen === 'welcome' && <WelcomeScreen onStart={() => setScreen('teaserQuiz')} />}
      {screen === 'teaserQuiz' && <TeaserQuiz onComplete={() => setScreen('placeholder')} />}
      {screen === 'placeholder' && <PlaceholderScreen />}
    </>
  )
}

export default App
