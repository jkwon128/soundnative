import { useState } from 'react'
import type { QuestSession } from './questSessions'
import { CATEGORY_META } from './categoryMeta'

function speak(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  window.speechSynthesis.speak(utterance)
}

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
  const meta = CATEGORY_META[question.category]

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

  const handleFooterClick = () => {
    if (status === 'correct') handleNext()
    else if (status === 'incorrect') handleRetry()
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center pb-24">
      <div className="w-full max-w-[640px] flex flex-col gap-md p-gutter md:p-lg">
        <div className="flex items-center justify-between">
          <button className="text-on-surface-variant cursor-pointer" onClick={onExit}>
            <span className="material-symbols-outlined">close</span>
          </button>
          <span className="bg-surface-container-high text-on-surface font-label-bold text-label-bold px-md py-1 rounded-full">
            Question {index + 1} / {session.questions.length}
          </span>
        </div>

        <div className="h-2 w-full rounded-full bg-surface-container-high overflow-hidden">
          <div
            className="h-full rounded-full bg-secondary"
            style={{ width: `${((index + 1) / session.questions.length) * 100}%` }}
          />
        </div>

        <div
          className="bg-surface-container-lowest border border-outline-variant border-l-4 rounded-xl p-md flex flex-col gap-sm"
          style={{ borderLeftColor: meta.color }}
        >
          <div
            className="flex items-center gap-2 font-label-bold text-label-bold tracking-wide"
            style={{ color: meta.color }}
          >
            <span className="material-symbols-outlined text-xl">{meta.icon}</span>
            {meta.label.toUpperCase()}
          </div>

          <p className="font-body-md text-body-md text-on-surface-variant">{question.situation}</p>

          <h2 className="font-headline-md text-headline-md text-on-surface">"{question.phrase}"</h2>

          <button
            className="flex items-center gap-sm w-fit cursor-pointer"
            onClick={() => speak(question.phrase)}
          >
            <span className="h-9 w-9 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-xl">play_arrow</span>
            </span>
            <span className="font-body-md text-sm text-on-surface-variant">
              Listen to pronunciation
            </span>
          </button>
        </div>

        <div className="flex flex-col gap-sm">
          {question.choices.map((choice, i) => {
            const isSelected = selected === i
            const showCorrect = status === 'correct' && isSelected
            const showIncorrect = status === 'incorrect' && isSelected
            return (
              <button
                key={i}
                className={`flex items-center justify-between gap-md bg-surface-container-lowest border rounded-xl px-md py-sm text-left cursor-pointer transition-colors disabled:cursor-default ${
                  showCorrect
                    ? 'border-secondary bg-secondary-container/20'
                    : showIncorrect
                      ? 'border-error bg-error-container/40'
                      : 'border-outline-variant hover:border-primary'
                }`}
                onClick={() => handleSelect(i)}
                disabled={status !== 'unanswered'}
              >
                <span className="font-body-lg text-body-lg text-on-surface">"{choice}"</span>
                <span
                  className={`h-5 w-5 shrink-0 rounded-full border-2 ${
                    showCorrect
                      ? 'border-secondary bg-secondary'
                      : showIncorrect
                        ? 'border-error bg-error'
                        : 'border-outline-variant'
                  }`}
                />
              </button>
            )
          })}
        </div>

        {status === 'correct' && (
          <div className="bg-secondary-container/20 border border-secondary rounded-xl p-md">
            <div className="font-label-bold text-label-bold text-on-secondary-container mb-1">
              정답이에요!
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {question.explanation}
            </p>
          </div>
        )}

        {status === 'incorrect' && (
          <div className="bg-error-container/40 border border-error rounded-xl p-md">
            <div className="font-label-bold text-label-bold text-on-error-container mb-1">
              다시 생각해보세요
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">{question.hint}</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant p-gutter md:p-lg flex justify-center">
        <button
          className="btn-primary w-full max-w-[640px] bg-primary text-on-primary font-label-bold text-label-bold py-sm px-md rounded-lg cursor-pointer disabled:bg-surface-container-high disabled:text-on-surface-variant disabled:border-none disabled:cursor-default"
          disabled={status === 'unanswered'}
          onClick={handleFooterClick}
        >
          {status === 'incorrect' ? '다시 시도' : isLastQuestion ? '완료' : '다음'}
        </button>
      </div>
    </div>
  )
}

export default QuestScreen
