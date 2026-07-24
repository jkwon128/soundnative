import { useState } from 'react'
import type { QuestSession } from './questSessions'
import './QuestScreen.css'

type AnswerStatus = 'unanswered' | 'correct' | 'incorrect'

interface QuestScreenProps {
  session: QuestSession
  onExit: () => void
}

function QuestScreen({ session, onExit }: QuestScreenProps) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [status, setStatus] = useState<AnswerStatus>('unanswered')

  const question = session.questions[index]
  const isLastQuestion = index === session.questions.length - 1

  const handleSelect = (choiceIndex: number) => {
    if (status !== 'unanswered') return
    setSelected(choiceIndex)
    setStatus(choiceIndex === question.answer ? 'correct' : 'incorrect')
  }

  const handleRetry = () => {
    setSelected(null)
    setStatus('unanswered')
  }

  const handleNext = () => {
    if (isLastQuestion) {
      onExit()
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
    setStatus('unanswered')
  }

  return (
    <div className="quest-screen">
      <button className="quest-back-button" onClick={onExit}>
        ← 홈으로
      </button>

      <div className="quest-progress">
        {index + 1} / {session.questions.length}
      </div>

      <div className="quest-situation">{question.situation}</div>
      <div className="quest-phrase">"{question.phrase}"</div>

      <div className="quest-choices">
        {question.choices.map((choice, i) => {
          const isSelected = selected === i
          const showCorrect = status === 'correct' && isSelected
          const showIncorrect = status === 'incorrect' && isSelected
          return (
            <button
              key={i}
              className={
                'quest-choice' +
                (showCorrect ? ' quest-choice-correct' : '') +
                (showIncorrect ? ' quest-choice-incorrect' : '')
              }
              onClick={() => handleSelect(i)}
              disabled={status !== 'unanswered'}
            >
              {choice}
            </button>
          )
        })}
      </div>

      {status === 'correct' && (
        <div className="quest-feedback quest-feedback-correct">
          <div className="quest-feedback-label">정답이에요!</div>
          <div>{question.explanation}</div>
          <button className="quest-action-button" onClick={handleNext}>
            {isLastQuestion ? '완료' : '다음'}
          </button>
        </div>
      )}

      {status === 'incorrect' && (
        <div className="quest-feedback quest-feedback-incorrect">
          <div className="quest-feedback-label">다시 생각해보세요</div>
          <div>{question.hint}</div>
          <button className="quest-action-button" onClick={handleRetry}>
            다시 시도
          </button>
        </div>
      )}
    </div>
  )
}

export default QuestScreen
