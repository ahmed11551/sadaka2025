# Переход на MongoDB

## ✅ MongoDB Connection String настроен!

```
MONGODB_URI="mongodb+srv://Vercel-Admin-sadaka2025:lTu120QTs6TOVVBr@sadaka2025.f3evghc.mongodb.net/?retryWrites=true&w=majority"
```

## 📋 Что создано

1. **`server/db/mongodb.ts`** - Подключение к MongoDB
2. **`server/repositories/user.repository.mongo.ts`** - Пример репозитория для MongoDB

## 🚀 Установка MongoDB драйвера

```bash
. "$HOME/.nvm/nvm.sh"
npm install mongodb
npm install -D @types/mongodb
```

## 📝 Основные различия: PostgreSQL vs MongoDB

### PostgreSQL (SQL)
- Таблицы и строки
- SQL запросы
- Схема определена заранее
- JOIN операции

### MongoDB (NoSQL)
- Коллекции и документы
- MongoDB Query Language
- Гибкая схема
- Встроенные ссылки или денормализация

## 🔧 Использование

### 1. Подключение к MongoDB

```typescript
import { connectToMongoDB } from '../db/mongodb.js';

// При запуске приложения
await connectToMongoDB();
```

### 2. Работа с коллекциями

```typescript
import { getDB } from '../db/mongodb.js';

const db = getDB();
const usersCollection = db.collection('users');

// Найти пользователя
const user = await usersCollection.findOne({ email: 'user@example.com' });

// Создать пользователя
await usersCollection.insertOne({
  email: 'user@example.com',
  username: 'username',
  password: 'hashed_password',
  role: 'user',
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Обновить пользователя
await usersCollection.updateOne(
  { email: 'user@example.com' },
  { $set: { role: 'admin', updatedAt: new Date() } }
);

// Удалить пользователя
await usersCollection.deleteOne({ email: 'user@example.com' });
```

### 3. Использование репозитория

```typescript
import { UserRepositoryMongo } from '../repositories/user.repository.mongo.js';

const userRepo = new UserRepositoryMongo();

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

## 📊 Примеры запросов

### Найти всех администраторов

```typescript
const admins = await usersCollection.find({ role: 'admin' }).toArray();
```

### Найти пользователей с фильтрами

```typescript
const users = await usersCollection.find({
  country: 'ru',
  role: { $in: ['user', 'admin'] },
  createdAt: { $gte: new Date('2024-01-01') }
}).sort({ createdAt: -1 }).limit(10).toArray();
```

### Агрегация (аналог GROUP BY)

```typescript
const stats = await usersCollection.aggregate([
  { $group: { _id: '$role', count: { $sum: 1 } } }
]).toArray();
```

## 🔄 Миграция данных

### Из PostgreSQL в MongoDB

Если у вас уже есть данные в PostgreSQL, нужно:

1. **Экспортировать данные из PostgreSQL**:
   ```bash
   pg_dump -t users > users.sql
   ```

2. **Преобразовать в JSON**:
   ```javascript
   // Скрипт для конвертации
   const pgData = require('./users.json');
   const mongoData = pgData.map(user => ({
     ...user,
     _id: new ObjectId(),
     createdAt: new Date(user.createdAt),
     updatedAt: new Date(user.updatedAt),
   }));
   ```

3. **Импортировать в MongoDB**:
   ```javascript
   await usersCollection.insertMany(mongoData);
   ```

## 🎯 Структура коллекций

### users
```javascript
{
  _id: ObjectId,
  email: string,
  username: string,
  password: string,
  role: 'user' | 'admin' | 'moderator',
  country: string,
  createdAt: Date,
  updatedAt: Date
}
```

### campaigns
```javascript
{
  _id: ObjectId,
  ownerId: ObjectId, // ссылка на users._id
  title: string,
  description: string,
  goalAmount: number,
  collectedAmount: number,
  status: 'active' | 'completed' | 'cancelled',
  moderationStatus: 'pending' | 'approved' | 'rejected',
  createdAt: Date
}
```

### donations
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // ссылка на users._id
  campaignId: ObjectId, // ссылка на campaigns._id
  amount: number,
  currency: string,
  status: 'pending' | 'completed' | 'failed',
  createdAt: Date
}
```

## ✅ Преимущества MongoDB

1. **Гибкая схема** - легко добавлять новые поля
2. **Горизонтальное масштабирование** - шардирование
3. **JSON-подобные документы** - удобно для JavaScript
4. **Встроенная репликация** - высокая доступность

## ⚠️ Важные моменты

1. **Индексы**: Создавайте индексы для часто используемых полей
   ```typescript
   await usersCollection.createIndex({ email: 1 }, { unique: true });
   ```

2. **ObjectId**: MongoDB использует `_id` типа `ObjectId`, но можно добавить `id` как строку

3. **Даты**: Храните как `Date` объекты, не строки

4. **Ссылки**: Используйте `ObjectId` для ссылок на другие документы

## 📚 Документация

- **MongoDB Node.js Driver**: https://www.mongodb.com/docs/drivers/node/current/
- **MongoDB Query Language**: https://www.mongodb.com/docs/manual/tutorial/query-documents/
- **MongoDB Aggregation**: https://www.mongodb.com/docs/manual/aggregation/

## 🎯 Следующие шаги

1. ✅ MONGODB_URI добавлен в .env
2. ⏳ Установить mongodb: `npm install mongodb`
3. ⏳ Подключиться к MongoDB при запуске сервера
4. ⏳ Создать репозитории для других моделей
5. ⏳ Обновить контроллеры для использования MongoDB

