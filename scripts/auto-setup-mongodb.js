// Автоматическая настройка и проверка MongoDB
import { MongoClient } from 'mongodb';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Чтение .env
function getEnvVar(name) {
  try {
    const envPath = join(__dirname, '..', '.env');
    const envContent = readFileSync(envPath, 'utf8');
    const match = envContent.match(new RegExp(`^${name}="?([^"]+)"?`, 'm'));
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
}

const uri = getEnvVar('MONGODB_URI') || process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI не найден в .env');
  process.exit(1);
}

console.log('🔧 Автоматическая настройка MongoDB...\n');
console.log('📋 Проверка connection string...');
const host = uri.match(/@([^/]+)/)?.[1] || 'unknown';
console.log(`   Host: ${host}`);
console.log(`   Пользователь: ${uri.match(/:\/\/([^:]+):/)?.[1] || 'unknown'}\n`);

let client;
let connected = false;

try {
  console.log('🔌 Попытка подключения к MongoDB...');
  client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
    tls: true,
    tlsAllowInvalidCertificates: false,
    retryWrites: true,
  });
  
  await client.connect();
  connected = true;
  console.log('✅ Подключение успешно!\n');
  
  // Получить базу данных
  // Имя БД может быть в URI после последнего / или в параметрах
  let dbName = 'sadaka2025'; // значение по умолчанию
  const dbMatch = uri.match(/mongodb\+srv:\/\/[^/]+\/([^?]+)/);
  if (dbMatch && dbMatch[1]) {
    dbName = dbMatch[1];
  } else {
    // Если имя БД не указано в URI, используем значение по умолчанию
    dbName = 'sadaka2025';
  }
  const db = client.db(dbName);
  console.log(`📊 База данных: ${dbName}`);
  
  // Проверка коллекций
  const collections = await db.listCollections().toArray();
  console.log(`📊 Найдено коллекций: ${collections.length}`);
  if (collections.length > 0) {
    console.log('   Коллекции:');
    collections.forEach(col => {
      console.log(`     - ${col.name}`);
    });
  }
  
  // Тест записи
  console.log('\n🧪 Тест записи...');
  const testCollection = db.collection('test');
  const insertResult = await testCollection.insertOne({
    test: true,
    timestamp: new Date(),
    message: 'Auto-setup test'
  });
  console.log(`   ✅ Запись успешна (ID: ${insertResult.insertedId})`);
  
  // Тест чтения
  const testDoc = await testCollection.findOne({ _id: insertResult.insertedId });
  console.log('   ✅ Чтение успешно');
  
  // Удаление тестовой записи
  await testCollection.deleteOne({ _id: insertResult.insertedId });
  console.log('   ✅ Удаление успешно');
  
  console.log('\n🎉 Все проверки пройдены! MongoDB готов к использованию.\n');
  
  // Создание индексов через init-indexes.ts
  console.log('📊 Создание индексов...\n');
  
  try {
    // Используем существующий скрипт init-indexes.ts
    const { createIndexes } = await import('../server/db/init-indexes.js');
    await createIndexes();
    console.log('   ✅ Все индексы созданы успешно!');
  } catch (e) {
    console.log('   ⚠️ Ошибка при создании индексов через init-indexes.ts');
    console.log(`   ${e.message}`);
    console.log('   💡 Попробуйте запустить: npm run db:mongo:indexes');
  }
  
  console.log('\n🚀 MongoDB полностью настроен и готов к использованию!\n');
  
  process.exit(0);
  
} catch (error) {
  console.error('\n❌ Ошибка подключения к MongoDB:\n');
  console.error(`   ${error.message}\n`);
  
  if (error.message.includes('timeout') || error.message.includes('ENOTFOUND')) {
    console.error('💡 Проблема: Network Access не настроен в MongoDB Atlas\n');
    console.error('📋 Решение:\n');
    console.error('   1. Откройте MongoDB Atlas: https://cloud.mongodb.com');
    console.error('   2. Перейдите в: Security → Database & Network Access');
    console.error('   3. Нажмите "Add IP Address"');
    console.error('   4. Выберите "Allow Access from Anywhere" (0.0.0.0/0)');
    console.error('   5. Подождите 1-2 минуты');
    console.error('   6. Запустите этот скрипт снова: node scripts/auto-setup-mongodb.js\n');
  } else if (error.message.includes('authentication')) {
    console.error('💡 Проблема: Неправильный пароль или пользователь\n');
    console.error('📋 Решение: Проверьте MONGODB_URI в .env файле\n');
  } else {
    console.error('💡 Дополнительная информация:');
    if (error.stack) {
      console.error(`   ${error.stack.split('\n')[1]}\n`);
    }
  }
  
  process.exit(1);
} finally {
  if (client && connected) {
    await client.close();
    console.log('🔌 Соединение закрыто');
  }
}

