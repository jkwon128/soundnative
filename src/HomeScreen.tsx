import { useEffect, useState } from 'react'
import { ALL_SESSIONS, type QuestSession } from './questSessions'
import { CATEGORY_META } from './categoryMeta'
import { loadStreak } from './dailyQuest'
import { loadNotes } from './notes'
import { loadCompletedSessionIds } from './sessionProgress'
import { supabase } from './supabaseClient'
import type { SubscriptionState } from './useSubscription'
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
  subscription: SubscriptionState
  onOpenQuest: (session: QuestSession) => void
  onOpenDecode: () => void
  onOpenNotes: () => void
  onOpenMyPage: () => void
}

// Real days remaining, rounded up — a trial that ends in 20 hours should
// still read "D-1", not "D-0", since there's a partial day of access left.
function daysRemaining(isoDate: string): number {
  const ms = new Date(isoDate).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / 86400000))
}

function formatKoreanDate(isoDate: string): string {
  return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric' }).format(
    new Date(isoDate),
  )
}

function HomeScreen({
  subscription,
  onOpenQuest,
  onOpenDecode,
  onOpenNotes,
  onOpenMyPage,
}: HomeScreenProps) {
  const streak = loadStreak().streak
  const noteCount = loadNotes().length

  // "Today" is progress-based (the first session the user hasn't finished
  // yet), not calendar-based — a brand-new user has completed nothing, so
  // this resolves to index 0 rather than however many sessions have elapsed
  // since day 0. Membership in completedSessionIds (keyed by session.id, not
  // array index) is the only thing that marks a node "completed".
  const completedSessionIds = new Set(loadCompletedSessionIds())
  const firstIncompleteIndex = ALL_SESSIONS.findIndex(
    (session) => !completedSessionIds.has(session.id),
  )
  const todayIndex = firstIncompleteIndex === -1 ? ALL_SESSIONS.length : firstIncompleteIndex

  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user.email ?? null)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const nodeCenterX = (i: number) => PATH_WIDTH / 2 + OFFSET_PATTERN[i % 4] * OFFSET_X
  const nodeCenterY = (i: number) => i * SLOT_HEIGHT + NODE_ZONE / 2

  return (
    <div className="min-h-screen bg-surface bg-soundwave">
      <div className="sticky top-0 z-10 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between px-md md:px-lg py-sm">
        <div className="flex items-center gap-2 text-primary font-label-bold text-label-bold">
          <Logo className="h-8 w-8" />
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
          {userEmail && (
            <button
              className="text-on-surface-variant cursor-pointer"
              onClick={onOpenMyPage}
              aria-label="마이페이지"
              title={userEmail}
            >
              <span className="material-symbols-outlined text-2xl">account_circle</span>
            </button>
          )}
        </div>
      </div>

      {subscription.status === 'trialing' && subscription.trialEndsAt && (
        <div className="bg-secondary-container/20 border-b border-secondary px-md md:px-lg py-sm text-center">
          <p className="font-body-md text-sm text-on-surface">
            무료 체험 D-{daysRemaining(subscription.trialEndsAt)} · {formatKoreanDate(subscription.trialEndsAt)}
            부터 자동으로 결제돼요.{' '}
            <button
              className="font-label-bold underline cursor-pointer"
              onClick={onOpenMyPage}
            >
              구독 관리
            </button>
          </p>
        </div>
      )}
      {subscription.status === 'active' && subscription.cancelAtPeriodEnd && subscription.currentPeriodEnd && (
        <div className="bg-error-container/40 border-b border-error px-md md:px-lg py-sm text-center">
          <p className="font-body-md text-sm text-on-surface">
            {formatKoreanDate(subscription.currentPeriodEnd)}에 구독이 종료돼요. 그 전까지는 계속
            이용할 수 있어요.
          </p>
        </div>
      )}
      {subscription.status === 'past_due' && (
        <div className="bg-error-container/40 border-b border-error px-md md:px-lg py-sm text-center">
          <p className="font-body-md text-sm text-on-surface">
            결제에 실패했어요. 계속 이용하려면 결제 수단을 업데이트해주세요.{' '}
            <button
              className="font-label-bold underline cursor-pointer"
              onClick={onOpenMyPage}
            >
              결제 수단 업데이트
            </button>
          </p>
        </div>
      )}

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
                const state: NodeState = completedSessionIds.has(session.id)
                  ? 'completed'
                  : i === todayIndex
                    ? 'today'
                    : 'future'
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

        <div className="md:sticky md:top-24 w-full max-w-[320px] md:w-60 shrink-0 flex flex-col gap-md">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md text-center flex flex-col items-center gap-sm shadow-[0_10px_28px_rgba(22,26,50,0.08)]">
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

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md text-center flex flex-col items-center gap-sm shadow-[0_10px_28px_rgba(22,26,50,0.08)]">
            <span className="material-symbols-outlined text-secondary text-3xl">bookmark</span>
            <p className="font-label-bold text-body-lg text-on-surface">
              지금까지 배운 표현 {noteCount}개
            </p>
            <button
              className="btn-secondary w-full flex items-center justify-center gap-sm bg-surface-container-lowest border border-outline text-on-surface font-label-bold text-label-bold py-sm px-md rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer"
              onClick={onOpenNotes}
            >
              노트 보기
            </button>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md text-center flex flex-col items-center gap-sm shadow-[0_10px_28px_rgba(22,26,50,0.08)]">
            <span className="material-symbols-outlined text-primary text-3xl">diamond</span>
            <p className="font-label-bold text-body-lg text-on-surface">
              {subscription.status === 'trialing' ? '무료 체험 이용 중' : '프리미엄 이용 중'}
            </p>
            <button
              className="btn-secondary w-full flex items-center justify-center gap-sm bg-surface-container-lowest border border-outline text-on-surface font-label-bold text-label-bold py-sm px-md rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer"
              onClick={onOpenMyPage}
            >
              구독 관리
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomeScreen
