import { getDayIndex } from './dateUtils'
import { loadStreak, getTodayDateString } from './dailyQuest'
import BilingualText from './BilingualText'

// Korean short weekday label, indexed by Date#getUTCDay() (0 = Sun).
const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']
// Single-letter English abbreviations, same index — Tue/Thu both "T" and
// Sat/Sun both "S" is the standard calendar-strip convention, not a bug.
const WEEKDAY_LABELS_EN = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

// Pure date-string math kept local rather than added to dateUtils.ts — that
// file is shared with the streak data layer, which we're leaving untouched.
function addDays(dateString: string, delta: number): string {
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + delta)
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
}

function weekdayIndex(dateString: string): number {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay()
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

interface WeekdayTrackerProps {
  // Off by default so QuestCompleteScreen's existing call site (unchanged)
  // keeps rendering Korean-only, exactly as before. Home's StreakCard opts
  // in explicitly.
  bilingual?: boolean
}

// A rolling 7-day window ending today (today is always the rightmost cell) —
// shared by StreakCard (Home) and QuestCompleteScreen (post-session
// celebration), self-contained so either can drop it in without threading
// streak data through props.
function WeekdayTracker({ bilingual = false }: WeekdayTrackerProps) {
  const { streak, lastPlayedDate } = loadStreak()
  const today = getTodayDateString()
  const last7Days = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6))

  return (
    <div className="flex items-center justify-between">
      {last7Days.map((dateString) => {
        const isToday = dateString === today
        const completed = isDayCompleted(dateString, lastPlayedDate, streak)
        const dayIndex = weekdayIndex(dateString)

        return (
          <div key={dateString} className="flex flex-col items-center gap-1">
            <BilingualText
              mode={bilingual ? 'bilingual' : 'ko'}
              ko={WEEKDAY_LABELS[dayIndex]}
              en={WEEKDAY_LABELS_EN[dayIndex]}
              className="items-center"
              koClassName="font-label-bold text-xs text-warm-text-muted"
              enClassName="text-[9px] leading-none"
            />
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
  )
}

export default WeekdayTracker
