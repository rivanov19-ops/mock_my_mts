import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { BottomNav } from '../components/layout/BottomNav'

export default function SecretaryPlusPromo() {
  const navigate = useNavigate()
  const [voice, setVoice] = useState<'male' | 'female'>('female')

  return (
    <div className="min-h-screen flex justify-center bg-white">
      <div className="w-full max-w-app flex flex-col min-h-screen relative">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-4 pt-12 pb-3 bg-white z-10">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center">
            <ArrowLeft size={22} className="text-gray-900" strokeWidth={2}/>
          </button>
          <div className="text-center">
            <p className="font-sans font-bold text-base text-gray-900 leading-tight">Мой МТС</p>
            <p className="font-compact font-normal text-xs text-gray-400">Роман Иванов</p>
          </div>
          <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill="#9CA3AF"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="#9CA3AF"/></svg>
          </div>
        </div>

        {/* ── Hero ── */}
        <div
          className="relative overflow-hidden flex-shrink-0"
          style={{ background: 'linear-gradient(160deg, #E8EAF5 0%, #F2F3FA 60%, #FAFAFA 100%)', minHeight: 180 }}
        >
          {/* Phone mockup — right side */}
          <div className="absolute right-0 top-0 bottom-0 flex items-center pr-4">
            <div
              className="relative rounded-3xl overflow-visible"
              style={{ width: 160, height: 140 }}
            >
              {/* "Итоги разговора" bubble */}
              <div
                className="absolute top-6 right-2 flex items-center gap-2 px-3 py-2 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.9)', boxShadow: '0 2px 12px rgba(0,0,0,0.10)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                <span className="font-compact font-medium text-sm text-gray-700">Итоги разговора</span>
              </div>
              {/* Red MTS circle (phone) */}
              <div
                className="absolute bottom-4 left-4 w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: '#E30611' }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11.3a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 bg-white px-5 pt-6 pb-28 overflow-y-auto">

          {/* Title */}
          <h1 className="font-sans font-black text-[2rem] text-gray-900 leading-tight mb-3">
            Секретарь+
          </h1>

          {/* Description */}
          <p className="font-compact font-normal text-base text-gray-500 leading-relaxed mb-6">
            Всё нужное в одной подписке: Секретарь для пропущенных, перевод звонка в чат и автозапись разговоров с текстовыми расшифровками
          </p>

          {/* Free period banner */}
          <div
            className="rounded-2xl px-5 py-4 mb-6 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #6B8BFF 0%, #88A8FF 100%)' }}
          >
            <p className="font-sans font-bold text-xl text-white mb-1">Бесплатный период</p>
            <p className="font-compact font-normal text-sm text-white/80">Действует первый месяц до 30 апреля</p>
            {/* Gift icon */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                <span className="text-2xl">🎁</span>
              </div>
            </div>
          </div>

          {/* Voice selector */}
          <p className="font-compact font-normal text-sm text-gray-500 mb-3">Голос</p>
          <div className="flex items-center gap-6 mb-6">
            <button
              className="flex items-center gap-2"
              onClick={() => setVoice('male')}
            >
              <div
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                style={{ borderColor: voice === 'male' ? '#E30611' : '#D1D5DB' }}
              >
                {voice === 'male' && <div className="w-2.5 h-2.5 rounded-full bg-red-600"/>}
              </div>
              <span className="font-sans font-medium text-base text-gray-900">Мужской голос</span>
            </button>
            <button
              className="flex items-center gap-2"
              onClick={() => setVoice('female')}
            >
              <div
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                style={{ borderColor: voice === 'female' ? '#E30611' : '#D1D5DB' }}
              >
                {voice === 'female' && <div className="w-2.5 h-2.5 rounded-full bg-red-600"/>}
              </div>
              <span className="font-sans font-medium text-base text-gray-900">Женский голос</span>
            </button>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-1">
            <span className="font-sans font-black text-3xl text-gray-900">0 ₽/мес</span>
            <span className="font-compact font-normal text-lg text-gray-400 line-through">199 ₽</span>
          </div>
          <p className="font-compact font-normal text-sm text-gray-500 mb-6">
            Бесплатно первый месяц, далее —{' '}
            <span className="text-blue-500 underline underline-offset-2">оплата меняется</span>
          </p>

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
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B8BFF" strokeWidth="2" strokeLinecap="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11.3a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div>
                <p className="font-sans font-bold text-base text-gray-900 leading-snug">
                  Контакт в каждом звонке
                </p>
                <p className="font-compact font-normal text-sm text-gray-500 mt-0.5 leading-snug">
                  Секретарь ответит на пропущенные и примет сообщение
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B8BFF" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div>
                <p className="font-sans font-bold text-base text-gray-900 leading-snug">
                  Перевод звонка в чат
                </p>
                <p className="font-compact font-normal text-sm text-gray-500 mt-0.5 leading-snug">
                  Не можете говорить — переведите звонок в текстовый чат
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B8BFF" strokeWidth="2" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <div>
                <p className="font-sans font-bold text-base text-gray-900 leading-snug">
                  Автозапись и расшифровка
                </p>
                <p className="font-compact font-normal text-sm text-gray-500 mt-0.5 leading-snug">
                  Каждый разговор записывается и расшифровывается автоматически
                </p>
              </div>
            </div>
          </div>
        </div>

        <BottomNav/>
      </div>
    </div>
  )
}
