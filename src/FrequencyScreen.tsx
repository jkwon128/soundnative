import { useState } from 'react'
import type { VisitFrequency } from './types'
import './FrequencyScreen.css'

const TOTAL_ONBOARDING_STEPS = 5
const CURRENT_STEP = 3

interface FrequencyOption {
  value: VisitFrequency
  label: string
}

const FREQUENCY_OPTIONS: FrequencyOption[] = [
  { value: 'daily', label: '매일 — 하루 3문제씩 꾸준히' },
  { value: 'weekdays', label: '평일마다 — 주중엔 꼭 챙길게요' },
  { value: 'whenever', label: '생각날 때마다 — 부담 없이 갈게요' },
]

interface FrequencyScreenProps {
  onNext: (frequency: VisitFrequency) => void
}

function FrequencyScreen({ onNext }: FrequencyScreenProps) {
  const [selected, setSelected] = useState<VisitFrequency | null>(null)

  return (
    <div className="frequency-screen">
      <div className="frequency-progress">
        Step {CURRENT_STEP} / {TOTAL_ONBOARDING_STEPS}
      </div>

      <h1 className="frequency-question">얼마나 자주 오실 생각이세요?</h1>

      <div className="frequency-options" role="radiogroup">
        {FREQUENCY_OPTIONS.map((option) => (
          <label key={option.value} className="frequency-option">
            <input
              type="radio"
              name="frequency"
              value={option.value}
              checked={selected === option.value}
              onChange={() => setSelected(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>

      <button
        className="frequency-next-button"
        disabled={selected === null}
        onClick={() => selected !== null && onNext(selected)}
      >
        다음
      </button>
    </div>
  )
}

export default FrequencyScreen
