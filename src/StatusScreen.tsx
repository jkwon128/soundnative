import { useState } from 'react'
import type { UserStatus } from './types'
import './StatusScreen.css'

const TOTAL_ONBOARDING_STEPS = 6
const CURRENT_STEP = 1

interface StatusOption {
  value: UserStatus
  label: string
}

const STATUS_OPTIONS: StatusOption[] = [
  { value: 'student', label: '유학생 (학교·과제·교수님 영어가 필요해요)' },
  { value: 'workingHoliday', label: '워킹홀리데이 / 어학연수' },
  { value: 'immigrant', label: '이민자 / 영주권자 (일상·병원·관공서 영어가 필요해요)' },
  { value: 'expatWorker', label: '주재원 / 해외 취업 (직장·회의 영어가 필요해요)' },
  { value: 'preparing', label: '아직 준비 중 (곧 떠날 예정이에요)' },
]

interface StatusScreenProps {
  onNext: (status: UserStatus) => void
}

function StatusScreen({ onNext }: StatusScreenProps) {
  const [selected, setSelected] = useState<UserStatus | null>(null)

  return (
    <div className="status-screen">
      <div className="status-progress">
        Step {CURRENT_STEP} / {TOTAL_ONBOARDING_STEPS}
      </div>

      <h1 className="status-question">지금 영어권에서 어떤 상황이신가요?</h1>

      <div className="status-options" role="radiogroup">
        {STATUS_OPTIONS.map((option) => (
          <label key={option.value} className="status-option">
            <input
              type="radio"
              name="status"
              value={option.value}
              checked={selected === option.value}
              onChange={() => setSelected(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>

      <button
        className="status-next-button"
        disabled={selected === null}
        onClick={() => selected !== null && onNext(selected)}
      >
        다음
      </button>
    </div>
  )
}

export default StatusScreen
