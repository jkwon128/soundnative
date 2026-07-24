interface LogoProps {
  className?: string
}

// The SoundNative brand mark — a speech bubble with sound-wave bars,
// matching public/favicon.svg. Fixed two-tone colors (purple bubble, white
// bars) so it reads consistently regardless of surrounding background.
function Logo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#6C4CF6"
        d="M10 3h12a8 8 0 0 1 8 8v4a8 8 0 0 1-8 8h-8.2L7 29.4A1.2 1.2 0 0 1 5 28.5V23a8 8 0 0 1-3-6.2V11a8 8 0 0 1 8-8Z"
      />
      <g stroke="#fff" strokeWidth="3" strokeLinecap="round">
        <line x1="9" y1="12" x2="9" y2="18" />
        <line x1="14" y1="9" x2="14" y2="21" />
        <line x1="19" y1="6" x2="19" y2="24" />
        <line x1="24" y1="11" x2="24" y2="19" />
      </g>
    </svg>
  )
}

export default Logo
