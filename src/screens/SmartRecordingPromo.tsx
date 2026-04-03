import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function SmartRecordingPromo() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex justify-center bg-white">
      <div className="w-full max-w-app flex flex-col min-h-screen relative overflow-y-auto">

        {/* ── Hero ── */}
        <div
          className="relative overflow-hidden flex-shrink-0"
          style={{ background: 'linear-gradient(160deg, #9BA3C8 0%, #C4C9E2 50%, #E2E5F2 100%)', minHeight: 260 }}
        >
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-12 left-4 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center z-10"
          >
            <ArrowLeft size={20} color="white" strokeWidth={2} />
          </button>

          {/* Share button */}
          <button className="absolute top-12 right-4 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center z-10">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <polyline points="16 6 12 2 8 6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
          </button>

          {/* Phone UI mockup */}
          <div className="flex justify-center pt-16 pb-6">
            <div
              className="relative rounded-3xl overflow-hidden"
              style={{
                width: 220,
                background: 'linear-gradient(160deg, #7B8EC8 0%, #B0B8DA 100%)',
                boxShadow: '0 8px 32px rgba(90,100,160,0.25)',
                padding: '14px 14px 0 14px',
              }}
            >
              {/* Notch bar */}
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="font-compact text-[10px] text-white/70">Звонки</span>
              </div>

              {/* "Итоги разговора" chip */}
              <div className="flex justify-center mb-3">
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.18)' }}
                >
                  {/* transcript icon */}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  <span className="font-compact text-[11px] text-white font-medium">Итоги разговора</span>
                </div>
              </div>

              {/* Audio player */}
              <div
                className="flex items-center gap-2 rounded-2xl px-3 py-2.5 mb-4"
                style={{ background: 'rgba(255,255,255,0.15)' }}
              >
                {/* Pause button */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.25)' }}
                >
                  <svg width="12" height="14" viewBox="0 0 12 14" fill="white">
                    <rect x="1" y="1" width="3" height="12" rx="1"/>
                    <rect x="8" y="1" width="3" height="12" rx="1"/>
                  </svg>
                </div>

                {/* Timestamps + waveform */}
                <div className="flex-1 flex flex-col gap-1">
                  {/* Waveform */}
                  <div className="flex items-center gap-0.5 h-4">
                    {[3,5,7,4,6,8,5,3,6,7,4,5,3,6,8,5,4,6].map((h, i) => (
                      <div
                        key={i}
                        className="rounded-full flex-1"
                        style={{
                          height: `${h * 2}px`,
                          background: i < 7 ? '#007AFF' : 'rgba(255,255,255,0.5)',
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <span className="font-compact text-[9px] text-white/70">00:00</span>
                    <span className="font-compact text-[9px] text-white/70">00:25</span>
                  </div>
                </div>

                {/* Transcribe button */}
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #4A5285, #7B8EC8)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 bg-white px-5 pt-6 pb-10">

          {/* Title */}
          <h1 className="font-sans font-black text-[2rem] text-gray-900 leading-tight mb-3">
            Интеллектуальная запись
          </h1>

          {/* Description */}
          <p className="font-compact font-normal text-sm text-gray-500 leading-relaxed mb-6">
            Автоматическая запись и расшифровка звонков, краткие итоги разговоров, безопасное хранение в приложении Мой МТС
          </p>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="font-sans font-black text-3xl text-gray-900">0 ₽</span>
            <span className="font-compact font-normal text-base text-gray-400 line-through">99 ₽/мес</span>
          </div>

          {/* Info box */}
          <div className="rounded-2xl bg-[#F5F5F5] px-4 py-3 mb-6">
            <p className="font-compact font-normal text-sm text-gray-500 leading-relaxed">
              С тарифами «МТС Супер», «РИИЛ» — 0 ₽/мес. Для других — 30 дней за 0 ₽, далее — 99 ₽/мес
            </p>
          </div>

          {/* CTA */}
          <button
            className="w-full rounded-full py-4 font-sans font-bold text-sm text-white uppercase tracking-widest mb-8"
            style={{ background: '#E30611' }}
          >
            Подключить
          </button>

          {/* Features */}
          <div className="flex flex-col gap-5">
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #7B8EC8, #9BA3D8)' }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
              <div>
                <p className="font-sans font-bold text-base text-gray-900 leading-snug">
                  Быстро находите нужную информацию из разговора
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #7B8EC8, #9BA3D8)' }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4l3 3"/>
                </svg>
              </div>
              <div>
                <p className="font-sans font-bold text-base text-gray-900 leading-snug">
                  Никаких лишних действий — вы разговариваете как обычно
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #7B8EC8, #9BA3D8)' }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div>
                <p className="font-sans font-bold text-base text-gray-900 leading-snug">
                  Безопасное хранение записей в Мой МТС
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
