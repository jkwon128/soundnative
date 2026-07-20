import { useState } from 'react'
import './App.css'
import './OnboardingScreen.css'
import type { QuizCategory } from './quizData'
import {
  SITUATION_CHIPS,
  saveOnboardingLevel,
  saveOnboardingSituations,
  type OnboardingLevel,
} from './situations'

interface OnboardingScreenProps {
  onComplete: () => void
}

const LEVELS: { value: OnboardingLevel; label: string }[] = [
  { value: 'gettingBy', label: 'Getting by' },
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'fluentIsh', label: 'Fluent-ish' },
]

function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [level, setLevel] = useState<OnboardingLevel | null>(null)
  const [situations, setSituations] = useState<QuizCategory[]>([])

  const toggleSituation = (category: QuizCategory) => {
    setSituations((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const handleStart = () => {
    if (level) saveOnboardingLevel(level)
    saveOnboardingSituations(situations)
    onComplete()
  }

  return (
    <div className="app">
      <div className="logo">SoundNative</div>
      <h1 className="headline">시작하기 전에</h1>

      <div className="onboarding-section">
        <div className="onboarding-section-title">지금 영어, 어느 정도인가요?</div>
        <div className="onboarding-level-list">
          {LEVELS.map((item) => (
            <button
              key={item.value}
              className={`onboarding-level-button ${level === item.value ? 'selected' : ''}`.trim()}
              onClick={() => setLevel(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="onboarding-section">
        <div className="onboarding-section-title">어떤 상황에서 영어를 자주 쓰시나요?</div>
        <div className="onboarding-chip-list">
          {SITUATION_CHIPS.map((chip) => (
            <button
              key={chip.category}
              className={`onboarding-chip ${situations.includes(chip.category) ? 'selected' : ''}`.trim()}
              onClick={() => toggleSituation(chip.category)}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
      <div className="onboarding-hint">복수 선택 가능 · 선택하지 않으면 전체 문제에서 출제돼요</div>

      <button className="continue-button" onClick={handleStart}>
        시작하기
      </button>
    </div>
  )
}

export default OnboardingScreen
