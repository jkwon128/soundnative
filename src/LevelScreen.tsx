import { useState } from 'react'
import type { EnglishLevel } from './types'

const TOTAL_ONBOARDING_STEPS = 5
const CURRENT_STEP = 2

interface LevelOption {
  value: EnglishLevel
  title: string
  subtitle: string
  icon: string
}

const LEVEL_OPTIONS: LevelOption[] = [
  {
    value: 'new',
    title: '아직 낯설어요',
    subtitle: '천천히 말해줘도 무슨 뜻인지 헷갈려요 (New to this - still confusing even if spoken slowly)',
    icon: 'sentiment_dissatisfied',
  },
  {
    value: 'basicUnderstanding',
    title: '대충은 알아들어요',
    subtitle: '근데 속뜻이나 뉘앙스는 자주 놓쳐요 (Understand roughly - but miss nuances often)',
    icon: 'sentiment_neutral',
  },
  {
    value: 'mostlyFluent',
    title: '거의 다 알아들어요',
    subtitle: '가끔 애매한 표현에서만 막혀요 (Understand almost everything - only stuck on ambiguous phrases)',
    icon: 'sentiment_satisfied',
  },
]

interface LevelScreenProps {
  onNext: (level: EnglishLevel) => void
}

function LevelScreen({ onNext }: LevelScreenProps) {
  const [selected, setSelected] = useState<EnglishLevel | null>(null)

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
              className={`flex items-center justify-between gap-md bg-surface-container-lowest border rounded-xl px-md py-sm cursor-pointer transition-colors ${
                selected === option.value
                  ? 'border-primary'
                  : 'border-outline-variant hover:border-primary'
              }`}
            >
              <div className="flex items-center gap-sm">
                <input
                  type="radio"
                  name="level"
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

export default LevelScreen
