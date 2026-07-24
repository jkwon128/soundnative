import { useState } from 'react'
import './AuthScreen.css'

const TOTAL_ONBOARDING_STEPS = 5
const CURRENT_STEP = 5

interface AuthScreenProps {
  // Dummy navigation only — no real signup/login/API/DB logic here.
  onContinue: () => void
}

function AuthScreen({ onContinue }: AuthScreenProps) {
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className="auth-screen">
      <div className="auth-progress">
        Step {CURRENT_STEP} / {TOTAL_ONBOARDING_STEPS}
      </div>

      <h1 className="auth-headline">거의 다 왔어요!</h1>
      <p className="auth-subtitle">지금까지의 진행 상황을 저장하려면 가입해주세요.</p>

      {!showEmailForm && (
        <div className="auth-options">
          <button className="auth-provider-button" onClick={() => setShowEmailForm(true)}>
            이메일로 계속하기
          </button>
          <button className="auth-provider-button" onClick={onContinue}>
            Google로 계속하기
          </button>
          <button className="auth-provider-button" onClick={onContinue}>
            Apple로 계속하기
          </button>
        </div>
      )}

      {showEmailForm && (
        <form
          className="auth-email-form"
          onSubmit={(e) => {
            e.preventDefault()
            onContinue()
          }}
        >
          <input
            className="auth-email-input"
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="auth-email-input"
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="auth-signup-button" type="submit">
            가입하기
          </button>
        </form>
      )}

      <button className="auth-skip-button" onClick={onContinue}>
        나중에 하기
      </button>
    </div>
  )
}

export default AuthScreen
