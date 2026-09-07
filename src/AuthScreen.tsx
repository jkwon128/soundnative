import { useState, type FormEvent } from 'react'
import { supabase } from './supabaseClient'
import { saveUserProfile, savePendingOnboardingProfile } from './userProfile'
import type { EnglishLevel, LearningGoal, UserStatus, VisitFrequency } from './types'
import {
  trackSignUp,
  trackLogin,
  trackSignUpConfirmationSent,
  stashPendingGoogleAuthMode,
} from './analytics'

const TOTAL_ONBOARDING_STEPS = 5

interface AuthScreenProps {
  // The 5-step onboarding survey's answers, held by App.tsx. Always
  // non-null by the time this screen is reachable (Status/Level/Frequency/
  // Goal each require a selection before their "다음" advances) — typed
  // nullable anyway since that's how App.tsx has to declare the state, and
  // saving the profile just no-ops if one is somehow missing.
  userStatus: UserStatus | null
  englishLevel: EnglishLevel | null
  visitFrequency: VisitFrequency | null
  learningGoal: LearningGoal | null
  onContinue: () => void
}

type AuthMode = 'signUp' | 'logIn'
type ResetStatus = 'idle' | 'sending' | 'sent' | 'error'

function AuthScreen({
  userStatus,
  englishLevel,
  visitFrequency,
  learningGoal,
  onContinue,
}: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('signUp')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmationSent, setConfirmationSent] = useState(false)

  const [forgotPasswordMode, setForgotPasswordMode] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetStatus, setResetStatus] = useState<ResetStatus>('idle')
  const [resetError, setResetError] = useState<string | null>(null)

  // Fires the user_profiles upsert without awaiting it, so a slow or failed
  // save never delays the screen transition it's called alongside. Only
  // called once a signup/login has actually produced a session (a user id
  // to save against, and the session the RLS policy checks).
  const saveOnboardingProfile = (userId: string) => {
    if (!userStatus || !englishLevel || !visitFrequency || !learningGoal) return
    void saveUserProfile(userId, {
      status: userStatus,
      englishLevel,
      visitFrequency,
      learningGoal,
    })
  }

  // For flows that leave this page before a session exists (email
  // confirmation, Google OAuth) — stash the answers so App.tsx's session
  // check can save them later once it remounts with a session. See
  // userProfile.ts's savePendingOnboardingProfile for why this is needed.
  const stashOnboardingProfileForLater = () => {
    if (!userStatus || !englishLevel || !visitFrequency || !learningGoal) return
    savePendingOnboardingProfile({
      status: userStatus,
      englishLevel,
      visitFrequency,
      learningGoal,
    })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError(null)

    try {
      if (mode === 'signUp') {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
        if (signUpError) throw signUpError
        // If email confirmation is required, Supabase returns a user but no
        // active session yet — there's nothing to continue into until they
        // click the link in their inbox.
        if (data.session) {
          saveOnboardingProfile(data.session.user.id)
          trackSignUp('email')
          onContinue()
        } else {
          stashOnboardingProfileForLater()
          trackSignUpConfirmationSent()
          setConfirmationSent(true)
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError
        saveOnboardingProfile(data.user.id)
        trackLogin('email')
        onContinue()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setMode((m) => (m === 'signUp' ? 'logIn' : 'signUp'))
    setError(null)
    setConfirmationSent(false)
  }

  const openForgotPassword = () => {
    setForgotPasswordMode(true)
    setResetEmail(email)
    setResetStatus('idle')
    setResetError(null)
  }

  const closeForgotPassword = () => {
    setForgotPasswordMode(false)
    setResetStatus('idle')
    setResetError(null)
  }

  const handleSendResetEmail = async (e: FormEvent) => {
    e.preventDefault()
    if (resetStatus === 'sending') return
    setResetStatus('sending')
    setResetError(null)

    // Supabase emails a link back to this origin; clicking it fires a
    // PASSWORD_RECOVERY auth event that App.tsx listens for to show the
    // "set a new password" screen.
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: window.location.origin,
    })
    if (resetErr) {
      setResetStatus('error')
      setResetError(resetErr.message)
      return
    }
    setResetStatus('sent')
  }

  const handleGoogleLogin = async () => {
    setError(null)
    // This navigates the browser away to Google's consent screen — on
    // success it lands back on this origin with a session, which
    // App.tsx's getSession() check on mount picks up. React remounts from
    // scratch on the way back, so stash the answers now or they're gone.
    stashOnboardingProfileForLater()
    stashPendingGoogleAuthMode(mode)
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (oauthError) setError(oauthError.message)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-gutter md:p-lg bg-warm-bg">
      <div className="w-full max-w-[480px] bg-warm-surface border border-warm-border rounded-warm-card shadow-warm-card p-md md:p-lg flex flex-col gap-md md:gap-lg relative overflow-hidden">
        <div className="flex items-center gap-xs w-full mb-sm">
          {Array.from({ length: TOTAL_ONBOARDING_STEPS }).map((_, i) => (
            <div key={i} className="h-2 flex-1 rounded-full bg-warm-primary relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20" />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-sm text-center">
          <span className="material-symbols-outlined text-warm-primary text-4xl mb-2 inline-block">
            celebration
          </span>
          <h1 className="font-headline-md text-headline-md text-warm-text">
            거의 다 왔어요! 진행 상황을 저장하려면 가입해주세요
          </h1>
          <p className="font-body-md text-body-md text-warm-text-muted">
            Almost there! Sign up to save your progress.
          </p>
        </div>

        {confirmationSent ? (
          <div className="bg-warm-success-bg border border-warm-success-border rounded-warm-lg px-md py-sm text-center">
            <p className="font-body-md text-body-md text-warm-text">
              가입 확인 이메일을 보냈어요. 메일함에서 링크를 눌러 인증을 완료해주세요.
            </p>
          </div>
        ) : forgotPasswordMode ? (
          <div className="flex flex-col gap-sm w-full mt-2">
            {resetStatus === 'sent' ? (
              <div className="bg-warm-success-bg border border-warm-success-border rounded-warm-lg px-md py-sm text-center">
                <p className="font-body-md text-body-md text-warm-text">
                  비밀번호 재설정 이메일을 보냈어요. 메일함에서 링크를 눌러 새 비밀번호를
                  설정해주세요.
                </p>
              </div>
            ) : (
              <form className="flex flex-col gap-sm" onSubmit={handleSendResetEmail}>
                <input
                  className="w-full bg-warm-surface border-2 border-warm-border rounded-warm-lg px-md py-sm font-body-lg text-body-lg text-warm-text focus:border-warm-primary focus:ring-0 transition-colors"
                  placeholder="이메일 (Email address)"
                  type="email"
                  autoComplete="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  disabled={resetStatus === 'sending'}
                />

                {resetStatus === 'error' && resetError && (
                  <div className="bg-warm-error-bg border border-warm-error-border rounded-warm-lg px-md py-sm font-body-md text-sm text-warm-error-text">
                    {resetError}
                  </div>
                )}

                <button
                  className="btn-warm-primary w-full bg-warm-primary text-warm-on-primary font-label-bold text-label-bold py-sm px-md rounded-full flex justify-center items-center cursor-pointer disabled:bg-warm-badge-bg disabled:text-warm-text-muted"
                  type="submit"
                  disabled={resetStatus === 'sending' || !resetEmail.trim()}
                >
                  {resetStatus === 'sending' ? '전송 중...' : '재설정 이메일 보내기'}
                </button>
              </form>
            )}

            <button
              type="button"
              className="text-warm-primary font-label-bold text-label-bold text-sm text-center cursor-pointer"
              onClick={closeForgotPassword}
            >
              로그인으로 돌아가기
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-sm w-full mt-2">
            <button
              type="button"
              className="btn-warm-secondary w-full flex items-center justify-center gap-sm bg-warm-surface border border-warm-border text-warm-text font-label-bold text-label-bold py-sm px-md rounded-full hover:bg-warm-bg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-default"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google로 계속하기
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-warm-border" />
              <span className="flex-shrink-0 mx-4 text-warm-text-muted text-sm font-label-bold">
                or
              </span>
              <div className="flex-grow border-t border-warm-border" />
            </div>

            <form className="flex flex-col gap-sm" onSubmit={handleSubmit}>
              <input
                className="w-full bg-warm-surface border-2 border-warm-border rounded-warm-lg px-md py-sm font-body-lg text-body-lg text-warm-text focus:border-warm-primary focus:ring-0 transition-colors"
                placeholder="이메일 (Email address)"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <input
                className="w-full bg-warm-surface border-2 border-warm-border rounded-warm-lg px-md py-sm font-body-lg text-body-lg text-warm-text focus:border-warm-primary focus:ring-0 transition-colors"
                placeholder="비밀번호 (Password)"
                type="password"
                autoComplete={mode === 'signUp' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                minLength={6}
              />

              {mode === 'logIn' && (
                <button
                  type="button"
                  className="text-warm-primary font-label-bold text-label-bold text-sm text-right w-fit self-end cursor-pointer"
                  onClick={openForgotPassword}
                  disabled={loading}
                >
                  비밀번호를 잊으셨나요?
                </button>
              )}

              {error && (
                <div className="bg-warm-error-bg border border-warm-error-border rounded-warm-lg px-md py-sm font-body-md text-sm text-warm-error-text">
                  {error}
                </div>
              )}

              <button
                className="btn-warm-primary w-full bg-warm-primary text-warm-on-primary font-label-bold text-label-bold py-sm px-md rounded-full flex justify-center items-center cursor-pointer disabled:bg-warm-badge-bg disabled:text-warm-text-muted"
                type="submit"
                disabled={loading || !email.trim() || !password}
              >
                {loading ? '처리 중...' : mode === 'signUp' ? '이메일로 가입하기' : '로그인'}
              </button>

              <button
                type="button"
                className="text-warm-primary font-label-bold text-label-bold text-sm text-center cursor-pointer"
                onClick={toggleMode}
                disabled={loading}
              >
                {mode === 'signUp'
                  ? '이미 계정이 있으신가요? 로그인'
                  : '계정이 없으신가요? 회원가입'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuthScreen
