import { useEffect, useState } from 'react'
import { ALL_SESSIONS, type QuestSession } from './questSessions'
import { loadStreak, getEffectiveStreak, getTodayDateString } from './dailyQuest'
import { loadNotes } from './notes'
import { loadCompletedSessionIds } from './sessionProgress'
import { supabase } from './supabaseClient'
import HomeLayout from './HomeLayout'
import StreakCard from './StreakCard'
import QuestPreviewCard from './QuestPreviewCard'
import BilingualText, { type BilingualTextValue } from './BilingualText'
import { homeStrings, formatBilingual } from './i18n/homeStrings'

interface HomeScreenProps {
  isLocked: boolean
  onOpenQuest: (session: QuestSession) => void
  onOpenDecode: () => void
  onOpenNotes: () => void
  onOpenMyPage: () => void
}

interface NavCardProps {
  icon: string
  title: BilingualTextValue
  subtitle: BilingualTextValue
  onClick: () => void
}

function NavCard({ icon, title, subtitle, onClick }: NavCardProps) {
  return (
    <button
      className="w-full bg-warm-surface border border-warm-border rounded-warm-card shadow-warm-card p-md flex items-center gap-sm text-left cursor-pointer"
      onClick={onClick}
    >
      <span className="h-11 w-11 shrink-0 rounded-full bg-warm-peach/30 flex items-center justify-center text-warm-primary">
        <span className="material-symbols-outlined text-xl">{icon}</span>
      </span>
      <span className="flex-1 min-w-0">
        <BilingualText
          ko={title.ko}
          en={title.en}
          koClassName="font-label-bold text-body-lg text-warm-text text-pretty"
          enClassName="text-sm text-pretty"
        />
        <BilingualText
          className="mt-0.5"
          ko={subtitle.ko}
          en={subtitle.en}
          koClassName="font-body-md text-sm text-warm-text-muted text-pretty"
          enClassName="text-[11px] text-pretty"
        />
      </span>
      <span className="material-symbols-outlined text-xl text-warm-text-muted shrink-0">
        chevron_right
      </span>
    </button>
  )
}

function isSameMonth(iso: string, reference: Date): boolean {
  const date = new Date(iso)
  return date.getFullYear() === reference.getFullYear() && date.getMonth() === reference.getMonth()
}

function HomeScreen({ isLocked, onOpenQuest, onOpenDecode, onOpenNotes, onOpenMyPage }: HomeScreenProps) {
  const { lastPlayedDate } = loadStreak()
  const streak = getEffectiveStreak()
  const playedToday = lastPlayedDate === getTodayDateString()

  // "Today"'s session is progress-based (the first session not yet
  // completed), matching the previous path-style Home screen's logic —
  // unaffected by whether a session was already played today.
  const completedSessionIds = new Set(loadCompletedSessionIds())
  const firstIncompleteIndex = ALL_SESSIONS.findIndex(
    (session) => !completedSessionIds.has(session.id),
  )
  const todaySession = firstIncompleteIndex === -1 ? undefined : ALL_SESSIONS[firstIncompleteIndex]

  // Sessions are always completed in order via this same progress pointer,
  // so once something was played today, the one just finished is whichever
  // sits right before the pointer's current position — no separate
  // "which session was played today" log needed.
  const completedPointer = firstIncompleteIndex === -1 ? ALL_SESSIONS.length : firstIncompleteIndex
  const completedTodaySession = playedToday ? ALL_SESSIONS[completedPointer - 1] : undefined

  const notes = loadNotes()
  const noteCount = notes.length
  const now = new Date()
  const notesThisMonth = notes.filter((note) => isSameMonth(note.createdAt, now)).length

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

  return (
    <HomeLayout
      activeTab="today"
      streak={streak}
      userEmail={userEmail}
      onOpenMyPage={onOpenMyPage}
      onOpenHome={() => {}}
      onOpenDecode={onOpenDecode}
      onOpenNotes={onOpenNotes}
    >
      {/*
        Desktop splits into two independent-height columns via flex, not a
        shared grid — a grid row is sized by the tallest item sharing that
        row across both columns, so a tall QuestPreviewCard (e.g. once
        today's quest is completed) was stretching the row under StreakCard
        and leaving a gap before the cards below it. The sidebar wrapper
        collapses to `contents` on mobile so it doesn't affect the stacked
        (mobile) order, which stays Streak → Quest → NavCard → NavCard via
        the `order` values below.
      */}
      <div className="flex flex-col md:flex-row gap-md md:items-start">
        <div className="order-2 md:order-none md:flex-1 md:min-w-0">
          <QuestPreviewCard
            session={playedToday ? completedTodaySession : todaySession}
            completedToday={playedToday}
            isLocked={isLocked}
            onOpen={onOpenQuest}
            onOpenDecode={onOpenDecode}
          />
        </div>

        <div className="contents md:flex md:flex-col md:gap-md md:w-[320px] md:shrink-0">
          <div className="order-1">
            <StreakCard />
          </div>

          <div className="order-3">
            <NavCard
              icon="auto_awesome"
              title={homeStrings.decodeCard.title}
              subtitle={homeStrings.decodeCard.subtitle}
              onClick={onOpenDecode}
            />
          </div>

          <div className="order-4">
            <NavCard
              icon="bookmark_add"
              title={homeStrings.notesCard.title}
              subtitle={formatBilingual(homeStrings.notesCard.subtitle, {
                count: noteCount,
                monthCount: notesThisMonth,
              })}
              onClick={onOpenNotes}
            />
          </div>
        </div>
      </div>
    </HomeLayout>
  )
}

export default HomeScreen
