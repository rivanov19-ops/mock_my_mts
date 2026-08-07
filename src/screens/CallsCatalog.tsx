import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { BottomNav } from '../components/layout/BottomNav'

interface SubscriptionCard {
  title: string
  subtitle: string
  footerLink: string
  gradient: string
  route: string
  footerRoute?: string
  art: 'ai' | 'shield'
}

const CARDS: SubscriptionCard[] = [
  {
    title: 'AI Помощник МТС',
    subtitle: 'Запись, расшифровка и управление всеми звонками',
    footerLink: 'Все сервисы VoiceTech',
    gradient: 'linear-gradient(145deg, #EAE6FB 0%, #D9DCF8 40%, #CDD4F4 70%, #E2DAF7 100%)',
    route: '/calls/smart-recording-promo',
    footerRoute: '/calls/voicetech-services',
    art: 'ai',
  },
  {
    title: 'Защитник+',
    subtitle: 'Блокировка спама, мошенников и нежелательных звонков',
    footerLink: 'Все сервисы Безопасности',
    gradient: 'linear-gradient(145deg, #FDEAE6 0%, #F9D6CE 40%, #F5C8BF 70%, #FADFD6 100%)',
    route: '/calls/secretary-promo',
    art: 'shield',
  },
]

// Нейросеть + эквалайзер + «искра» — тема AI-обработки звонков
function AiArt() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 358 200"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Мягкие пятна глубины */}
      <circle cx="310" cy="30" r="70" fill="#A99EE6" fillOpacity="0.12" />
      <circle cx="60" cy="150" r="60" fill="#8B7FD6" fillOpacity="0.08" />

      {/* Связи нейросети */}
      <g stroke="#7B6CD0" strokeOpacity="0.35" strokeWidth="1.4">
        <line x1="238" y1="42" x2="290" y2="72" />
        <line x1="290" y1="72" x2="254" y2="112" />
        <line x1="238" y1="42" x2="254" y2="112" />
        <line x1="290" y1="72" x2="330" y2="44" />
        <line x1="254" y1="112" x2="316" y2="128" />
        <line x1="290" y1="72" x2="316" y2="128" />
      </g>

      {/* Узлы */}
      <circle cx="238" cy="42" r="7" fill="#7B6CD0" fillOpacity="0.75" />
      <circle cx="290" cy="72" r="10" fill="#8B7FD6" fillOpacity="0.85" />
      <circle cx="254" cy="112" r="6" fill="#9C90E0" fillOpacity="0.75" />
      <circle cx="330" cy="44" r="5" fill="#AFA5E8" fillOpacity="0.7" />
      <circle cx="316" cy="128" r="4.5" fill="#AFA5E8" fillOpacity="0.7" />

      {/* Эквалайзер голоса */}
      <g fill="#7B6CD0" fillOpacity="0.45">
        <rect x="42" y="54" width="6" height="18" rx="3" />
        <rect x="55" y="44" width="6" height="38" rx="3" />
        <rect x="68" y="30" width="6" height="64" rx="3" />
        <rect x="81" y="48" width="6" height="30" rx="3" />
        <rect x="94" y="58" width="6" height="12" rx="3" />
      </g>

      {/* Искра AI */}
      <path
        d="M158 40 l4.5 11 11 4.5 -11 4.5 -4.5 11 -4.5 -11 -11 -4.5 11 -4.5 z"
        fill="#8B7FD6"
        fillOpacity="0.55"
      />
    </svg>
  )
}

// Щит с галочкой + отражённые «спам-точки» — тема защиты от нежелательных звонков
function ShieldArt() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 358 200"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="catShield" x1="245" y1="30" x2="325" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E57368" />
          <stop offset="100%" stopColor="#D1584C" />
        </linearGradient>
      </defs>

      {/* Мягкие пятна глубины */}
      <circle cx="320" cy="40" r="72" fill="#E57368" fillOpacity="0.12" />
      <circle cx="55" cy="140" r="58" fill="#D1584C" fillOpacity="0.08" />

      {/* Щит */}
      <path
        d="M285 26 L328 41 V88 C328 115 310 134 285 145 C260 134 242 115 242 88 V41 Z"
        fill="url(#catShield)"
        fillOpacity="0.9"
      />
      <path
        d="M267 84 L280 97 L304 68"
        stroke="white"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Отражённые спам-звонки */}
      <g fill="#D1584C">
        <circle cx="200" cy="46" r="5" fillOpacity="0.35" />
        <circle cx="178" cy="90" r="4" fillOpacity="0.28" />
        <circle cx="205" cy="126" r="3.5" fillOpacity="0.22" />
      </g>
      <g stroke="#D1584C" strokeOpacity="0.3" strokeWidth="1.6" strokeLinecap="round">
        <path d="M214 46 h14" />
        <path d="M190 90 h13" />
        <path d="M216 126 h12" />
      </g>
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

              {/* Themed art */}
              {card.art === 'ai' ? <AiArt /> : <ShieldArt />}

              {/* Readability overlay at bottom */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to top, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.2) 45%, transparent 100%)',
                }}
              />

              {/* Arrow button top-right */}
              <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/60 flex items-center justify-center">
                <ChevronRight size={18} className="text-gray-800" strokeWidth={2} />
              </div>

              {/* Text content */}
              <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
                <h2
                  className="font-sans font-black text-gray-900 text-left mb-1"
                  style={{ fontSize: '1.5rem', lineHeight: 1.1 }}
                >
                  {card.title}
                </h2>
                <p className="font-compact text-gray-600 text-xs text-left mb-3 leading-snug">
                  {card.subtitle}
                </p>
                <div
                  className="flex items-center gap-1"
                  onClick={card.footerRoute ? (e) => { e.stopPropagation(); navigate(card.footerRoute!) } : undefined}
                >
                  <span className="font-compact text-gray-500 text-xs">{card.footerLink}</span>
                  <ChevronRight size={12} className="text-gray-500" strokeWidth={2} />
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
