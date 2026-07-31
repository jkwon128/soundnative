interface OnboardingOptionCardProps {
  name: string
  title: string
  subtitle: string
  icon?: string
  selected: boolean
  onSelect: () => void
}

function OnboardingOptionCard({ name, title, subtitle, icon, selected, onSelect }: OnboardingOptionCardProps) {
  return (
    <label
      className={`flex items-center justify-between gap-md bg-warm-surface border-2 rounded-warm-card px-md py-sm cursor-pointer transition-colors shadow-warm-card ${
        selected ? 'border-warm-primary' : 'border-transparent hover:border-warm-primary'
      }`}
    >
      <div className="flex items-center gap-sm">
        <input
          type="radio"
          name={name}
          className="h-5 w-5 accent-warm-primary"
          checked={selected}
          onChange={onSelect}
        />
        <div className="flex flex-col">
          <span className="font-label-bold text-body-lg text-warm-text">{title}</span>
          <span className="font-body-md text-sm text-warm-text-muted">{subtitle}</span>
        </div>
      </div>
      {icon && <span className="material-symbols-outlined text-2xl text-warm-primary">{icon}</span>}
    </label>
  )
}

export default OnboardingOptionCard
