# PRD: Mock Web App — Мой МТС (My MTS)

## Overview

A pixel-faithful, progressive mock of the **Мой МТС** (My MTS) telecom self-service app built as a web application. The goal is to replicate the UI/UX of the iOS app screen-by-screen, starting from the very first screen (splash → login) and incrementally adding every section until the full app experience is reproduced.

**Original app:** Мой МТС by Mobile TeleSystems PJSC
**Platform target:** Web (desktop + mobile-responsive, portrait-primary)
**Language:** Russian (ru-RU locale)
**Build approach:** Step-by-step, one screen at a time, demo-ready after each step

---

## Design Principles

| Principle | Detail |
|-----------|--------|
| Mobile-first | Max content width 390 px (iPhone 14 baseline), centered on desktop |
| Pixel-faithful | Match MTS brand colors, typography, spacing, and component shapes |
| Mock data only | All data is hard-coded JSON; no real API calls |
| Progressive | Each step ships an independently runnable, testable screen |
| Stateless friendly | React 18 + Zustand + local state; no backend required |

### Brand Tokens

```
Primary Red   #E30611
Dark Red      #B3000C
White         #FFFFFF
Light Grey    #F5F5F5
Mid Grey      #9E9E9E
Dark Text     #1A1A1A
Success Green #4CAF50
Warning Amber #FF9800
```

Typography: **MTS Sans** (fallback: `"Helvetica Neue", Arial, sans-serif`)

### Brand Tokens as Tailwind Theme

```ts
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      mts: {
        red:        '#E30611',
        'red-dark': '#B3000C',
        surface:    '#F5F5F5',
        muted:      '#9E9E9E',
        success:    '#4CAF50',
        warning:    '#FF9800',
      }
    },
    borderRadius: {
      card: '16px',
      btn:  '12px',
    }
  }
}
```

> Tailwind token names map 1:1 to NativeWind — migrating to React Native requires no color/spacing changes.

---

## Step-by-Step Implementation Plan

---

### Step 0 — App Scaffold

**Goal:** Bootstrap a Vite + React + TypeScript project with Tailwind, React Router, and Zustand wired up. A placeholder screen confirms everything runs before any real screen is built.

#### Bootstrap Commands

```bash
npm create vite@latest mock_my_mts -- --template react-ts
cd mock_my_mts
npm install react-router-dom zustand framer-motion lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm run dev   # → http://localhost:5173
```

#### Directory Structure

```
mock_my_mts/
├── index.html
├── tailwind.config.ts        # Brand tokens as Tailwind theme extension
├── vite.config.ts
├── tsconfig.json
├── package.json
└── src/
    ├── main.tsx               # Vite entry — ReactDOM.createRoot
    ├── App.tsx                # React Router <Routes> setup
    ├── index.css              # Tailwind directives + MTS Sans font
    │
    ├── core/                  # ← 100% portable to React Native, zero rewrites
    │   ├── store/
    │   │   ├── accountStore.ts      # Zustand: balance, tariff, usage
    │   │   ├── servicesStore.ts     # Zustand: VAS toggles
    │   │   └── notificationsStore.ts
    │   ├── data/
    │   │   └── mock.ts              # Typed mock data (TS, not JSON)
    │   ├── hooks/
    │   │   ├── useBalance.ts
    │   │   ├── useOtpTimer.ts
    │   │   └── useSpeedTest.ts
    │   └── types/
    │       └── index.ts             # Shared TypeScript interfaces
    │
    ├── components/            # ← Primitive UI atoms, mostly portable
    │   ├── ui/
    │   │   ├── Button.tsx
    │   │   ├── Card.tsx
    │   │   ├── Toggle.tsx
    │   │   └── OtpInput.tsx
    │   └── layout/
    │       ├── Screen.tsx           # max-w-[390px] + safe-area wrapper
    │       ├── BottomNav.tsx
    │       └── TopBar.tsx
    │
    ├── screens/               # ← One file per PRD step
    │   └── Placeholder.tsx
    │
    └── assets/
        ├── logo.svg           # MTS red square + white МТС wordmark
        └── icons/
```

#### Key File Skeletons

**`src/main.tsx`**
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
```

**`src/App.tsx`**
```tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import Placeholder from './screens/Placeholder'
// screens added here one-by-one as steps are completed

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Placeholder />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
```

**`src/index.css`**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    font-family: "MTS Sans", "Helvetica Neue", Arial, sans-serif;
    background-color: #F5F5F5;
    -webkit-font-smoothing: antialiased;
  }
}
```

**`tailwind.config.ts`** (brand tokens)
```ts
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        mts: {
          red:        '#E30611',
          'red-dark': '#B3000C',
          surface:    '#F5F5F5',
          muted:      '#9E9E9E',
          success:    '#4CAF50',
          warning:    '#FF9800',
        }
      },
      borderRadius: { card: '16px', btn: '12px' },
      boxShadow:    { card: '0 2px 12px rgba(0,0,0,.08)' },
      maxWidth:     { app: '390px' },
    }
  }
}
```

**`src/core/store/accountStore.ts`** (Zustand slice — identical on RN)
```ts
import { create } from 'zustand'
import mock from '../data/mock'

interface AccountState {
  balance: number
  tariff: string
  topUp: (amount: number) => void
}

export const useAccountStore = create<AccountState>((set) => ({
  balance: mock.account.balance,
  tariff:  mock.account.tariff,
  topUp:   (amount) => set((s) => ({ balance: s.balance + amount })),
}))
```

**`src/screens/Placeholder.tsx`**
```tsx
import { useNavigate } from 'react-router-dom'
import { ReactComponent as Logo } from '../assets/logo.svg'

export default function Placeholder() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4 p-8 rounded-card shadow-card max-w-app w-full">
        <Logo className="w-20 h-20" />
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Мой МТС</h1>
        <p className="text-mts-success font-medium">Scaffold ready ✓</p>
        <button
          onClick={() => navigate('/splash')}
          className="text-mts-red underline text-sm"
        >
          → Перейти к Splash
        </button>
      </div>
    </div>
  )
}
```

#### Placeholder Screen

```
┌──────────────────────────┐
│   [MTS logo 80×80]       │
│   Мой МТС                │  h1
│   Scaffold ready ✓       │  green
│   [→ Перейти к Splash]   │  red link
└──────────────────────────┘
```

#### How to Run

```bash
npm run dev   # → http://localhost:5173
```

No other tooling required. HMR reloads the screen on every save.

#### Acceptance Criteria
- [ ] `npm run dev` opens with no console errors
- [ ] Placeholder card renders with MTS logo in brand red
- [ ] `bg-mts-red` Tailwind class resolves (confirms tailwind.config token wiring)
- [ ] `useAccountStore.getState().balance` returns `412.5` in browser console
- [ ] Clicking "→ Перейти к Splash" navigates to `/splash` (404 until Step 1, not a crash)
- [ ] TypeScript compiles with `npm run build` — zero type errors

---

### Step 1 — Splash Screen

**Goal:** Reproduce the animated launch screen shown while the app initializes.

#### Layout
- Full-screen white background (`#FFFFFF`)
- Center-aligned MTS logo (red square with white "МТС" wordmark, ~120 × 120 px)
- Subtle fade-in animation (0 → 1 opacity, 400 ms)
- Auto-advance to Step 2 after 1.8 s

#### Acceptance Criteria
- [ ] Logo renders at correct aspect ratio
- [ ] Fade-in animation plays on every load
- [ ] Redirects to Login screen automatically

---

### Step 2 — Login / Phone Number Entry

**Goal:** Reproduce the primary authentication entry point.

#### Layout
```
┌─────────────────────────────────────┐
│  ← (back, hidden on first open)     │
│                                     │
│  [MTS Logo — small, top-center]     │
│                                     │
│  Войдите в аккаунт МТС              │  h1
│  Введите номер телефона             │  subtitle
│                                     │
│  ┌───────────────────────────────┐  │
│  │ +7  │  (___) ___-__-__        │  │  phone input
│  └───────────────────────────────┘  │
│                                     │
│  [Продолжить]  ← primary CTA btn    │
│                                     │
│  ─────── или ────────               │
│                                     │
│  [Войти через Госуслуги]            │  secondary btn
│                                     │
│  Нет аккаунта? Зарегистрироваться   │  link
│                                     │
│  Политика конфиденциальности        │  footer link
└─────────────────────────────────────┘
```

#### Interactions
- Phone field: Russian mask `+7 (___) ___-__-__`; auto-focuses on mount
- "Продолжить" activates only when 11 digits entered; red when active
- On submit → navigate to Step 3 (OTP screen)
- "Войти через Госуслуги" → show "Coming soon" toast

#### Acceptance Criteria
- [ ] Phone mask formats in real time
- [ ] Button disabled/grey until valid number
- [ ] Button turns red (#E30611) when enabled
- [ ] Tap outside keyboard closes it (mobile)

---

### Step 3 — OTP Verification

**Goal:** 4-digit SMS code entry screen.

#### Layout
```
┌─────────────────────────────────────┐
│  ←                                  │
│                                     │
│  Введите код из СМС                 │  h1
│  Отправили на +7 (___) ___-__-__    │  subtitle (dynamic)
│                                     │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐               │  4 OTP boxes
│  │  │ │  │ │  │ │  │               │
│  └──┘ └──┘ └──┘ └──┘               │
│                                     │
│  Отправить код повторно (0:59)      │  countdown timer
│                                     │
│  Не получили СМС? Позвонить         │  link
└─────────────────────────────────────┘
```

#### Interactions
- Auto-advance focus box on each digit
- Hardcoded valid code: `1234` → advances to Step 4
- Any other code → shows inline error "Неверный код"
- Countdown 60 s → enables "Отправить повторно" link
- Back → returns to Step 2

#### Acceptance Criteria
- [ ] 4 boxes, auto-focus progression
- [ ] Code `1234` navigates to dashboard
- [ ] Wrong code shows error state (red boxes + message)
- [ ] Countdown timer works correctly

---

### Step 4 — Home / Dashboard

**Goal:** Main screen after login — balance overview and quick actions.

#### Layout
```
┌─────────────────────────────────────┐
│  [Avatar]  Привет, Алексей!   [🔔]  │  top bar
│                                     │
│  ┌───────────────────────────────┐  │
│  │  +7 (916) 123-45-67           │  │  account card
│  │  Тариф: Smart Maxi            │  │
│  │                               │  │
│  │  Баланс                       │  │
│  │  412,50 ₽                     │  │  large balance
│  │                               │  │
│  │  [Пополнить]   [Детализация]  │  │
│  └───────────────────────────────┘  │
│                                     │
│  Остатки                            │  section title
│  ┌──────┐ ┌──────┐ ┌──────┐        │
│  │ 📞   │ │ 💬   │ │ 🌐   │        │  usage pills
│  │ 87   │ │ ∞    │ │ 4.2  │        │
│  │ мин  │ │ СМС  │ │ ГБ   │        │
│  └──────┘ └──────┘ └──────┘        │
│                                     │
│  Быстрые действия                   │  section title
│  ┌──────┐ ┌──────┐ ┌──────┐        │
│  │[icon]│ │[icon]│ │[icon]│  ...   │  grid 2×3
│  │Тарифы│ │Услуги│ │Семья │        │
│  └──────┘ └──────┘ └──────┘        │
│                                     │
│  Рекомендуем                        │  promo banner carousel
│  ┌───────────────────────────────┐  │
│  │  [Banner image placeholder]   │  │
│  └───────────────────────────────┘  │
│                                     │
│  [🏠 Главная][💳 Оплата][👤 Профиль][☰ Ещё]  │  bottom nav
└─────────────────────────────────────┘
```

#### Mock Data (JSON)
```json
{
  "user": { "name": "Алексей", "phone": "+7 (916) 123-45-67" },
  "account": {
    "balance": 412.50,
    "tariff": "Smart Maxi",
    "minutes": { "used": 213, "total": 300 },
    "sms": { "unlimited": true },
    "data_gb": { "used": 9.8, "total": 14 }
  }
}
```

#### Acceptance Criteria
- [ ] Balance displays with ₽ symbol and 2 decimal places
- [ ] Usage pills show remaining (total − used)
- [ ] Quick actions grid is scrollable horizontally
- [ ] Promo banner auto-scrolls every 4 s
- [ ] Bottom navigation is sticky

---

### Step 5 — Expense History

**Goal:** 6-month spending history accessible from "Детализация".

#### Layout
- Header: "Расходы" + month selector tabs (Янв–Июн)
- Per-day expense list items: date | service name | amount (red for charges, green for top-ups)
- Monthly total summary card at top
- Empty state: "Нет операций за этот период"

#### Mock Data
6 months × ~8 transactions; mix of data charges, calls, top-ups.

#### Acceptance Criteria
- [ ] Month tabs filter the list
- [ ] Top-ups shown in green, charges in red
- [ ] Pull-to-refresh animation (no actual reload)

---

### Step 6 — Payment Screen

**Goal:** Top-up balance flow.

#### Layout
```
Пополнить баланс
[Amount input: ___  ₽]
Quick amounts: [100] [200] [300] [500]
Card on file:  **** 4242  [Change]
[Пополнить]  →  Success screen
```

#### Interactions
- Tapping quick amount fills input
- "Пополнить" → success modal with checkmark animation
- Success modal closes after 3 s; balance on dashboard updates (local state)

#### Acceptance Criteria
- [ ] Minimum amount validation: 10 ₽
- [ ] Success animation plays
- [ ] Dashboard balance increments by paid amount

---

### Step 7 — Tariff Management

**Goal:** View current tariff and browse available plans.

#### Layout
- Current tariff card (highlighted in red border)
- List of other tariffs (name, price/month, minutes, GB, SMS)
- Each tariff → detail sheet with "Подключить" CTA
- "Подключить" → confirmation modal → "Успешно подключено" toast

#### Mock Tariffs
```json
[
  { "name": "Smart Mini",  "price": 299,  "min": 100, "gb": 5,  "sms": 50 },
  { "name": "Smart",       "price": 499,  "min": 200, "gb": 10, "sms": "∞" },
  { "name": "Smart Maxi",  "price": 699,  "min": 300, "gb": 14, "sms": "∞" },
  { "name": "Smart Ultra", "price": 999,  "min": "∞", "gb": 30, "sms": "∞" }
]
```

---

### Step 8 — Services / Add-ons

**Goal:** Enable/disable value-added services.

#### Layout
- Section list with toggle switches
- Categories: Безопасность, Развлечения, Связь
- Each service: icon | name | description | price/mo | toggle

#### Mock Services
| Service | Price | Default |
|---------|-------|---------|
| Защитник (anti-fraud) | 0 ₽ | ON |
| Определитель номера | 0 ₽ | OFF |
| МТС Секретарь | 99 ₽/мес | OFF |
| Антивирус | 49 ₽/мес | OFF |

#### Acceptance Criteria
- [ ] Toggle switches animate on/off
- [ ] Monthly total recalculates as toggles change
- [ ] Paid service shows confirmation dialog before enabling

---

### Step 9 — Security Centre ("Защитник")

**Goal:** Dedicated security dashboard.

#### Layout
```
Защитник                          [Активен ✓]

Защита от мошенников
  AI-анализ звонков               [ON]
  Фильтрация спама                [ON]
  Страховка до 1,5 млн ₽

Ваши данные
  Утечки личных данных            [Проверить]
  Последняя проверка: сегодня     ✓ Всё в порядке

Статистика (last 30 days)
  Заблокировано звонков:  47
  Распознано мошенников:   3
```

---

### Step 10 — Family Group

**Goal:** Family account management screen.

#### Layout
- "Моя семья" header
- Member cards: avatar | name | phone | tariff | balance
- "Пригласить участника" CTA
- Shared discount banner: "Скидка 10% для всей семьи"
- Location dots on a simplified map placeholder

#### Mock Data
```json
[
  { "name": "Мария",  "phone": "+7 (916) 123-45-68", "tariff": "Smart", "balance": 200 },
  { "name": "Сергей", "phone": "+7 (916) 123-45-69", "tariff": "Smart Mini", "balance": 50 }
]
```

---

### Step 11 — Profile / Account Settings

**Goal:** User profile and settings screen.

#### Layout
- Avatar + name + phone (editable)
- Settings sections:
  - Личные данные (name, email, date of birth)
  - Уведомления (push toggles)
  - Безопасность (PIN, biometrics)
  - О приложении (version 6.60.0)
  - Выйти (red destructive button → back to Step 2)

---

### Step 12 — Speed Test

**Goal:** In-app network speed test screen.

#### Layout
- Circular gauge (0–300 Mbps)
- Download / Upload / Ping metrics
- "Начать тест" button
- Animated needle sweep for ~5 s → shows mock results:
  - Download: 48.3 Mbps
  - Upload: 12.1 Mbps
  - Ping: 24 ms

---

### Step 13 — Notifications Centre

**Goal:** Push notification history screen (bell icon on dashboard).

#### Layout
- Chronological list of notifications
- Unread shown with red dot
- Types: payment confirmation, security alerts, promo offers
- "Отметить все как прочитанные" action

---

### Step 14 — Search

**Goal:** Global in-app search.

#### Layout
- Full-screen search overlay
- Recent searches chips
- Live results filtered from mock data (services, tariffs, FAQs)
- Voice input button (placeholder UI only)

---

## Technical Architecture

### Tech Stack

| Layer | Library | Version | React Native equivalent |
|-------|---------|---------|------------------------|
| Build | Vite | 5.x | Metro (built into RN) |
| Framework | React | 18.x | React Native 0.73+ |
| Language | TypeScript | 5.x | Same |
| Routing | React Router | v6 | React Navigation 6 |
| State | Zustand | 4.x | Same — zero changes |
| Styling | Tailwind CSS | v3 | NativeWind v4 (same class names) |
| Animation | Framer Motion | 11.x | Reanimated 3 |
| Icons | Lucide React | latest | `lucide-react-native` |

### Architectural Layers

```
src/core/        ← Never imports DOM, React Router, or CSS
                    Fully portable to React Native as-is
                    Contains: Zustand stores, custom hooks, mock data, TypeScript types

src/components/  ← UI primitives using Tailwind classes
                    Portable with minor JSX swaps (div→View, p→Text) when going to RN

src/screens/     ← One file per PRD step, wired into React Router
                    Requires JSX rewrite for RN; logic stays in core/hooks
```

### React Native Migration Path

When the time comes, the migration is a layer swap — not a rewrite:

| Keep (0 changes) | Swap |
|-----------------|------|
| All of `src/core/` | React Router → React Navigation |
| Zustand stores | `className=` → NativeWind (same class names) |
| TypeScript types | `<div>` → `<View>`, `<p>` → `<Text>` |
| Business logic hooks | Framer Motion → Reanimated 3 |
| Mock data | `lucide-react` → `lucide-react-native` |

Estimated port effort per screen: **1–2 hours** (hook logic already written; only JSX markup changes).

### Rules to Preserve Portability

1. **No CSS Modules** — use Tailwind classes only; `.module.css` files are web-only
2. **No `window`/`document` in `src/core/`** — keep hooks returning data and callbacks only
3. **No inline `localStorage`** — use a thin `storage.ts` adapter (maps to `AsyncStorage` on RN)
4. **No DOM event types in shared hooks** — bind events in screen components, not in `core/`

---

## Out of Scope (v1 Mock)

- Real authentication or API integration
- Push notifications (OS-level)
- Apple Watch companion UI
- In-app call recording playback
- Госуслуги OAuth flow
- Gaming section content
- Actual map/geolocation for family tracking

---

## Milestones

| Step | Screen | Done When |
|------|--------|-----------|
| 0 | Scaffold | `npm run dev` shows placeholder, Zustand store + Tailwind tokens verified |
| 1 | Splash | Logo animates, auto-advances |
| 2 | Login | Phone mask, CTA validation |
| 3 | OTP | 4-box input, code `1234` works |
| 4 | Dashboard | Balance, usage pills, nav |
| 5 | Expenses | Month filter, transaction list |
| 6 | Payment | Top-up flow, success animation |
| 7 | Tariffs | List + switch confirmation |
| 8 | Services | Toggle switches, cost summary |
| 9 | Security | Статистика, toggles |
| 10 | Family | Member cards, invite CTA |
| 11 | Profile | Settings, logout |
| 12 | Speed Test | Animated gauge, mock results |
| 13 | Notifications | List, read/unread state |
| 14 | Search | Filter, recent chips |

---

*Document version: 1.2 — 2026-02-17*
