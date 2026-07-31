import { useState } from 'react'
import type { VisitFrequency } from './types'
import OnboardingHeader from './OnboardingHeader'
import OnboardingOptionCard from './OnboardingOptionCard'
import PillButton from './PillButton'

const TOTAL_ONBOARDING_STEPS = 5
const CURRENT_STEP = 3

interface FrequencyOption {
  value: VisitFrequency
  title: string
  subtitle: string
  icon: string
}

const FREQUENCY_OPTIONS: FrequencyOption[] = [
  {
    value: 'daily',
    title: '매일 — 하루 3문제씩 꾸준히',
    subtitle: 'Daily — Consistent practice',
    icon: 'calendar_month',
  },
  {
    value: 'weekdays',
    title: '평일마다 — 주중엔 꼭 챙길게요',
    subtitle: 'Weekdays — Dedicated study days',
    icon: 'event_repeat',
  },
  {
    value: 'whenever',
    title: '생각날 때마다 — 부담 없이 갈게요',
    subtitle: 'Whenever I can — Casual learning',
    icon: 'bedtime',
  },
]

interface FrequencyScreenProps {
  onNext: (frequency: VisitFrequency) => void
}

function FrequencyScreen({ onNext }: FrequencyScreenProps) {
  const [selected, setSelected] = useState<VisitFrequency | null>(null)

  return (
    <div className="min-h-screen bg-warm-bg p-gutter md:p-lg flex flex-col items-center">
      <div className="w-full max-w-[640px] flex flex-col gap-md">
        <OnboardingHeader step={CURRENT_STEP} total={TOTAL_ONBOARDING_STEPS} />

        <div className="flex flex-col gap-1 mt-sm mb-sm">
          <h1 className="font-warm-serif text-headline-md text-warm-text">
            얼마나 자주 오실 생각이세요?
          </h1>
          <p className="font-body-md text-body-md text-warm-text-muted">
            How often do you plan to visit?
          </p>
        </div>

        <div className="flex flex-col gap-sm" role="radiogroup">
          {FREQUENCY_OPTIONS.map((option) => (
            <OnboardingOptionCard
              key={option.value}
              name="frequency"
              title={option.title}
              subtitle={option.subtitle}
              icon={option.icon}
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

export default FrequencyScreen
