import { ChevronRight, Phone, Heart, ArrowRight, Cpu, UserCheck, Wifi, Satellite, Music, Tv2, Gamepad2, Percent } from 'lucide-react'
import { BottomNav } from '../components/layout/BottomNav'
import mock from '../core/data/mock'

// ─── Section row item ────────────────────────────────────────────────────────

function CatalogRow({
  icon: Icon,
  iconBg,
  label,
  sub,
}: {
  icon: React.ElementType
  iconBg: string
  label: string
  sub: string
}) {
  return (
    <button className="w-full flex items-center gap-4 px-4 py-3.5 bg-white active:bg-gray-50 transition-colors">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: iconBg }}
      >
        <Icon size={24} color="white" strokeWidth={1.8} />
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="font-sans font-bold text-sm text-gray-900">{label}</p>
        <p className="font-compact font-normal text-xs text-gray-400 mt-0.5">{sub}</p>
      </div>
      <ChevronRight size={18} className="text-gray-300 shrink-0" />
    </button>
  )
}

// ─── Section block ────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-sans font-black text-xl text-gray-900 px-4 mb-3">{title}</h2>
      <div className="bg-white rounded-2xl mx-4 overflow-hidden divide-y divide-gray-100 shadow-sm">
        {children}
      </div>
    </div>
  )
}

// ─── Catalog ─────────────────────────────────────────────────────────────────

export default function Catalog() {
  return (
    <div className="min-h-screen bg-mts-surface flex justify-center">
      <div className="w-full max-w-app flex flex-col min-h-screen relative">

        {/* ── Top bar ── */}
        <div className="px-4 pt-12 pb-4 bg-mts-surface flex items-start justify-between">
          <div>
            <h1 className="font-sans font-black text-2xl text-gray-900 leading-tight">Каталог</h1>
            <p className="font-compact font-normal text-sm text-gray-400">{mock.user.name}</p>
          </div>
          <button
            className="h-9 px-3 rounded-full flex items-center gap-1.5 mt-1 shrink-0"
            style={{ background: 'linear-gradient(135deg, #9B59B6, #E91E8C)' }}
          >
            <span className="text-white font-sans font-bold text-xs">✦</span>
            <span className="text-white font-sans font-bold text-xs uppercase tracking-wide">CASHBACK</span>
          </button>
        </div>

        {/* ── Scrollable ── */}
        <div className="flex-1 overflow-y-auto pb-24 flex flex-col gap-6">

          {/* Video banner */}
          <div className="mx-4">
            <div className="rounded-2xl overflow-hidden shadow-sm bg-black" style={{ aspectRatio: '16/9' }}>
              <video
                src="/promo.mov"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Promo banner */}
          <div className="mx-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="font-sans font-black text-base text-gray-900 mb-3 leading-snug">
                Ежедневные скидки,<br />игры и подарки от МТС
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  {/* 3 mini icons */}
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #9B59B6, #5B8DEF)' }}>
                    <span className="text-white text-xs font-bold">✦</span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-blue-400 flex items-center justify-center">
                    <Gamepad2 size={16} color="white" strokeWidth={2} />
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-pink-500 flex items-center justify-center">
                    <Percent size={14} color="white" strokeWidth={2.5} />
                  </div>
                </div>
                <p className="font-compact font-normal text-xs text-gray-500 flex-1 leading-snug">
                  заходите и выбирайте то,<br />что вам нужно
                </p>
                <ChevronRight size={18} className="text-gray-300 shrink-0" />
              </div>
            </div>
          </div>

          {/* Мобильная связь */}
          <Section title="Мобильная связь">
            <CatalogRow icon={Phone}      iconBg="#2196F3" label="Выбрать тариф"         sub="И подключиться к МТС" />
            <CatalogRow icon={Heart}      iconBg="#2196F3" label="Заказать новую SIM-карту" sub="Можно с красивым номером" />
            <CatalogRow icon={ArrowRight} iconBg="#2196F3" label="Перейти в МТС"         sub="Сохраните номер при смене оператора" />
            <CatalogRow icon={Cpu}        iconBg="#2196F3" label="Оформить eSIM"         sub="Цифровая карта без пластика" />
            <CatalogRow icon={UserCheck}  iconBg="#2196F3" label="Активировать SIM-карту" sub="Подписать договор онлайн" />
          </Section>

          {/* Связь дома */}
          <Section title="Связь дома">
            <CatalogRow icon={Wifi}      iconBg="#8B44AC" label="Домашний интернет и ТВ" sub="Тарифы и подключение" />
            <CatalogRow icon={Satellite} iconBg="#8B44AC" label="Спутниковое ТВ"         sub="Телевидение без кабеля" />
          </Section>

          {/* Подписка МТС Premium */}
          <div className="mx-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, #9B59B6, #5B8DEF)' }}
                >
                  <span className="text-white font-bold text-lg">✦</span>
                </div>
                <div>
                  <p className="font-sans font-black text-base text-gray-900 leading-tight">
                    Подписка МТС Premium
                  </p>
                  <p className="font-compact font-normal text-xs text-gray-400 mt-0.5">
                    Сервисы МТС для вас и ещё 3 близких
                  </p>
                </div>
              </div>

              {/* Service icons scroll */}
              <div className="flex gap-4 overflow-x-auto pb-1 mb-5" style={{ scrollbarWidth: 'none' }}>
                {[
                  { label: 'Бесплатный старт\nпоездки', bg: '#4A90D9', icon: '🙂' },
                  { label: 'KION',       bg: 'linear-gradient(135deg, #2C1654, #E30611)', text: 'KION' },
                  { label: 'МТС Музыка', bg: '#E30611', iconEl: <Music size={22} color="white" strokeWidth={2} /> },
                  { label: 'Строки',     bg: '#FF6B35', iconEl: <Tv2 size={22} color="white" strokeWidth={2} /> },
                ].map(({ label, bg, icon, text, iconEl }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 shrink-0">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ background: bg }}
                    >
                      {icon  && <span className="text-2xl">{icon}</span>}
                      {text  && <span className="text-white font-bold text-sm">{text}</span>}
                      {iconEl}
                    </div>
                    <p className="font-compact font-normal text-[10px] text-gray-500 text-center whitespace-pre-line leading-tight max-w-[68px]">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                className="w-full rounded-full py-4 font-sans font-bold text-sm text-white uppercase tracking-widest"
                style={{ background: 'linear-gradient(135deg, #9B59B6 0%, #5B8DEF 100%)' }}
              >
                Подробнее о подписке
              </button>
            </div>
          </div>

          {/* Отдых и развлечения */}
          <div className="px-4 flex flex-col gap-3 pb-2">
            <h2 className="font-sans font-black text-xl text-gray-900">Отдых и развлечения с МТС</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { title: 'КИОН',        sub: 'Кино, сериалы и ТВ',  bg: '#E30611',  icon: <Tv2 size={28} color="white" strokeWidth={1.5} /> },
                { title: 'КИОН Музыка', sub: 'Треки и подкасты',     bg: '#E30611',  icon: <Music size={28} color="white" strokeWidth={1.5} /> },
                { title: 'МТС Live',    sub: 'Концерты и события',   bg: '#FF6B35',  icon: <span className="text-2xl">🎤</span> },
                { title: 'Строки',      sub: 'Книги и аудиокниги',   bg: '#9B59B6',  icon: <span className="text-2xl">📖</span> },
              ].map(({ title, sub, bg, icon }) => (
                <div
                  key={title}
                  className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: bg }}
                  >
                    {icon}
                  </div>
                  <div>
                    <p className="font-sans font-bold text-sm text-gray-900">{title}</p>
                    <p className="font-compact font-normal text-xs text-gray-400 mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        <BottomNav />
      </div>
    </div>
  )
}
