// TEMPORARY dev-only tool for testing the daily quest / streak logic.
// Remove this file and its usage in App.tsx when no longer needed.
import { useState } from 'react'
import { quizQuestions } from './quizData'
import {
  clearQuestionIndexOverride,
  clearStreak,
  getCurrentQuestionIndex,
  getTodayDateString,
  getYesterdayDateString,
  loadStreak,
  saveStreak,
  setQuestionIndexOverride,
} from './dailyQuest'

interface DevPanelProps {
  onStateChange: () => void
}

function DevPanel({ onStateChange }: DevPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  const current = loadStreak()
  const today = getTodayDateString()
  const currentQuestionIndex = getCurrentQuestionIndex(quizQuestions.length)
  const solvedToday = current.lastPlayedDate === today

  // Rolling lastPlayedDate back to "yesterday" (keeping the streak number)
  // is the only way to make today replayable without wiping the streak,
  // since there's no separate "solved today" flag in storage — this is
  // also exactly what simulating "played yesterday" means for continuity.
  const rollLastPlayedToYesterday = () => {
    saveStreak({ streak: current.streak, lastPlayedDate: getYesterdayDateString(today) })
    onStateChange()
  }

  const handleFullReset = () => {
    clearStreak()
    clearQuestionIndexOverride()
    onStateChange()
  }

  const handleIncrementStreak = () => {
    saveStreak({ streak: current.streak + 1, lastPlayedDate: current.lastPlayedDate })
    onStateChange()
  }

  const handleResetStreakNumber = () => {
    saveStreak({ streak: 0, lastPlayedDate: current.lastPlayedDate })
    onStateChange()
  }

  const handleNextQuestion = () => {
    setQuestionIndexOverride((currentQuestionIndex + 1) % quizQuestions.length)
    onStateChange()
  }

  return (
    <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999, fontFamily: 'monospace' }}>
      {isOpen && (
        <div
          style={{
            marginBottom: 8,
            width: 260,
            background: '#111',
            color: '#fff',
            fontSize: 12,
            padding: 12,
            borderRadius: 8,
          }}
        >
          <div style={{ marginBottom: 8, lineHeight: 1.6 }}>
            <div>스트릭: {current.streak}</div>
            <div>마지막 완료일: {current.lastPlayedDate ?? '없음'}</div>
            <div>오늘 완료 여부: {solvedToday ? '완료' : '미완료'}</div>
            <div>
              문제 인덱스: {currentQuestionIndex} / {quizQuestions.length - 1}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <button onClick={rollLastPlayedToYesterday}>오늘 기록 리셋</button>
            <button onClick={handleFullReset}>전체 리셋</button>
            <button onClick={rollLastPlayedToYesterday}>어제 푼 것처럼</button>
            <button onClick={handleIncrementStreak}>스트릭 +1</button>
            <button onClick={handleResetStreakNumber}>스트릭 리셋</button>
            <button onClick={handleNextQuestion}>다음 문제 보기</button>
          </div>
        </div>
      )}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: 'none',
          background: '#111',
          color: '#fff',
          fontSize: 18,
          cursor: 'pointer',
        }}
      >
        🛠
      </button>
    </div>
  )
}

export default DevPanel
