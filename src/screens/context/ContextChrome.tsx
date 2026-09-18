import { Home, Mic, Search, ArrowLeft, ChevronRight, Phone, MessageCircle, Eye, Trash2 } from 'lucide-react'

// ─── Отдельное приложение «Мой Контекст» ──────────────────────────────────────
// Контекст вынесен из Мой МТС в своё приложение. Главный экран — лента звонков
// (CallsToBe в режиме app="context"), здесь — то, чего в Мой МТС не было:
// свой таббар с диктофоном по центру и свои настройки.

export type ContextTab = 'home' | 'search'

// Диктофон — главное действие приложения, поэтому крупная кнопка ровно по
// центру. По краям — «Главная» и «Поиск»; контакты и настройки живут в шапке.
export function ContextTabBar({ active, onTab, onRecord }: {
  active: ContextTab; onTab: (t: ContextTab) => void; onRecord: () => void
}) {
  const Item = ({ tab, label, Icon }: { tab: ContextTab; label: string; Icon: typeof Home }) => {
    const on = active === tab
    return (
      <button onClick={() => onTab(tab)}
        className="flex-1 flex flex-col items-center gap-0.5 pt-2 pb-1.5 active:opacity-60">
        <Icon size={22} strokeWidth={on ? 2.4 : 1.7} style={{ color: on ? '#1D2023' : '#8D969F' }}/>
        <span className="font-compact text-[11px] font-medium" style={{ color: on ? '#1D2023' : '#8D969F' }}>{label}</span>
      </button>
    )
  }

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app z-50 bg-white"
      style={{ borderTop: '1px solid #F2F2F7', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="relative flex items-stretch">
        <div className="flex-1 flex"><Item tab="home" label="Главная" Icon={Home}/></div>
        <div style={{ width: 84 }} className="shrink-0"/>
        <div className="flex-1 flex"><Item tab="search" label="Поиск" Icon={Search}/></div>

        {/* Диктофон — приподнят над баром, подпись на одной линии с остальными */}
        <button onClick={onRecord}
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center active:scale-95 transition-transform"
          style={{ bottom: 6 }}>
          <span className="rounded-full flex items-center justify-center"
            style={{ width: 52, height: 52, background: '#E30611', boxShadow: '0 5px 14px rgba(227,6,17,0.32), 0 0 0 4px white' }}>
            <Mic size={22} strokeWidth={2.2} style={{ color: 'white' }}/>
          </span>
          <span className="font-compact text-[11px] font-medium mt-1" style={{ color: '#1D2023' }}>Диктофон</span>
        </button>
      </div>
    </nav>
  )
}

// ─── Настройки ────────────────────────────────────────────────────────────────
// Первая версия: источники контекста и приватность. Настройки услуг МТС
// (Секретарь, Запись) живут в Мой МТС и сюда не переезжают.

function Row({ icon, iconBg, title, sub, right }: {
  icon: React.ReactNode; iconBg: string; title: string; sub?: string; right?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: iconBg }}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="font-compact text-[15px]" style={{ color: '#1D2023' }}>{title}</p>
        {sub && <p className="font-compact text-[12px] leading-snug" style={{ color: '#8D969F' }}>{sub}</p>}
      </div>
      {right ?? <ChevronRight size={16} style={{ color: '#C7C7CC' }}/>}
    </div>
  )
}

function Status({ on, text }: { on: boolean; text: string }) {
  return (
    <span className="font-compact text-[13px] font-semibold shrink-0" style={{ color: on ? '#15803D' : '#0070E5' }}>{text}</span>
  )
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="font-compact text-[11px] font-semibold uppercase tracking-wide px-1 mb-1.5" style={{ color: '#8D969F' }}>{label}</p>
      <div className="bg-white rounded-2xl overflow-hidden divide-y divide-gray-100" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>
        {children}
      </div>
    </div>
  )
}

export function ContextSettings({ onMessenger, onBack }: { onMessenger: () => void; onBack: () => void }) {
  return (
    <div className="px-4 pt-12 pb-10">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center shrink-0 -ml-2 active:opacity-60">
          <ArrowLeft size={22} strokeWidth={2} style={{ color: '#1D2023' }}/>
        </button>
        <h1 className="font-sans font-black text-xl" style={{ color: '#1D2023' }}>Настройки</h1>
      </div>

      <Group label="Источники контекста">
        <Row icon={<Phone size={17} strokeWidth={2} style={{ color: '#5C6570' }}/>} iconBg="#F2F2F7"
          title="Звонки" sub="Интеллектуальная запись и Секретарь" right={<Status on text="Подключено"/>}/>
        <Row icon={<Mic size={17} strokeWidth={2} style={{ color: '#6D28D9' }}/>} iconBg="#EDE9FE"
          title="Голосовые заметки" sub="Осталось 7 из 10 в этом месяце" right={<Status on text="Включено"/>}/>
        <button onClick={onMessenger} className="w-full text-left active:bg-gray-50">
          <Row icon={<MessageCircle size={17} strokeWidth={2} style={{ color: '#0E7490' }}/>} iconBg="#CFFAFE"
            title="Мессенджер" sub="Пересылка сообщений боту" right={<Status on={false} text="Подключить"/>}/>
        </button>
      </Group>

      <Group label="Приватность">
        <Row icon={<Eye size={17} strokeWidth={2} style={{ color: '#5C6570' }}/>} iconBg="#F2F2F7"
          title="Что мы о вас знаем" sub="Всё, что лежит в контексте, с источниками"/>
        <Row icon={<Trash2 size={17} strokeWidth={2} style={{ color: '#E30611' }}/>} iconBg="#FDECEC"
          title="Удалить контекст" sub="По контакту, по источнику или целиком"/>
      </Group>

      <p className="font-compact text-[12px] text-center px-6" style={{ color: '#8D969F' }}>
        Услуги звонков — Секретарь, Запись, Защитник — настраиваются в приложении Мой МТС
      </p>
    </div>
  )
}
