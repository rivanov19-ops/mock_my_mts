interface LogoProps {
  size?: number
  className?: string
}

export function Logo({ size = 64, className = '' }: LogoProps) {
  const fontSize = Math.round(size * 0.44)
  const radius   = Math.round(size * 0.18)
  const pad      = Math.round(size * 0.10)

  return (
    <div
      className={`bg-mts-red grid grid-cols-2 shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        padding: pad,
        gap: Math.round(size * 0.02),
      }}
    >
      {(['М', 'Т', '', 'С'] as const).map((letter, i) => (
        <span
          key={i}
          className="text-white font-black leading-none"
          style={{ fontSize, fontFamily: '"MTS Wide", sans-serif' }}
        >
          {letter}
        </span>
      ))}
    </div>
  )
}
