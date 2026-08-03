import type { QuestSession } from './questSessions'
import { getNotePhrase } from './notes'

interface QuestPreviewCardProps {
  session: QuestSession | undefined
  playedToday: boolean
  onOpen: (session: QuestSession) => void
}

function formatTodayLabel(): string {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date())
}

function QuestPreviewCard({ session, playedToday, onOpen }: QuestPreviewCardProps) {
  if (!session) {
    return (
      <div className="bg-warm-surface border border-warm-border rounded-warm-card shadow-warm-card p-md flex flex-col gap-sm items-center text-center py-lg">
        <span className="material-symbols-outlined text-warm-primary text-3xl">celebration</span>
        <p className="font-label-bold text-body-lg text-warm-text">
          모든 퀘스트를 완료했어요!
        </p>
        <p className="font-body-md text-body-md text-warm-text-muted">
          내일 새로운 퀘스트로 다시 만나요.
        </p>
      </div>
    )
  }

  const question = session.questions[0]
  const phrase = getNotePhrase(question)

  return (
    <div className="bg-warm-surface border border-warm-border rounded-warm-card shadow-warm-card overflow-hidden flex flex-col">
      <div className="p-md flex flex-col gap-sm">
        <p className="font-body-md text-sm text-warm-text-muted">{formatTodayLabel()}</p>

        <span className="w-fit bg-warm-badge-bg text-warm-badge-text font-label-bold text-label-bold px-md py-1 rounded-full">
          {question.situation}
        </span>

        {phrase && (
          <h2 className="font-warm-serif text-headline-md md:text-display-lg text-warm-text">
            "{phrase}"
          </h2>
        )}

        <p className="font-body-md text-body-md text-warm-text-muted">
          이 말, 진짜 무슨 뜻일까요?
        </p>
      </div>

      <button
        className="btn-warm-primary bg-warm-primary text-warm-on-primary font-label-bold text-label-bold py-sm px-md m-md mt-0 rounded-full flex items-center justify-center gap-2 cursor-pointer"
        onClick={() => onOpen(session)}
      >
        {playedToday ? '다음 퀘스트 풀어보기' : '풀어보기 · 1분'}
        <span className="material-symbols-outlined text-lg">arrow_forward</span>
      </button>
    </div>
  )
}

export default QuestPreviewCard
