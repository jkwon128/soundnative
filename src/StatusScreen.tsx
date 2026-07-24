import { useState } from 'react'
import type { UserStatus } from './types'

const TOTAL_ONBOARDING_STEPS = 5
const CURRENT_STEP = 1

interface StatusOption {
  value: UserStatus
  title: string
  subtitle: string
  icon: string
  iconColor: string
}

const STATUS_OPTIONS: StatusOption[] = [
  {
    value: 'student',
    title: '유학생',
    subtitle: 'School work, assignments, and talking with professors',
    icon: 'school',
    iconColor: 'text-primary',
  },
  {
    value: 'workingHoliday',
    title: '워킹홀리데이 / 어학연수',
    subtitle: 'Working Holiday / Language Study',
    icon: 'flight',
    iconColor: 'text-secondary',
  },
  {
    value: 'immigrant',
    title: '이민자 / 영주권자',
    subtitle: 'Everyday life, hospital visits, and government offices',
    icon: 'home',
    iconColor: 'text-primary',
  },
  {
    value: 'expatWorker',
    title: '주재원 / 해외 취업',
    subtitle: 'Workplace / Meetings',
    icon: 'work',
    iconColor: 'text-secondary',
  },
  {
    value: 'preparing',
    title: '아직 준비 중',
    subtitle: 'Preparing to leave',
    icon: 'calendar_month',
    iconColor: 'text-primary',
  },
]

interface StatusScreenProps {
  onNext: (status: UserStatus) => void
}

function StatusScreen({ onNext }: StatusScreenProps) {
  const [selected, setSelected] = useState<UserStatus | null>(null)

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
            지금 영어권에서 어떤 상황이신가요?
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            What is your current situation?
          </p>
        </div>

        <div className="flex flex-col gap-sm" role="radiogroup">
          {STATUS_OPTIONS.map((option) => (
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
                  name="status"
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
              <span className={`material-symbols-outlined text-2xl ${option.iconColor}`}>
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

export default StatusScreen
