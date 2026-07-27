import { useEffect, useState } from 'react'
import WelcomeScreen from './WelcomeScreen'
import TeaserQuiz from './TeaserQuiz'
import StatusScreen from './StatusScreen'
import LevelScreen from './LevelScreen'
import FrequencyScreen from './FrequencyScreen'
import GoalScreen from './GoalScreen'
import AuthScreen from './AuthScreen'
import HomeScreen from './HomeScreen'
import QuestScreen from './QuestScreen'
import DecodeScreen from './DecodeScreen'
import NoteScreen from './NoteScreen'
import PricingScreen from './PricingScreen'
import CheckoutSuccessScreen from './CheckoutSuccessScreen'
import type { QuestSession } from './questSessions'
import type { EnglishLevel, LearningGoal, UserStatus, VisitFrequency } from './types'

type Screen =
  | 'welcome'
  | 'teaserQuiz'
  | 'status'
  | 'level'
  | 'frequency'
  | 'goal'
  | 'auth'
  | 'home'
  | 'quest'
  | 'decode'
  | 'notes'
  | 'pricing'
  | 'checkoutSuccess'

// Polar redirects back to `/?checkout_id=...` after a checkout attempt
// (success or otherwise) — pull that out of the URL once on load rather than
// wiring up a full router for a single query param.
function readCheckoutIdFromUrl(): string | null {
  const checkoutId = new URLSearchParams(window.location.search).get('checkout_id')
  if (checkoutId) {
    window.history.replaceState(null, '', window.location.pathname)
  }
  return checkoutId
}

function App() {
  const [checkoutId] = useState<string | null>(readCheckoutIdFromUrl)
  const [screen, setScreen] = useState<Screen>(checkoutId ? 'checkoutSuccess' : 'welcome')
  // Held in memory only. Gets merged into the full onboarding profile object
  // (goal/motivation/level/daily goal/profiling) and written to localStorage
  // once the whole onboarding flow is complete — not yet.
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null)
  const [englishLevel, setEnglishLevel] = useState<EnglishLevel | null>(null)
  const [visitFrequency, setVisitFrequency] = useState<VisitFrequency | null>(null)
  const [learningGoal, setLearningGoal] = useState<LearningGoal | null>(null)
  const [activeSession, setActiveSession] = useState<QuestSession | null>(null)
  // Pricing is shown both right after signup (onboarding paywall) and later
  // from the home screen's upgrade card — only the skip/back button copy
  // differs between the two.
  const [pricingContext, setPricingContext] = useState<'onboarding' | 'upgrade'>('onboarding')

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
      {screen === 'auth' && (
        <AuthScreen
          onContinue={() => {
            setPricingContext('onboarding')
            setScreen('pricing')
          }}
        />
      )}
      {screen === 'home' && (
        <HomeScreen
          onOpenQuest={(session) => {
            setActiveSession(session)
            setScreen('quest')
          }}
          onOpenDecode={() => setScreen('decode')}
          onOpenNotes={() => setScreen('notes')}
          onOpenPricing={() => {
            setPricingContext('upgrade')
            setScreen('pricing')
          }}
        />
      )}
      {screen === 'quest' && activeSession && (
        <QuestScreen session={activeSession} onExit={() => setScreen('home')} />
      )}
      {screen === 'decode' && <DecodeScreen onBack={() => setScreen('home')} />}
      {screen === 'notes' && <NoteScreen onBack={() => setScreen('home')} />}
      {screen === 'pricing' && (
        <PricingScreen
          skipLabel={pricingContext === 'onboarding' ? '나중에 하기' : '홈으로'}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'checkoutSuccess' && checkoutId && (
        <CheckoutSuccessScreen checkoutId={checkoutId} onDone={() => setScreen('home')} />
      )}
    </>
  )
}

export default App
