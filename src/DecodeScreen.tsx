import { useEffect, useState } from 'react'
import { getEffectiveStreak } from './dailyQuest'
import { addDecodeNote, hasNoteForPhrase } from './notes'
import { supabase } from './supabaseClient'
import HomeLayout from './HomeLayout'

interface DecodeResult {
  literal: string
  realMeaning: string
  tone: string
  howToRespond: string
}

interface DecodeUsage {
  used: number
  limit: number
  remaining: number
  subscribed: boolean
}

interface DecodeScreenProps {
  onBack: () => void
  onOpenNotes: () => void
  onOpenPricing: () => void
  onOpenMyPage: () => void
}

// Hardcoded per design — not backed by a data file, just a few common
// phrases to help a first-time user see what to paste in.
const EXAMPLE_PHRASES = ["You all set?", "I'll look into it.", "That's an interesting point."]

function DecodeScreen({ onBack, onOpenNotes, onOpenPricing, onOpenMyPage }: DecodeScreenProps) {
  const [phrase, setPhrase] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUpgradeCta, setShowUpgradeCta] = useState(false)
  const [result, setResult] = useState<DecodeResult | null>(null)
  const [usage, setUsage] = useState<DecodeUsage | null>(null)
  const [noteButtonState, setNoteButtonState] = useState<'idle' | 'panelOpen' | 'saved'>('idle')
  const [noteMemoDraft, setNoteMemoDraft] = useState('')
  // Distinguishes "this phrase was already saved before this decode" (label:
  // "이미 노트에 있어요") from "just saved via the panel" (label: "노트에
  // 추가됨") without needing a 4th noteButtonState value.
  const [noteAlreadyExisted, setNoteAlreadyExisted] = useState(false)

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

  useEffect(() => {
    let cancelled = false

    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token
      if (!token) return

      try {
        const response = await fetch('/api/decode-usage', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const info = await response.json()
        if (!cancelled && response.ok) setUsage(info as DecodeUsage)
      } catch {
        // Best-effort — if this fails, the screen just doesn't show a
        // remaining count rather than blocking anything.
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  const handleDecode = async () => {
    if (!phrase.trim() || loading) return

    setLoading(true)
    setError(null)
    setShowUpgradeCta(false)
    setResult(null)
    setNoteButtonState('idle')
    setNoteMemoDraft('')

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) throw new Error('로그인이 필요합니다.')

      const response = await fetch('/api/decode', {
        method: 'POST',
        headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ phrase }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data?.limitReached) setShowUpgradeCta(!data.subscribed)
        throw new Error(data?.error || '분석에 실패했습니다.')
      }

      setResult(data as DecodeResult)
      setUsage((prev) =>
        prev ? { ...prev, used: prev.used + 1, remaining: Math.max(0, prev.remaining - 1) } : prev,
      )
      const alreadySaved = hasNoteForPhrase(phrase)
      setNoteAlreadyExisted(alreadySaved)
      if (alreadySaved) setNoteButtonState('saved')
    } catch (err) {
      setError(err instanceof Error ? err.message : '분석에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <HomeLayout
      activeTab="decode"
      streak={streak}
      userEmail={userEmail}
      onOpenMyPage={onOpenMyPage}
      onOpenHome={onBack}
      onOpenDecode={() => {}}
      onOpenNotes={onOpenNotes}
    >
      <div className="w-full max-w-[560px] mx-auto flex flex-col gap-md">
        <div className="flex items-center gap-sm">
          <button
            className="flex items-center gap-1 text-warm-primary font-label-bold text-label-bold cursor-pointer"
            onClick={onBack}
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>홈으로
          </button>
          <span className="bg-warm-badge-bg text-warm-badge-text font-label-bold text-xs tracking-wide uppercase px-md py-1 rounded-full">
            AI TOOL · DECODE
          </span>
        </div>

        {usage && (
          <p className="font-body-md text-sm text-warm-text-muted">
            오늘 {usage.remaining}/{usage.limit}회 남음
          </p>
        )}

        <div>
          <h1 className="font-warm-serif text-headline-md md:text-display-lg text-warm-text">
            원어민이 한 말,
            <br />
            진짜 속뜻은?
          </h1>
          <p className="font-body-md text-body-md text-warm-text-muted mt-1">
            방금 들었거나 받은 영어 문장을 붙여넣으세요.
          </p>
        </div>

        <textarea
          className="w-full min-h-24 bg-warm-surface border border-warm-border rounded-warm-card px-md py-sm font-body-md text-body-md text-warm-text focus:border-warm-primary focus:ring-0 transition-colors resize-y"
          placeholder="예: We should grab coffee sometime!"
          value={phrase}
          onChange={(e) => setPhrase(e.target.value)}
        />

        <button
          className={`w-full font-label-bold text-label-bold py-sm px-md rounded-full flex items-center justify-center gap-2 cursor-pointer transition-colors ${
            phrase.trim()
              ? 'btn-warm-primary bg-warm-primary text-warm-on-primary'
              : 'bg-warm-primary/40 text-warm-on-primary/90'
          }`}
          onClick={handleDecode}
          disabled={loading || !phrase.trim()}
        >
          속뜻 보기
          <span className="material-symbols-outlined text-lg">auto_awesome</span>
        </button>

        <div className="flex flex-col gap-sm">
          <p className="font-body-md text-sm text-warm-text-muted">이런 문장 자주 나와요</p>
          {EXAMPLE_PHRASES.map((example) => (
            <button
              key={example}
              className="w-full bg-warm-surface border border-warm-border rounded-2xl px-md py-sm text-left font-body-md text-body-md text-warm-text cursor-pointer"
              onClick={() => setPhrase(example)}
            >
              "{example}"
            </button>
          ))}
        </div>

        {loading && (
          <div className="font-body-md text-body-md text-warm-text-muted">분석 중...</div>
        )}
        {error && (
          <div className="bg-warm-error-bg border border-warm-error-border rounded-warm-lg px-md py-sm font-body-md text-body-md text-warm-error-text flex flex-col gap-sm">
            <p>{error}</p>
            {showUpgradeCta && (
              <button
                className="btn-warm-primary w-fit bg-warm-primary text-warm-on-primary font-label-bold text-label-bold py-sm px-md rounded-full cursor-pointer"
                onClick={onOpenPricing}
              >
                구독하러 가기
              </button>
            )}
          </div>
        )}

        {result && (
          <>
            <div className="flex flex-col gap-sm">
              {[
                { label: '직역', value: result.literal },
                { label: '진짜 속뜻', value: result.realMeaning },
                { label: '톤', value: result.tone },
                { label: '이렇게 답해보세요', value: result.howToRespond },
              ].map((field) => (
                <div
                  key={field.label}
                  className="bg-warm-surface border border-warm-border rounded-warm-card shadow-warm-card p-md"
                >
                  <div className="font-label-bold text-sm text-warm-text-muted tracking-wide uppercase mb-2">
                    {field.label}
                  </div>
                  <div className="font-body-md text-body-md text-warm-text">{field.value}</div>
                </div>
              ))}
            </div>

            {noteButtonState !== 'panelOpen' && (
              <div className="flex">
                {noteButtonState === 'saved' ? (
                  <button
                    className="flex items-center gap-1 ml-auto shrink-0 bg-warm-surface border border-warm-border rounded-full py-1 px-sm font-label-bold text-xs text-warm-text-muted cursor-default"
                    disabled
                  >
                    <span className="material-symbols-outlined text-base text-warm-success-text">
                      check_circle
                    </span>
                    {noteAlreadyExisted ? '이미 노트에 있어요' : '노트에 추가됨'}
                  </button>
                ) : (
                  <button
                    className="flex items-center gap-1 ml-auto shrink-0 bg-warm-surface border border-warm-border rounded-full py-1 px-sm font-label-bold text-xs text-warm-primary cursor-pointer"
                    onClick={() => setNoteButtonState('panelOpen')}
                  >
                    <span className="material-symbols-outlined text-base">bookmark_add</span>
                    노트에 추가하기
                  </button>
                )}
              </div>
            )}

            {noteButtonState === 'panelOpen' && (
              <div className="flex flex-col gap-sm bg-warm-bg-soft border border-warm-border rounded-warm-lg p-md">
                <div className="flex flex-col gap-1">
                  <p className="font-warm-serif text-body-lg text-warm-text">"{phrase}"</p>
                  <p className="font-body-md text-body-md text-warm-text-muted">
                    {result.realMeaning}
                  </p>
                </div>
                <textarea
                  autoFocus
                  className="w-full min-h-16 bg-warm-surface border-2 border-warm-border rounded-warm-lg px-md py-sm font-body-md text-body-md text-warm-text focus:border-warm-primary focus:ring-0 transition-colors resize-y"
                  placeholder="메모 추가 (선택)"
                  value={noteMemoDraft}
                  onChange={(e) => setNoteMemoDraft(e.target.value)}
                />
                <div className="flex gap-sm justify-end">
                  <button
                    className="font-label-bold text-label-bold text-warm-text-muted py-sm px-md rounded-full cursor-pointer"
                    onClick={() => {
                      setNoteButtonState('idle')
                      setNoteMemoDraft('')
                    }}
                  >
                    취소
                  </button>
                  <button
                    className="btn-warm-primary bg-warm-primary text-warm-on-primary font-label-bold text-label-bold py-sm px-md rounded-full cursor-pointer"
                    onClick={() => {
                      addDecodeNote(phrase, result, noteMemoDraft)
                      setNoteButtonState('saved')
                      setNoteMemoDraft('')
                    }}
                  >
                    저장
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </HomeLayout>
  )
}

export default DecodeScreen
