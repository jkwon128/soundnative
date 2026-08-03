import { useState } from 'react'
import type { QuestSession } from './questSessions'
import { CATEGORY_META } from './categoryMeta'
import { computeNextStreak, getTodayDateString, loadStreak, saveStreak } from './dailyQuest'
import { addAutoNote, getNotePhrase, hasNoteForQuestion } from './notes'
import { markSessionCompleted } from './sessionProgress'
import type { AnswerStatus } from './types'
import AnswerFeedbackCard from './AnswerFeedbackCard'
import HintFeedbackCard from './HintFeedbackCard'

type NoteButtonState = 'idle' | 'panelOpen' | 'saved'

function speak(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  window.speechSynthesis.speak(utterance)
}

interface QuestScreenProps {
  session: QuestSession
  onExit: () => void
  // Fired instead of onExit when the user finishes the last question (vs.
  // closing early via the X button) — routes to the one-time celebration
  // screen rather than straight back to Home.
  onComplete: () => void
}

function QuestScreen({ session, onExit, onComplete }: QuestScreenProps) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | 'A' | 'B' | null>(null)
  const [status, setStatus] = useState<AnswerStatus>('unanswered')

  const question = session.questions[index]
  const isLastQuestion = index === session.questions.length - 1
  const meta = CATEGORY_META[question.category]

  const [noteButtonState, setNoteButtonState] = useState<NoteButtonState>(() =>
    hasNoteForQuestion(question.id) ? 'saved' : 'idle',
  )
  const [noteMemoDraft, setNoteMemoDraft] = useState('')

  const handleSelect = (choice: number | 'A' | 'B') => {
    if (status !== 'unanswered') return
    setSelected(choice)
    setStatus(choice === question.answer ? 'correct' : 'incorrect')
  }

  const handleRetry = () => {
    setSelected(null)
    setStatus('unanswered')
  }

  const handleNext = () => {
    if (isLastQuestion) {
      const today = getTodayDateString()
      saveStreak({ streak: computeNextStreak(loadStreak(), today), lastPlayedDate: today })
      markSessionCompleted(session.id)
      onComplete()
      return
    }
    const nextQuestion = session.questions[index + 1]
    setIndex((i) => i + 1)
    setSelected(null)
    setStatus('unanswered')
    setNoteButtonState(hasNoteForQuestion(nextQuestion.id) ? 'saved' : 'idle')
    setNoteMemoDraft('')
  }

  const handleSaveNote = () => {
    addAutoNote(question, noteMemoDraft)
    setNoteButtonState('saved')
    setNoteMemoDraft('')
  }

  const handleCancelNote = () => {
    setNoteButtonState('idle')
    setNoteMemoDraft('')
  }

  return (
    <div className="min-h-screen bg-warm-bg flex flex-col items-center">
      <div className="w-full max-w-[640px] flex flex-col gap-md p-gutter md:p-lg">
        <div className="flex items-center justify-between">
          <button className="text-warm-text-muted cursor-pointer" onClick={onExit}>
            <span className="material-symbols-outlined">close</span>
          </button>
          <span className="bg-warm-badge-bg text-warm-badge-text font-label-bold text-label-bold px-md py-1 rounded-full">
            Question {index + 1} / {session.questions.length}
          </span>
        </div>

        <div className="h-2 w-full rounded-full bg-warm-badge-bg overflow-hidden">
          <div
            className="h-full rounded-full bg-warm-primary"
            style={{ width: `${((index + 1) / session.questions.length) * 100}%` }}
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
                  const showCorrect = status === 'correct' && isSelected
                  const showIncorrect = status === 'incorrect' && isSelected
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
                  const showCorrect = status === 'correct' && isSelected
                  const showIncorrect = status === 'incorrect' && isSelected
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
                headerExtra={
                  noteButtonState === 'saved' ? (
                    <button
                      className="flex items-center gap-1 ml-auto shrink-0 bg-warm-surface border border-warm-border rounded-full py-1 px-sm font-label-bold text-xs text-warm-text-muted cursor-default"
                      disabled
                    >
                      <span className="material-symbols-outlined text-base text-warm-success-text">
                        check_circle
                      </span>
                      노트에 추가됨
                    </button>
                  ) : noteButtonState === 'idle' ? (
                    <button
                      className="flex items-center gap-1 ml-auto shrink-0 bg-warm-surface border border-warm-border rounded-full py-1 px-sm font-label-bold text-xs text-warm-primary cursor-pointer"
                      onClick={() => setNoteButtonState('panelOpen')}
                    >
                      <span className="material-symbols-outlined text-base">bookmark_add</span>
                      노트에 추가하기
                    </button>
                  ) : undefined
                }
              />
            )}

            {status === 'correct' && noteButtonState === 'panelOpen' && (
              <div className="flex flex-col gap-sm bg-warm-bg-soft border border-warm-border rounded-warm-lg p-md">
                <div className="flex flex-col gap-1">
                  <p className="font-warm-serif text-body-lg text-warm-text">
                    "{getNotePhrase(question)}"
                  </p>
                  <p className="font-body-md text-body-md text-warm-text-muted">
                    {question.explanation}
                  </p>
                </div>
                <textarea
                  autoFocus
                  className="w-full min-h-16 bg-warm-surface border-2 border-warm-border rounded-warm-lg px-md py-sm font-body-md text-body-md text-warm-text focus:border-warm-primary focus:ring-0 transition-colors resize-y"
                  placeholder="메모 추가 (선택)"
                  value={noteMemoDraft}
                  onChange={(e) => setNoteMemoDraft(e.target.value)}
                />
                <div className="flex gap-sm justify-end">
                  <button
                    className="font-label-bold text-label-bold text-warm-text-muted py-sm px-md rounded-full cursor-pointer"
                    onClick={handleCancelNote}
                  >
                    취소
                  </button>
                  <button
                    className="btn-warm-primary bg-warm-primary text-warm-on-primary font-label-bold text-label-bold py-sm px-md rounded-full cursor-pointer"
                    onClick={handleSaveNote}
                  >
                    저장
                  </button>
                </div>
              </div>
            )}

            {status === 'incorrect' && (
              <HintFeedbackCard hint={question.hint} onRetry={handleRetry} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuestScreen
