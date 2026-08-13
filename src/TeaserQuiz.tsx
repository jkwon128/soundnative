import { useState } from 'react'
import { quizQuestions, type QuizCategory, type QuizQuestion } from './quizData'
import { CATEGORY_META } from './categoryMeta'
import type { AnswerStatus } from './types'
import AnswerFeedbackCard from './AnswerFeedbackCard'
import HintFeedbackCard from './HintFeedbackCard'
import RevealFeedbackCard from './RevealFeedbackCard'

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

function speak(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  window.speechSynthesis.speak(utterance)
}

interface TeaserQuizProps {
  onComplete: () => void
}

function TeaserQuiz({ onComplete }: TeaserQuizProps) {
  const [questions] = useState<QuizQuestion[]>(() => pickTeaserQuestions())
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | 'A' | 'B' | null>(null)
  const [status, setStatus] = useState<AnswerStatus>('unanswered')
  const [attempts, setAttempts] = useState(0)

  const question = questions[index]
  const isLastQuestion = index === questions.length - 1
  const meta = CATEGORY_META[question.category]
  // tone is a single-attempt reveal; the 3-choice types get one retry (2 attempts total).
  const maxAttempts = question.type === 'tone' ? 1 : 2

  const handleSelect = (choice: number | 'A' | 'B') => {
    if (status !== 'unanswered') return
    const nextAttempts = attempts + 1
    setAttempts(nextAttempts)
    setSelected(choice)
    if (choice === question.answer) {
      setStatus('correct')
    } else {
      setStatus(nextAttempts >= maxAttempts ? 'revealed' : 'incorrect')
    }
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
    setAttempts(0)
  }

  return (
    <div className="min-h-screen bg-warm-bg flex flex-col items-center">
      <div className="w-full max-w-[640px] flex flex-col gap-md p-gutter md:p-lg">
        <div className="flex items-center justify-end">
          <span className="bg-warm-badge-bg text-warm-badge-text font-label-bold text-label-bold px-md py-1 rounded-full">
            Question {index + 1} / {questions.length}
          </span>
        </div>

        <div className="h-2 w-full rounded-full bg-warm-badge-bg overflow-hidden">
          <div
            className="h-full rounded-full bg-warm-primary"
            style={{ width: `${((index + 1) / questions.length) * 100}%` }}
          />
        </div>

        <div className="bg-warm-surface border border-warm-border rounded-warm-card shadow-warm-card overflow-hidden">
          <div className="bg-warm-card-header p-md flex flex-col gap-sm">
            <span
              className="flex items-center gap-2 w-fit bg-warm-surface/70 font-label-bold text-label-bold px-md py-1 rounded-full"
              style={{ color: meta.color }}
            >
              <span className="material-symbols-outlined text-lg">{meta.icon}</span>
              {meta.label}
            </span>

            <p className="font-body-md text-body-md text-warm-text-muted">{question.situation}</p>

            {question.type !== 'tone' && question.phrase && (
              <>
                <h2 className="font-warm-serif text-headline-md text-warm-text">
                  "{question.phrase}"
                </h2>

                <button
                  className="flex items-center gap-sm w-fit cursor-pointer"
                  onClick={() => speak(question.phrase!)}
                >
                  <span className="h-9 w-9 rounded-full bg-warm-surface flex items-center justify-center text-warm-primary">
                    <span className="material-symbols-outlined text-xl">play_arrow</span>
                  </span>
                  <span className="font-body-md text-sm text-warm-text-muted">
                    Listen to pronunciation
                  </span>
                </button>
              </>
            )}
          </div>

          <div className="p-md flex flex-col gap-sm">
            {question.type === 'tone' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                {(['A', 'B'] as const).map((label) => {
                  const text = label === 'A' ? question.phraseA : question.phraseB
                  const isSelected = selected === label
                  const isCorrectChoice = label === question.answer
                  const showCorrect = (status === 'correct' && isSelected) || (status === 'revealed' && isCorrectChoice)
                  const showIncorrect = (status === 'incorrect' && isSelected) || (status === 'revealed' && isSelected)
                  return (
                    <button
                      key={label}
                      className={`flex flex-col gap-sm bg-warm-surface border-2 rounded-warm-lg p-md text-left cursor-pointer transition-colors disabled:cursor-default ${
                        showCorrect
                          ? 'border-warm-success-border bg-warm-success-bg'
                          : showIncorrect
                            ? 'border-warm-error-border bg-warm-error-bg'
                            : 'border-warm-border hover:border-warm-primary'
                      }`}
                      onClick={() => handleSelect(label)}
                      disabled={status !== 'unanswered'}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`h-7 w-7 shrink-0 rounded-full border-2 flex items-center justify-center font-label-bold text-label-bold ${
                            showCorrect
                              ? 'border-warm-success-border bg-warm-success-border text-warm-on-primary'
                              : showIncorrect
                                ? 'border-warm-error-border bg-warm-error-border text-warm-on-primary'
                                : 'border-warm-border text-warm-text-muted'
                          }`}
                        >
                          {showCorrect ? (
                            <span className="material-symbols-outlined text-base">check</span>
                          ) : showIncorrect ? (
                            <span className="material-symbols-outlined text-base">close</span>
                          ) : (
                            label
                          )}
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          className="h-8 w-8 rounded-full bg-warm-badge-bg flex items-center justify-center text-warm-primary cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            speak(text)
                          }}
                        >
                          <span className="material-symbols-outlined text-lg">play_arrow</span>
                        </span>
                      </div>
                      <span className="font-body-lg text-body-lg text-warm-text">"{text}"</span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-sm">
                {question.choices.map((choice, i) => {
                  const label = String.fromCharCode(65 + i)
                  const isSelected = selected === i
                  const isCorrectChoice = i === question.answer
                  const showCorrect = (status === 'correct' && isSelected) || (status === 'revealed' && isCorrectChoice)
                  const showIncorrect = (status === 'incorrect' && isSelected) || (status === 'revealed' && isSelected)
                  return (
                    <button
                      key={i}
                      className={`flex items-center gap-md bg-warm-surface border-2 rounded-warm-lg px-md py-sm text-left cursor-pointer transition-colors disabled:cursor-default ${
                        showCorrect
                          ? 'border-warm-success-border bg-warm-success-bg'
                          : showIncorrect
                            ? 'border-warm-error-border bg-warm-error-bg'
                            : 'border-warm-border hover:border-warm-primary'
                      }`}
                      onClick={() => handleSelect(i)}
                      disabled={status !== 'unanswered'}
                    >
                      <span
                        className={`h-7 w-7 shrink-0 rounded-full border-2 flex items-center justify-center font-label-bold text-label-bold ${
                          showCorrect
                            ? 'border-warm-success-border bg-warm-success-border text-warm-on-primary'
                            : showIncorrect
                              ? 'border-warm-error-border bg-warm-error-border text-warm-on-primary'
                              : 'border-warm-border text-warm-text-muted'
                        }`}
                      >
                        {showCorrect ? (
                          <span className="material-symbols-outlined text-base">check</span>
                        ) : showIncorrect ? (
                          <span className="material-symbols-outlined text-base">close</span>
                        ) : (
                          label
                        )}
                      </span>
                      <span className="font-body-lg text-body-lg text-warm-text">"{choice}"</span>
                    </button>
                  )
                })}
              </div>
            )}

            {status === 'correct' && (
              <AnswerFeedbackCard
                explanation={question.explanation}
                buttonLabel={isLastQuestion ? '완료!' : '다음'}
                onNext={handleNext}
              />
            )}

            {status === 'incorrect' && (
              <HintFeedbackCard hint={question.hint} onRetry={handleRetry} />
            )}

            {status === 'revealed' && (
              <RevealFeedbackCard
                hint={question.type === 'tone' ? question.hint : undefined}
                explanation={question.explanation}
                buttonLabel={isLastQuestion ? '완료!' : '다음'}
                onNext={handleNext}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeaserQuiz
