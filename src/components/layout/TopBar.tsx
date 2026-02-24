import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface TopBarProps {
  title?: string
  showBack?: boolean
  right?: ReactNode
}

export function TopBar({ title, showBack = false, right }: TopBarProps) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center h-14 px-4 border-b border-gray-100 shrink-0">
      <div className="w-10">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="p-1 -ml-1 text-mts-red"
            aria-label="Назад"
          >
            <ArrowLeft size={24} />
          </button>
        )}
      </div>
      <h1 className="flex-1 text-center text-base font-semibold text-gray-900">
        {title}
      </h1>
      <div className="w-10 flex justify-end">{right}</div>
    </div>
  )
}
