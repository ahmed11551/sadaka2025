# Проверка подключения к MongoDB

## ✅ MONGODB_URI настроен

```
MONGODB_URI="mongodb+srv://Vercel-Admin-sadaka2025:lTu120QTs6TOVVBr@sadaka2025.f3evghc.mongodb.net/?retryWrites=true&w=majority"
```

## 🧪 Как проверить подключение

### 1. Через скрипт проверки

Создайте файл `scripts/test-mongodb.js`:

```javascript
import { connectToMongoDB, getDB } from '../server/db/mongodb.js';

async function testConnection() {
  try {
    console.log('🔌 Подключение к MongoDB...');
    const db = await connectToMongoDB();
    console.log('✅ Подключено к MongoDB!');
    
    // Проверка коллекций
    const collections = await db.listCollections().toArray();
    console.log(`📊 Найдено коллекций: ${collections.length}`);
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    // Тест записи
    const testCollection = db.collection('test');
    await testCollection.insertOne({ test: true, timestamp: new Date() });
    console.log('✅ Тест записи успешен');
    
    // Удаление тестовой записи
    await testCollection.deleteOne({ test: true });
    console.log('✅ Тест удаления успешен');
    
    console.log('\n🎉 Все проверки пройдены!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

testConnection();
```

Запуск:
```bash
. "$HOME/.nvm/nvm.sh"
node scripts/test-mongodb.js
```

### 2. Через создание индексов

```bash
npm run db:mongo:indexes
```

Если индексы создались без ошибок - подключение работает!

### 3. Через запуск сервера

```bash
npm run dev
```

В логах должно быть:
```
✅ MongoDB подключена
```

## 🔍 Проверка в коде

```typescript
import { connectToMongoDB, getDB } from './db/mongodb.js';

// Подключение
await connectToMongoDB();

// Получить базу данных
const db = getDB();

// Проверить коллекции
const collections = await db.listCollections().toArray();
console.log('Коллекции:', collections.map(c => c.name));
```

## ⚠️ Возможные проблемы

### Ошибка: "MONGODB_URI не установлен"
**Решение**: Проверьте, что `.env` файл содержит `MONGODB_URI`

### Ошибка: "Connection timeout"
**Решение**: 
- Проверьте интернет-соединение
- Убедитесь, что MongoDB доступна
- Проверьте правильность connection string

### Ошибка: "Authentication failed"
**Решение**: 
- Проверьте правильность пароля в connection string
- Убедитесь, что пользователь имеет права доступа

## ✅ Чеклист проверки

- [ ] `MONGODB_URI` есть в `.env`
- [ ] Connection string правильный
- [ ] MongoDB доступна (проверить в MongoDB Atlas)
- [ ] Зависимости установлены (`npm install`)
- [ ] Подключение работает (запустить тест)

## 🎯 Следующий шаг

После успешной проверки подключения:
1. Создать индексы: `npm run db:mongo:indexes`
2. Начать использовать репозитории в коде

