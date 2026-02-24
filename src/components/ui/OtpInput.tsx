import { useRef } from 'react'
import type { KeyboardEvent, ClipboardEvent } from 'react'

interface OtpInputProps {
  value: string[]
  onChange: (value: string[]) => void
  error?: boolean
  length?: number
}

export function OtpInput({ value, onChange, error = false, length = 4 }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, char: string) => {
    if (!/^\d?$/.test(char)) return
    const next = [...value]
    next[index] = char
    onChange(next)
    if (char && index < length - 1) refs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      refs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (pasted) {
      const next = Array.from({ length }, (_, i) => pasted[i] ?? '')
      onChange(next)
      refs.current[Math.min(pasted.length, length - 1)]?.focus()
    }
    e.preventDefault()
  }

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`w-14 h-14 text-center text-xl font-bold rounded-card border-2 outline-none transition-colors
            ${error
              ? 'border-mts-red bg-red-50 text-mts-red'
              : value[i]
                ? 'border-mts-red text-gray-900'
                : 'border-gray-200 text-gray-900 focus:border-mts-red'
            }`}
        />
      ))}
    </div>
  )
}
