import { useState } from 'react'
import './App.css'
import {
  computeNextStreak,
  getCurrentQuestionIndex,
  getTodayDateString,
  loadStreak,
  saveStreak,
  type StreakState,
} from './dailyQuest'
import { getActiveSessions } from './questSessions'

interface QuestScreenProps {
  onContinue: () => void
}

function QuestScreen({ onContinue }: QuestScreenProps) {
  const today = getTodayDateString()
  const activeSessions = getActiveSessions()
  const sessionIndex = getCurrentQuestionIndex(activeSessions.length)
  const session = activeSessions[sessionIndex]

  const [streakState, setStreakState] = useState<StreakState>(() => loadStreak())
  const [alreadyCompletedToday] = useState(() => streakState.lastPlayedDate === today)

  // Progress through today's session lives only in component state — it is
  // never persisted, so leaving mid-session and coming back starts over.
  // Modeled as a step index rather than a hardcoded "3 questions" so a
  // future step type (e.g. a non-quiz "depth card") can slot in without
  // restructuring this flow.
  const [stepIndex, setStepIndex] = useState(0)
  const [wrongChoices, setWrongChoices] = useState<number[]>([])
  const [correct, setCorrect] = useState(false)
  const [sessionComplete, setSessionComplete] = useState(false)

  const totalSteps = session.questions.length
  const isLastStep = stepIndex === totalSteps - 1
  const question = session.questions[stepIndex]

  const handleSelect = (choiceIndex: number) => {
    if (correct || wrongChoices.length > 0) return

    if (choiceIndex === question.answer) {
      setCorrect(true)
    } else {
      setWrongChoices((prev) => [...prev, choiceIndex])
    }
  }

  const handleRetry = () => {
    setWrongChoices([])
  }

  const handleAdvance = () => {
    if (isLastStep) {
      // Streak only advances once every step in the session is done.
      setStreakState((prev) => {
        const next: StreakState = {
          streak: computeNextStreak(prev, today),
          lastPlayedDate: today,
        }
        saveStreak(next)
        return next
      })
      setSessionComplete(true)
      return
    }

    setStepIndex((i) => i + 1)
    setWrongChoices([])
    setCorrect(false)
  }

  const streakBadge = (
    <div className="streak-hero">
      <span className="streak-hero-fire">🔥</span>
      <span className="streak-hero-value">{streakState.streak}</span>
      <span className="streak-hero-unit">일 연속</span>
    </div>
  )

  if (alreadyCompletedToday || sessionComplete) {
    return (
      <div className="app">
        <div className="logo">SoundNative</div>
        {streakBadge}
        <h1 className="headline">Sound like a native</h1>

        <div className="quest-card">
          <div className="quest-complete-title">오늘의 세션 완료!</div>
          <div className="quest-complete-text">내일 새로운 세션이 도착해요.</div>

          <div className="session-summary-list">
            {session.questions.map((sessionQuestion, index) => (
              <div className="session-summary-item" key={index}>
                <div className="session-summary-phrase">"{sessionQuestion.phrase}"</div>
                <div className="session-summary-note">{sessionQuestion.explanation}</div>
              </div>
            ))}
          </div>

          <button className="continue-button" onClick={onContinue}>
            Decode 도구 열기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="logo">SoundNative</div>
      {streakBadge}
      <h1 className="headline">Sound like a native</h1>

      <div className="quest-card">
        <div className="quest-progress">
          {stepIndex + 1} / {totalSteps}
        </div>
        <div className="quest-label">{question.situation}</div>
        <div className="quest-phrase">"{question.phrase}"</div>

        <div className="answers">
          {question.choices.map((choice, index) => {
            const isWrongPick = wrongChoices.includes(index)
            const isCorrectChoice = index === question.answer

            let stateClass = ''
            if (correct) {
              stateClass = isCorrectChoice ? 'correct' : isWrongPick ? 'incorrect' : 'muted'
            } else if (isWrongPick) {
              stateClass = 'incorrect'
            }

            return (
              <button
                key={index}
                className={`answer-button ${stateClass}`.trim()}
                disabled={correct || wrongChoices.length > 0}
                onClick={() => handleSelect(index)}
              >
                {choice}
              </button>
            )
          })}
        </div>

        {!correct && wrongChoices.length > 0 && (
          <div className="quest-hint">
            <div className="quest-hint-text">{question.hint}</div>
            <button className="quest-retry-button" onClick={handleRetry}>
              다시 시도
            </button>
          </div>
        )}

        {correct && (
          <div className="result">
            <div className="result-status">Correct!</div>
            <div className="result-explanation">{question.explanation}</div>
            <button className="continue-button" onClick={handleAdvance}>
              {isLastStep ? 'Continue' : '다음'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuestScreen
