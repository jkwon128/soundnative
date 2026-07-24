import { useState } from 'react'
import type { VisitFrequency } from './types'

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
              className={`flex items-center justify-between gap-md bg-surface-container-lowest border rounded-xl px-md py-sm cursor-pointer transition-colors ${
                selected === option.value
                  ? 'border-primary'
                  : 'border-outline-variant hover:border-primary'
              }`}
            >
              <div className="flex items-center gap-sm">
                <input
                  type="radio"
                  name="frequency"
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
              <span className="material-symbols-outlined text-2xl text-primary">
                {option.icon}
              </span>
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

export default FrequencyScreen
