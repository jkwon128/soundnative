import { useState } from 'react'
import type { QuestSession } from './questSessions'
import { CATEGORY_META } from './categoryMeta'
import { computeNextStreak, getTodayDateString, loadStreak, saveStreak } from './dailyQuest'
import { addAutoNote, getNotePhrase, hasNoteForQuestion } from './notes'
import { markSessionCompleted } from './sessionProgress'
import QuizFeedbackFooter, { type AnswerStatus } from './QuizFeedbackFooter'

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
}

function QuestScreen({ session, onExit }: QuestScreenProps) {
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
      onExit()
      return
    }
    const nextQuestion = session.questions[index + 1]
    setIndex((i) => i + 1)
    setSelected(null)
    setStatus('unanswered')
    setNoteButtonState(hasNoteForQuestion(nextQuestion.id) ? 'saved' : 'idle')
    setNoteMemoDraft('')
  }

  const handleFooterClick = () => {
    if (status === 'correct') handleNext()
    else if (status === 'incorrect') handleRetry()
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

          {question.type !== 'tone' && question.phrase && (
            <>
              <h2 className="font-headline-md text-headline-md text-on-surface">
                "{question.phrase}"
              </h2>

              <button
                className="flex items-center gap-sm w-fit cursor-pointer"
                onClick={() => speak(question.phrase!)}
              >
                <span className="h-9 w-9 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-xl">play_arrow</span>
                </span>
                <span className="font-body-md text-sm text-on-surface-variant">
                  Listen to pronunciation
                </span>
              </button>
            </>
          )}
        </div>

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
                  className={`flex flex-col gap-sm bg-surface-container-lowest border rounded-xl p-md text-left cursor-pointer transition-colors disabled:cursor-default ${
                    showCorrect
                      ? 'border-secondary bg-secondary-container/20'
                      : showIncorrect
                        ? 'border-error bg-error-container/40'
                        : 'border-outline-variant hover:border-primary'
                  }`}
                  onClick={() => handleSelect(label)}
                  disabled={status !== 'unanswered'}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`h-7 w-7 shrink-0 rounded-full border-2 flex items-center justify-center font-label-bold text-label-bold ${
                        showCorrect
                          ? 'border-secondary bg-secondary text-on-secondary'
                          : showIncorrect
                            ? 'border-error bg-error text-on-error'
                            : 'border-outline-variant text-on-surface-variant'
                      }`}
                    >
                      {label}
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      className="h-8 w-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        speak(text)
                      }}
                    >
                      <span className="material-symbols-outlined text-lg">play_arrow</span>
                    </span>
                  </div>
                  <span className="font-body-lg text-body-lg text-on-surface">"{text}"</span>
                </button>
              )
            })}
          </div>
        ) : (
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
        )}

        {status === 'correct' && (
          <div className="bg-secondary-container/20 border border-secondary rounded-xl p-md flex flex-wrap items-start gap-sm">
            <p className="flex-1 min-w-[160px] font-body-md text-body-md text-on-surface-variant">
              {question.explanation}
            </p>

            {noteButtonState === 'saved' && (
              <button
                className="flex items-center gap-1 ml-auto shrink-0 bg-surface-container-lowest border border-outline-variant rounded-lg py-1 px-sm font-label-bold text-xs text-on-surface-variant cursor-default"
                disabled
              >
                <span className="material-symbols-outlined text-base text-secondary">
                  check_circle
                </span>
                노트에 추가됨
              </button>
            )}

            {noteButtonState === 'idle' && (
              <button
                className="flex items-center gap-1 ml-auto shrink-0 bg-surface-container-lowest border border-outline-variant rounded-lg py-1 px-sm font-label-bold text-xs text-primary cursor-pointer"
                onClick={() => setNoteButtonState('panelOpen')}
              >
                <span className="material-symbols-outlined text-base">bookmark_add</span>
                노트에 추가하기
              </button>
            )}
          </div>
        )}

        {status === 'correct' && noteButtonState === 'panelOpen' && (
          <div className="flex flex-col gap-sm bg-surface-container-lowest border border-outline-variant rounded-xl p-md">
            <div className="flex flex-col gap-1">
              <p className="font-headline-md text-body-lg text-on-surface">
                "{getNotePhrase(question)}"
              </p>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {question.explanation}
              </p>
            </div>
            <textarea
              autoFocus
              className="w-full min-h-16 bg-surface border-2 border-outline-variant rounded-lg px-md py-sm font-body-md text-body-md text-on-surface focus:border-primary focus:ring-0 transition-colors resize-y"
              placeholder="메모 추가 (선택)"
              value={noteMemoDraft}
              onChange={(e) => setNoteMemoDraft(e.target.value)}
            />
            <div className="flex gap-sm justify-end">
              <button
                className="font-label-bold text-label-bold text-on-surface-variant py-sm px-md rounded-lg cursor-pointer"
                onClick={handleCancelNote}
              >
                취소
              </button>
              <button
                className="btn-primary bg-primary text-on-primary font-label-bold text-label-bold py-sm px-md rounded-lg cursor-pointer"
                onClick={handleSaveNote}
              >
                저장
              </button>
            </div>
          </div>
        )}

        {status === 'incorrect' && (
          <div className="bg-error-container/40 border border-error rounded-xl p-md">
            <div className="font-label-bold text-label-bold text-on-error-container mb-1">힌트</div>
            <p className="font-body-md text-body-md text-on-surface-variant">{question.hint}</p>
          </div>
        )}
      </div>

      <QuizFeedbackFooter status={status} isLastQuestion={isLastQuestion} onClick={handleFooterClick} />
    </div>
  )
}

export default QuestScreen
