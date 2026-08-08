import { useEffect, useState } from 'react'
import { loadStreak } from './dailyQuest'
import { supabase } from './supabaseClient'
import HomeLayout from './HomeLayout'

interface DecodeResult {
  literal: string
  realMeaning: string
  tone: string
  howToRespond: string
}

interface DecodeScreenProps {
  onBack: () => void
  onOpenNotes: () => void
  onOpenPricing: () => void
}

// Hardcoded per design — not backed by a data file, just a few common
// phrases to help a first-time user see what to paste in.
const EXAMPLE_PHRASES = ["You all set?", "I'll look into it.", "That's an interesting point."]

function DecodeScreen({ onBack, onOpenNotes, onOpenPricing }: DecodeScreenProps) {
  const [phrase, setPhrase] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUpgradeCta, setShowUpgradeCta] = useState(false)
  const [result, setResult] = useState<DecodeResult | null>(null)

  const { streak } = loadStreak()
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

  const handleDecode = async () => {
    if (!phrase.trim() || loading) return

    setLoading(true)
    setError(null)
    setShowUpgradeCta(false)
    setResult(null)

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
        )}
      </div>
    </HomeLayout>
  )
}

export default DecodeScreen
