import { loadStreak, getTodayDateString } from './dailyQuest'
import WeekdayTracker from './WeekdayTracker'

function StreakCard() {
  const { streak, lastPlayedDate } = loadStreak()
  const playedToday = lastPlayedDate === getTodayDateString()

  const subtext =
    streak === 0
      ? '오늘 첫 불씨를 붙여볼까요?'
      : playedToday
        ? '오늘도 해냈어요!'
        : '오늘 한 문장이면 이어져요'

  return (
    <div className="bg-warm-surface border border-warm-border rounded-warm-card shadow-warm-card p-md flex flex-col gap-md">
      <div className="flex items-center gap-md">
        <span className="h-14 w-14 shrink-0 rounded-2xl bg-warm-peach/30 flex items-center justify-center text-warm-primary">
          <span className="material-symbols-outlined text-3xl">local_fire_department</span>
        </span>
        <div>
          <p className="flex items-baseline gap-1">
            <span className="font-warm-serif text-display-lg text-warm-text">{streak}</span>
            <span className="font-label-bold text-body-lg text-warm-text">일 연속</span>
          </p>
          <p className="font-body-md text-sm text-warm-text-muted">{subtext}</p>
        </div>
      </div>

      <WeekdayTracker />
    </div>
  )
}

export default StreakCard
