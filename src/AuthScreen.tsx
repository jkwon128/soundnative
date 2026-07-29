import { useState, type FormEvent } from 'react'
import { supabase } from './supabaseClient'

const TOTAL_ONBOARDING_STEPS = 5

interface AuthScreenProps {
  onContinue: () => void
}

type AuthMode = 'signUp' | 'logIn'

function AuthScreen({ onContinue }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('signUp')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmationSent, setConfirmationSent] = useState(false)

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
          onContinue()
        } else {
          setConfirmationSent(true)
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError
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

  const handleGoogleLogin = async () => {
    setError(null)
    // This navigates the browser away to Google's consent screen — on
    // success it lands back on this origin with a session, which
    // App.tsx's getSession() check on mount picks up. Nothing else to do
    // here unless kicking off the redirect itself fails.
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (oauthError) setError(oauthError.message)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-gutter md:p-lg bg-surface">
      <div className="w-full max-w-[480px] bg-surface-container-lowest border border-outline-variant rounded-xl p-md md:p-lg flex flex-col gap-md md:gap-lg relative overflow-hidden">
        <div className="flex items-center gap-xs w-full mb-sm">
          {Array.from({ length: TOTAL_ONBOARDING_STEPS }).map((_, i) => (
            <div key={i} className="h-2 flex-1 rounded-full bg-primary relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20" />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-sm text-center">
          <span className="material-symbols-outlined text-primary text-4xl mb-2 inline-block">
            celebration
          </span>
          <h1 className="font-headline-md text-headline-md text-on-surface">
            거의 다 왔어요! 진행 상황을 저장하려면 가입해주세요
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Almost there! Sign up to save your progress.
          </p>
        </div>

        {confirmationSent ? (
          <div className="bg-secondary-container/20 border border-secondary rounded-lg px-md py-sm text-center">
            <p className="font-body-md text-body-md text-on-surface">
              가입 확인 이메일을 보냈어요. 메일함에서 링크를 눌러 인증을 완료해주세요.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-sm w-full mt-2">
            <button
              type="button"
              className="btn-secondary w-full flex items-center justify-center gap-sm bg-surface-container-lowest border border-outline text-on-surface font-label-bold text-label-bold py-sm px-md rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-default"
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
              <div className="flex-grow border-t border-outline-variant" />
              <span className="flex-shrink-0 mx-4 text-on-surface-variant text-sm font-label-bold">
                or
              </span>
              <div className="flex-grow border-t border-outline-variant" />
            </div>

            <form className="flex flex-col gap-sm" onSubmit={handleSubmit}>
              <input
                className="w-full bg-surface-container-lowest border-2 border-outline-variant rounded-lg px-md py-sm font-body-lg text-body-lg text-on-surface focus:border-primary focus:ring-0 transition-colors"
                placeholder="이메일 (Email address)"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <input
                className="w-full bg-surface-container-lowest border-2 border-outline-variant rounded-lg px-md py-sm font-body-lg text-body-lg text-on-surface focus:border-primary focus:ring-0 transition-colors"
                placeholder="비밀번호 (Password)"
                type="password"
                autoComplete={mode === 'signUp' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                minLength={6}
              />

              {error && (
                <div className="bg-error-container border border-error rounded-lg px-md py-sm font-body-md text-sm text-on-error-container">
                  {error}
                </div>
              )}

              <button
                className="btn-primary w-full bg-primary text-on-primary font-label-bold text-label-bold py-sm px-md rounded-lg flex justify-center items-center cursor-pointer disabled:bg-surface-container-high disabled:text-on-surface-variant disabled:border-none disabled:cursor-default"
                type="submit"
                disabled={loading || !email.trim() || !password}
              >
                {loading ? '처리 중...' : mode === 'signUp' ? '이메일로 가입하기' : '로그인'}
              </button>

              <button
                type="button"
                className="text-primary font-label-bold text-label-bold text-sm text-center cursor-pointer"
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

        <div className="mt-2 text-center">
          <button
            className="text-tertiary font-label-bold text-label-bold hover:text-on-surface underline transition-colors cursor-pointer"
            onClick={onContinue}
          >
            나중에 하기 (Do it later)
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthScreen
