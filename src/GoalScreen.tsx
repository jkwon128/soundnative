import { useState } from 'react'
import type { LearningGoal } from './types'
import OnboardingHeader from './OnboardingHeader'
import OnboardingOptionCard from './OnboardingOptionCard'
import PillButton from './PillButton'

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
    <div className="min-h-screen bg-warm-bg p-gutter md:p-lg flex flex-col items-center">
      <div className="w-full max-w-[640px] flex flex-col gap-md">
        <OnboardingHeader step={CURRENT_STEP} total={TOTAL_ONBOARDING_STEPS} />

        <div className="flex flex-col gap-1 mt-sm mb-sm">
          <h1 className="font-warm-serif text-headline-md text-warm-text">
            이 앱을 통해 어떤 모습이 되고 싶으세요?
          </h1>
          <p className="font-body-md text-body-md text-warm-text-muted">
            What is your main goal?
          </p>
        </div>

        <div className="flex flex-col gap-sm" role="radiogroup">
          {GOAL_OPTIONS.map((option) => (
            <OnboardingOptionCard
              key={option.value}
              name="goal"
              title={option.title}
              subtitle={option.subtitle}
              selected={selected === option.value}
              onSelect={() => setSelected(option.value)}
            />
          ))}
        </div>

        <PillButton disabled={selected === null} onClick={() => selected !== null && onNext(selected)}>
          다음
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </PillButton>
      </div>
    </div>
  )
}

export default GoalScreen
