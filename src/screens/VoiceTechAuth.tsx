import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// ─── Spinner Screen ───────────────────────────────────────────────────────────

function SpinnerScreen() {
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => navigate('/voicetech'), 2000)
    return () => clearTimeout(t)
  }, [navigate])

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white">
      <div className="w-full max-w-app flex flex-col min-h-screen relative">
        {/* Spinner centered */}
        <div className="flex-1 flex items-center justify-center">
          <svg
            className="animate-spin"
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
          >
            <circle
              cx="18" cy="18" r="15"
              stroke="url(#spinGrad)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="70 24"
            />
            <defs>
              <linearGradient id="spinGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1A1A1A" />
                <stop offset="100%" stopColor="#D1D5DB" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Browser bar */}
        <div
          className="w-full bg-white border-t border-gray-200 px-3 py-2"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}
        >
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 flex items-center justify-center rounded-full">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12 4L6 10L12 16" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-full">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="4" width="14" height="11" rx="2" stroke="#9CA3AF" strokeWidth="1.6"/>
                <path d="M5 4V3C5 2.44772 5.44772 2 6 2H12C12.5523 2 13 2.44772 13 3V4" stroke="#9CA3AF" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </button>
            <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 flex items-center justify-center">
              <span className="font-compact font-normal text-sm text-gray-500">m.mts.ru</span>
            </div>
            <button className="w-9 h-9 flex items-center justify-center rounded-full">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M15 9A6 6 0 1 1 3.5 5.5M3 3v3h3" stroke="#9CA3AF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-full">
              <svg width="18" height="4" viewBox="0 0 18 4" fill="none">
                <circle cx="2" cy="2" r="2" fill="#9CA3AF"/>
                <circle cx="9" cy="2" r="2" fill="#9CA3AF"/>
                <circle cx="16" cy="2" r="2" fill="#9CA3AF"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Auth Screen ──────────────────────────────────────────────────────────────

export default function VoiceTechAuth() {
  const [loading, setLoading] = useState(false)

  if (loading) return <SpinnerScreen />

  return (
    <div className="min-h-screen flex justify-center bg-white">
      <div className="w-full max-w-app flex flex-col min-h-screen">

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 pb-10">

          {/* 3D illustration */}
          <div className="relative mb-10">
            <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
              <defs>
                <linearGradient id="glassOuter" x1="20" y1="20" x2="140" y2="140" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#A8C0FF"/>
                  <stop offset="50%" stopColor="#C4B5F4"/>
                  <stop offset="100%" stopColor="#E8C5F0"/>
                </linearGradient>
                <linearGradient id="glassInner" x1="50" y1="50" x2="110" y2="110" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#D0D8FF" stopOpacity="0.9"/>
                  <stop offset="100%" stopColor="#F0E8FF" stopOpacity="0.6"/>
                </linearGradient>
                <linearGradient id="ballGrad" x1="65" y1="55" x2="95" y2="85" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#C8CFFF"/>
                  <stop offset="100%" stopColor="#B0B8F0"/>
                </linearGradient>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#9B8FD0" floodOpacity="0.3"/>
                </filter>
              </defs>

              {/* Outer squircle */}
              <rect x="22" y="22" width="116" height="116" rx="32" fill="url(#glassOuter)" filter="url(#shadow)" />

              {/* Inner glass panel */}
              <rect x="38" y="38" width="84" height="84" rx="22" fill="url(#glassInner)" opacity="0.7"/>

              {/* Highlight top-left */}
              <rect x="38" y="38" width="84" height="84" rx="22" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.6"/>

              {/* Ball / avatar */}
              <circle cx="80" cy="72" r="18" fill="url(#ballGrad)"/>
              <ellipse cx="80" cy="104" rx="22" ry="10" fill="#C4B8F2" opacity="0.5"/>

              {/* Shine */}
              <ellipse cx="60" cy="48" rx="12" ry="6" fill="white" opacity="0.25" transform="rotate(-30 60 48)"/>
            </svg>

            {/* Blue + badge */}
            <div
              className="absolute -left-2 bottom-8 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #4A7FFF, #2255EE)' }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 4v14M4 11h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          {/* Text */}
          <h1 className="font-sans font-black text-[1.75rem] text-gray-900 text-center leading-tight mb-3">
            Войдите с номером телефона любого оператора
          </h1>
          <p className="font-compact font-normal text-base text-gray-400 text-center leading-snug">
            Чтобы слушать разговоры и читать их расшифровку
          </p>
        </div>

        {/* Login button + browser bar */}
        <div className="px-4 pb-4">
          <button
            onClick={() => setLoading(true)}
            className="w-full bg-gray-900 rounded-2xl py-4 font-sans font-bold text-sm text-white uppercase tracking-widest active:opacity-80 transition-opacity"
          >
            Войти
          </button>
        </div>

        {/* Browser bar */}
        <div
          className="w-full bg-white border-t border-gray-200 px-3 py-2"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}
        >
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 flex items-center justify-center rounded-full">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12 4L6 10L12 16" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-full">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="4" width="14" height="11" rx="2" stroke="#9CA3AF" strokeWidth="1.6"/>
                <path d="M5 4V3C5 2.44772 5.44772 2 6 2H12C12.5523 2 13 2.44772 13 3V4" stroke="#9CA3AF" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </button>
            <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 flex items-center justify-center">
              <span className="font-compact font-normal text-sm text-gray-500">m.mts.ru</span>
            </div>
            <button className="w-9 h-9 flex items-center justify-center rounded-full">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M15 9A6 6 0 1 1 3.5 5.5M3 3v3h3" stroke="#9CA3AF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-full">
              <svg width="18" height="4" viewBox="0 0 18 4" fill="none">
                <circle cx="2" cy="2" r="2" fill="#9CA3AF"/>
                <circle cx="9" cy="2" r="2" fill="#9CA3AF"/>
                <circle cx="16" cy="2" r="2" fill="#9CA3AF"/>
              </svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
