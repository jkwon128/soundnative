import Logo from './Logo'

interface OnboardingHeaderProps {
  step: number
  total: number
}

function OnboardingHeader({ step, total }: OnboardingHeaderProps) {
  return (
    <div className="flex flex-col gap-md">
      <div className="flex items-center gap-2 text-warm-primary font-label-bold text-label-bold">
        <Logo className="h-6 w-6" />
        SoundNative
      </div>
      <span className="w-fit bg-warm-badge-bg text-warm-badge-text font-label-bold text-label-bold px-md py-1 rounded-full">
        {step}/{total}
      </span>
    </div>
  )
}

export default OnboardingHeader
