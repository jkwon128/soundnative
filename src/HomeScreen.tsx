import { ALL_SESSIONS, type QuestSession } from './questSessions'
import type { QuizCategory } from './quizData'
import { getCurrentQuestionIndex, loadStreak } from './dailyQuest'
import './HomeScreen.css'

interface CategoryMeta {
  label: string
  icon: string
  color: string
}

const CATEGORY_META: Record<QuizCategory, CategoryMeta> = {
  errands: { label: '일상 심부름', icon: '🛒', color: '#1a73e8' },
  doctor: { label: '병원·관공서', icon: '🏥', color: '#d93025' },
  work: { label: '직장·회의', icon: '💼', color: '#8a3ffc' },
  smalltalk: { label: '스몰토크', icon: '💬', color: '#0f9d58' },
  school: { label: '학교', icon: '🎓', color: '#e8a01a' },
  rent: { label: '렌트·이웃', icon: '🏠', color: '#e81a6e' },
}

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
    <div className="home-screen">
      <div className="home-topbar">
        <div className="home-logo">SoundNative</div>
        <div className="home-topbar-stats">
          <span className="home-stat">🔥 {streak}</span>
          <span className="home-stat">💎 {STATIC_GEM_COUNT}</span>
        </div>
      </div>

      <div className="home-body">
        <div className="home-path">
          {ALL_SESSIONS.map((session, i) => {
            const meta = CATEGORY_META[session.category]
            const state: NodeState = i < todayIndex ? 'completed' : i === todayIndex ? 'today' : 'future'
            const clickable = state !== 'future'

            return (
              <div key={i} className="home-path-node-wrapper">
                <button
                  className={`home-path-node home-path-node-${state}`}
                  style={clickable ? { background: meta.color, borderColor: meta.color } : undefined}
                  onClick={() => clickable && onOpenQuest(session)}
                  disabled={!clickable}
                >
                  <span className="home-path-node-icon">{clickable ? meta.icon : '🔒'}</span>
                  {state === 'completed' && <span className="home-path-node-badge">✓</span>}
                </button>
                <div className="home-path-node-label">{meta.label}</div>
              </div>
            )
          })}
        </div>

        <div className="home-decode-card">
          <div className="home-decode-question">지금 무슨 말인지 모르겠나요?</div>
          <button className="home-decode-button" onClick={onOpenDecode}>
            Decode 열기
          </button>
        </div>
      </div>
    </div>
  )
}

export default HomeScreen
