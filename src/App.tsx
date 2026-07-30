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
import MyPageScreen from './MyPageScreen'
import ResetPasswordScreen from './ResetPasswordScreen'
import { supabase } from './supabaseClient'
import useSubscription, { hasAccess } from './useSubscription'
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
  | 'checkoutSuccess'
  | 'myPage'
  | 'resetPassword'

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
  const [sessionChecked, setSessionChecked] = useState(false)
  // Held in memory only. Gets merged into the full onboarding profile object
  // (goal/motivation/level/daily goal/profiling) and written to localStorage
  // once the whole onboarding flow is complete — not yet.
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null)
  const [englishLevel, setEnglishLevel] = useState<EnglishLevel | null>(null)
  const [visitFrequency, setVisitFrequency] = useState<VisitFrequency | null>(null)
  const [learningGoal, setLearningGoal] = useState<LearningGoal | null>(null)
  const [activeSession, setActiveSession] = useState<QuestSession | null>(null)
  const subscription = useSubscription()

  useEffect(() => {
    // Right after a checkout, give the Polar webhook a moment to land before
    // the user hits "홈으로" — otherwise the entitlement check below can
    // still see the pre-checkout state and bounce them back to the paywall.
    if (!checkoutId) return
    const timer = setTimeout(() => subscription.refetch(), 1500)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutId])

  useEffect(() => {
    // The Supabase client auto-detects a session from the URL (e.g. the
    // "Confirm email" link's token) before this resolves, so a just-
    // confirmed or already-logged-in user lands on Home instead of
    // restarting onboarding from the welcome screen.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session && !checkoutId) {
        setScreen('home')
      }
      setSessionChecked(true)
    })
  }, [checkoutId])

  useEffect(() => {
    // Clicking the "reset password" email link lands back here and fires
    // this event (with a real, usable session) instead of appearing as a
    // normal sign-in — route to a dedicated "set a new password" screen
    // rather than dropping the user straight onto Home.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setScreen('resetPassword')
      }
    })
    return () => subscription.unsubscribe()
  }, [])

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

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="font-body-md text-body-md text-on-surface-variant">불러오는 중...</div>
      </div>
    )
  }

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
      {screen === 'auth' && <AuthScreen onContinue={() => setScreen('home')} />}
      {screen === 'home' && subscription.status === 'loading' && (
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <div className="font-body-md text-body-md text-on-surface-variant">불러오는 중...</div>
        </div>
      )}
      {screen === 'home' && subscription.status !== 'loading' && !hasAccess(subscription.status) && (
        // Not signed up for the trial yet, or the trial/subscription has
        // ended — every path into "home" funnels through this same check so
        // there's exactly one place the hard paywall is enforced.
        <PricingScreen skipLabel="나중에 하기" onBack={() => setScreen('welcome')} />
      )}
      {screen === 'home' && hasAccess(subscription.status) && (
        <HomeScreen
          subscription={subscription}
          onOpenQuest={(session) => {
            setActiveSession(session)
            setScreen('quest')
          }}
          onOpenDecode={() => setScreen('decode')}
          onOpenNotes={() => setScreen('notes')}
          onOpenMyPage={() => setScreen('myPage')}
        />
      )}
      {screen === 'quest' && activeSession && (
        <QuestScreen session={activeSession} onExit={() => setScreen('home')} />
      )}
      {screen === 'decode' && <DecodeScreen onBack={() => setScreen('home')} />}
      {screen === 'notes' && <NoteScreen onBack={() => setScreen('home')} />}
      {screen === 'checkoutSuccess' && checkoutId && (
        <CheckoutSuccessScreen checkoutId={checkoutId} onDone={() => setScreen('home')} />
      )}
      {screen === 'myPage' && (
        <MyPageScreen onBack={() => setScreen('home')} onLoggedOut={() => setScreen('welcome')} />
      )}
      {screen === 'resetPassword' && (
        <ResetPasswordScreen onDone={() => setScreen('home')} />
      )}
    </>
  )
}

export default App
