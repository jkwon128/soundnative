import { useState } from 'react'
import './DecodeScreen.css'

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
    <div className="decode-app">
      <button className="decode-back-button" onClick={onBack}>
        ← Quest로 돌아가기
      </button>

      <h1 className="decode-title">Decode</h1>
      <p className="decode-subtitle">원어민이 한 말의 진짜 속뜻을 알려드려요</p>

      <textarea
        className="decode-input"
        placeholder="e.g. We should grab coffee sometime"
        value={phrase}
        onChange={(e) => setPhrase(e.target.value)}
      />

      <button
        className="decode-button"
        onClick={handleDecode}
        disabled={loading || !phrase.trim()}
      >
        속뜻 보기
      </button>

      {loading && <div className="decode-status">분석 중...</div>}
      {error && <div className="decode-error">{error}</div>}

      {result && (
        <div className="decode-result">
          <div className="decode-field">
            <div className="decode-field-label">직역</div>
            <div className="decode-field-value">{result.literal}</div>
          </div>
          <div className="decode-field">
            <div className="decode-field-label">진짜 속뜻</div>
            <div className="decode-field-value">{result.realMeaning}</div>
          </div>
          <div className="decode-field">
            <div className="decode-field-label">톤</div>
            <div className="decode-field-value">{result.tone}</div>
          </div>
          <div className="decode-field">
            <div className="decode-field-label">이렇게 답해보세요</div>
            <div className="decode-field-value">{result.howToRespond}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DecodeScreen
