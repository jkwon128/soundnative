import { useEffect, useState } from 'react'
import { loadNotes, addManualNote, deleteNote } from './notes'
import { CATEGORY_META } from './categoryMeta'
import { groupNotesByDate, sortNotesNewestFirst } from './noteGrouping'
import { loadCustomerEmail } from './customerEmail'
import { getEffectiveStreak } from './dailyQuest'
import { supabase } from './supabaseClient'
import HomeLayout from './HomeLayout'
import type { QuizCategory } from './quizData'
import type { NoteEntry } from './types'

interface NoteScreenProps {
  onBack: () => void
  onOpenDecode: () => void
}

type EmailStatus = 'idle' | 'sending' | 'sent' | 'error'

function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

function NoteScreen({ onBack, onOpenDecode }: NoteScreenProps) {
  const [notes, setNotes] = useState<NoteEntry[]>(() => loadNotes())
  const [isWriting, setIsWriting] = useState(false)
  const [draft, setDraft] = useState('')

  const [isEmailFormOpen, setIsEmailFormOpen] = useState(false)
  const [emailStatus, setEmailStatus] = useState<EmailStatus>('idle')
  const [emailError, setEmailError] = useState<string | null>(null)
  const customerEmail = loadCustomerEmail()
  const canSendEmail = notes.length > 0 && Boolean(customerEmail)

  const streak = getEffectiveStreak()
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user.email ?? null)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const sortedNotes = sortNotesNewestFirst(notes)
  const noteGroups = groupNotesByDate(sortedNotes)

  const handleSaveDraft = () => {
    if (!draft.trim()) return
    addManualNote(draft)
    setNotes(loadNotes())
    setDraft('')
    setIsWriting(false)
  }

  const handleCancelDraft = () => {
    setDraft('')
    setIsWriting(false)
  }

  const handleDelete = (id: string) => {
    deleteNote(id)
    setNotes(loadNotes())
  }

  const handleOpenEmailForm = () => {
    if (!canSendEmail) return
    setIsEmailFormOpen(true)
    setEmailStatus('idle')
    setEmailError(null)
  }

  const handleCancelEmailForm = () => {
    setIsEmailFormOpen(false)
    setEmailStatus('idle')
    setEmailError(null)
  }

  const handleSendEmail = async () => {
    if (emailStatus === 'sending' || !customerEmail) return
    setEmailStatus('sending')
    setEmailError(null)

    try {
      const response = await fetch('/api/send-notes-email', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: customerEmail, notes: loadNotes() }),
      })
      const data = await response.json()
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || '이메일 전송에 실패했습니다.')
      }
      setEmailStatus('sent')
      // Show the confirmation briefly, then close.
      setTimeout(() => {
        setIsEmailFormOpen(false)
        setEmailStatus('idle')
      }, 1500)
    } catch (err) {
      setEmailStatus('error')
      setEmailError(err instanceof Error ? err.message : '이메일 전송에 실패했습니다.')
    }
  }

  return (
    <HomeLayout
      activeTab="notes"
      streak={streak}
      userEmail={userEmail}
      onOpenHome={onBack}
      onOpenDecode={onOpenDecode}
      onOpenNotes={() => {}}
    >
      <div className="w-full max-w-[560px] mx-auto flex flex-col gap-md">
        <button
          className="flex items-center gap-1 text-warm-primary font-label-bold text-label-bold w-fit cursor-pointer"
          onClick={onBack}
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          홈으로
        </button>

        <div>
          <h1 className="font-warm-serif text-headline-md text-warm-text">노트</h1>
          <p className="font-body-md text-body-md text-warm-text-muted">
            지금까지 배운 표현 {notes.length}개
          </p>
        </div>

        {!isWriting ? (
          <button
            className="flex items-center justify-center gap-2 bg-warm-surface border border-warm-border rounded-full py-sm px-md font-label-bold text-label-bold text-warm-primary cursor-pointer"
            onClick={() => setIsWriting(true)}
          >
            <span className="material-symbols-outlined text-xl">add</span>
            직접 메모 추가
          </button>
        ) : (
          <div className="flex flex-col gap-sm bg-warm-surface border border-warm-border rounded-warm-card p-md">
            <textarea
              autoFocus
              className="w-full min-h-20 bg-warm-bg-soft border-2 border-warm-border rounded-warm-lg px-md py-sm font-body-md text-body-md text-warm-text focus:border-warm-primary focus:ring-0 transition-colors resize-y"
              placeholder="배운 표현이나 느낀 점을 자유롭게 적어보세요"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <div className="flex gap-sm justify-end">
              <button
                className="font-label-bold text-label-bold text-warm-text-muted py-sm px-md rounded-full cursor-pointer"
                onClick={handleCancelDraft}
              >
                취소
              </button>
              <button
                className="btn-warm-primary bg-warm-primary text-warm-on-primary font-label-bold text-label-bold py-sm px-md rounded-full cursor-pointer disabled:bg-warm-badge-bg disabled:text-warm-text-muted"
                onClick={handleSaveDraft}
                disabled={!draft.trim()}
              >
                저장
              </button>
            </div>
          </div>
        )}

        {!isEmailFormOpen ? (
          <div className="flex flex-col gap-1">
            <button
              className="flex items-center justify-center gap-2 bg-warm-surface border border-warm-border rounded-full py-sm px-md font-label-bold text-label-bold text-warm-primary cursor-pointer disabled:bg-warm-badge-bg disabled:text-warm-text-muted"
              onClick={handleOpenEmailForm}
              disabled={!canSendEmail}
            >
              <span className="material-symbols-outlined text-xl">mail</span>
              이메일로 전송하기
            </button>
            {!customerEmail && (
              <p className="font-body-md text-xs text-warm-text-muted px-1">
                프리미엄 결제 시 입력한 이메일로 전송돼요. 아직 결제 내역이 없어요.
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-sm bg-warm-surface border border-warm-border rounded-warm-card p-md">
            {emailStatus === 'sent' ? (
              <p className="font-label-bold text-label-bold text-warm-success-text text-center py-sm">
                이메일로 전송했어요!
              </p>
            ) : (
              <>
                <p className="font-body-md text-body-md text-warm-text">
                  <span className="font-label-bold text-warm-primary">{customerEmail}</span>으로
                  전송할까요?
                </p>
                <p className="font-body-md text-xs text-warm-text-muted">
                  결제 시 입력하신 이메일 주소로만 전송돼요.
                </p>
                {emailStatus === 'error' && emailError && (
                  <div className="bg-warm-error-bg border border-warm-error-border rounded-warm-lg px-md py-sm font-body-md text-sm text-warm-error-text">
                    {emailError}
                  </div>
                )}
                <div className="flex gap-sm justify-end">
                  <button
                    className="font-label-bold text-label-bold text-warm-text-muted py-sm px-md rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-default"
                    onClick={handleCancelEmailForm}
                    disabled={emailStatus === 'sending'}
                  >
                    취소
                  </button>
                  <button
                    className="btn-warm-primary bg-warm-primary text-warm-on-primary font-label-bold text-label-bold py-sm px-md rounded-full cursor-pointer disabled:bg-warm-badge-bg disabled:text-warm-text-muted"
                    onClick={handleSendEmail}
                    disabled={emailStatus === 'sending'}
                  >
                    {emailStatus === 'sending' ? '보내는 중...' : '보내기'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {sortedNotes.length === 0 ? (
          <div className="bg-warm-surface border border-warm-border rounded-warm-card p-lg text-center">
            <p className="font-body-md text-body-md text-warm-text-muted">
              아직 배운 표현이 없어요. 퀘스트를 풀면 여기에 자동으로 쌓여요!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-md">
            {noteGroups.map((group) => (
              <div key={group.key} className="flex flex-col gap-sm">
                <h2 className="font-label-bold text-label-bold text-warm-text mt-sm">
                  {group.label}
                </h2>

                <div className="flex flex-col gap-sm">
                  {group.notes.map((note) => {
                    const meta = note.category
                      ? CATEGORY_META[note.category as QuizCategory]
                      : undefined
                    return (
                      <div
                        key={note.id}
                        className="bg-warm-surface border border-warm-border rounded-warm-card shadow-warm-card p-md flex flex-col gap-sm"
                      >
                        <div className="flex items-center justify-between gap-sm">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-label-bold text-xs px-2 py-0.5 rounded-full ${
                                note.type === 'auto'
                                  ? 'bg-warm-success-bg text-warm-success-text'
                                  : 'bg-warm-badge-bg text-warm-badge-text'
                              }`}
                            >
                              {note.type === 'auto' ? '자동' : '메모'}
                            </span>
                            {meta && (
                              <span
                                className="flex items-center gap-1 font-label-bold text-xs"
                                style={{ color: meta.color }}
                              >
                                <span className="material-symbols-outlined text-sm">
                                  {meta.icon}
                                </span>
                                {meta.label}
                              </span>
                            )}
                          </div>
                          <button
                            className="text-warm-text-muted cursor-pointer shrink-0"
                            onClick={() => handleDelete(note.id)}
                            aria-label="삭제"
                          >
                            <span className="material-symbols-outlined text-xl">delete</span>
                          </button>
                        </div>

                        {note.type === 'auto' ? (
                          <div className="flex flex-col gap-1">
                            <p className="font-warm-serif text-body-lg text-warm-text">
                              "{note.phrase}"
                            </p>
                            <p className="font-body-md text-body-md text-warm-text-muted">
                              {note.meaning}
                            </p>
                            {note.memo && (
                              <div className="mt-1 pt-2 border-t border-warm-border flex flex-col gap-0.5">
                                <span className="font-label-bold text-xs text-warm-primary">
                                  내 메모
                                </span>
                                <p className="font-body-md text-body-md text-warm-text whitespace-pre-wrap">
                                  {note.memo}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="font-body-md text-body-md text-warm-text whitespace-pre-wrap">
                            {note.content}
                          </p>
                        )}

                        <span className="font-body-md text-xs text-warm-text-muted">
                          {formatDate(note.createdAt)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </HomeLayout>
  )
}

export default NoteScreen
