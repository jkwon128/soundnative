import type { ButtonHTMLAttributes } from 'react'

type PillButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

function PillButton({ className = '', ...props }: PillButtonProps) {
  return (
    <button
      className={`btn-warm-primary w-full bg-warm-primary text-warm-on-primary font-label-bold text-label-bold py-sm px-md rounded-full flex items-center justify-center gap-2 cursor-pointer disabled:bg-warm-badge-bg disabled:text-warm-text-muted ${className}`}
      {...props}
    />
  )
}

export default PillButton
