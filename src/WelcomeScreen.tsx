interface WelcomeScreenProps {
  onStart: () => void
}

function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-gutter md:p-lg bg-gradient-to-br from-surface to-surface-container-high">
      <div className="w-full max-w-[560px] bg-surface-container-lowest border border-outline-variant rounded-xl p-md md:p-lg relative overflow-hidden shadow">
        <span className="material-symbols-outlined absolute top-md left-md text-secondary-fixed-dim text-2xl">
          graphic_eq
        </span>

        <div className="flex flex-col items-center text-center gap-sm pt-lg">
          <div className="flex items-center gap-2 text-primary font-label-bold text-label-bold">
            <span className="material-symbols-outlined text-2xl">volume_up</span>
            SoundNative
          </div>

          <h1 className="font-display-lg text-display-lg text-on-surface max-w-[420px]">
            Sound like a native, understand the real meaning.
          </h1>

          <p className="font-korean-support text-korean-support text-on-surface-variant">
            원어민처럼 소리 내고, 진짜 의미를 이해하세요.
          </p>

          <p className="font-body-md text-body-md text-on-surface-variant max-w-[420px]">
            Master the pragmatic meanings of native speakers. Go beyond literal translations and
            grasp the cultural nuance, emotion, and rhythm of real conversations.
          </p>

          <div className="w-full max-w-[420px] aspect-video rounded-xl bg-gradient-to-br from-primary-container to-secondary-fixed-dim flex items-center justify-center my-sm">
            <span className="material-symbols-outlined text-6xl text-on-primary/80">forum</span>
          </div>

          <button
            className="btn-primary w-full max-w-[320px] bg-primary text-on-primary font-label-bold text-label-bold py-sm px-md rounded-full flex items-center justify-center gap-2 cursor-pointer"
            onClick={onStart}
          >
            시작하기 (Start)
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>

          <p className="font-body-md text-sm text-on-surface-variant">
            No account required to explore.
          </p>
        </div>

        <span className="material-symbols-outlined absolute bottom-md right-md text-outline-variant text-2xl">
          translate
        </span>
      </div>
    </div>
  )
}

export default WelcomeScreen
