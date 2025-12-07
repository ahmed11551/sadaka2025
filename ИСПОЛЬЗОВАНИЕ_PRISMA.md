# Использование Prisma Client

## 🚀 Быстрый старт

### 1. Проверка подключения к БД

```bash
# Загрузите nvm (если нужно)
. "$HOME/.nvm/nvm.sh"

# Запустите тестовый скрипт
npm run db:test
```

Или напрямую:
```bash
node scripts/test-prisma.js
```

### 2. Открыть Prisma Studio (визуальный интерфейс)

```bash
npm run db:studio
```

Откроется веб-интерфейс на http://localhost:5555

---

## 📝 Примеры использования

### Ваш пример: Поиск пользователей по email

```javascript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const users = await prisma.user.findMany({
  where: {
    email: { endsWith: "prisma.io" }
  },
});

console.log(users);
```

### Другие полезные примеры

#### Найти всех пользователей
```javascript
const users = await prisma.user.findMany();
```

#### Найти пользователя по ID
```javascript
const user = await prisma.user.findUnique({
  where: {
    id: "user-id-here"
  }
});
```

#### Найти пользователей с фильтрами
```javascript
const users = await prisma.user.findMany({
  where: {
    role: 'admin',
    country: 'ru',
  },
  select: {
    id: true,
    email: true,
    username: true,
  },
  orderBy: {
    createdAt: 'desc',
  },
  take: 10,
});
```

#### Создать пользователя
```javascript
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    username: 'username',
    password: 'hashed_password',
    country: 'ru',
    role: 'user',
  },
});
```

#### Обновить пользователя
```javascript
const user = await prisma.user.update({
  where: {
    id: 'user-id',
  },
  data: {
    role: 'admin',
  },
});
```

#### Найти кампании, ожидающие модерации
```javascript
const campaigns = await prisma.campaign.findMany({
  where: {
    moderationStatus: 'pending',
  },
  include: {
    owner: true,
    partner: true,
  },
});
```

#### Найти пожертвования с суммой больше 1000
```javascript
const donations = await prisma.donation.findMany({
  where: {
    amount: {
      gte: 1000, // больше или равно
    },
    status: 'completed',
  },
  include: {
    user: true,
    campaign: true,
  },
});
```

#### Подсчитать статистику
```javascript
const stats = await prisma.donation.aggregate({
  where: {
    status: 'completed',
  },
  _sum: {
    amount: true, // общая сумма
  },
  _count: {
    id: true, // количество
  },
  _avg: {
    amount: true, // средняя сумма
  },
});
```

---

## 📚 Полная коллекция примеров

Все примеры находятся в файле: `scripts/prisma-examples.js`

Импортируйте нужные функции:

```javascript
import {
  findUsersByEmail,
  findUsersWithFilters,
  findPendingCampaigns,
  getStatistics,
} from './scripts/prisma-examples.js';
```

---

## 🔧 Полезные команды Prisma

### Генерация Prisma Client
```bash
npx prisma generate
```

### Применить миграции
```bash
npx prisma migrate deploy
```

### Создать новую миграцию
```bash
npx prisma migrate dev --name migration_name
```

### Синхронизировать schema с БД (без миграций)
```bash
npx prisma db push
```

### Открыть Prisma Studio
```bash
npm run db:studio
# или
npx prisma studio
```

### Форматировать schema
```bash
npx prisma format
```

### Валидация schema
```bash
npx prisma validate
```

---

## 📖 Документация

- **Официальная документация Prisma**: https://www.prisma.io/docs
- **Примеры запросов**: https://www.prisma.io/docs/concepts/components/prisma-client/crud
- **Фильтры**: https://www.prisma.io/docs/concepts/components/prisma-client/filtering-and-sorting

---

## ⚠️ Важно

1. **Всегда закрывайте подключение**:
   ```javascript
   await prisma.$disconnect();
   ```

2. **Используйте try/catch** для обработки ошибок

3. **Для production** используйте connection pooling

4. **Не храните пароли в открытом виде** - используйте хеширование

---

## 🎯 Следующие шаги

1. Примените миграцию через Vercel SQL Editor
2. Запустите `npm run db:test` для проверки
3. Откройте `npm run db:studio` для визуального просмотра
4. Используйте примеры из `scripts/prisma-examples.js`

