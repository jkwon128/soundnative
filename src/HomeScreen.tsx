import { ALL_SESSIONS, type QuestSession } from './questSessions'
import { CATEGORY_META } from './categoryMeta'
import { getCurrentQuestionIndex, loadStreak } from './dailyQuest'
import Logo from './Logo'

// Decorative only — not backed by any real currency/reward logic yet.
const STATIC_GEM_COUNT = 320

type NodeState = 'completed' | 'today' | 'future'

// Purely presentational constants for the zigzag path layout. Node i sits at
// horizontal offset OFFSET_PATTERN[i % 4] * OFFSET_X from center, and every
// node occupies a fixed-height vertical slot so connector geometry below can
// be computed without measuring the DOM.
const OFFSET_PATTERN = [0, -1, 0, 1]
const OFFSET_X = 22
const PATH_WIDTH = 300
const SLOT_HEIGHT = 132
const NODE_ZONE = 96
const BASE_NODE_SIZE = 64
const TODAY_NODE_SIZE = 88

interface HomeScreenProps {
  onOpenQuest: (session: QuestSession) => void
  onOpenDecode: () => void
}

function HomeScreen({ onOpenQuest, onOpenDecode }: HomeScreenProps) {
  const streak = loadStreak().streak
  const todayIndex = getCurrentQuestionIndex(ALL_SESSIONS.length)

  const nodeCenterX = (i: number) => PATH_WIDTH / 2 + OFFSET_PATTERN[i % 4] * OFFSET_X
  const nodeCenterY = (i: number) => i * SLOT_HEIGHT + NODE_ZONE / 2

  return (
    <div className="min-h-screen bg-surface bg-soundwave">
      <div className="sticky top-0 z-10 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between px-md md:px-lg py-sm">
        <div className="flex items-center gap-2 text-primary font-label-bold text-label-bold">
          <Logo className="h-6 w-6" />
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

      <div className="max-w-[820px] mx-auto flex flex-col md:flex-row items-center md:items-start justify-center gap-lg p-gutter md:p-lg">
        <div className="flex-1 flex justify-center py-lg">
          <div className="relative" style={{ width: PATH_WIDTH }}>
            {/* Connector segments, drawn behind the node column */}
            <div className="absolute inset-0 pointer-events-none">
              {ALL_SESSIONS.slice(0, -1).map((_, i) => {
                const x0 = nodeCenterX(i)
                const y0 = nodeCenterY(i)
                const x1 = nodeCenterX(i + 1)
                const dx = x1 - x0
                const dy = SLOT_HEIGHT
                const length = Math.hypot(dx, dy)
                // translateX(-50%) + rotate() compose around the element's own
                // transform-origin, which mirrors a plain atan2(dx, dy) angle
                // horizontally — negate it so the far end lands on (x1, y1)
                // instead of its mirror image.
                const angleDeg = -(Math.atan2(dx, dy) * 180) / Math.PI
                const walked = i < todayIndex

                return (
                  <div
                    key={i}
                    className={`absolute top-0 left-0 rounded-full ${
                      walked ? 'bg-primary/65' : 'bg-surface-container-high'
                    }`}
                    style={{
                      width: 6,
                      height: length,
                      transform: `translate(${x0}px, ${y0}px) translateX(-50%) rotate(${angleDeg}deg)`,
                      transformOrigin: 'top center',
                    }}
                  />
                )
              })}
            </div>

            {/* Node column */}
            <div className="relative flex flex-col items-center">
              {ALL_SESSIONS.map((session, i) => {
                const meta = CATEGORY_META[session.category]
                const state: NodeState =
                  i < todayIndex ? 'completed' : i === todayIndex ? 'today' : 'future'
                const clickable = state !== 'future'
                const isToday = state === 'today'
                const size = isToday ? TODAY_NODE_SIZE : BASE_NODE_SIZE
                const offsetX = OFFSET_PATTERN[i % 4] * OFFSET_X

                return (
                  <div
                    key={i}
                    className="flex flex-col items-center"
                    style={{ height: SLOT_HEIGHT, transform: `translateX(${offsetX}px)` }}
                  >
                    <div
                      className="relative flex items-center justify-center shrink-0"
                      style={{ height: NODE_ZONE }}
                    >
                      {isToday && (
                        <span
                          className="absolute rounded-full animate-node-glow"
                          style={{ width: size, height: size, background: meta.color }}
                          aria-hidden="true"
                        />
                      )}
                      <button
                        className={`relative rounded-full border-[3px] flex items-center justify-center cursor-pointer transition-transform disabled:cursor-default ${
                          state === 'future'
                            ? 'bg-surface-container-high border-outline-variant'
                            : 'border-transparent hover:scale-[1.04]'
                        } ${
                          state === 'completed'
                            ? 'shadow-[0_6px_14px_rgba(22,26,50,0.16)]'
                            : isToday
                              ? 'shadow-[0_10px_22px_rgba(22,26,50,0.24)]'
                              : ''
                        }`}
                        style={{
                          width: size,
                          height: size,
                          background: clickable
                            ? `linear-gradient(135deg, color-mix(in srgb, ${meta.color} 100%, white 32%), ${meta.color})`
                            : undefined,
                        }}
                        onClick={() => clickable && onOpenQuest(session)}
                        disabled={!clickable}
                      >
                        <span
                          className={`material-symbols-outlined ${isToday ? 'text-4xl' : 'text-3xl'} ${
                            clickable ? 'text-on-primary' : 'text-on-surface-variant'
                          }`}
                        >
                          {clickable ? meta.icon : 'lock'}
                        </span>
                        {state === 'completed' && (
                          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-secondary border-2 border-surface-container-lowest flex items-center justify-center shadow-[0_2px_4px_rgba(22,26,50,0.25)]">
                            <span className="material-symbols-outlined text-on-secondary text-sm">
                              check
                            </span>
                          </span>
                        )}
                      </button>
                    </div>
                    <span
                      className={`mt-2 font-label-bold text-xs tracking-wide text-center leading-tight ${
                        isToday ? 'text-on-surface' : 'text-on-surface-variant'
                      }`}
                      style={{
                        textShadow:
                          '0 0 5px var(--color-surface), 0 0 5px var(--color-surface), 0 0 5px var(--color-surface)',
                      }}
                    >
                      {meta.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="md:sticky md:top-24 w-full max-w-[320px] md:w-60 shrink-0 bg-surface-container-lowest border border-outline-variant rounded-xl p-md text-center flex flex-col items-center gap-sm shadow-[0_10px_28px_rgba(22,26,50,0.08)]">
          <span className="material-symbols-outlined text-primary text-3xl">graphic_eq</span>
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
