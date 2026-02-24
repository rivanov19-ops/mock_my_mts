interface ToggleProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
  disabled?: boolean
}

export function Toggle({ enabled, onChange, disabled = false }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={`relative w-12 h-7 rounded-full transition-colors duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-mts-red disabled:opacity-40
        ${enabled ? 'bg-mts-red' : 'bg-gray-300'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow
          transition-transform duration-200
          ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  )
}
