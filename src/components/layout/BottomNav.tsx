import { useNavigate, useLocation } from 'react-router-dom'
import { Home, CreditCard, LayoutGrid, Headphones, Phone } from 'lucide-react'

const TABS = [
  { label: 'Мой МТС',   icon: Home,        path: '/dashboard' },
  { label: 'Деньги',    icon: CreditCard,  path: '/money'     },
  { label: 'Каталог',   icon: LayoutGrid,  path: '/catalog'   },
  { label: 'Поддержка', icon: Headphones,  path: '/support'   },
  { label: 'Звонки',    icon: Phone,       path: '/calls'     },
] as const

export function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app
        bg-white border-t border-gray-100 flex z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {TABS.map(({ label, icon: Icon, path }) => {
        const active = pathname === path
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-compact font-medium transition-colors
              ${active ? 'text-mts-red' : 'text-mts-muted'}`}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.5} />
            {label}
          </button>
        )
      })}
    </nav>
  )
}
