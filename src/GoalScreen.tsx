import { useState } from 'react'
import type { LearningGoal } from './types'
import './GoalScreen.css'

const TOTAL_ONBOARDING_STEPS = 5
const CURRENT_STEP = 4

interface GoalOption {
  value: LearningGoal
  title: string
  subtitle: string
}

const GOAL_OPTIONS: GoalOption[] = [
  {
    value: 'dailyLifeConfidence',
    title: '일상생활에서 더는 당황하지 않고 싶어요',
    subtitle: '마트·병원·이웃과의 대화가 편해지길',
  },
  {
    value: 'nativeConnection',
    title: '원어민과 자연스럽게 어울리고 싶어요',
    subtitle: '프리토킹, 스몰토크가 어색하지 않길',
  },
  {
    value: 'nativeLevel',
    title: '원어민과 비슷한 수준으로 이해하고 싶어요',
    subtitle: '뉘앙스·농담까지 다 캐치하길',
  },
]

interface GoalScreenProps {
  onNext: (goal: LearningGoal) => void
}

function GoalScreen({ onNext }: GoalScreenProps) {
  const [selected, setSelected] = useState<LearningGoal | null>(null)

  return (
    <div className="goal-screen">
      <div className="goal-progress">
        Step {CURRENT_STEP} / {TOTAL_ONBOARDING_STEPS}
      </div>

      <h1 className="goal-question">이 앱을 통해 어떤 모습이 되고 싶으세요?</h1>

      <div className="goal-options" role="radiogroup">
        {GOAL_OPTIONS.map((option) => (
          <label key={option.value} className="goal-option">
            <input
              type="radio"
              name="goal"
              value={option.value}
              checked={selected === option.value}
              onChange={() => setSelected(option.value)}
            />
            <span className="goal-option-text">
              <span className="goal-option-title">{option.title}</span>
              <span className="goal-option-subtitle">{option.subtitle}</span>
            </span>
          </label>
        ))}
      </div>

      <button
        className="goal-next-button"
        disabled={selected === null}
        onClick={() => selected !== null && onNext(selected)}
      >
        다음
      </button>
    </div>
  )
}

export default GoalScreen
