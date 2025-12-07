# SadakaPass - Благотворительная платформа

MVP приложение для благотворительности: пожертвования, закят, подписки и кампании.

## Технологический стек

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Shadcn/ui
- **Backend**: Node.js, Express.js, TypeScript
- **База данных**: PostgreSQL, Prisma ORM
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter
- **Deployment**: Docker, Docker Compose

## Быстрый запуск

### С помощью Docker (рекомендуется)

```bash
docker-compose up --build
```

Приложение будет доступно на `http://localhost:5000`

### Локальный запуск

1. Установите зависимости:
```bash
npm install
```

2. Настройте базу данных:
```bash
cp .env.example .env
# Отредактируйте .env файл
```

3. Примените миграции:
```bash
npx prisma migrate deploy
npx prisma generate
```

4. Запустите приложение:
```bash
npm run dev
```

## Структура проекта

- `client/` - Frontend приложение (React)
- `server/` - Backend API (Express.js)
- `prisma/` - Схема базы данных и миграции
- `docker-compose.yml` - Конфигурация Docker

## API интеграция

Приложение интегрировано с внешним API:
- **Основной API**: `https://bot.e-replika.ru/api/v1`
- **Фонд Инсан API**: `https://fondinsan.ru/api/v1`
- **Прокси**: Настроен для обхода CORS в локальной разработке

### Переменные окружения

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

**Важно для Vercel**: Добавьте переменные окружения в Vercel Dashboard:
- `VITE_API_BASE_URL` - URL основного API
- `VITE_API_TOKEN` - токен для основного API
- `VITE_INSAN_API_URL` - URL API фонда Инсан (опционально)
- `VITE_INSAN_ACCESS_TOKEN` - токен для API фонда Инсан (опционально)

⚠️ **Безопасность**: Не коммитьте `.env` файл в Git! Токены должны храниться только в env переменных.

## Документация

Подробная документация по запуску доступна в `README_DOCKER.md`

