import { useNavigate } from 'react-router-dom'
import { BottomNav } from '../components/layout/BottomNav'

export default function NoiseReductionPromo() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex justify-center bg-[#F0F0F5]">
      <div className="w-full max-w-app flex flex-col min-h-screen relative">

        {/* ── Hero ── */}
        <div
          className="relative flex-shrink-0 overflow-hidden"
          style={{
            minHeight: 280,
            background: 'linear-gradient(135deg, #5B6FD4 0%, #8B6FD4 35%, #C46FBA 65%, #E87FA0 100%)',
          }}
        >
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-12 left-4 w-11 h-11 rounded-2xl flex items-center justify-center z-10"
            style={{ background: 'rgba(255,255,255,0.25)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>

          {/* Share button */}
          <button
            className="absolute top-12 right-4 w-11 h-11 rounded-2xl flex items-center justify-center z-10"
            style={{ background: 'rgba(255,255,255,0.25)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <polyline points="16 6 12 2 8 6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
          </button>

          {/* Ice crystals decoration */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Crystal shards */}
            {[
              { left: '8%', top: '30%', w: 18, h: 60, rotate: -20, opacity: 0.5 },
              { left: '18%', top: '15%', w: 12, h: 80, rotate: 10, opacity: 0.4 },
              { left: '28%', top: '40%', w: 10, h: 50, rotate: -35, opacity: 0.35 },
              { left: '5%', top: '55%', w: 8, h: 40, rotate: 15, opacity: 0.3 },
              { left: '38%', top: '20%', w: 14, h: 65, rotate: 5, opacity: 0.45 },
              { left: '22%', top: '60%', w: 9, h: 35, rotate: -10, opacity: 0.25 },
            ].map((s, i) => (
              <div
                key={i}
                className="absolute rounded-sm"
                style={{
                  left: s.left, top: s.top,
                  width: s.w, height: s.h,
                  transform: `rotate(${s.rotate}deg)`,
                  opacity: s.opacity,
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(180,200,255,0.4) 100%)',
                }}
              />
            ))}
          </div>

          {/* Phone mockup */}
          <div className="absolute right-6 top-8 bottom-0 flex items-end">
            <div
              className="relative rounded-[2rem] overflow-hidden"
              style={{
                width: 130,
                height: 220,
                background: 'linear-gradient(160deg, rgba(160,180,255,0.6) 0%, rgba(120,140,220,0.4) 100%)',
                border: '1.5px solid rgba(255,255,255,0.5)',
                boxShadow: '0 8px 40px rgba(80,80,200,0.3)',
              }}
            >
              {/* Screen glow */}
              <div
                className="absolute inset-2 rounded-[1.5rem]"
                style={{ background: 'linear-gradient(160deg, rgba(200,220,255,0.8), rgba(180,200,255,0.4))' }}
              />
              {/* Notch */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-4 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}/>
            </div>
          </div>
        </div>

        {/* ── White card ── */}
        <div className="bg-white rounded-t-[28px] -mt-6 flex-1 px-5 pt-7 pb-6">

          {/* Title */}
          <h1 className="font-sans font-black text-[2.1rem] text-gray-900 leading-tight mb-4">
            Шумоподавление
          </h1>

          {/* Description */}
          <p className="font-compact font-normal text-base text-gray-500 leading-relaxed mb-6">
            Общайтесь по телефону даже в самых шумных местах. Искусственный интеллект в реальном времени уберёт из звонка посторонние звуки
          </p>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="font-sans font-black text-3xl text-gray-900">0 ₽</span>
            <span className="font-compact font-normal text-lg text-gray-400 line-through">99 ₽/мес</span>
          </div>

          {/* Info box */}
          <div className="rounded-2xl bg-[#F5F5F5] px-4 py-3.5 mb-6">
            <p className="font-compact font-normal text-sm text-gray-500 leading-relaxed">
              Первые 30 дней 0 ₽, далее — 99 ₽/мес
            </p>
          </div>

          {/* CTA */}
          <button
            className="w-full rounded-full py-4 font-sans font-bold text-sm text-white uppercase tracking-widest"
            style={{ background: '#E30611' }}
          >
            Подключить
          </button>
        </div>

        {/* ── Features ── */}
        <div className="bg-[#F0F0F5] px-5 pt-6 pb-28 flex flex-col gap-5">
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7B8EC8 0%, #9B6FD4 100%)' }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
                <rect x="1" y="3" width="15" height="13" rx="2"/>
                <path d="M16 8h4l3 3v5h-7V8z"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <p className="font-sans font-bold text-base text-gray-900 leading-snug pt-1">
              Удобно в транспорте, на улице и других шумных местах
            </p>
          </div>

          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7B8EC8 0%, #9B6FD4 100%)' }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </div>
            <p className="font-sans font-bold text-base text-gray-900 leading-snug pt-1">
              Собеседник не услышит посторонние звуки у вас, а вы — шум у собеседника
            </p>
          </div>
        </div>

        <BottomNav/>
      </div>
    </div>
  )
}
