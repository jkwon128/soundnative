import { useState } from 'react'
import './App.css'
import { quizQuestions } from './quizData'
import {
  computeNextStreak,
  getCurrentQuestionIndex,
  getTodayDateString,
  loadStreak,
  saveStreak,
  type StreakState,
} from './dailyQuest'

interface QuestScreenProps {
  onContinue: () => void
}

function QuestScreen({ onContinue }: QuestScreenProps) {
  const today = getTodayDateString()
  const questionIndex = getCurrentQuestionIndex(quizQuestions.length)
  const quest = quizQuestions[questionIndex]

  const [streakState, setStreakState] = useState<StreakState>(() => loadStreak())
  const [alreadySolvedToday] = useState(() => streakState.lastPlayedDate === today)
  const [wrongChoices, setWrongChoices] = useState<number[]>([])
  const [correct, setCorrect] = useState(false)

  const handleSelect = (choiceIndex: number) => {
    if (correct || wrongChoices.includes(choiceIndex)) return

    if (choiceIndex === quest.answer) {
      setCorrect(true)
      setStreakState((prev) => {
        const next: StreakState = {
          streak: computeNextStreak(prev, today),
          lastPlayedDate: today,
        }
        saveStreak(next)
        return next
      })
    } else {
      setWrongChoices((prev) => [...prev, choiceIndex])
    }
  }

  const handleRetry = () => {
    setWrongChoices([])
  }

  const streakBadge = <div className="streak-badge">🔥 {streakState.streak}일 연속</div>

  if (alreadySolvedToday) {
    return (
      <div className="app">
        <div className="logo">SoundNative</div>
        {streakBadge}
        <h1 className="headline">Sound like a native</h1>

        <div className="quest-card">
          <div className="quest-complete-title">오늘의 퀘스트는 완료했어요!</div>
          <div className="quest-complete-text">내일 새로운 문제가 도착해요.</div>
          <button className="continue-button" onClick={onContinue}>
            Continue
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
        <div className="quest-label">{quest.situation}</div>
        <div className="quest-phrase">"{quest.phrase}"</div>

        <div className="answers">
          {quest.choices.map((choice, index) => {
            const isWrongPick = wrongChoices.includes(index)
            const isCorrectChoice = index === quest.answer

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
                disabled={correct || isWrongPick}
                onClick={() => handleSelect(index)}
              >
                {choice}
              </button>
            )
          })}
        </div>

        {!correct && wrongChoices.length > 0 && (
          <div className="quest-hint">
            <div className="quest-hint-text">{quest.hint}</div>
            <button className="quest-retry-button" onClick={handleRetry}>
              다시 시도
            </button>
          </div>
        )}

        {correct && (
          <div className="result">
            <div className="result-status">Correct!</div>
            <div className="result-explanation">{quest.explanation}</div>
            <button className="continue-button" onClick={onContinue}>
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuestScreen
