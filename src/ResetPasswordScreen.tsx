import { useState, type FormEvent } from 'react'
import { supabase } from './supabaseClient'

interface ResetPasswordScreenProps {
  // Fired once the new password is saved — App.tsx sends the user to Home,
  // since a PASSWORD_RECOVERY session is a real logged-in session.
  onDone: () => void
}

type Status = 'idle' | 'saving' | 'saved' | 'error'

function ResetPasswordScreen({ onDone }: ResetPasswordScreenProps) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (status === 'saving') return

    if (newPassword.length < 6) {
      setStatus('error')
      setError('비밀번호는 6자 이상이어야 해요.')
      return
    }
    if (newPassword !== confirmPassword) {
      setStatus('error')
      setError('비밀번호가 일치하지 않아요.')
      return
    }

    setStatus('saving')
    setError(null)

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
    if (updateError) {
      setStatus('error')
      setError(updateError.message)
      return
    }

    setStatus('saved')
    setTimeout(onDone, 1200)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-gutter md:p-lg bg-warm-bg">
      <div className="w-full max-w-[480px] bg-warm-surface border border-warm-border rounded-warm-card shadow-warm-card p-md md:p-lg flex flex-col gap-md">
        <div className="flex flex-col gap-sm text-center">
          <span className="material-symbols-outlined text-warm-primary text-4xl mb-2 inline-block">
            lock_reset
          </span>
          <h1 className="font-headline-md text-headline-md text-warm-text">새 비밀번호 설정</h1>
          <p className="font-body-md text-body-md text-warm-text-muted">
            새로 사용할 비밀번호를 입력해주세요.
          </p>
        </div>

        {status === 'saved' ? (
          <div className="bg-warm-success-bg border border-warm-success-border rounded-warm-lg px-md py-sm text-center">
            <p className="font-body-md text-body-md text-warm-text">비밀번호가 변경됐어요!</p>
          </div>
        ) : (
          <form className="flex flex-col gap-sm" onSubmit={handleSubmit}>
            <input
              className="w-full bg-warm-surface border-2 border-warm-border rounded-warm-lg px-md py-sm font-body-lg text-body-lg text-warm-text focus:border-warm-primary focus:ring-0 transition-colors"
              placeholder="새 비밀번호"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={status === 'saving'}
              minLength={6}
            />
            <input
              className="w-full bg-warm-surface border-2 border-warm-border rounded-warm-lg px-md py-sm font-body-lg text-body-lg text-warm-text focus:border-warm-primary focus:ring-0 transition-colors"
              placeholder="새 비밀번호 확인"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={status === 'saving'}
              minLength={6}
            />

            {status === 'error' && error && (
              <div className="bg-warm-error-bg border border-warm-error-border rounded-warm-lg px-md py-sm font-body-md text-sm text-warm-error-text">
                {error}
              </div>
            )}

            <button
              className="btn-warm-primary w-full bg-warm-primary text-warm-on-primary font-label-bold text-label-bold py-sm px-md rounded-full flex justify-center items-center cursor-pointer disabled:bg-warm-badge-bg disabled:text-warm-text-muted"
              type="submit"
              disabled={status === 'saving' || !newPassword || !confirmPassword}
            >
              {status === 'saving' ? '변경 중...' : '비밀번호 변경'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPasswordScreen
