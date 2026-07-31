import Logo from './Logo'

interface WelcomeScreenProps {
  onStart: () => void
}

function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-gutter md:p-lg bg-warm-bg">
      <div className="w-full max-w-[560px] bg-warm-surface border border-warm-border rounded-warm-card p-md md:p-lg relative overflow-hidden shadow-warm-card">
        <span className="material-symbols-outlined absolute top-md left-md text-warm-primary text-2xl">
          graphic_eq
        </span>

        <div className="flex flex-col items-center text-center gap-sm pt-lg">
          <div className="flex items-center gap-2 text-warm-primary font-label-bold text-lg font-bold">
            <Logo className="h-7 w-7" />
            SoundNative
          </div>

          <h1 className="font-warm-serif text-display-lg text-warm-text max-w-[420px]">
            Sound like a <em className="text-warm-primary not-italic">native</em>, understand the
            real meaning.
          </h1>

          <p className="font-body-md text-body-md text-warm-text-muted max-w-[420px]">
            영어는 하는데, 원어민이 하는 말의 속뜻과 톤이 안 잡히시나요? 하루 1분으로 그 감각을
            만드세요.
          </p>

          <div className="w-full max-w-[420px] aspect-video rounded-warm-lg bg-gradient-to-br from-warm-primary via-warm-primary to-warm-peach relative overflow-hidden my-sm shadow-warm-card">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.28),transparent_65%)]" />

            <span className="material-symbols-outlined absolute top-5 left-7 text-warm-on-primary/25 text-xl">
              translate
            </span>
            <span className="material-symbols-outlined absolute top-6 right-8 text-warm-on-primary/20 text-lg">
              chat_bubble
            </span>
            <span className="material-symbols-outlined absolute bottom-6 right-8 text-warm-on-primary/20 text-lg">
              language
            </span>
            <span className="material-symbols-outlined absolute top-1/2 left-5 -translate-y-1/2 text-warm-on-primary/15 text-base">
              emoji_objects
            </span>

            <div className="relative h-full flex flex-col items-center justify-center gap-4">
              <div className="flex items-center gap-4">
                <span className="h-14 w-14 rounded-full bg-white/15 ring-1 ring-white/25 backdrop-blur-sm flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-3xl text-warm-on-primary">
                    record_voice_over
                  </span>
                </span>
                <span className="material-symbols-outlined text-2xl text-warm-on-primary/60">
                  arrow_forward
                </span>
                <span className="h-14 w-14 rounded-full bg-white/15 ring-1 ring-white/25 backdrop-blur-sm flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-3xl text-warm-on-primary">
                    psychology
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                <Logo className="h-5 w-5" />
                <span className="font-label-bold text-warm-on-primary text-xs">SoundNative</span>
              </div>
            </div>
          </div>

          <button
            className="btn-warm-primary w-full max-w-[320px] bg-warm-primary text-warm-on-primary font-label-bold text-label-bold py-sm px-md rounded-full flex items-center justify-center gap-2 cursor-pointer"
            onClick={onStart}
          >
            시작하기 (Start)
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>

          <p className="font-body-md text-sm text-warm-text-muted">
            No account required to explore.
          </p>
        </div>

        <span className="material-symbols-outlined absolute bottom-md right-md text-warm-border text-2xl">
          translate
        </span>
      </div>
    </div>
  )
}

export default WelcomeScreen
