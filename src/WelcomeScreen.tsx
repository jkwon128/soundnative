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

          <div className="w-full max-w-[420px] aspect-video rounded-xl bg-gradient-to-br from-primary via-primary-container to-secondary-fixed-dim relative overflow-hidden my-sm shadow-lg">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.28),transparent_65%)]" />

            <span className="material-symbols-outlined absolute top-5 left-7 text-on-primary/25 text-xl">
              translate
            </span>
            <span className="material-symbols-outlined absolute top-6 right-8 text-on-primary/20 text-lg">
              chat_bubble
            </span>
            <span className="material-symbols-outlined absolute bottom-6 right-8 text-on-primary/20 text-lg">
              language
            </span>
            <span className="material-symbols-outlined absolute top-1/2 left-5 -translate-y-1/2 text-on-primary/15 text-base">
              emoji_objects
            </span>

            <div className="relative h-full flex flex-col items-center justify-center gap-4">
              <div className="flex items-center gap-4">
                <span className="h-14 w-14 rounded-full bg-white/15 ring-1 ring-white/25 backdrop-blur-sm flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-3xl text-on-primary">
                    record_voice_over
                  </span>
                </span>
                <span className="material-symbols-outlined text-2xl text-on-primary/60">
                  arrow_forward
                </span>
                <span className="h-14 w-14 rounded-full bg-white/15 ring-1 ring-white/25 backdrop-blur-sm flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-3xl text-on-primary">
                    psychology
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                <span className="material-symbols-outlined text-on-primary text-sm">
                  volume_up
                </span>
                <span className="font-label-bold text-on-primary text-xs">SoundNative</span>
              </div>
            </div>
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
