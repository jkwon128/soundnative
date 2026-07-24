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
      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant p-gutter md:p-lg flex justify-center">
        <button
          className="w-full max-w-[640px] bg-surface-container-high text-on-surface-variant font-label-bold text-label-bold py-sm px-md rounded-lg cursor-default"
          disabled
        >
          다음
        </button>
      </div>
    )
  }

  const isCorrect = status === 'correct'

  return (
    <div className={`fixed bottom-0 left-0 right-0 p-gutter md:p-lg ${isCorrect ? 'bg-secondary' : 'bg-error'}`}>
      <div className="max-w-[640px] mx-auto flex items-center justify-between gap-md">
        <div
          className={`flex items-center gap-2 font-label-bold text-body-lg ${
            isCorrect ? 'text-on-secondary' : 'text-on-error'
          }`}
        >
          <span className="material-symbols-outlined text-2xl">
            {isCorrect ? 'check_circle' : 'cancel'}
          </span>
          {isCorrect ? '정답이에요!' : '오답이에요'}
        </div>
        <button
          className={`font-label-bold text-label-bold py-sm px-lg rounded-lg cursor-pointer ${
            isCorrect ? 'bg-on-secondary text-secondary' : 'bg-on-error text-error'
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
