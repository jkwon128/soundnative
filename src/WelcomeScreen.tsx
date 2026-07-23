import './WelcomeScreen.css'

interface WelcomeScreenProps {
  onStart: () => void
}

function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="welcome-screen">
      <div className="welcome-logo">SoundNative</div>
      <h1 className="welcome-headline">Sound like a native.</h1>
      <p className="welcome-subtitle">원어민이 진짜로 하는 말의 속뜻을 배워보세요.</p>
      <button className="welcome-start-button" onClick={onStart}>
        시작하기
      </button>
    </div>
  )
}

export default WelcomeScreen
