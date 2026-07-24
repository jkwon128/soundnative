import { ALL_SESSIONS, type QuestSession } from './questSessions'
import { CATEGORY_META } from './categoryMeta'
import { getCurrentQuestionIndex, loadStreak } from './dailyQuest'

// Decorative only — not backed by any real currency/reward logic yet.
const STATIC_GEM_COUNT = 320

type NodeState = 'completed' | 'today' | 'future'

interface HomeScreenProps {
  onOpenQuest: (session: QuestSession) => void
  onOpenDecode: () => void
}

function HomeScreen({ onOpenQuest, onOpenDecode }: HomeScreenProps) {
  const streak = loadStreak().streak
  const todayIndex = getCurrentQuestionIndex(ALL_SESSIONS.length)

  return (
    <div className="min-h-screen bg-surface">
      <div className="sticky top-0 z-10 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between px-md md:px-lg py-sm">
        <div className="flex items-center gap-2 text-primary font-label-bold text-label-bold">
          <span className="material-symbols-outlined text-2xl">volume_up</span>
          SoundNative
        </div>
        <div className="flex items-center gap-md">
          <span className="flex items-center gap-1 font-label-bold text-body-lg text-on-surface">
            <span className="material-symbols-outlined text-error text-2xl">
              local_fire_department
            </span>
            {streak}
          </span>
          <span className="flex items-center gap-1 font-label-bold text-body-lg text-on-surface">
            <span className="material-symbols-outlined text-secondary text-2xl">diamond</span>
            {STATIC_GEM_COUNT}
          </span>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto flex items-start justify-center gap-xl p-gutter md:p-lg">
        <div className="relative flex flex-col items-center py-lg">
          <div className="absolute top-8 bottom-8 left-1/2 w-1 bg-surface-container-high -translate-x-1/2" />

          {ALL_SESSIONS.map((session, i) => {
            const meta = CATEGORY_META[session.category]
            const state: NodeState = i < todayIndex ? 'completed' : i === todayIndex ? 'today' : 'future'
            const clickable = state !== 'future'

            return (
              <div key={i} className="relative z-10 flex flex-col items-center mb-9">
                <button
                  className={`relative h-16 w-16 rounded-full border-[3px] flex items-center justify-center cursor-pointer disabled:cursor-default ${
                    state === 'future'
                      ? 'bg-surface-container-high border-outline-variant opacity-70'
                      : 'border-transparent'
                  } ${state === 'today' ? 'animate-pulse' : ''}`}
                  style={clickable ? { background: meta.color } : undefined}
                  onClick={() => clickable && onOpenQuest(session)}
                  disabled={!clickable}
                >
                  <span
                    className={`material-symbols-outlined text-3xl ${
                      clickable ? 'text-on-primary' : 'text-on-surface-variant'
                    }`}
                  >
                    {clickable ? meta.icon : 'lock'}
                  </span>
                  {state === 'completed' && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-secondary border-2 border-surface-container-lowest flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-secondary text-sm">
                        check
                      </span>
                    </span>
                  )}
                </button>
                <span className="mt-2 font-body-md text-sm text-on-surface-variant">
                  {meta.label}
                </span>
              </div>
            )
          })}
        </div>

        <div className="sticky top-24 w-60 shrink-0 bg-surface-container-lowest border border-outline-variant rounded-xl p-md text-center flex flex-col gap-sm">
          <p className="font-label-bold text-body-lg text-on-surface">
            지금 무슨 말인지 모르겠나요?
          </p>
          <button
            className="btn-primary w-full bg-primary text-on-primary font-label-bold text-label-bold py-sm px-md rounded-lg cursor-pointer"
            onClick={onOpenDecode}
          >
            Decode 열기
          </button>
        </div>
      </div>
    </div>
  )
}

export default HomeScreen
