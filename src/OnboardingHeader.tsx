import Logo from './Logo'

interface OnboardingHeaderProps {
  step: number
  total: number
  onBack?: () => void
}

function OnboardingHeader({ step, total, onBack }: OnboardingHeaderProps) {
  return (
    <div className="flex flex-col gap-md">
      <div className="flex items-center justify-center relative">
        {onBack && (
          <button
            className="absolute left-0 text-warm-text-muted hover:text-warm-primary transition-colors cursor-pointer"
            onClick={onBack}
            aria-label="뒤로가기"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
        )}
        <div className="flex items-center gap-2 text-warm-primary font-label-bold text-label-bold">
          <Logo className="h-8 w-8" />
          SoundNative
        </div>
      </div>
      <span className="w-fit bg-warm-badge-bg text-warm-badge-text font-label-bold text-label-bold px-md py-1 rounded-full">
        {step}/{total}
      </span>
    </div>
  )
}

export default OnboardingHeader
