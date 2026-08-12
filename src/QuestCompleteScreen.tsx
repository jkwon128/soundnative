import { getEffectiveStreak } from './dailyQuest'
import WeekdayTracker from './WeekdayTracker'
import Logo from './Logo'

interface QuestCompleteScreenProps {
  onOpenDecode: () => void
  onOpenHome: () => void
}

// One-time celebration shown right after finishing today's session — see
// QuestScreen's onComplete (fired only on the last question's Continue) and
// App.tsx's screen state machine, which only ever transitions here from
// that callback, never from a saved/persisted flag.
function QuestCompleteScreen({ onOpenDecode, onOpenHome }: QuestCompleteScreenProps) {
  const streak = getEffectiveStreak()

  return (
    <div className="min-h-screen bg-warm-bg flex flex-col items-center">
      <div className="w-full max-w-[560px] flex flex-col gap-md p-gutter md:p-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-warm-text font-label-bold text-lg font-bold">
            <Logo className="h-8 w-8" />
            SoundNative
          </div>
          <span className="flex items-center gap-1 bg-warm-badge-bg text-warm-badge-text font-label-bold text-label-bold px-md py-1 rounded-full">
            <span className="material-symbols-outlined text-lg">local_fire_department</span>
            {streak}
          </span>
        </div>

        <div className="w-full bg-warm-surface rounded-3xl shadow-warm-card overflow-hidden">
          <div className="bg-gradient-to-b from-warm-peach/25 to-warm-surface px-lg py-xl flex flex-col items-center gap-sm text-center">
            <span className="h-20 w-20 rounded-full bg-warm-peach/30 flex items-center justify-center text-warm-primary">
              <span className="material-symbols-outlined text-5xl">local_fire_department</span>
            </span>
            <h1 className="font-warm-serif text-display-lg text-warm-text">{streak}일 연속!</h1>
            <p className="font-body-md text-body-md text-warm-text-muted">
              매일 1분. 이 감각이 쌓이면 대화의 온도가 달라져요.
            </p>
          </div>

          <div className="px-lg pb-lg flex flex-col gap-md">
            <WeekdayTracker />

            <p className="bg-warm-bg-soft border border-warm-border rounded-full px-md py-sm text-center font-body-md text-sm text-warm-text-muted">
              내일의 한 문장이 <span className="font-label-bold text-warm-text">내일 아침</span>에
              도착해요.
            </p>

            <button
              className="btn-warm-primary w-full bg-warm-primary text-warm-on-primary font-label-bold text-label-bold py-sm px-md rounded-full flex items-center justify-center gap-2 cursor-pointer"
              onClick={onOpenDecode}
            >
              지금 곤란한 문장 Decode하기
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
        </div>

        <button
          className="self-center font-label-bold text-label-bold text-warm-text-muted cursor-pointer"
          onClick={onOpenHome}
        >
          홈으로
        </button>
      </div>
    </div>
  )
}

export default QuestCompleteScreen
