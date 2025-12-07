# Переход с Prisma на прямой SQL (pg)

## ✅ Хорошие новости!

В вашем проекте **уже установлен `pg`** (PostgreSQL клиент)!

```json
"pg": "^8.16.3"
```

Это означает, что вы можете использовать прямые SQL запросы **прямо сейчас**, без установки Prisma!

## 🚀 Что уже создано

1. **`server/db/pool.ts`** - Пул соединений к PostgreSQL
2. **`server/repositories/user.repository.pg.ts`** - Пример репозитория через pg

## 📋 Как использовать

### 1. Импортируйте pool

```typescript
import { pool } from '../db/pool.js';
```

### 2. Выполняйте SQL запросы

```typescript
// Простой SELECT
const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
const user = result.rows[0];

// INSERT
await pool.query(
  'INSERT INTO users (email, username, password) VALUES ($1, $2, $3)',
  [email, username, password]
);

// UPDATE
await pool.query(
  'UPDATE users SET role = $1 WHERE id = $2',
  [role, userId]
);

// DELETE
await pool.query('DELETE FROM users WHERE id = $1', [userId]);
```

### 3. Используйте репозитории

```typescript
import { UserRepositoryPG } from '../repositories/user.repository.pg.js';

const userRepo = new UserRepositoryPG();

// Найти пользователя
const user = await userRepo.findByEmail(email);

// Создать пользователя
const newUser = await userRepo.create({
  email: 'user@example.com',
  username: 'username',
  password: 'hashed_password',
});

// Обновить роль
await userRepo.updateRole(userId, 'admin');
```

## 🔄 Миграция существующего кода

### Было (Prisma):

```typescript
import prisma from '../db/client.js';

const user = await prisma.user.findUnique({
  where: { id: userId }
});
```

### Стало (pg):

```typescript
import { pool } from '../db/pool.js';

const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
const user = result.rows[0];
```

## 📝 Примеры для других моделей

### Кампании

```typescript
// Найти все активные кампании
const result = await pool.query(
  `SELECT * FROM campaigns 
   WHERE status = 'active' AND "moderationStatus" = 'approved'
   ORDER BY "createdAt" DESC
   LIMIT $1 OFFSET $2`,
  [limit, offset]
);
const campaigns = result.rows;
```

### Пожертвования

```typescript
// Создать пожертвование
const result = await pool.query(
  `INSERT INTO donations (id, "userId", "campaignId", amount, currency, status, "createdAt")
   VALUES (gen_random_uuid()::text, $1, $2, $3, $4, 'pending', NOW())
   RETURNING *`,
  [userId, campaignId, amount, currency]
);
const donation = result.rows[0];
```

### Платежи

```typescript
// Найти платежи по статусу
const result = await pool.query(
  'SELECT * FROM payments WHERE status = $1 ORDER BY "createdAt" DESC',
  ['succeeded']
);
const payments = result.rows;
```

## ✅ Преимущества использования pg

1. **Уже установлен** - не нужно ничего устанавливать
2. **Простота** - прямые SQL запросы
3. **Производительность** - нет накладных расходов ORM
4. **Гибкость** - можно использовать любые SQL запросы
5. **Контроль** - полный контроль над запросами

## 🔧 Настройка

Файл `server/db/pool.ts` уже настроен:
- ✅ Connection pooling
- ✅ SSL поддержка
- ✅ Graceful shutdown
- ✅ Обработка ошибок

## 📚 Документация

- **pg (node-postgres)**: https://node-postgres.com/
- **SQL запросы**: https://www.postgresql.org/docs/

## 🎯 Следующие шаги

1. ✅ Pool создан (`server/db/pool.ts`)
2. ✅ Пример репозитория создан (`server/repositories/user.repository.pg.ts`)
3. ⏳ Создать репозитории для других моделей (campaigns, donations, payments)
4. ⏳ Обновить контроллеры для использования pg вместо Prisma
5. ⏳ Применить миграцию через Vercel SQL Editor

## 💡 Совет

Используйте **pg** для всех новых запросов. Это проще и надёжнее, чем пытаться установить Prisma при проблемах с сетью!

