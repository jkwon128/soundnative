import { useState } from 'react'
import type { EnglishLevel } from './types'

const TOTAL_ONBOARDING_STEPS = 5
const CURRENT_STEP = 2

interface LevelOption {
  value: EnglishLevel
  icon: string
  title: string
  subtitle: string
}

const LEVEL_OPTIONS: LevelOption[] = [
  {
    value: 'new',
    icon: 'sentiment_dissatisfied',
    title: '아직 낯설어요',
    subtitle: '천천히 말해줘도 무슨 뜻인지 헷갈려요 (New to this - still confusing even if spoken slowly)',
  },
  {
    value: 'basicUnderstanding',
    icon: 'sentiment_neutral',
    title: '대충은 알아들어요',
    subtitle: '근데 속뜻이나 뉘앙스는 자주 놓쳐요 (Understand roughly - but miss nuances often)',
  },
  {
    value: 'mostlyFluent',
    icon: 'sentiment_satisfied',
    title: '거의 다 알아들어요',
    subtitle: '가끔 애매한 표현에서만 막혀요 (Understand almost everything - only stuck on ambiguous phrases)',
  },
]

interface LevelScreenProps {
  onNext: (level: EnglishLevel) => void
}

function LevelScreen({ onNext }: LevelScreenProps) {
  const [selected, setSelected] = useState<EnglishLevel | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface to-secondary-fixed/20 flex items-center justify-center p-gutter md:p-lg">
      <div className="w-full max-w-[560px] bg-surface-container-lowest border border-outline-variant rounded-xl p-md md:p-lg flex flex-col gap-md shadow">
        <div className="flex items-center justify-between">
          <button className="h-9 w-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface cursor-pointer">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <span className="font-label-bold text-label-bold text-on-surface-variant tracking-wide">
            STEP {CURRENT_STEP} OF {TOTAL_ONBOARDING_STEPS}
          </span>
        </div>

        <div className="h-2 w-full rounded-full bg-surface-container-high overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-secondary-fixed-dim to-primary"
            style={{ width: `${(CURRENT_STEP / TOTAL_ONBOARDING_STEPS) * 100}%` }}
          />
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="font-headline-md text-headline-md text-on-surface">
            원어민이 하는 말, 얼마나 알아들으시나요?
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            How much do you understand native speakers?
          </p>
        </div>

        <div className="flex flex-col gap-sm" role="radiogroup">
          {LEVEL_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`flex items-start gap-sm border rounded-xl px-md py-sm cursor-pointer transition-colors ${
                selected === option.value
                  ? 'border-primary bg-primary-container/5'
                  : 'border-outline-variant hover:border-primary'
              }`}
            >
              <input
                type="radio"
                name="level"
                className="sr-only"
                checked={selected === option.value}
                onChange={() => setSelected(option.value)}
              />
              <span className="h-10 w-10 shrink-0 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
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
          className="btn-primary w-full bg-primary text-on-primary font-label-bold text-label-bold py-sm px-md rounded-lg flex items-center justify-center gap-2 cursor-pointer disabled:bg-outline-variant disabled:border-outline-variant disabled:cursor-default"
          disabled={selected === null}
          onClick={() => selected !== null && onNext(selected)}
        >
          Continue
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
      </div>
    </div>
  )
}

export default LevelScreen
