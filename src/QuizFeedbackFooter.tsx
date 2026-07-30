import { useEffect } from 'react'
import { playCorrectSound, playIncorrectSound } from './sound'

export type AnswerStatus = 'unanswered' | 'correct' | 'incorrect'

interface QuizFeedbackFooterProps {
  status: AnswerStatus
  isLastQuestion: boolean
  onClick: () => void
}

function QuizFeedbackFooter({ status, isLastQuestion, onClick }: QuizFeedbackFooterProps) {
  useEffect(() => {
    if (status === 'correct') playCorrectSound()
    else if (status === 'incorrect') playIncorrectSound()
  }, [status])

  if (status === 'unanswered') {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-warm-bg border-t border-warm-border px-gutter md:px-lg py-sm flex justify-center">
        <button
          className="w-full max-w-[640px] bg-warm-badge-bg text-warm-text-muted font-label-bold text-label-bold text-sm py-2 px-md rounded-full cursor-default"
          disabled
        >
          다음
        </button>
      </div>
    )
  }

  const isCorrect = status === 'correct'

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 px-gutter md:px-lg py-sm ${isCorrect ? 'bg-warm-success-text' : 'bg-warm-error-border'}`}
    >
      <div className="max-w-[640px] mx-auto flex items-center justify-between gap-sm">
        <div className="flex items-center gap-1 font-label-bold text-sm text-warm-on-primary">
          <span className="material-symbols-outlined text-lg">
            {isCorrect ? 'check_circle' : 'cancel'}
          </span>
          {isCorrect ? '정답이에요!' : '오답이에요'}
        </div>
        <button
          className={`font-label-bold text-label-bold text-sm py-2 px-md rounded-full cursor-pointer bg-warm-on-primary ${
            isCorrect ? 'text-warm-success-text' : 'text-warm-error-border'
          }`}
          onClick={onClick}
        >
          {status === 'incorrect' ? '다시 시도' : isLastQuestion ? '완료' : '다음'}
        </button>
      </div>
    </div>
  )
}

export default QuizFeedbackFooter
