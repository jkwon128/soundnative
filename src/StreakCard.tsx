import { getDayIndex } from './dateUtils'
import { loadStreak, getTodayDateString } from './dailyQuest'

// Korean short weekday label, indexed by Date#getUTCDay() (0 = Sun).
const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

// Pure date-string math kept local rather than added to dateUtils.ts — that
// file is shared with the streak data layer, which we're leaving untouched.
function addDays(dateString: string, delta: number): string {
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + delta)
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
}

function weekdayLabel(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number)
  return WEEKDAY_LABELS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()]
}

// A day counts as completed if it falls within the most recent `streakCount`
// consecutive days ending at lastPlayedDate — the streak counter itself is
// already a "consecutive days played" count, so this reconstructs per-day
// state without needing a new history log alongside it.
function isDayCompleted(dateString: string, lastPlayedDate: string | null, streakCount: number): boolean {
  if (!lastPlayedDate || streakCount <= 0) return false
  const offset = getDayIndex(lastPlayedDate) - getDayIndex(dateString)
  return offset >= 0 && offset < streakCount
}

function StreakCard() {
  const { streak, lastPlayedDate } = loadStreak()
  const today = getTodayDateString()
  const playedToday = lastPlayedDate === today
  const last7Days = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6))

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

      <div className="flex items-center justify-between">
        {last7Days.map((dateString) => {
          const isToday = dateString === today
          const completed = isDayCompleted(dateString, lastPlayedDate, streak)

          return (
            <div key={dateString} className="flex flex-col items-center gap-1">
              <span className="font-label-bold text-xs text-warm-text-muted">
                {weekdayLabel(dateString)}
              </span>
              <span
                className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  completed
                    ? 'bg-warm-primary text-warm-on-primary'
                    : isToday
                      ? 'border-2 border-dashed border-warm-primary/50'
                      : 'bg-warm-badge-bg'
                }`}
              >
                {completed && <span className="material-symbols-outlined text-base">check</span>}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default StreakCard
