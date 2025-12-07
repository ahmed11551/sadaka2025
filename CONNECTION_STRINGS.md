# Connection Strings для базы данных

## 📋 Доступные Connection Strings

### 1. Прямой PostgreSQL Connection String (текущий)

```
postgres://290ec0599bafdebadd344af8e7abe26e28b739ecdea5b5e54251cfe67f34e5fa:sk_nlc-F6iLMJn8S7id2ySc3@db.prisma.io:5432/postgres?sslmode=require&pool=true
```

**Использование**: 
- ✅ Миграции (`prisma migrate`)
- ✅ Prisma Studio
- ✅ Прямые запросы к БД
- ✅ Приложение (если не используете Accelerate)

**Параметры**:
- `sslmode=require` - обязательное SSL соединение
- `pool=true` - включён connection pooling

### 2. Prisma Accelerate Connection String (опционально)

```
prisma+postgres://accelerate.prisma-data.net/?api_key=...
```

**Использование**:
- ✅ Только для запросов через Prisma Client
- ❌ Не для миграций
- ✅ Для production приложений с высокой нагрузкой

## 🔧 Настройка

### Текущая конфигурация

В `.env` файле установлен **прямой PostgreSQL connection string**, который можно использовать для:
- Миграций
- Prisma Studio
- Приложения

### Если хотите использовать оба

Можно добавить отдельную переменную для Accelerate:

```env
# Прямой connection string (для миграций и всего остального)
DATABASE_URL="postgres://290ec0599bafdebadd344af8e7abe26e28b739ecdea5b5e54251cfe67f34e5fa:sk_nlc-F6iLMJn8S7id2ySc3@db.prisma.io:5432/postgres?sslmode=require&pool=true"

# Prisma Accelerate (опционально, только для приложения)
PRISMA_ACCELERATE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=..."
```

Затем в коде:

```javascript
import { PrismaClient } from '@prisma/client';

// Использовать Accelerate для приложения (если настроен)
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.PRISMA_ACCELERATE_URL || process.env.DATABASE_URL,
    },
  },
});
```

## ✅ Проверка подключения

### 1. Через Prisma Studio

```bash
. "$HOME/.nvm/nvm.sh"
npm install
npx prisma generate
npm run db:studio
```

Откроется на http://localhost:5555

### 2. Через тестовый скрипт

```bash
npm run db:test
```

### 3. Через Prisma CLI

```bash
# Проверка подключения
npx prisma db pull

# Применение миграций
npx prisma migrate deploy
```

## 🔒 Безопасность

⚠️ **Важно**: Connection strings содержат секретные ключи!

- ✅ `.env` файл в `.gitignore` - безопасно
- ❌ Не коммитьте connection strings в Git
- ✅ Используйте переменные окружения в Vercel

## 📚 Документация

- **Prisma Connection Strings**: https://www.prisma.io/docs/concepts/database-connectors/postgresql
- **Prisma Accelerate**: https://www.prisma.io/docs/accelerate

