# Примеры использования MongoDB репозиториев

## 📋 Базовое использование

### Импорт и создание экземпляра

```typescript
import { UserRepositoryMongo } from './repositories/user.repository.mongo.js';

const userRepo = new UserRepositoryMongo();
const user = await userRepo.findByEmail(email);
```

## 🔧 Примеры для каждой модели

### 1. Пользователи (Users)

```typescript
import { UserRepositoryMongo } from './repositories/user.repository.mongo.js';

const userRepo = new UserRepositoryMongo();

// Найти пользователя по email
const user = await userRepo.findByEmail('user@example.com');

// Найти пользователя по ID
const userById = await userRepo.findById('user-id');

// Создать пользователя
const newUser = await userRepo.create({
  email: 'newuser@example.com',
  username: 'newuser',
  password: 'hashed_password',
  country: 'ru',
  role: 'user',
});

// Обновить пользователя
const updated = await userRepo.update('user-id', {
  fullName: 'Имя Фамилия',
  phone: '+79991234567',
});

// Обновить роль
await userRepo.updateRole('user-id', 'admin');

// Найти всех пользователей
const allUsers = await userRepo.findAll(100, 0);

// Подсчитать пользователей
const count = await userRepo.count();
```

### 2. Кампании (Campaigns)

```typescript
import { CampaignRepositoryMongo } from './repositories/campaign.repository.mongo.js';

const campaignRepo = new CampaignRepositoryMongo();

// Найти кампанию по ID
const campaign = await campaignRepo.findById('campaign-id');

// Найти по slug
const campaignBySlug = await campaignRepo.findBySlug('campaign-slug');

// Найти активные кампании
const activeCampaigns = await campaignRepo.findMany({
  status: 'active',
  moderationStatus: 'approved',
  limit: 20,
  offset: 0,
});

// Создать кампанию
const newCampaign = await campaignRepo.create({
  title: 'Помощь сиротам',
  slug: 'pomosh-sirotam',
  description: 'Описание кампании',
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
  authorId: 'user-id',
});

// Обновить собранную сумму
await campaignRepo.updateCollected('campaign-id', 5000);

// Обновить кампанию
await campaignRepo.update('campaign-id', {
  title: 'Новое название',
  description: 'Новое описание',
});
```

### 3. Пожертвования (Donations)

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

// Найти пожертвования пользователя
const userDonations = await donationRepo.findByUser('user-id', 50, 0);

// Найти пожертвования по кампании
const campaignDonations = await donationRepo.findByCampaign('campaign-id', 50, 0);

// Получить общую сумму по кампании
const total = await donationRepo.getTotalByCampaign('campaign-id');

// Получить общую сумму пользователя
const userTotal = await donationRepo.getTotalByUser('user-id');

// Обновить статус
await donationRepo.update('donation-id', {
  status: 'completed',
});
```

### 4. Партнёры (Partners)

```typescript
import { PartnerRepositoryMongo } from './repositories/partner.repository.mongo.js';

const partnerRepo = new PartnerRepositoryMongo();

// Найти партнёра по slug
const partner = await partnerRepo.findBySlug('fond-insan');

// Найти партнёров по стране
const russianPartners = await partnerRepo.findMany({
  country: 'ru',
  verified: true,
  limit: 20,
});

// Создать партнёра
const newPartner = await partnerRepo.create({
  name: 'Фонд Инсан',
  slug: 'fond-insan',
  type: 'General',
  description: 'Описание фонда',
  country: 'ru',
  location: 'Москва',
  verified: true,
  totalCollected: 0,
  totalDonors: 0,
  totalHelped: 0,
  projectCount: 0,
  categories: ['Сироты', 'Образование'],
});

// Обновить статистику
await partnerRepo.incrementStats('partner-id', {
  totalCollected: 5000,
  totalDonors: 1,
});
```

### 5. Платежи (Payments)

```typescript
import { PaymentRepositoryMongo } from './repositories/payment.repository.mongo.js';

const paymentRepo = new PaymentRepositoryMongo();

// Создать платёж
const payment = await paymentRepo.create({
  donationId: 'donation-id',
  provider: 'yookassa',
  amount: 1000,
  currency: 'RUB',
  status: 'pending',
  paymentUrl: 'https://yookassa.ru/payment/...',
});

// Найти платёж по donation ID
const paymentByDonation = await paymentRepo.findByDonationId('donation-id');

// Найти платёж по provider ID
const paymentByProvider = await paymentRepo.findByProviderId('provider-id');

// Обновить статус платежа
await paymentRepo.update('payment-id', {
  status: 'succeeded',
  providerId: 'provider-id',
});
```

### 6. Подписки (Subscriptions)

```typescript
import { SubscriptionRepositoryMongo } from './repositories/subscription.repository.mongo.js';

const subscriptionRepo = new SubscriptionRepositoryMongo();

// Создать подписку
const subscription = await subscriptionRepo.create({
  userId: 'user-id',
  plan: 'pro',
  period: '12M',
  status: 'active',
  nextPayment: new Date('2025-01-01'),
  chargeAttempts: 0,
  maxChargeAttempts: 3,
});

// Найти подписки пользователя
const userSubscriptions = await subscriptionRepo.findByUser('user-id');

// Найти активную подписку
const activeSubscription = await subscriptionRepo.findActiveByUser('user-id');

// Найти подписки для списания
const dueSubscriptions = await subscriptionRepo.findDueForCharge();

// Обновить подписку
await subscriptionRepo.update('subscription-id', {
  status: 'paused',
  nextPayment: new Date('2025-02-01'),
});
```

### 7. Закят (Zakat)

```typescript
import { ZakatRepositoryMongo } from './repositories/zakat.repository.mongo.js';

const zakatRepo = new ZakatRepositoryMongo();

// Создать расчёт закята
const zakatCalc = await zakatRepo.create({
  userId: 'user-id',
  payloadJson: JSON.stringify({
    cash: 100000,
    gold: 50,
    silver: 200,
  }),
  zakatDue: 2500,
  aboveNisab: true,
});

// Найти расчёты пользователя
const userCalculations = await zakatRepo.findByUser('user-id', 50, 0);
```

### 8. Избранное (Favorites)

```typescript
import { FavoriteRepositoryMongo } from './repositories/favorite.repository.mongo.js';

const favoriteRepo = new FavoriteRepositoryMongo();

// Добавить в избранное
const favorite = await favoriteRepo.create('user-id', 'campaign-id');

// Найти избранное пользователя
const userFavorites = await favoriteRepo.findByUser('user-id');

// Проверить, есть ли в избранном
const isFavorite = await favoriteRepo.findByUserAndCampaign('user-id', 'campaign-id');

// Удалить из избранного
await favoriteRepo.delete('user-id', 'campaign-id');
```

### 9. Комментарии (Comments)

```typescript
import { CommentRepositoryMongo } from './repositories/comment.repository.mongo.js';

const commentRepo = new CommentRepositoryMongo();

// Создать комментарий
const comment = await commentRepo.create({
  userId: 'user-id',
  campaignId: 'campaign-id',
  content: 'Отличная кампания!',
});

// Найти комментарии кампании
const campaignComments = await commentRepo.findByCampaign('campaign-id', 20, 0);

// Удалить комментарий
await commentRepo.delete('comment-id', 'user-id');
```

## 🎯 Использование в контроллерах

См. примеры контроллеров:
- `server/controllers/auth.controller.mongo.ts` - Аутентификация
- `server/controllers/campaign.controller.mongo.ts` - Кампании

## ✅ Преимущества

1. **Единый интерфейс** - все репозитории имеют одинаковые методы
2. **TypeScript типизация** - полная поддержка типов
3. **Индексы** - оптимизированные запросы
4. **Гибкость** - легко расширять функциональность

## 📚 Дополнительно

- Все репозитории поддерживают `createIndexes()` для создания индексов
- Используйте `ObjectId` для ссылок между документами
- Даты хранятся как `Date` объекты

