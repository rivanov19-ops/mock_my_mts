# Развёртывание mock_my_mts на новом компьютере

## 1. Node.js через NVM

```bash
# Установить NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Перезапустить терминал, затем:
nvm install 22
nvm use 22
```

## 2. Клонировать репозиторий

```bash
cd ~/Desktop
git clone https://github.com/rivanov19-ops/mock_my_mts.git mock_my_mts-main
cd mock_my_mts-main
npm install
```

## 3. Запустить локально

```bash
npm run dev
# Открыть http://localhost:5173
```

## 4. Подключить Vercel (деплой)

```bash
npm install -g vercel
vercel login        # войти через браузер
vercel link         # привязать к проекту romans-projects-294306b8/mock-my-mts-main
```

После привязки деплой командой:
```bash
vercel --prod
```

Продакшн: https://mock-my-mts-main.vercel.app

## 5. Установить Claude Code

```bash
npm install -g @anthropic/claude-code
```

Запустить из папки проекта:
```bash
cd ~/Desktop/mock_my_mts-main
claude
```

Claude автоматически подхватит инструкции из `CLAUDE.md` в папке проекта.

## 6. Структура проекта

```
mock_my_mts-main/
├── src/screens/CallsToBe.tsx   # главный файл — все экраны tobe
├── CLAUDE.md                   # инструкции для Claude
└── ...
```

## Быстрая шпаргалка

| Задача | Команда |
|--------|---------|
| Запустить dev-сервер | `npm run dev` |
| Собрать билд | `npm run build` |
| Задеплоить | `npx vercel --prod` |
| Запустить Claude | `claude` |
| Запушить на GitHub | `git add . && git commit -m "..." && git push` |
