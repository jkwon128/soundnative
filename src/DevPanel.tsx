// TEMPORARY dev-only tool for testing the daily quest / streak logic.
// Remove this file and its usage in App.tsx when no longer needed.
import { useState } from 'react'
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
import { SITUATION_CHIPS, loadOnboardingSituations } from './situations'
import { getDevIgnoreSituationFilter, setDevIgnoreSituationFilter } from './questSelection'
import { ALL_SESSIONS, filterSessionsByCategories } from './questSessions'

interface DevPanelProps {
  onStateChange: () => void
}

function DevPanel({ onStateChange }: DevPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  const current = loadStreak()
  const today = getTodayDateString()
  const selectedSituations = loadOnboardingSituations()
  const selectedSituationLabels = SITUATION_CHIPS.filter((chip) =>
    selectedSituations.includes(chip.category),
  ).map((chip) => chip.label)
  const ignoreSituationFilter = getDevIgnoreSituationFilter()
  const candidateSessions = filterSessionsByCategories(ALL_SESSIONS, selectedSituations)
  const activeSessions = ignoreSituationFilter ? ALL_SESSIONS : candidateSessions
  const currentSessionIndex = getCurrentQuestionIndex(activeSessions.length)
  const currentSession = activeSessions[currentSessionIndex]
  const currentSessionCategoryLabel =
    SITUATION_CHIPS.find((chip) => chip.category === currentSession.category)?.label ??
    currentSession.category
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

  const handleNextSession = () => {
    setQuestionIndexOverride((currentSessionIndex + 1) % activeSessions.length)
    onStateChange()
  }

  // Session progress lives only in QuestScreen's component state, so simply
  // forcing a remount (same mechanism every other button here uses) resets
  // it back to step 1 without touching which session is active.
  const handleRestartSession = () => {
    onStateChange()
  }

  const handleToggleIgnoreSituationFilter = () => {
    setDevIgnoreSituationFilter(!ignoreSituationFilter)
    onStateChange()
  }

  return (
    <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999, fontFamily: 'monospace' }}>
      {isOpen && (
        <div
          style={{
            marginBottom: 8,
            width: 280,
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
              세션: {currentSessionIndex + 1}번째 / 총 {activeSessions.length}개
            </div>
            <div>
              후보 세션 {candidateSessions.length}개 / 전체 세션 {ALL_SESSIONS.length}개
            </div>
            <div>
              선택된 상황:{' '}
              {selectedSituationLabels.length > 0 ? selectedSituationLabels.join(', ') : '없음 (전체 사용)'}
            </div>
          </div>
          <div style={{ marginBottom: 8, lineHeight: 1.6, borderTop: '1px solid #333', paddingTop: 8 }}>
            <div>현재 세션 category: {currentSessionCategoryLabel}</div>
            {currentSession.questions.map((q, index) => (
              <div key={index} style={{ color: '#aaa' }}>
                {index + 1}. {q.phrase}
              </div>
            ))}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <input
              type="checkbox"
              checked={ignoreSituationFilter}
              onChange={handleToggleIgnoreSituationFilter}
            />
            상황 필터 무시하고 전체 보기
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <button onClick={rollLastPlayedToYesterday}>오늘 기록 리셋</button>
            <button onClick={handleFullReset}>전체 리셋</button>
            <button onClick={rollLastPlayedToYesterday}>어제 푼 것처럼</button>
            <button onClick={handleIncrementStreak}>스트릭 +1</button>
            <button onClick={handleResetStreakNumber}>스트릭 리셋</button>
            <button onClick={handleNextSession}>다음 세션 보기</button>
            <button onClick={handleRestartSession}>세션 처음부터</button>
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
