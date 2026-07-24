import { useState } from 'react'
import type { LearningGoal } from './types'

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
    subtitle: 'Comfortable daily conversations',
  },
  {
    value: 'nativeConnection',
    title: '원어민과 자연스럽게 어울리고 싶어요',
    subtitle: 'Natural free talking & small talk',
  },
  {
    value: 'nativeLevel',
    title: '원어민과 비슷한 수준으로 이해하고 싶어요',
    subtitle: 'Catching all nuances and jokes',
  },
]

interface GoalScreenProps {
  onNext: (goal: LearningGoal) => void
}

function GoalScreen({ onNext }: GoalScreenProps) {
  const [selected, setSelected] = useState<LearningGoal | null>(null)

  return (
    <div className="min-h-screen bg-surface p-gutter md:p-lg flex flex-col items-center">
      <div className="w-full max-w-[640px] flex flex-col gap-md">
        <div className="flex items-center justify-center relative">
          <button className="absolute left-0 text-on-surface-variant cursor-pointer">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <span className="font-label-bold text-label-bold text-on-surface-variant">
            Step {CURRENT_STEP} of {TOTAL_ONBOARDING_STEPS}
          </span>
        </div>

        <div className="h-2 w-full rounded-full bg-surface-container-high overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary-fixed-dim"
            style={{ width: `${(CURRENT_STEP / TOTAL_ONBOARDING_STEPS) * 100}%` }}
          />
        </div>

        <div className="text-center flex flex-col gap-1 mt-sm mb-sm">
          <h1 className="font-headline-md text-headline-md text-on-surface">
            이 앱을 통해 어떤 모습이 되고 싶으세요?
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            What is your main goal?
          </p>
        </div>

        <div className="flex flex-col gap-sm" role="radiogroup">
          {GOAL_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`flex items-center justify-between gap-md bg-surface-container-lowest border rounded-xl px-md py-sm cursor-pointer transition-colors ${
                selected === option.value
                  ? 'border-primary'
                  : 'border-outline-variant hover:border-primary'
              }`}
            >
              <div className="flex items-center gap-sm">
                <input
                  type="radio"
                  name="goal"
                  className="h-5 w-5 accent-primary"
                  checked={selected === option.value}
                  onChange={() => setSelected(option.value)}
                />
                <div className="flex flex-col">
                  <span className="font-label-bold text-body-lg text-on-surface">
                    {option.title}
                  </span>
                  <span className="font-body-md text-sm text-on-surface-variant">
                    {option.subtitle}
                  </span>
                </div>
              </div>
            </label>
          ))}
        </div>

        <button
          className="btn-primary w-full bg-primary text-on-primary font-label-bold text-label-bold py-sm px-md rounded-lg flex items-center justify-center gap-2 cursor-pointer disabled:bg-surface-container-high disabled:text-on-surface-variant disabled:border-none disabled:cursor-default"
          disabled={selected === null}
          onClick={() => selected !== null && onNext(selected)}
        >
          다음
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
      </div>
    </div>
  )
}

export default GoalScreen
