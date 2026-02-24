import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { BottomNav } from '../components/layout/BottomNav'
import { Toggle } from '../components/ui/Toggle'

function StorageBar({ used, total, color }: { used: number; total: number; color: string }) {
  const pct = Math.min((used / total) * 100, 100)
  return (
    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl px-5 pt-5 pb-2 mx-4" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-sans font-black text-xl text-gray-900">{title}</h2>
        <button className="font-compact font-medium text-sm text-blue-500">Управлять</button>
      </div>
      {children}
    </div>
  )
}

function ToggleRow({
  title,
  subtitle,
  defaultEnabled = false,
  badge,
}: {
  title: string
  subtitle?: string
  defaultEnabled?: boolean
  badge?: React.ReactNode
}) {
  const [enabled, setEnabled] = useState(defaultEnabled)
  return (
    <div className="flex items-start gap-4 py-3.5">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="font-compact font-normal text-base text-gray-900">{title}</p>
          {badge}
        </div>
        {subtitle && (
          <p className="font-compact font-normal text-sm text-gray-400 mt-0.5 leading-snug">{subtitle}</p>
        )}
      </div>
      <div className="shrink-0 mt-0.5">
        <Toggle enabled={enabled} onChange={setEnabled} />
      </div>
    </div>
  )
}

function ArrowRow({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <button className="w-full flex items-center gap-4 py-3.5 text-left active:bg-gray-50 rounded-xl transition-colors">
      <div className="flex-1 min-w-0">
        <p className="font-compact font-normal text-base text-gray-900">{title}</p>
        {subtitle && (
          <p className="font-compact font-normal text-sm text-gray-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      <ChevronRight size={18} className="text-gray-300 shrink-0" />
    </button>
  )
}

function Divider() {
  return <div className="border-t border-gray-100" />
}

function SparkleBadge() {
  return <span style={{ fontSize: 16, color: '#A855F7' }}>✦</span>
}

export default function CallSettings() {
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
            Настройки
          </h1>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-24 flex flex-col gap-4 pt-1">

          {/* Запись */}
          <Section title="Запись">
            <ToggleRow
              title="Автозапись звонков"
              subtitle="Запись всех разговоров"
              defaultEnabled={true}
            />
            <Divider />
            <ArrowRow title="Сохранять запись" subtitle="На устройстве" />

            <div className="mt-2 mb-3">
              <p className="font-compact font-bold text-xs text-gray-400 uppercase tracking-wider mb-3">
                Использование памяти
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-100 rounded-2xl p-4">
                  <p className="font-compact font-semibold text-sm text-gray-900 mb-3">Облако</p>
                  <StorageBar used={2.82} total={8} color="#4A90D9" />
                  <p className="font-compact font-normal text-sm text-gray-500 mt-2">2,82 ГБ / 8 ГБ</p>
                </div>
                <div className="bg-gray-100 rounded-2xl p-4">
                  <p className="font-compact font-semibold text-sm text-gray-900 mb-3">Устройство</p>
                  <StorageBar used={78.2} total={127} color="#E91E8C" />
                  <p className="font-compact font-normal text-sm text-gray-500 mt-2">78,2 ГБ / 127 ГБ</p>
                </div>
              </div>
            </div>
          </Section>

          {/* Секретарь */}
          <Section title="Секретарь">
            <ToggleRow
              title="Звонок в чат"
              subtitle="Отвечайте на входящие текстом, а Секретарь озвучит ваши сообщения"
              defaultEnabled={true}
              badge={<SparkleBadge />}
            />
            <Divider />
            <ArrowRow title="Уведомления" subtitle="Пуш и СМС" />
          </Section>

          {/* Секретарь в звонке */}
          <Section title="Секретарь в звонке">
            <ToggleRow
              title="Отвечать на звонки"
              subtitle="Секретарь будет отвечать вместо вас"
              defaultEnabled={false}
            />
            <Divider />
            <ArrowRow title="Сценарии ответа" subtitle="Настройте поведение секретаря" />
            <Divider />
            <ArrowRow title="Задержка ответа" subtitle="15 секунд" />
          </Section>

        </div>

        <BottomNav />
      </div>
    </div>
  )
}
