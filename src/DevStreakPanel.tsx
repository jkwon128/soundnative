// TEMPORARY dev-only tool for testing the daily quest / streak logic.
// Remove this file and its usage in App.tsx when no longer needed.
import {
  clearStreak,
  getTodayDateString,
  getYesterdayDateString,
  loadStreak,
  saveStreak,
} from './dailyQuest'

function DevStreakPanel() {
  const current = loadStreak()
  const today = getTodayDateString()

  const handleReset = () => {
    clearStreak()
    window.location.reload()
  }

  const handleSimulateYesterday = () => {
    saveStreak({
      streak: Math.max(current.streak, 1),
      lastPlayedDate: getYesterdayDateString(today),
    })
    window.location.reload()
  }

  const handleSimulateSolvedToday = () => {
    saveStreak({
      streak: Math.max(current.streak, 1),
      lastPlayedDate: today,
    })
    window.location.reload()
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#111',
        color: '#fff',
        fontSize: 12,
        padding: '8px 12px',
        zIndex: 9999,
        fontFamily: 'monospace',
      }}
    >
      <div>
        [DEV] streak={current.streak} / lastPlayedDate={current.lastPlayedDate ?? '없음'} / today=
        {today}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
        <button onClick={handleReset}>리셋</button>
        <button onClick={handleSimulateYesterday}>어제 푼 것으로 설정</button>
        <button onClick={handleSimulateSolvedToday}>오늘 이미 푼 것으로 설정</button>
      </div>
    </div>
  )
}

export default DevStreakPanel
