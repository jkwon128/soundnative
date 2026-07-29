import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from './supabaseClient'

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

function MyPageScreen({ onBack, onLoggedOut }: MyPageScreenProps) {
  const [email, setEmail] = useState<string | null>(null)
  const [provider, setProvider] = useState<string | null>(null)
  const [createdAt, setCreatedAt] = useState<string | undefined>(undefined)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordStatus, setPasswordStatus] = useState<PasswordStatus>('idle')
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const [deleteStep, setDeleteStep] = useState<DeleteStep>('idle')
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

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

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setPasswordStatus('error')
      setPasswordError(error.message)
      return
    }

    setPasswordStatus('saved')
    setNewPassword('')
    setConfirmPassword('')
    setTimeout(() => setPasswordStatus('idle'), 2000)
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
    <div className="min-h-screen bg-surface flex justify-center p-gutter md:p-lg">
      <div className="w-full max-w-[480px] flex flex-col gap-md py-lg">
        <button
          className="flex items-center gap-1 text-primary font-label-bold text-label-bold w-fit cursor-pointer"
          onClick={onBack}
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          홈으로
        </button>

        <h1 className="font-headline-md text-headline-md text-on-surface">마이페이지</h1>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col gap-sm">
          <div className="font-label-bold text-label-bold text-on-surface-variant">내 정보</div>
          <div className="flex flex-col gap-1">
            <p className="font-body-lg text-body-lg text-on-surface">{email ?? '불러오는 중...'}</p>
            <p className="font-body-md text-sm text-on-surface-variant">
              {provider && (PROVIDER_LABEL[provider] ?? provider)}
              {provider && createdAt && ' · '}
              {createdAt && `${formatDate(createdAt)} 가입`}
            </p>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col gap-sm">
          <div className="font-label-bold text-label-bold text-on-surface-variant">
            비밀번호 재설정
          </div>
          <form className="flex flex-col gap-sm" onSubmit={handleChangePassword}>
            <input
              className="w-full bg-surface border-2 border-outline-variant rounded-lg px-md py-sm font-body-md text-body-md text-on-surface focus:border-primary focus:ring-0 transition-colors"
              placeholder="새 비밀번호"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={passwordStatus === 'saving'}
              minLength={6}
            />
            <input
              className="w-full bg-surface border-2 border-outline-variant rounded-lg px-md py-sm font-body-md text-body-md text-on-surface focus:border-primary focus:ring-0 transition-colors"
              placeholder="새 비밀번호 확인"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={passwordStatus === 'saving'}
              minLength={6}
            />

            {passwordStatus === 'error' && passwordError && (
              <div className="bg-error-container border border-error rounded-lg px-md py-sm font-body-md text-sm text-on-error-container">
                {passwordError}
              </div>
            )}
            {passwordStatus === 'saved' && (
              <div className="bg-secondary-container/20 border border-secondary rounded-lg px-md py-sm font-body-md text-sm text-on-surface">
                비밀번호가 변경됐어요.
              </div>
            )}

            <button
              className="btn-primary w-full bg-primary text-on-primary font-label-bold text-label-bold py-sm px-md rounded-lg cursor-pointer disabled:bg-surface-container-high disabled:text-on-surface-variant disabled:border-none disabled:cursor-default"
              type="submit"
              disabled={passwordStatus === 'saving' || !newPassword || !confirmPassword}
            >
              {passwordStatus === 'saving' ? '변경 중...' : '비밀번호 변경'}
            </button>
          </form>
        </div>

        <button
          className="flex items-center justify-center gap-2 bg-surface-container-lowest border border-outline-variant rounded-lg py-sm px-md font-label-bold text-label-bold text-on-surface cursor-pointer"
          onClick={handleLogout}
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          로그아웃
        </button>

        {deleteStep === 'idle' ? (
          <button
            className="text-error font-label-bold text-label-bold text-sm text-center cursor-pointer mt-md"
            onClick={() => setDeleteStep('confirming')}
          >
            회원 탈퇴
          </button>
        ) : (
          <div className="bg-error-container/40 border border-error rounded-xl p-md flex flex-col gap-sm">
            <p className="font-label-bold text-label-bold text-on-error-container">
              정말 탈퇴하시겠어요?
            </p>
            <p className="font-body-md text-sm text-on-surface-variant">
              계정을 삭제하면 되돌릴 수 없어요. 저장된 학습 기록은 이 브라우저에 남아있지만,
              계정으로는 다시 로그인할 수 없어요.
            </p>
            <p className="font-body-md text-sm text-on-surface-variant">
              계속하려면 아래에 <span className="font-label-bold text-on-error-container">DELETE</span>를
              입력해주세요.
            </p>

            <input
              className="w-full bg-surface border-2 border-outline-variant rounded-lg px-md py-sm font-body-md text-body-md text-on-surface focus:border-error focus:ring-0 transition-colors"
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
              <div className="bg-error-container border border-error rounded-lg px-md py-sm font-body-md text-sm text-on-error-container">
                {deleteError}
              </div>
            )}

            <div className="flex gap-sm justify-end">
              <button
                className="font-label-bold text-label-bold text-on-surface-variant py-sm px-md rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-default"
                onClick={() => {
                  setDeleteStep('idle')
                  setDeleteConfirmText('')
                }}
                disabled={deleteStep === 'deleting'}
              >
                취소
              </button>
              <button
                className="bg-error text-on-error font-label-bold text-label-bold py-sm px-md rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-default"
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
