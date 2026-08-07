import { useEffect } from 'react'
import { playIncorrectSound } from './sound'
import PillButton from './PillButton'

interface RevealFeedbackCardProps {
  // Only tone questions pass this — the 3-choice final-reveal state has
  // already shown the hint on the first wrong attempt, so it's omitted there.
  hint?: string
  explanation: string
  buttonLabel: string
  onNext: () => void
}

function RevealFeedbackCard({ hint, explanation, buttonLabel, onNext }: RevealFeedbackCardProps) {
  useEffect(() => {
    playIncorrectSound()
  }, [])

  return (
    <div className="bg-warm-error-bg border border-warm-error-border rounded-warm-lg p-md flex flex-col gap-sm">
      <div>
        <div className="font-label-bold text-label-bold text-warm-error-text mb-1">정답 공개</div>
        {hint && <p className="font-body-md text-sm text-warm-text-muted mb-1">{hint}</p>}
        <p className="font-body-md text-body-md text-warm-text-muted">{explanation}</p>
      </div>
      <PillButton onClick={onNext}>
        {buttonLabel}
        <span className="material-symbols-outlined text-lg">arrow_forward</span>
      </PillButton>
    </div>
  )
}

export default RevealFeedbackCard
