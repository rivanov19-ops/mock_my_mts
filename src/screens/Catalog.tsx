import { ChevronRight, Phone, Heart, ArrowRight, Cpu, UserCheck, Wifi, Satellite, Music, Tv2, Shield, PhoneCall } from 'lucide-react'
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

          {/* Отдых и развлечения */}
          <div className="px-4 flex flex-col gap-3">
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

          {/* Полезное от МТС */}
          <div className="px-4 flex flex-col gap-3 pb-2">
            <h2 className="font-sans font-black text-xl text-gray-900">Полезное от МТС</h2>

            {/* Сервисы VoiceTech — широкая карточка */}
            <div className="bg-gray-100 rounded-2xl p-4 flex items-center justify-between overflow-hidden relative border border-gray-200" style={{ minHeight: 100 }}>
              <div>
                <p className="font-sans font-black text-base text-gray-900 leading-snug">Сервисы VoiceTech</p>
                <p className="font-compact font-normal text-xs text-gray-500 mt-0.5">Сделают каждый звонок удобнее</p>
              </div>
              <span className="text-5xl select-none">🎙️</span>
            </div>

            {/* Секретарь+ — широкая карточка */}
            <div className="bg-gray-100 rounded-2xl p-4 flex items-center justify-between overflow-hidden relative border border-gray-200" style={{ minHeight: 100 }}>
              <div>
                <p className="font-sans font-black text-base text-gray-900 leading-snug">Секретарь+</p>
                <p className="font-compact font-normal text-xs text-gray-500 mt-0.5">Ответит сам, если занят, и пришлёт запись после каждого звонка</p>
              </div>
              <span className="text-5xl select-none">📋</span>
            </div>

            {/* Защитник и Интеллектуальная запись — список */}
            <div className="bg-white rounded-2xl overflow-hidden divide-y divide-gray-100 shadow-sm">
              <button className="w-full flex items-center gap-4 px-4 py-3.5 active:bg-gray-50 transition-colors">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-red-600">
                  <Shield size={24} color="white" strokeWidth={1.8} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-sans font-bold text-sm text-gray-900">Защитник</p>
                  <p className="font-compact font-normal text-xs text-gray-400 mt-0.5">Умная защита от спам-звонков</p>
                </div>
                <ChevronRight size={18} className="text-gray-300 shrink-0" />
              </button>

              <button className="w-full flex items-center gap-4 px-4 py-3.5 active:bg-gray-50 transition-colors">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-gray-200">
                  <PhoneCall size={24} color="#555" strokeWidth={1.8} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-sans font-bold text-sm text-gray-900">Интеллектуальная запись</p>
                  <p className="font-compact font-normal text-xs text-gray-400 mt-0.5">Автоматическая запись разговоров</p>
                </div>
                <ChevronRight size={18} className="text-gray-300 shrink-0" />
              </button>
            </div>
          </div>

        </div>

        <BottomNav />
      </div>
    </div>
  )
}
