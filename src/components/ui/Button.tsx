import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base =
    'rounded-btn font-semibold text-base py-3.5 px-6 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed'

  const variants = {
    primary:   'bg-mts-red text-white hover:bg-mts-red-dark active:bg-mts-red-dark',
    secondary: 'border border-mts-red text-mts-red bg-white hover:bg-mts-surface active:bg-mts-surface',
    ghost:     'text-mts-red bg-transparent hover:bg-mts-surface',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
