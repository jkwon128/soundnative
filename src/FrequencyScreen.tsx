import { useState } from 'react'
import type { VisitFrequency } from './types'

const TOTAL_ONBOARDING_STEPS = 5
const CURRENT_STEP = 3

interface FrequencyOption {
  value: VisitFrequency
  icon: string
  title: string
  subtitle: string
}

const FREQUENCY_OPTIONS: FrequencyOption[] = [
  {
    value: 'daily',
    icon: 'calendar_month',
    title: '매일 — 하루 3문제씩 꾸준히',
    subtitle: 'Daily — Consistent practice',
  },
  {
    value: 'weekdays',
    icon: 'event_repeat',
    title: '평일마다 — 주중엔 꼭 챙길게요',
    subtitle: 'Weekdays — Dedicated study days',
  },
  {
    value: 'whenever',
    icon: 'bedtime',
    title: '생각날 때마다 — 부담 없이 갈게요',
    subtitle: 'Whenever I can — Casual learning',
  },
]

interface FrequencyScreenProps {
  onNext: (frequency: VisitFrequency) => void
}

function FrequencyScreen({ onNext }: FrequencyScreenProps) {
  const [selected, setSelected] = useState<VisitFrequency | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface to-secondary-fixed/20 p-gutter md:p-lg flex flex-col items-center">
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
            className="h-full rounded-full bg-gradient-to-r from-secondary-fixed-dim to-primary"
            style={{ width: `${(CURRENT_STEP / TOTAL_ONBOARDING_STEPS) * 100}%` }}
          />
        </div>

        <div className="text-center flex flex-col gap-1 mt-sm mb-sm">
          <h1 className="font-headline-md text-headline-md text-on-surface">
            얼마나 자주 오실 생각이세요?
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            How often do you plan to visit?
          </p>
        </div>

        <div className="flex flex-col gap-sm" role="radiogroup">
          {FREQUENCY_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`flex items-center gap-sm bg-surface-container-lowest border rounded-xl px-md py-sm cursor-pointer transition-colors ${
                selected === option.value
                  ? 'border-primary'
                  : 'border-outline-variant hover:border-primary'
              }`}
            >
              <input
                type="radio"
                name="frequency"
                className="sr-only"
                checked={selected === option.value}
                onChange={() => setSelected(option.value)}
              />
              <span className="h-10 w-10 shrink-0 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-2xl">{option.icon}</span>
              </span>
              <div className="flex flex-col">
                <span className="font-label-bold text-body-lg text-on-surface">
                  {option.title}
                </span>
                <span className="font-body-md text-sm text-on-surface-variant">
                  {option.subtitle}
                </span>
              </div>
            </label>
          ))}
        </div>

        <button
          className="btn-primary w-full bg-primary text-on-primary font-label-bold text-label-bold py-sm px-md rounded-lg flex items-center justify-center gap-2 cursor-pointer disabled:bg-surface-container-high disabled:text-on-surface-variant disabled:border-none disabled:cursor-default"
          disabled={selected === null}
          onClick={() => selected !== null && onNext(selected)}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default FrequencyScreen
