import { useEffect, type ReactNode } from 'react'
import { playCorrectSound } from './sound'
import PillButton from './PillButton'

interface AnswerFeedbackCardProps {
  explanation: string
  buttonLabel: string
  onNext: () => void
  headerExtra?: ReactNode
}

function AnswerFeedbackCard({ explanation, buttonLabel, onNext, headerExtra }: AnswerFeedbackCardProps) {
  useEffect(() => {
    playCorrectSound()
  }, [])

  return (
    <div className="bg-warm-success-bg border border-warm-success-border rounded-warm-lg p-md flex flex-col gap-sm">
      <div className="flex flex-wrap items-start gap-sm">
        <div className="flex-1 min-w-[160px]">
          <div className="font-label-bold text-label-bold text-warm-success-text mb-1">정답!</div>
          <p className="font-body-md text-body-md text-warm-text-muted">{explanation}</p>
        </div>
        {headerExtra}
      </div>
      <PillButton onClick={onNext}>
        {buttonLabel}
        <span className="material-symbols-outlined text-lg">arrow_forward</span>
      </PillButton>
    </div>
  )
}

export default AnswerFeedbackCard
