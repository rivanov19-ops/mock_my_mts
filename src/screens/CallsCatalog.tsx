import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { BottomNav } from '../components/layout/BottomNav'

interface SubscriptionCard {
  title: string
  subtitle: string
  footerLink: string
  gradient: string
  overlayGradient: string
  route: string
  activeBadge?: boolean
}

const CARDS: SubscriptionCard[] = [
  {
    title: 'Мембрана',
    subtitle: 'Подписка звонков и безопасности в одной подписке',
    footerLink: 'Все сервисы Мембраны',
    gradient: 'linear-gradient(145deg, #2A2D5E 0%, #3A3F80 40%, #2E3A6A 70%, #242C58 100%)',
    overlayGradient: 'linear-gradient(to top, rgba(30,33,70,0.9) 0%, rgba(30,33,70,0.4) 55%, transparent 100%)',
    route: '/calls/secretary-plus-promo',
  },
  {
    title: 'Секретарь+',
    subtitle: 'Запись, расшифровка и управление всеми звонками',
    footerLink: 'Все сервисы VoiceTech',
    gradient: 'linear-gradient(145deg, #3A1A7A 0%, #5A28AA 40%, #432080 70%, #2E1560 100%)',
    overlayGradient: 'linear-gradient(to top, rgba(35,12,70,0.9) 0%, rgba(35,12,70,0.4) 55%, transparent 100%)',
    route: '/calls/smart-recording-promo',
  },
  {
    title: 'Защитник+',
    subtitle: 'Блокировка спама, мошенников и нежелательных звонков',
    footerLink: 'Все сервисы Безопасности',
    gradient: 'linear-gradient(145deg, #4A1010 0%, #7A1818 40%, #5A1212 70%, #3A0E0E 100%)',
    overlayGradient: 'linear-gradient(to top, rgba(50,8,8,0.9) 0%, rgba(50,8,8,0.4) 55%, transparent 100%)',
    route: '/calls/secretary-promo',
  },
]

function StarField() {
  const stars = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.round((i * 137.5) % 100),
    y: Math.round((i * 97.3) % 100),
    size: i % 3 === 0 ? 2 : 1,
    opacity: 0.3 + (i % 5) * 0.1,
  }))
  return (
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {stars.map(s => (
        <circle key={s.id} cx={`${s.x}%`} cy={`${s.y}%`} r={s.size} fill="white" opacity={s.opacity} />
      ))}
    </svg>
  )
}

export default function CallsCatalog() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-mts-surface flex justify-center">
      <div className="w-full max-w-app flex flex-col min-h-screen relative">

        {/* Header */}
        <div className="px-4 pt-12 pb-4 bg-mts-surface flex items-center">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center shrink-0">
            <ChevronLeft size={24} className="text-gray-900" strokeWidth={2} />
          </button>
          <h1 className="font-sans font-bold text-lg text-gray-900 flex-1 text-center pr-9">
            Каталог
          </h1>
        </div>

        {/* Cards */}
        <div className="flex-1 overflow-y-auto pb-24 px-4 flex flex-col gap-3 pt-1">
          {CARDS.map((card) => (
            <button
              key={card.title}
              onClick={() => navigate(card.route)}
              className="w-full rounded-2xl overflow-hidden relative active:scale-[0.98] transition-transform"
              style={{ height: 200 }}
            >
              {/* Background gradient */}
              <div className="absolute inset-0" style={{ background: card.gradient }} />

              {/* Stars */}
              <StarField />

              {/* Subtle glow */}
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: 'radial-gradient(ellipse at 80% 20%, rgba(120,80,255,0.15) 0%, transparent 60%)',
                }}
              />

              {/* Content overlay gradient */}
              <div className="absolute inset-0" style={{ background: card.overlayGradient }} />

              {/* Arrow button top-right */}
              <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
                <ChevronRight size={18} color="white" strokeWidth={2} />
              </div>

              {/* Text content */}
              <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
                <h2
                  className="font-sans font-black text-white text-left mb-1"
                  style={{ fontSize: '1.5rem', lineHeight: 1.1 }}
                >
                  {card.title}
                </h2>
                <p className="font-compact text-white/60 text-xs text-left mb-3 leading-snug">
                  {card.subtitle}
                </p>
                <div className="flex items-center gap-1">
                  <span className="font-compact text-white/40 text-xs">{card.footerLink}</span>
                  <ChevronRight size={12} color="rgba(255,255,255,0.4)" strokeWidth={2} />
                </div>
              </div>
            </button>
          ))}
        </div>

        <BottomNav />
      </div>
    </div>
  )
}
