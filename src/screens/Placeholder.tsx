import { useNavigate } from 'react-router-dom'
import { useAccountStore } from '../core/store/accountStore'
import { Logo } from '../components/ui/Logo'
import mock from '../core/data/mock'

export default function Placeholder() {
  const navigate = useNavigate()
  const { account } = useAccountStore()

  return (
    <div className="min-h-screen bg-mts-surface flex items-center justify-center p-4">
      <div className="bg-white rounded-card shadow-card max-w-app w-full p-8 flex flex-col items-center gap-4">
        <Logo size={80} />
        <h1 className="text-2xl font-bold text-gray-900">Мой МТС</h1>
        <p className="text-mts-success font-medium">Scaffold ready ✓</p>
        <p className="text-sm text-mts-muted">
          Zustand balance:{' '}
          <span className="font-mono font-bold text-gray-900">{account.balance} ₽</span>
        </p>
        <div className="flex flex-col items-center gap-2 w-full pt-2 border-t border-gray-100">
          <button
            onClick={() => navigate('/splash')}
            className="text-mts-red text-sm font-medium underline"
          >
            → Перейти к Splash
          </button>
          <button
            onClick={() => navigate('/dashboard', { state: { phone: mock.user.phone } })}
            className="text-mts-red text-sm font-medium underline"
          >
            → Перейти к Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
