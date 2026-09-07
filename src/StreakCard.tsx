import { loadStreak, getEffectiveStreak, getTodayDateString } from './dailyQuest'
import WeekdayTracker from './WeekdayTracker'
import BilingualText from './BilingualText'
import { homeStrings } from './i18n/homeStrings'

function StreakCard() {
  const { lastPlayedDate } = loadStreak()
  const streak = getEffectiveStreak()
  const playedToday = lastPlayedDate === getTodayDateString()

  const subtext =
    streak === 0
      ? homeStrings.streakSubtext.zero
      : playedToday
        ? homeStrings.streakSubtext.playedToday
        : homeStrings.streakSubtext.continue

  return (
    <div className="bg-warm-surface border border-warm-border rounded-warm-card shadow-warm-card p-md flex flex-col gap-md">
      <div className="flex items-center gap-md">
        <span className="h-14 w-14 shrink-0 rounded-2xl bg-warm-peach/30 flex items-center justify-center text-warm-primary">
          <span className="material-symbols-outlined text-3xl">local_fire_department</span>
        </span>
        <div>
          <p className="flex items-baseline gap-1">
            <span className="font-warm-serif text-display-lg text-warm-text">{streak}</span>
            <BilingualText
              ko={homeStrings.streakUnit.ko}
              en={homeStrings.streakUnit.en}
              koClassName="font-label-bold text-body-lg text-warm-text"
              enClassName="text-sm"
            />
          </p>
          <BilingualText
            as="p"
            ko={subtext.ko}
            en={subtext.en}
            koClassName="font-body-md text-sm text-warm-text-muted"
            enClassName="text-[11px]"
          />
        </div>
      </div>

      <WeekdayTracker bilingual />
    </div>
  )
}

export default StreakCard
