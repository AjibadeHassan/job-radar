interface LogoProps {
  size?: number
  className?: string
  animated?: boolean
}

export function Logo({ size = 32, className = '', animated = false }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="radar-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.7 0.15 160)" />
          <stop offset="100%" stopColor="oklch(0.55 0.14 165)" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="9" fill="url(#radar-grad)" />
      <circle cx="20" cy="20" r="13" stroke="white" strokeWidth="1.5" opacity="0.4" fill="none" />
      <circle cx="20" cy="20" r="8" stroke="white" strokeWidth="1.5" opacity="0.55" fill="none" />
      <circle cx="20" cy="20" r="3" stroke="white" strokeWidth="1.5" opacity="0.75" fill="none" />
      <circle cx="20" cy="20" r="1.6" fill="white" className={animated ? 'radar-dot' : ''} />
      <path d="M20 20 L20 7" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.85"
        className={animated ? 'radar-sweep' : ''}
        style={animated ? { transformOrigin: '20px 20px' } : undefined}
      />
      <circle cx="28" cy="14" r="1.4" fill="white" opacity="0.9" />
      <circle cx="13" cy="26" r="1.1" fill="white" opacity="0.7" />
      <circle cx="27" cy="27" r="0.9" fill="white" opacity="0.6" />
    </svg>
  )
}
