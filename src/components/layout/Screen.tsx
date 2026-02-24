import type { HTMLAttributes } from 'react'

interface ScreenProps extends HTMLAttributes<HTMLDivElement> {
  withBottomNav?: boolean
}

export function Screen({ withBottomNav = false, className = '', children, ...props }: ScreenProps) {
  return (
    <div className="min-h-screen bg-mts-surface flex justify-center">
      <div
        className={`w-full max-w-app bg-white min-h-screen flex flex-col relative
          ${withBottomNav ? 'pb-20' : ''}
          ${className}`}
        {...props}
      >
        {children}
      </div>
    </div>
  )
}
