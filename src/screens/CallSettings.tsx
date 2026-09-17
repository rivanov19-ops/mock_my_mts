import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronRight, X } from 'lucide-react'
import { BottomNav } from '../components/layout/BottomNav'

// ─── Sub-components ───────────────────────────────────────────────────────────

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className="relative shrink-0 transition-colors duration-200"
      style={{
        width: 51, height: 31, borderRadius: 15.5,
        background: enabled ? '#34C759' : '#D1D5DB',
      }}
    >
      <div
        className="absolute top-[2px] bg-white rounded-full transition-all duration-200"
        style={{
          width: 27, height: 27,
          left: enabled ? 22 : 2,
          boxShadow: '0 2px 4px rgba(0,0,0,0.22)',
        }}
      />
    </button>
  )
}

function SparkleBadge() {
  return <span style={{ fontSize: 15, color: '#A855F7', lineHeight: 1 }}>✦</span>
}

function OffBadge() {
  return (
    <span
      className="font-compact text-[12px] font-semibold px-1.5 py-[2px] rounded-md shrink-0"
      style={{ color: '#E30611', border: '1px solid #E30611' }}
    >
      Выкл
    </span>
  )
}

function Divider() {
  return <div className="h-px bg-gray-100" />
}

function ToggleRow({
  title, subtitle, defaultOn = false, badge,
}: {
  title: string; subtitle?: string; defaultOn?: boolean; badge?: React.ReactNode
}) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div className="flex items-center gap-3 py-3.5">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="font-compact text-[16px] text-gray-900">{title}</p>
          {badge}
        </div>
        {subtitle && (
          <p className="font-compact text-[14px] leading-snug mt-0.5" style={{ color: '#8D969F' }}>{subtitle}</p>
        )}
      </div>
      <Toggle enabled={on} onChange={setOn} />
    </div>
  )
}

function ArrowRow({
  title, subtitle, leading, trailingBadge, onPress,
}: {
  title: string; subtitle?: string; leading?: React.ReactNode; trailingBadge?: React.ReactNode; onPress?: () => void
}) {
  return (
    <button onClick={onPress} className="w-full flex items-center gap-3 py-3.5 text-left active:bg-gray-50 transition-colors rounded-xl">
      {leading}
      <div className="flex-1 min-w-0">
        <p className="font-compact text-[16px] text-gray-900">{title}</p>
        {subtitle && (
          <p className="font-compact text-[14px] mt-0.5" style={{ color: '#8D969F' }}>{subtitle}</p>
        )}
      </div>
      {trailingBadge}
      <ChevronRight size={18} strokeWidth={2} style={{ color: '#C7CBD0' }} className="shrink-0" />
    </button>
  )
}

function InfoBox({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl px-4 py-3 my-1" style={{ background: '#F2F3F7' }}>
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: '#0070E5' }}
      >
        <span className="text-white font-sans font-black text-[13px] italic">i</span>
      </div>
      <p className="font-compact text-[14px] leading-snug flex-1" style={{ color: '#626C77' }}>{text}</p>
    </div>
  )
}

function Section({
  title, children,
}: {
  title: string; children?: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-3xl overflow-hidden mx-4" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
      <div className="flex items-center justify-between px-5 pt-5 pb-1">
        <h2 className="font-sans font-black text-[20px]" style={{ color: '#1D2023' }}>{title}</h2>
        <button className="font-compact text-[15px] font-medium" style={{ color: '#0070E5' }}>Управлять</button>
      </div>
      {children && <div className="px-5 pb-3">{children}</div>}
      {!children && <div className="pb-3" />}
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function CallSettings() {
  const navigate = useNavigate()
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactEmail, setContactEmail] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactCategory, setContactCategory] = useState('')
  const [contactText, setContactText] = useState('')
  const [contactSent, setContactSent] = useState(false)

  const handleContactClose = () => {
    setShowContactModal(false)
    setContactSent(false)
    setContactEmail('')
    setContactName('')
    setContactCategory('')
    setContactText('')
  }

  const handleContactSubmit = async () => {
    if (!contactEmail || !contactCategory || !contactText) return
    await fetch('https://formspree.io/f/mbdbwdkl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        email: contactEmail,
        name: contactName || '—',
        topic: contactCategory === 'idea' ? 'Идеи и пожелания' : 'Сообщить о проблеме',
        message: contactText,
      }),
    })
    setContactSent(true)
  }

  return (
    <div className="min-h-screen flex justify-center" style={{ background: '#F2F3F7' }}>
      <div className="w-full max-w-app flex flex-col min-h-screen relative">

        {/* Header */}
        <div className="px-4 pt-12 pb-4 bg-white shrink-0" style={{ borderBottom: '1px solid #F2F2F7' }}>
          <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center shrink-0">
              <ArrowLeft size={22} strokeWidth={2} style={{ color: '#1D2023' }} />
            </button>
            <h1 className="font-sans font-bold text-[17px] flex-1 text-center pr-9" style={{ color: '#1D2023' }}>
              Настройки
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-28 pt-5 flex flex-col gap-4">

          {/* Звонки */}
          <Section title="Звонки">
            <ArrowRow
              title="Приём входящих"
              subtitle="Все звонки через Мой МТС"
              trailingBadge={<OffBadge />}
            />
            <Divider />
            <ToggleRow
              title="Фоновые звуки"
              subtitle="Шум леса или звуки города во время звонка"
            />
          </Section>

          {/* Секретарь */}
          <Section title="Секретарь">
            <ToggleRow
              title="Звонок в чат"
              subtitle="Отвечайте на входящие текстом, а Секретарь озвучит ваши сообщения"
              badge={<SparkleBadge />}
            />
            <Divider />
            <ToggleRow
              title="Уведомлять о прочтении"
              subtitle="Звонивший увидит, что вы прослушали его сообщение"
            />
            <Divider />
            <ArrowRow title="Уведомления" subtitle="Пуш и СМС" />
            <Divider />
            <ArrowRow title="Ответы Секретаря" onPress={() => navigate('/calls/secretary-answers')} />
          </Section>

          {/* Защитник */}
          <Section title="Защитник" />

          {/* Запись */}
          <Section title="Запись">
            <InfoBox text="Записи разговоров сохраняются в персональном облачном хранилище МТС на 90 дней" />
          </Section>

          {/* Ассистент в звонке */}
          <Section title="Ассистент в звонке" />

          {/* Вопросы о звонках */}
          <div className="bg-white rounded-3xl overflow-hidden mx-4" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
            <div className="px-5">
              <ArrowRow
                title="Вопросы о звонках"
                leading={
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: '#C7CBD0' }}
                  >
                    <span className="text-white font-sans font-black text-[13px]">?</span>
                  </div>
                }
              />
            </div>
          </div>

          {/* Связаться с VoiceTech */}
          <div className="mx-4">
            <button
              onClick={() => setShowContactModal(true)}
              className="block w-full rounded-3xl py-4 bg-white active:bg-gray-50 transition-colors text-center"
              style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}
            >
              <span
                className="font-sans font-black text-[13px] tracking-[0.08em] uppercase"
                style={{ color: '#0070E5' }}
              >
                Связаться с VoiceTech
              </span>
            </button>
          </div>

          {/* Модалка "Связаться с командой" */}
          {showContactModal && (
            <div
              className="fixed inset-0 z-50 flex items-end justify-center"
              style={{ background: 'rgba(0,0,0,0.4)' }}
              onClick={() => setShowContactModal(false)}
            >
              <div
                className="w-full max-w-app bg-white rounded-t-3xl px-5 pt-5 pb-10"
                onClick={e => e.stopPropagation()}
              >
                {/* Крестик */}
                <div className="flex justify-end mb-2">
                  <button
                    onClick={handleContactClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full"
                    style={{ background: '#F2F3F7' }}
                  >
                    <X size={16} strokeWidth={2.5} style={{ color: '#1D2023' }} />
                  </button>
                </div>

                {contactSent ? (
                  /* Экран подтверждения */
                  <div className="flex flex-col items-center py-6">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                      style={{ background: '#E8F5E9' }}
                    >
                      <span style={{ fontSize: 28 }}>✓</span>
                    </div>
                    <p className="font-sans font-bold text-[17px] mb-1" style={{ color: '#1D2023' }}>
                      Сообщение отправлено
                    </p>
                    <p className="font-sans text-[13px] text-center" style={{ color: '#8D969F' }}>
                      Мы ответим на {contactEmail}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Header */}
                    <div className="mb-5">
                      <p className="font-sans font-bold text-[17px]" style={{ color: '#1D2023' }}>
                        Свяжитесь с командой
                      </p>
                      <p className="font-sans text-[13px] mt-0.5" style={{ color: '#8D969F' }}>
                        в течение суток ответит живой человек
                      </p>
                    </div>

                    {/* Email */}
                    <div className="mb-3">
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={e => setContactEmail(e.target.value)}
                        placeholder="e-mail для ответа"
                        className="w-full rounded-2xl px-4 py-3 font-sans text-[15px]"
                        style={{ background: '#F2F3F7', color: '#1D2023', border: 'none', outline: 'none' }}
                      />
                    </div>

                    {/* Имя (необязательное) */}
                    <div className="mb-3">
                      <input
                        type="text"
                        value={contactName}
                        onChange={e => setContactName(e.target.value)}
                        placeholder="Ваше имя"
                        className="w-full rounded-2xl px-4 py-3 font-sans text-[15px]"
                        style={{ background: '#F2F3F7', color: '#1D2023', border: 'none', outline: 'none' }}
                      />
                    </div>

                    {/* Дропдаун */}
                    <div className="mb-3">
                      <select
                        value={contactCategory}
                        onChange={e => setContactCategory(e.target.value)}
                        className="w-full rounded-2xl px-4 py-3 font-sans text-[15px] appearance-none"
                        style={{
                          background: '#F2F3F7',
                          color: contactCategory ? '#1D2023' : '#8D969F',
                          border: 'none',
                          outline: 'none',
                        }}
                      >
                        <option value="" disabled>Выберите тему</option>
                        <option value="idea">Идеи и пожелания</option>
                        <option value="problem">Сообщить о проблеме</option>
                      </select>
                    </div>

                    {/* Текстовое поле */}
                    <div className="mb-4">
                      <textarea
                        value={contactText}
                        onChange={e => setContactText(e.target.value)}
                        placeholder="Опишите подробнее..."
                        rows={4}
                        className="w-full rounded-2xl px-4 py-3 font-sans text-[15px] resize-none"
                        style={{ background: '#F2F3F7', color: '#1D2023', border: 'none', outline: 'none' }}
                      />
                    </div>

                    {/* Кнопка отправить */}
                    <button
                      onClick={handleContactSubmit}
                      disabled={!contactEmail || !contactCategory || !contactText}
                      className="w-full rounded-2xl py-4 font-sans font-bold text-[15px] text-white transition-opacity"
                      style={{ background: '#0070E5', opacity: contactEmail && contactCategory && contactText ? 1 : 0.4 }}
                    >
                      Отправить
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Настройки Мой МТС */}
          <div className="mx-4">
            <button
              className="w-full rounded-3xl py-4 bg-white active:bg-gray-50 transition-colors"
              style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}
            >
              <span
                className="font-sans font-black text-[13px] tracking-[0.08em] uppercase"
                style={{ color: '#8D969F' }}
              >
                Настройки Мой МТС
              </span>
            </button>
          </div>

        </div>

        <BottomNav />
      </div>
    </div>
  )
}
