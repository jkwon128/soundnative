import { useState } from 'react'
import { quizQuestions, type QuizCategory, type QuizQuestion } from './quizData'
import './TeaserQuiz.css'

const ALL_CATEGORIES: QuizCategory[] = ['errands', 'doctor', 'work', 'smalltalk', 'school', 'rent']
const TEASER_SIZE = 3

function shuffle<T>(items: T[]): T[] {
  const array = [...items]
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

// Picks 3 distinct random categories, one random question from each — a
// fresh combination on every mount (i.e. every page refresh).
function pickTeaserQuestions(): QuizQuestion[] {
  const categories = shuffle(ALL_CATEGORIES).slice(0, TEASER_SIZE)
  return categories.map((category) => {
    const candidates = quizQuestions.filter((question) => question.category === category)
    return candidates[Math.floor(Math.random() * candidates.length)]
  })
}

type AnswerStatus = 'unanswered' | 'correct' | 'incorrect'

interface TeaserQuizProps {
  onComplete: () => void
}

function TeaserQuiz({ onComplete }: TeaserQuizProps) {
  const [questions] = useState<QuizQuestion[]>(() => pickTeaserQuestions())
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [status, setStatus] = useState<AnswerStatus>('unanswered')

  const question = questions[index]
  const isLastQuestion = index === questions.length - 1

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
      onComplete()
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
    setStatus('unanswered')
  }

  return (
    <div className="teaser-quiz">
      <div className="teaser-progress">
        {index + 1} / {questions.length}
      </div>

      <div className="teaser-situation">{question.situation}</div>
      <div className="teaser-phrase">"{question.phrase}"</div>

      <div className="teaser-choices">
        {question.choices.map((choice, i) => {
          const isSelected = selected === i
          const showCorrect = status === 'correct' && isSelected
          const showIncorrect = status === 'incorrect' && isSelected
          return (
            <button
              key={i}
              className={
                'teaser-choice' +
                (showCorrect ? ' teaser-choice-correct' : '') +
                (showIncorrect ? ' teaser-choice-incorrect' : '')
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
        <div className="teaser-feedback teaser-feedback-correct">
          <div className="teaser-feedback-label">정답이에요!</div>
          <div>{question.explanation}</div>
          <button className="teaser-action-button" onClick={handleNext}>
            다음
          </button>
        </div>
      )}

      {status === 'incorrect' && (
        <div className="teaser-feedback teaser-feedback-incorrect">
          <div className="teaser-feedback-label">다시 생각해보세요</div>
          <div>{question.hint}</div>
          <button className="teaser-action-button" onClick={handleRetry}>
            다시 시도
          </button>
        </div>
      )}
    </div>
  )
}

export default TeaserQuiz
