# Альтернативы Prisma для работы с базой данных

## 📋 Текущая ситуация

- **База данных**: PostgreSQL ✅
- **ORM**: Prisma (планировалось)
- **Проблема**: Сложности с установкой Prisma из-за сетевых проблем

## 🎯 Варианты решения

### Вариант 1: Прямые SQL запросы через `pg` (самый простой)

**Преимущества**:
- ✅ Не требует Prisma
- ✅ Легко установить
- ✅ Полный контроль над запросами
- ✅ Быстрая работа

**Недостатки**:
- ❌ Нет автоматической типизации
- ❌ Нужно писать SQL вручную
- ❌ Нет миграций из коробки

**Установка**:
```bash
npm install pg
npm install -D @types/pg
```

**Пример использования**:
```javascript
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Простой запрос
const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

// Создание пользователя
await pool.query(
  'INSERT INTO users (email, username, password) VALUES ($1, $2, $3)',
  [email, username, password]
);
```

---

### Вариант 2: Drizzle ORM (уже в проекте!)

**Преимущества**:
- ✅ Уже установлен в проекте (`drizzle-kit` в package.json)
- ✅ Легковесный
- ✅ TypeScript-first
- ✅ Хорошая производительность

**Проверка**:
```bash
grep -i drizzle package.json
```

**Пример использования**:
```javascript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres-js';

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

// Запрос
const users = await db.select().from(usersTable).where(eq(usersTable.id, userId));
```

---

### Вариант 3: TypeORM

**Преимущества**:
- ✅ Популярный ORM
- ✅ Активное сообщество
- ✅ Хорошая документация
- ✅ Поддержка миграций

**Недостатки**:
- ❌ Тяжелее чем Prisma/Drizzle
- ❌ Может быть избыточным для простых проектов

**Установка**:
```bash
npm install typeorm pg reflect-metadata
```

---

### Вариант 4: Sequelize

**Преимущества**:
- ✅ Очень популярный
- ✅ Много примеров
- ✅ Хорошая поддержка миграций

**Недостатки**:
- ❌ Менее типобезопасный чем TypeScript-first ORM
- ❌ Тяжелее

---

## 🚀 Рекомендация: Использовать `pg` (прямые SQL запросы)

Для вашего случая (проблемы с установкой Prisma) лучше всего использовать **прямые SQL запросы через `pg`**.

### Почему это лучше:

1. **Простота**: Не нужны сложные настройки
2. **Контроль**: Полный контроль над запросами
3. **Производительность**: Нет накладных расходов ORM
4. **Гибкость**: Можно использовать любые SQL запросы

### Пример реализации

#### 1. Создать файл `server/db/pool.ts`:

```typescript
import pg from 'pg';
const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require') 
    ? { rejectUnauthorized: false } 
    : false,
  max: 20, // максимум соединений в пуле
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Проверка подключения
pool.on('connect', () => {
  console.log('✅ Подключено к PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Ошибка подключения к PostgreSQL:', err);
});
```

#### 2. Создать репозиторий для пользователей `server/repositories/user.repository.ts`:

```typescript
import { pool } from '../db/pool.js';

export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  role?: string;
  createdAt: Date;
}

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  async create(data: {
    email: string;
    username: string;
    password: string;
    country?: string;
  }): Promise<User> {
    const result = await pool.query(
      `INSERT INTO users (email, username, password, country, "createdAt")
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [data.email, data.username, data.password, data.country || 'ru']
    );
    return result.rows[0];
  }

  async updateRole(userId: string, role: 'user' | 'admin' | 'moderator'): Promise<User> {
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING *',
      [role, userId]
    );
    return result.rows[0];
  }
}
```

#### 3. Использовать в контроллерах:

```typescript
import { UserRepository } from '../repositories/user.repository.js';

const userRepo = new UserRepository();

// В контроллере
const user = await userRepo.findByEmail(email);
```

---

## 📦 Установка `pg`

```bash
. "$HOME/.nvm/nvm.sh"
npm install pg
npm install -D @types/pg
```

Это должно установиться без проблем, так как `pg` - простой пакет без сложных зависимостей.

---

## 🔄 Миграции без Prisma

### Вариант 1: SQL файлы вручную

Создайте директорию `migrations/` и храните SQL файлы там:

```
migrations/
├── 001_initial.sql
├── 002_add_payments.sql
└── 003_add_moderation.sql
```

Применяйте через:
- Vercel SQL Editor
- `psql` напрямую
- Скрипт на Node.js

### Вариант 2: node-pg-migrate

```bash
npm install node-pg-migrate
```

---

## ✅ Итоговая рекомендация

1. **Используйте `pg`** для прямых SQL запросов
2. **Создайте репозитории** для каждой модели
3. **Применяйте миграции** через Vercel SQL Editor или SQL файлы
4. **Не используйте Prisma** если есть проблемы с установкой

Это проще, быстрее и надёжнее для вашего случая!

