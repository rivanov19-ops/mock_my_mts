import type { MockData } from '../types'

const mock: MockData = {
  user: {
    name: 'Алексей',
    phone: '+7 (916) 123-45-67',
  },

  account: {
    balance: 412.50,
    tariff: 'Smart Maxi',
    minutes: { used: 213, total: 300 },
    sms: { unlimited: true },
    data_gb: { used: 9.8, total: 14 },
  },

  tariffs: [
    { id: 't1', name: 'Smart Mini',  price: 299, minutes: 100, gb: 5,  sms: 50 },
    { id: 't2', name: 'Smart',       price: 499, minutes: 200, gb: 10, sms: '∞' },
    { id: 't3', name: 'Smart Maxi',  price: 699, minutes: 300, gb: 14, sms: '∞' },
    { id: 't4', name: 'Smart Ultra', price: 999, minutes: '∞', gb: 30, sms: '∞' },
  ],

  services: [
    {
      id: 's1',
      name: 'Защитник',
      description: 'Защита от мошенников и спама',
      category: 'security',
      pricePerMonth: 0,
      enabled: true,
    },
    {
      id: 's2',
      name: 'Определитель номера',
      description: 'Узнайте, кто звонит',
      category: 'security',
      pricePerMonth: 0,
      enabled: false,
    },
    {
      id: 's3',
      name: 'МТС Секретарь',
      description: 'Управление звонками и запись разговоров',
      category: 'communication',
      pricePerMonth: 99,
      enabled: false,
    },
    {
      id: 's4',
      name: 'Антивирус',
      description: 'Защита устройства от вирусов',
      category: 'security',
      pricePerMonth: 49,
      enabled: false,
    },
  ],

  transactions: [
    // February 2026
    { id: 'tx1',  date: '2026-02-15', description: 'Пополнение баланса',             amount:  500,  type: 'topup'  },
    { id: 'tx2',  date: '2026-02-14', description: 'Списание за тариф Smart Maxi',   amount: -699,  type: 'charge' },
    { id: 'tx3',  date: '2026-02-12', description: 'Интернет-роуминг',               amount: -150,  type: 'charge' },
    { id: 'tx4',  date: '2026-02-10', description: 'Пополнение баланса',             amount:  300,  type: 'topup'  },
    { id: 'tx5',  date: '2026-02-07', description: 'МТС Секретарь',                  amount:  -99,  type: 'charge' },
    { id: 'tx6',  date: '2026-02-03', description: 'Дополнительный пакет интернета', amount: -199,  type: 'charge' },
    { id: 'tx7',  date: '2026-02-01', description: 'Пополнение баланса',             amount: 1000,  type: 'topup'  },
    // January 2026
    { id: 'tx8',  date: '2026-01-28', description: 'Пополнение баланса',             amount:  500,  type: 'topup'  },
    { id: 'tx9',  date: '2026-01-15', description: 'Списание за тариф Smart Maxi',   amount: -699,  type: 'charge' },
    { id: 'tx10', date: '2026-01-10', description: 'Антивирус',                      amount:  -49,  type: 'charge' },
    { id: 'tx11', date: '2026-01-05', description: 'Пополнение баланса',             amount:  700,  type: 'topup'  },
    // December 2025
    { id: 'tx12', date: '2025-12-20', description: 'Пополнение баланса',             amount:  500,  type: 'topup'  },
    { id: 'tx13', date: '2025-12-15', description: 'Списание за тариф Smart Maxi',   amount: -699,  type: 'charge' },
    { id: 'tx14', date: '2025-12-01', description: 'Пополнение баланса',             amount: 1000,  type: 'topup'  },
    // November 2025
    { id: 'tx15', date: '2025-11-15', description: 'Списание за тариф Smart Maxi',   amount: -699,  type: 'charge' },
    { id: 'tx16', date: '2025-11-10', description: 'Пополнение баланса',             amount:  500,  type: 'topup'  },
    // October 2025
    { id: 'tx17', date: '2025-10-15', description: 'Списание за тариф Smart Maxi',   amount: -699,  type: 'charge' },
    { id: 'tx18', date: '2025-10-01', description: 'Пополнение баланса',             amount:  800,  type: 'topup'  },
    // September 2025
    { id: 'tx19', date: '2025-09-15', description: 'Списание за тариф Smart Maxi',   amount: -699,  type: 'charge' },
    { id: 'tx20', date: '2025-09-05', description: 'Пополнение баланса',             amount:  500,  type: 'topup'  },
  ],

  family: [
    { id: 'f1', name: 'Мария',  phone: '+7 (916) 123-45-68', tariff: 'Smart',      balance: 200 },
    { id: 'f2', name: 'Сергей', phone: '+7 (916) 123-45-69', tariff: 'Smart Mini', balance: 50  },
  ],

  notifications: [
    {
      id: 'n1',
      type: 'payment',
      title: 'Баланс пополнен',
      body: 'Ваш баланс пополнен на 500 ₽. Текущий баланс: 412,50 ₽',
      timestamp: '2026-02-15T10:30:00',
      read: false,
    },
    {
      id: 'n2',
      type: 'security',
      title: 'Защитник заблокировал звонок',
      body: 'Входящий звонок с номера +7 (800) 555-55-55 определён как спам и заблокирован',
      timestamp: '2026-02-14T15:45:00',
      read: false,
    },
    {
      id: 'n3',
      type: 'promo',
      title: 'Специальное предложение',
      body: 'Подключите Smart Ultra со скидкой 20% только до конца февраля',
      timestamp: '2026-02-13T09:00:00',
      read: true,
    },
    {
      id: 'n4',
      type: 'payment',
      title: 'Списание за тариф',
      body: 'Ежемесячное списание 699 ₽ за тариф Smart Maxi выполнено успешно',
      timestamp: '2026-02-14T00:01:00',
      read: true,
    },
  ],
}

export default mock
