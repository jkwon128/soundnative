import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from './supabaseClient'
import useSubscription from './useSubscription'

interface MyPageScreenProps {
  onBack: () => void
  // Fired after a successful logout or account deletion — App.tsx sends
  // the user back to the welcome screen rather than an empty Home.
  onLoggedOut: () => void
}

type PasswordStatus = 'idle' | 'saving' | 'saved' | 'error'
type DeleteStep = 'idle' | 'confirming' | 'deleting' | 'error'

const DELETE_CONFIRM_WORD = 'DELETE'

const PROVIDER_LABEL: Record<string, string> = {
  email: '이메일 계정',
  google: '구글 계정',
}

function formatDate(iso: string | undefined): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

const SUBSCRIPTION_STATUS_LABEL: Record<string, string> = {
  trialing: '무료 체험 중',
  active: '구독 중',
  past_due: '결제 실패',
  canceled: '구독 종료됨',
  unpaid: '구독 종료됨',
  incomplete: '결제 확인 중',
  incomplete_expired: '구독 종료됨',
}

function MyPageScreen({ onBack, onLoggedOut }: MyPageScreenProps) {
  const [email, setEmail] = useState<string | null>(null)
  const [provider, setProvider] = useState<string | null>(null)
  const [createdAt, setCreatedAt] = useState<string | undefined>(undefined)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordStatus, setPasswordStatus] = useState<PasswordStatus>('idle')
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const [deleteStep, setDeleteStep] = useState<DeleteStep>('idle')
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const subscription = useSubscription()
  const [portalLoading, setPortalLoading] = useState(false)
  const [portalError, setPortalError] = useState<string | null>(null)

  useEffect(() => {
    // getSession() reads the already-established local session directly
    // (matches how HomeScreen/App.tsx check auth state) rather than
    // round-tripping to Supabase just to display info that's already known.
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user
      setEmail(user?.email ?? null)
      setProvider(user?.app_metadata?.provider ?? null)
      setCreatedAt(user?.created_at)
    })
  }, [])

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault()
    if (passwordStatus === 'saving') return

    if (newPassword.length < 6) {
      setPasswordStatus('error')
      setPasswordError('비밀번호는 6자 이상이어야 해요.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus('error')
      setPasswordError('비밀번호가 일치하지 않아요.')
      return
    }

    setPasswordStatus('saving')
    setPasswordError(null)

    // This project requires the current password to authorize a password
    // change from an ordinary logged-in session (as opposed to a
    // PASSWORD_RECOVERY session from the "forgot password" email link,
    // which is exempt) — without it Supabase rejects the update with
    // "current_password_required".
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
      current_password: currentPassword,
    })
    if (error) {
      setPasswordStatus('error')
      setPasswordError(error.message)
      return
    }

    setPasswordStatus('saved')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setTimeout(() => setPasswordStatus('idle'), 2000)
  }

  const handleOpenPortal = async () => {
    if (portalLoading) return
    setPortalLoading(true)
    setPortalError(null)

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) throw new Error('로그인이 필요합니다.')

      const response = await fetch('/api/customer-portal', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (!response.ok || !data?.url) {
        throw new Error(data?.error || '구독 관리 페이지를 여는 데 실패했습니다.')
      }
      // Card updates and cancellation happen on Polar's hosted portal — this
      // app never handles payment details itself. See customer-portal.ts.
      window.location.href = data.url
    } catch (err) {
      setPortalError(
        err instanceof Error ? err.message : '구독 관리 페이지를 여는 데 실패했습니다.',
      )
      setPortalLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    onLoggedOut()
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== DELETE_CONFIRM_WORD) return
    setDeleteStep('deleting')
    setDeleteError(null)

    try {
      // delete_user() is a SECURITY DEFINER Postgres function (owned by a
      // role with rights on auth.users) that deletes exactly
      // `auth.users where id = auth.uid()` — so it can only ever delete the
      // caller's own account, enforced by Postgres itself.
      const { error } = await supabase.rpc('delete_user')
      if (error) throw error

      await supabase.auth.signOut()
      onLoggedOut()
    } catch (err) {
      setDeleteStep('error')
      setDeleteError(err instanceof Error ? err.message : '탈퇴에 실패했습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-warm-bg flex justify-center p-gutter md:p-lg">
      <div className="w-full max-w-[480px] flex flex-col gap-md py-lg">
        <button
          className="flex items-center gap-1 text-warm-primary font-label-bold text-label-bold w-fit cursor-pointer"
          onClick={onBack}
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          홈으로
        </button>

        <h1 className="font-warm-serif text-headline-md text-warm-text">마이페이지</h1>

        <div className="bg-warm-surface border border-warm-border rounded-warm-card p-md flex flex-col gap-sm">
          <div className="font-label-bold text-label-bold text-warm-text-muted">내 정보</div>
          <div className="flex flex-col gap-1">
            <p className="font-body-lg text-body-lg text-warm-text">{email ?? '불러오는 중...'}</p>
            <p className="font-body-md text-sm text-warm-text-muted">
              {provider && (PROVIDER_LABEL[provider] ?? provider)}
              {provider && createdAt && ' · '}
              {createdAt && `${formatDate(createdAt)} 가입`}
            </p>
          </div>
        </div>

        <div className="bg-warm-surface border border-warm-border rounded-warm-card p-md flex flex-col gap-sm">
          <div className="font-label-bold text-label-bold text-warm-text-muted">구독</div>

          {subscription.status === 'loading' ? (
            <p className="font-body-md text-body-md text-warm-text-muted">불러오는 중...</p>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <p className="font-body-lg text-body-lg text-warm-text">
                  {SUBSCRIPTION_STATUS_LABEL[subscription.status] ?? '구독 내역 없음'}
                </p>
                {subscription.status === 'trialing' && subscription.trialEndsAt && (
                  <p className="font-body-md text-sm text-warm-text-muted">
                    {formatDate(subscription.trialEndsAt)}부터 자동으로 결제돼요
                  </p>
                )}
                {subscription.status === 'active' && subscription.currentPeriodEnd && (
                  <p className="font-body-md text-sm text-warm-text-muted">
                    {subscription.cancelAtPeriodEnd
                      ? `${formatDate(subscription.currentPeriodEnd)}에 종료돼요`
                      : `다음 결제일: ${formatDate(subscription.currentPeriodEnd)}`}
                  </p>
                )}
              </div>

              {subscription.status !== 'none' && (
                <button
                  className="flex items-center justify-center gap-2 bg-warm-surface border border-warm-border rounded-full py-sm px-md font-label-bold text-label-bold text-warm-text cursor-pointer disabled:opacity-50 disabled:cursor-default"
                  onClick={handleOpenPortal}
                  disabled={portalLoading}
                >
                  {portalLoading ? '이동 중...' : '구독 관리 (결제 수단 변경·해지)'}
                </button>
              )}

              {portalError && (
                <div className="bg-warm-error-bg border border-warm-error-border rounded-warm-lg px-md py-sm font-body-md text-sm text-warm-error-text">
                  {portalError}
                </div>
              )}
            </>
          )}
        </div>

        <div className="bg-warm-surface border border-warm-border rounded-warm-card p-md flex flex-col gap-sm">
          <div className="font-label-bold text-label-bold text-warm-text-muted">
            비밀번호 재설정
          </div>
          <form className="flex flex-col gap-sm" onSubmit={handleChangePassword}>
            <input
              className="w-full bg-warm-bg-soft border-2 border-warm-border rounded-warm-lg px-md py-sm font-body-md text-body-md text-warm-text focus:border-warm-primary focus:ring-0 transition-colors"
              placeholder="현재 비밀번호"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={passwordStatus === 'saving'}
            />
            <input
              className="w-full bg-warm-bg-soft border-2 border-warm-border rounded-warm-lg px-md py-sm font-body-md text-body-md text-warm-text focus:border-warm-primary focus:ring-0 transition-colors"
              placeholder="새 비밀번호"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={passwordStatus === 'saving'}
              minLength={6}
            />
            <input
              className="w-full bg-warm-bg-soft border-2 border-warm-border rounded-warm-lg px-md py-sm font-body-md text-body-md text-warm-text focus:border-warm-primary focus:ring-0 transition-colors"
              placeholder="새 비밀번호 확인"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={passwordStatus === 'saving'}
              minLength={6}
            />

            {passwordStatus === 'error' && passwordError && (
              <div className="bg-warm-error-bg border border-warm-error-border rounded-warm-lg px-md py-sm font-body-md text-sm text-warm-error-text">
                {passwordError}
              </div>
            )}
            {passwordStatus === 'saved' && (
              <div className="bg-warm-success-bg border border-warm-success-border rounded-warm-lg px-md py-sm font-body-md text-sm text-warm-text">
                비밀번호가 변경됐어요.
              </div>
            )}

            <button
              className="btn-warm-primary w-full bg-warm-primary text-warm-on-primary font-label-bold text-label-bold py-sm px-md rounded-full cursor-pointer disabled:bg-warm-badge-bg disabled:text-warm-text-muted"
              type="submit"
              disabled={
                passwordStatus === 'saving' || !currentPassword || !newPassword || !confirmPassword
              }
            >
              {passwordStatus === 'saving' ? '변경 중...' : '비밀번호 변경'}
            </button>
          </form>
        </div>

        <button
          className="flex items-center justify-center gap-2 bg-warm-surface border border-warm-border rounded-full py-sm px-md font-label-bold text-label-bold text-warm-text cursor-pointer"
          onClick={handleLogout}
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          로그아웃
        </button>

        {deleteStep === 'idle' ? (
          <button
            className="text-warm-error-border font-label-bold text-label-bold text-sm text-center cursor-pointer mt-md"
            onClick={() => setDeleteStep('confirming')}
          >
            회원 탈퇴
          </button>
        ) : (
          <div className="bg-warm-error-bg border border-warm-error-border rounded-warm-card p-md flex flex-col gap-sm">
            <p className="font-label-bold text-label-bold text-warm-error-text">
              정말 탈퇴하시겠어요?
            </p>
            <p className="font-body-md text-sm text-warm-text-muted">
              계정을 삭제하면 되돌릴 수 없어요. 저장된 학습 기록은 이 브라우저에 남아있지만,
              계정으로는 다시 로그인할 수 없어요.
            </p>
            <p className="font-body-md text-sm text-warm-text-muted">
              계속하려면 아래에 <span className="font-label-bold text-warm-error-text">DELETE</span>를
              입력해주세요.
            </p>

            <input
              className="w-full bg-warm-surface border-2 border-warm-border rounded-warm-lg px-md py-sm font-body-md text-body-md text-warm-text focus:border-warm-error-border focus:ring-0 transition-colors"
              placeholder="DELETE"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              disabled={deleteStep === 'deleting'}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />

            {deleteStep === 'error' && deleteError && (
              <div className="bg-warm-error-bg border border-warm-error-border rounded-warm-lg px-md py-sm font-body-md text-sm text-warm-error-text">
                {deleteError}
              </div>
            )}

            <div className="flex gap-sm justify-end">
              <button
                className="font-label-bold text-label-bold text-warm-text-muted py-sm px-md rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-default"
                onClick={() => {
                  setDeleteStep('idle')
                  setDeleteConfirmText('')
                }}
                disabled={deleteStep === 'deleting'}
              >
                취소
              </button>
              <button
                className="bg-warm-error-border text-warm-on-primary font-label-bold text-label-bold py-sm px-md rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-default"
                onClick={handleDeleteAccount}
                disabled={deleteStep === 'deleting' || deleteConfirmText !== DELETE_CONFIRM_WORD}
              >
                {deleteStep === 'deleting' ? '탈퇴 처리 중...' : '탈퇴하기'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyPageScreen
