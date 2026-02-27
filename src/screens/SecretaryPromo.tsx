import { useNavigate } from 'react-router-dom'
import { ArrowLeft, X } from 'lucide-react'

export default function SecretaryPromo() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex justify-center bg-white">
      <div className="w-full max-w-app flex flex-col min-h-screen relative">

        {/* ── Hero ── */}
        <div className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #7B8EC8 0%, #A8B4D8 60%, #D4D8EA 100%)', minHeight: 320 }}>
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-12 left-4 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center z-10"
          >
            <ArrowLeft size={20} color="white" strokeWidth={2} />
          </button>

          {/* Decorative phone illustration */}
          <div className="absolute right-4 top-8 opacity-60">
            <div className="w-24 h-40 rounded-3xl border-2 border-white/40 bg-white/10 flex items-center justify-center">
              <div className="w-16 h-28 rounded-2xl bg-white/20 flex items-center justify-center">
                <span className="text-4xl">✦</span>
              </div>
            </div>
          </div>

          {/* Hero text */}
          <div className="px-5 pt-28 pb-10">
            <h1 className="font-sans font-black text-3xl text-gray-900 leading-tight mb-3">
              Секретарь+
            </h1>
            <p className="font-compact font-normal text-sm text-gray-700 leading-relaxed max-w-[260px]">
              Всё нужное в одной подписке: запись и текстовая расшифровка разговора после каждого звонка. Когда вы заняты — на звонок ответит Секретарь.
            </p>
          </div>
        </div>

        {/* ── Free period banner ── */}
        <div className="mx-4 -mt-5 z-10 relative">
          <div
            className="rounded-2xl px-5 py-4 flex items-center justify-between overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #7B8EC8 0%, #9BA3C8 100%)' }}
          >
            <div>
              <p className="font-sans font-bold text-base text-white">Бесплатный период</p>
              <p className="font-compact font-normal text-xs text-white/70 mt-0.5">Действует первый месяц до 25 марта</p>
            </div>
            <span className="text-3xl">🎁</span>
          </div>
        </div>

        {/* ── Price sheet ── */}
        <div className="mx-4 mt-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <p className="font-sans font-bold text-base text-gray-900">Стоимость продукта</p>
            <button onClick={() => navigate(-1)}>
              <X size={20} className="text-gray-400" strokeWidth={2} />
            </button>
          </div>

          <p className="font-compact font-normal text-sm text-gray-400 mb-1">Абонентская плата</p>
          <div className="flex items-baseline gap-3 mb-5">
            <span className="font-sans font-black text-3xl text-gray-900">0 ₽/мес</span>
            <span className="font-compact font-normal text-base text-gray-400 line-through">199 ₽</span>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="font-compact font-normal text-sm text-gray-400 mb-3">Ваши цены</p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-compact font-normal text-sm text-gray-700">по 25 марта 2026</span>
                <span className="font-sans font-bold text-sm text-gray-900">0 ₽/мес</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-compact font-normal text-sm text-gray-700">с 25 марта 2026 по 25 марта 2027</span>
                <span className="font-sans font-bold text-sm text-gray-900">149 ₽/мес</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-compact font-normal text-sm text-gray-700">после 25 марта 2027</span>
                <span className="font-sans font-bold text-sm text-gray-900">199 ₽/мес</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="px-4 mt-6">
          <button
            className="w-full rounded-full py-4 font-sans font-bold text-sm text-white uppercase tracking-widest"
            style={{ background: 'linear-gradient(135deg, #4A5285 0%, #7B8EC8 100%)' }}
          >
            Подключить
          </button>
        </div>

      </div>
    </div>
  )
}
