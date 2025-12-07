# Деплой на Vercel

## Вариант 1: Только Frontend (рекомендуется)

Этот вариант деплоит только React frontend на Vercel, а backend остается на вашем сервере или другом хостинге.

### Шаги:

1. **Подключите репозиторий к Vercel:**
   - Зайдите на https://vercel.com
   - Нажмите "Add New Project"
   - Импортируйте репозиторий `https://github.com/ahmed11551/sadaka2025.git`

2. **Настройте проект:**
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (корень проекта)
   - **Build Command**: `cd client && npm install && npm run build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install`

3. **Настройте переменные окружения:**
   
   ⚠️ **ОБЯЗАТЕЛЬНО** добавьте в Vercel Dashboard → Project Settings → Environment Variables:
   
   Для Production, Preview и Development:
   ```
   VITE_API_BASE_URL = https://bot.e-replika.ru/api/v1
   VITE_API_TOKEN = test_token_123
   ```
   
   **Важно**: 
   - Приложение автоматически определит что работает на Vercel и использует прямой доступ к API
   - Если вы хотите использовать свой backend с прокси, установите `VITE_API_BASE_URL = https://ваш-backend-url.com/api/external`
   - Без этих переменных приложение будет использовать дефолтные значения (должно работать, но лучше указать явно)

4. **Важно:** 
   - Frontend будет обращаться к backend через API_BASE_URL
   - Убедитесь, что backend настроен для CORS запросов с домена Vercel
   - Или используйте `/api/external` для проксирования через backend

### Настройка CORS на backend

Если frontend на Vercel, а backend на другом сервере, нужно обновить CORS настройки в `server/index.ts`:

```typescript
app.use(cors({
  origin: [
    'https://your-vercel-app.vercel.app',
    'http://localhost:5000'
  ],
  credentials: true
}));
```

## Вариант 2: Full-stack на Vercel (Serverless Functions)

Этот вариант требует переделки backend под Vercel Serverless Functions. Более сложный, но позволяет держать все на Vercel.

### Что нужно сделать:

1. Создать `api/` директорию с serverless functions
2. Конвертировать Express routes в Vercel serverless functions
3. Использовать Vercel Postgres для базы данных

### Альтернатива: Vercel + отдельный Backend

- **Frontend**: Vercel (React приложение)
- **Backend**: Railway, Render, или другой хостинг для Node.js
- **Database**: Vercel Postgres или отдельная PostgreSQL БД

## Быстрый старт (Вариант 1)

1. Зайдите на https://vercel.com и войдите через GitHub
2. Нажмите "Add New Project"
3. Выберите репозиторий `ahmed11551/sadaka2025`
4. Настройте как указано выше
5. Добавьте переменные окружения
6. Нажмите "Deploy"

Vercel автоматически деплоит при каждом push в main ветку.

