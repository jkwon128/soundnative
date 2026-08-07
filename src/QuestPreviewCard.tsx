import type { QuestSession } from './questSessions'
import { getNotePhrase } from './notes'

interface QuestPreviewCardProps {
  // Not-completed: the next session to play. Completed-today: the session
  // that was just played (see HomeScreen's completedTodaySession) — the two
  // never both apply, HomeScreen picks the right one to pass in.
  session: QuestSession | undefined
  completedToday: boolean
  onOpen: (session: QuestSession) => void
  onOpenDecode: () => void
}

function formatTodayLabel(): string {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date())
}

function QuestPreviewCard({ session, completedToday, onOpen, onOpenDecode }: QuestPreviewCardProps) {
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
          {completedToday ? '오늘의 한 문장을 풀었어요.' : '이 말, 진짜 무슨 뜻일까요?'}
        </p>
      </div>

      {completedToday ? (
        <div className="m-md mt-0 bg-warm-success-bg border border-warm-success-border rounded-warm-lg p-md flex flex-col gap-sm">
          <p className="flex items-center gap-1 font-label-bold text-label-bold text-warm-success-text">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            오늘의 퀘스트 완료!
          </p>
          <p className="font-body-md text-sm text-warm-text">
            내일 새로운 문장이 도착해요. 지금 곤란한 표현이 있다면 Decode에 넣어보세요.
          </p>
          <button
            className="w-full bg-warm-surface text-warm-text font-label-bold text-label-bold py-sm px-md rounded-full flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            onClick={onOpenDecode}
          >
            <span className="material-symbols-outlined text-lg">auto_awesome</span>
            Decode 열기
          </button>
        </div>
      ) : (
        <button
          className="btn-warm-primary bg-warm-primary text-warm-on-primary font-label-bold text-label-bold py-sm px-md m-md mt-0 rounded-full flex items-center justify-center gap-2 cursor-pointer"
          onClick={() => onOpen(session)}
        >
          풀어보기 · 1분
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
      )}
    </div>
  )
}

export default QuestPreviewCard
