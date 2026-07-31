import { useState } from 'react'
import type { EnglishLevel } from './types'
import OnboardingHeader from './OnboardingHeader'
import OnboardingOptionCard from './OnboardingOptionCard'
import PillButton from './PillButton'

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
    <div className="min-h-screen bg-warm-bg p-gutter md:p-lg flex flex-col items-center">
      <div className="w-full max-w-[640px] flex flex-col gap-md">
        <OnboardingHeader step={CURRENT_STEP} total={TOTAL_ONBOARDING_STEPS} />

        <div className="flex flex-col gap-1 mt-sm mb-sm">
          <h1 className="font-warm-serif text-headline-md text-warm-text">
            원어민이 하는 말, 얼마나 알아들으시나요?
          </h1>
          <p className="font-body-md text-body-md text-warm-text-muted">
            How much do you understand native speakers?
          </p>
        </div>

        <div className="flex flex-col gap-sm" role="radiogroup">
          {LEVEL_OPTIONS.map((option) => (
            <OnboardingOptionCard
              key={option.value}
              name="level"
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

export default LevelScreen
