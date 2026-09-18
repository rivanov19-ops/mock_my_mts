// Куда возвращаться из общих экранов Контекста (диктофон, заметка, пересылка).
// Их открывают и из раздела звонков Мой МТС, и из отдельного приложения
// «Мой Контекст» — домашний экран запоминает тот, кто их открыл.

const KEY = 'appHome'
const DEFAULT = '/calls/tobe'

export function setAppHome(path: string) {
  try { sessionStorage.setItem(KEY, path) } catch { /* приватный режим — живём с дефолтом */ }
}

export function appHome(): string {
  try { return sessionStorage.getItem(KEY) || DEFAULT } catch { return DEFAULT }
}
