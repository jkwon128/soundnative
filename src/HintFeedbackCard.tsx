import { useEffect } from 'react'
import { playIncorrectSound } from './sound'
import PillButton from './PillButton'

interface HintFeedbackCardProps {
  hint: string
  onRetry: () => void
}

function HintFeedbackCard({ hint, onRetry }: HintFeedbackCardProps) {
  useEffect(() => {
    playIncorrectSound()
  }, [])

  return (
    <div className="bg-warm-hint-bg border border-warm-hint-border rounded-warm-lg p-md flex flex-col gap-sm">
      <div>
        <div className="flex items-center gap-1 font-label-bold text-label-bold text-warm-hint-text mb-1">
          <span className="material-symbols-outlined text-lg">lightbulb</span>
          힌트
        </div>
        <p className="font-body-md text-body-md text-warm-text-muted">{hint}</p>
      </div>
      <PillButton onClick={onRetry}>
        다시 시도
        <span className="material-symbols-outlined text-lg">refresh</span>
      </PillButton>
    </div>
  )
}

export default HintFeedbackCard
