import { useState } from 'react'

interface DecodeResult {
  literal: string
  realMeaning: string
  tone: string
  howToRespond: string
}

interface DecodeScreenProps {
  onBack: () => void
}

function DecodeScreen({ onBack }: DecodeScreenProps) {
  const [phrase, setPhrase] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<DecodeResult | null>(null)

  const handleDecode = async () => {
    if (!phrase.trim() || loading) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/decode', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ phrase }),
      })

      const data = await response.json()

      if (!response.ok) {
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
    <div className="min-h-screen bg-warm-bg flex justify-center p-gutter md:p-lg">
      <div className="w-full max-w-[560px] flex flex-col gap-md py-lg">
        <button
          className="flex items-center gap-1 text-warm-primary font-label-bold text-label-bold w-fit cursor-pointer"
          onClick={onBack}
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          홈으로
        </button>

        <div>
          <h1 className="font-warm-serif text-headline-md text-warm-text">Decode</h1>
          <p className="font-body-md text-body-md text-warm-text-muted">
            원어민이 한 말의 진짜 속뜻을 알려드려요
          </p>
        </div>

        <textarea
          className="w-full min-h-24 bg-warm-surface border-2 border-warm-border rounded-warm-lg px-md py-sm font-body-md text-body-md text-warm-text focus:border-warm-primary focus:ring-0 transition-colors resize-y"
          placeholder="e.g. We should grab coffee sometime"
          value={phrase}
          onChange={(e) => setPhrase(e.target.value)}
        />

        <button
          className="btn-warm-primary w-full bg-warm-primary text-warm-on-primary font-label-bold text-label-bold py-sm px-md rounded-full cursor-pointer disabled:bg-warm-badge-bg disabled:text-warm-text-muted"
          onClick={handleDecode}
          disabled={loading || !phrase.trim()}
        >
          속뜻 보기
        </button>

        {loading && (
          <div className="font-body-md text-body-md text-warm-text-muted">분석 중...</div>
        )}
        {error && (
          <div className="bg-warm-error-bg border border-warm-error-border rounded-warm-lg px-md py-sm font-body-md text-body-md text-warm-error-text">
            {error}
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
    </div>
  )
}

export default DecodeScreen
