import { useEffect, useState } from 'react'
import type { EnglishLevel } from './types'
import './LevelScreen.css'

const TOTAL_ONBOARDING_STEPS = 6
const CURRENT_STEP = 2
const AUTO_ADVANCE_DELAY_MS = 300

interface LevelOption {
  value: EnglishLevel
  label: string
}

const LEVEL_OPTIONS: LevelOption[] = [
  { value: 'new', label: '아직 낯설어요 — 천천히 말해줘도 무슨 뜻인지 헷갈려요' },
  { value: 'basicUnderstanding', label: '대충은 알아들어요 — 근데 속뜻이나 뉘앙스는 자주 놓쳐요' },
  { value: 'mostlyFluent', label: '거의 다 알아들어요 — 가끔 애매한 표현에서만 막혀요' },
]

interface LevelScreenProps {
  onNext: (level: EnglishLevel) => void
}

function LevelScreen({ onNext }: LevelScreenProps) {
  const [selected, setSelected] = useState<EnglishLevel | null>(null)

  useEffect(() => {
    if (selected === null) return
    const timer = setTimeout(() => onNext(selected), AUTO_ADVANCE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [selected, onNext])

  return (
    <div className="level-screen">
      <div className="level-progress">
        Step {CURRENT_STEP} / {TOTAL_ONBOARDING_STEPS}
      </div>

      <h1 className="level-question">원어민이 하는 말, 얼마나 알아들으시나요?</h1>

      <div className="level-options" role="radiogroup">
        {LEVEL_OPTIONS.map((option) => (
          <label key={option.value} className="level-option">
            <input
              type="radio"
              name="level"
              value={option.value}
              checked={selected === option.value}
              onChange={() => setSelected(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  )
}

export default LevelScreen
