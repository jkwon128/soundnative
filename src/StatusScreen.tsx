import { useState } from 'react'
import type { UserStatus } from './types'
import OnboardingHeader from './OnboardingHeader'
import OnboardingOptionCard from './OnboardingOptionCard'
import PillButton from './PillButton'

const TOTAL_ONBOARDING_STEPS = 5
const CURRENT_STEP = 1

interface StatusOption {
  value: UserStatus
  title: string
  subtitle: string
  icon: string
}

const STATUS_OPTIONS: StatusOption[] = [
  {
    value: 'student',
    title: '유학생',
    subtitle: 'School work, assignments, and talking with professors',
    icon: 'school',
  },
  {
    value: 'workingHoliday',
    title: '워킹홀리데이 / 어학연수',
    subtitle: 'Working Holiday / Language Study',
    icon: 'flight',
  },
  {
    value: 'immigrant',
    title: '이민자 / 영주권자',
    subtitle: 'Everyday life, hospital visits, and government offices',
    icon: 'home',
  },
  {
    value: 'expatWorker',
    title: '주재원 / 해외 취업',
    subtitle: 'Workplace / Meetings',
    icon: 'work',
  },
  {
    value: 'preparing',
    title: '아직 준비 중',
    subtitle: 'Preparing to leave',
    icon: 'calendar_month',
  },
]

interface StatusScreenProps {
  initialValue: UserStatus | null
  onNext: (status: UserStatus) => void
  onBack: () => void
}

function StatusScreen({ initialValue, onNext, onBack }: StatusScreenProps) {
  const [selected, setSelected] = useState<UserStatus | null>(initialValue)

  return (
    <div className="min-h-screen bg-warm-bg p-gutter md:p-lg flex flex-col items-center">
      <div className="w-full max-w-[640px] flex flex-col gap-md">
        <OnboardingHeader step={CURRENT_STEP} total={TOTAL_ONBOARDING_STEPS} onBack={onBack} />

        <div className="flex flex-col gap-1 mt-sm mb-sm">
          <h1 className="font-warm-serif text-headline-md text-warm-text">
            지금 영어권에서 어떤 상황이신가요?
          </h1>
          <p className="font-body-md text-body-md text-warm-text-muted">
            What is your current situation?
          </p>
        </div>

        <div className="flex flex-col gap-sm" role="radiogroup">
          {STATUS_OPTIONS.map((option) => (
            <OnboardingOptionCard
              key={option.value}
              name="status"
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

export default StatusScreen
