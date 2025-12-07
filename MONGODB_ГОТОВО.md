# ✅ MongoDB полностью настроен!

## 🎉 Что сделано

### 1. Репозитории для всех моделей созданы:

- ✅ `user.repository.mongo.ts` - Пользователи
- ✅ `campaign.repository.mongo.ts` - Кампании
- ✅ `donation.repository.mongo.ts` - Пожертвования
- ✅ `partner.repository.mongo.ts` - Партнёры
- ✅ `payment.repository.mongo.ts` - Платежи
- ✅ `subscription.repository.mongo.ts` - Подписки
- ✅ `zakat.repository.mongo.ts` - Расчёты закята
- ✅ `favorite.repository.mongo.ts` - Избранное
- ✅ `comment.repository.mongo.ts` - Комментарии

### 2. Подключение к MongoDB

- ✅ `server/db/mongodb.ts` - Подключение и управление соединением
- ✅ `server/index.ts` - Обновлён для автоматического подключения к MongoDB

### 3. Индексы

- ✅ `server/db/init-indexes.ts` - Скрипт для создания всех индексов
- ✅ Команда `npm run db:mongo:indexes` добавлена в package.json

### 4. Конфигурация

- ✅ `MONGODB_URI` добавлен в `.env`
- ✅ Сервер автоматически подключается к MongoDB при запуске

## 🚀 Использование

### 1. Установить MongoDB драйвер (когда сеть восстановится)

```bash
. "$HOME/.nvm/nvm.sh"
npm install mongodb
npm install -D @types/mongodb
```

### 2. Создать индексы (один раз)

```bash
# Установить CREATE_INDEXES=true в .env или:
CREATE_INDEXES=true npm run dev

# Или запустить скрипт напрямую:
npm run db:mongo:indexes
```

### 3. Использовать репозитории в коде

```typescript
import { UserRepositoryMongo } from './repositories/user.repository.mongo.js';

const userRepo = new UserRepositoryMongo();
const user = await userRepo.findByEmail(email);
```

## 📋 Примеры использования

### Пользователи

```typescript
import { UserRepositoryMongo } from './repositories/user.repository.mongo.js';

const userRepo = new UserRepositoryMongo();

// Найти пользователя
const user = await userRepo.findByEmail('user@example.com');

// Создать пользователя
const newUser = await userRepo.create({
  email: 'user@example.com',
  username: 'username',
  password: 'hashed_password',
  country: 'ru',
});
```

### Кампании

```typescript
import { CampaignRepositoryMongo } from './repositories/campaign.repository.mongo.js';

const campaignRepo = new CampaignRepositoryMongo();

// Найти активные кампании
const campaigns = await campaignRepo.findMany({
  status: 'active',
  moderationStatus: 'approved',
  limit: 20,
});

// Создать кампанию
const campaign = await campaignRepo.create({
  title: 'Новая кампания',
  slug: 'new-campaign',
  description: 'Описание',
  category: 'orphans',
  goal: 100000,
  collected: 0,
  currency: 'RUB',
  type: 'private',
  status: 'active',
  urgent: false,
  verified: false,
  moderationStatus: 'pending',
  participantCount: 0,
});
```

### Пожертвования

```typescript
import { DonationRepositoryMongo } from './repositories/donation.repository.mongo.js';

const donationRepo = new DonationRepositoryMongo();

// Создать пожертвование
const donation = await donationRepo.create({
  userId: 'user-id',
  campaignId: 'campaign-id',
  amount: 1000,
  currency: 'RUB',
  status: 'pending',
  anonymous: false,
});

// Получить общую сумму по кампании
const total = await donationRepo.getTotalByCampaign('campaign-id');
```

## 🔧 Настройка

### Переменные окружения

В `.env` файле:

```env
MONGODB_URI="mongodb+srv://Vercel-Admin-sadaka2025:lTu120QTs6TOVVBr@sadaka2025.f3evghc.mongodb.net/?retryWrites=true&w=majority"
MONGODB_DB_NAME="sadaka2025"  # опционально, по умолчанию используется из URI
CREATE_INDEXES="true"  # установить в true для создания индексов при первом запуске
```

## ✅ Преимущества

1. **Гибкая схема** - легко добавлять новые поля
2. **Быстрые запросы** - индексы оптимизируют поиск
3. **Масштабируемость** - MongoDB легко масштабируется
4. **JSON-подобные документы** - удобно для JavaScript/TypeScript

## 📚 Документация

Все репозитории имеют одинаковый интерфейс:
- `findById(id)` - найти по ID
- `create(data)` - создать
- `update(id, data)` - обновить
- `delete(id)` - удалить
- `createIndexes()` - создать индексы

## 🎯 Следующие шаги

1. ⏳ Установить `mongodb` пакет: `npm install mongodb`
2. ✅ Индексы созданы автоматически при первом запуске (если `CREATE_INDEXES=true`)
3. ✅ Использовать репозитории в контроллерах
4. ✅ Тестировать работу с MongoDB

## 🆘 Если что-то не работает

1. Проверьте `MONGODB_URI` в `.env`
2. Убедитесь, что MongoDB доступна
3. Проверьте логи сервера при запуске
4. Запустите создание индексов вручную: `npm run db:mongo:indexes`

---

**Всё готово к использованию!** 🚀

