import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Mic, Shield, MessageSquare, Star, BookMarked, ListVideo } from 'lucide-react'
import { BottomNav } from '../components/layout/BottomNav'

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

function CatalogRow({
  icon: Icon,
  iconBg,
  label,
  sub,
  badge,
}: {
  icon: React.ElementType
  iconBg: string
  label: string
  sub: string
  badge?: string
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
        <div className="flex items-center gap-2">
          <p className="font-sans font-bold text-sm text-gray-900">{label}</p>
          {badge && (
            <span className="text-[10px] font-compact font-bold px-1.5 py-0.5 rounded-full text-white"
              style={{ background: 'linear-gradient(135deg, #9B59B6, #E91E8C)' }}>
              {badge}
            </span>
          )}
        </div>
        <p className="font-compact font-normal text-xs text-gray-400 mt-0.5">{sub}</p>
      </div>
      <ChevronRight size={18} className="text-gray-300 shrink-0" />
    </button>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-24 flex flex-col gap-6 pt-1">

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

          {/* Секретарь */}
          <Section title="Секретарь">
            <CatalogRow
              icon={Mic}
              iconBg="linear-gradient(135deg, #2C2C2E, #48484A)"
              label="МТС Секретарь"
              sub="Запись и расшифровка звонков"
              badge="NEW"
            />
            <CatalogRow
              icon={MessageSquare}
              iconBg="linear-gradient(135deg, #4A90D9, #7B68EE)"
              label="Звонок в чат"
              sub="Отвечайте текстом на входящие"
            />
          </Section>

          {/* Безопасность */}
          <Section title="Безопасность">
            <CatalogRow
              icon={Shield}
              iconBg="linear-gradient(135deg, #E30611, #FF6B35)"
              label="Защитник"
              sub="Блокировка спама и мошенников"
            />
            <CatalogRow
              icon={Star}
              iconBg="linear-gradient(135deg, #FF9800, #F44336)"
              label="Определитель номера"
              sub="Узнайте, кто звонит"
            />
          </Section>

          {/* Интеллектуальная запись */}
          <Section title="Интеллектуальная запись">
            <CatalogRow
              icon={BookMarked}
              iconBg="linear-gradient(135deg, #4A90D9, #7B68EE)"
              label="Базовая запись"
              sub="Сохранённые записи звонков"
            />
            <CatalogRow
              icon={ListVideo}
              iconBg="linear-gradient(135deg, #2C2C2E, #48484A)"
              label="Запись PRO"
              sub="Все записи, фильтры и настройки"
            />
          </Section>

        </div>

        <BottomNav />
      </div>
    </div>
  )
}
