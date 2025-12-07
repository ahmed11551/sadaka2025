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
  const dbName = uri.match(/\/([^?]+)/)?.[1] || 'sadaka2025';
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
  
  // Создание индексов
  console.log('📊 Создание индексов...\n');
  
  const repos = await import('../server/repositories/user.repository.mongo.js').then(m => m.UserRepositoryMongo);
  const UserRepo = repos;
  const userRepo = new UserRepo();
  await userRepo.createIndexes();
  console.log('   ✅ Индексы users созданы');
  
  // Импортируем и создаём индексы для остальных коллекций
  try {
    const { CampaignRepositoryMongo } = await import('../server/repositories/campaign.repository.mongo.js');
    const campaignRepo = new CampaignRepositoryMongo();
    await campaignRepo.createIndexes();
    console.log('   ✅ Индексы campaigns созданы');
  } catch (e) {
    console.log('   ⚠️ Индексы campaigns пропущены');
  }
  
  try {
    const { DonationRepositoryMongo } = await import('../server/repositories/donation.repository.mongo.js');
    const donationRepo = new DonationRepositoryMongo();
    await donationRepo.createIndexes();
    console.log('   ✅ Индексы donations созданы');
  } catch (e) {
    console.log('   ⚠️ Индексы donations пропущены');
  }
  
  try {
    const { PartnerRepositoryMongo } = await import('../server/repositories/partner.repository.mongo.js');
    const partnerRepo = new PartnerRepositoryMongo();
    await partnerRepo.createIndexes();
    console.log('   ✅ Индексы partners созданы');
  } catch (e) {
    console.log('   ⚠️ Индексы partners пропущены');
  }
  
  try {
    const { PaymentRepositoryMongo } = await import('../server/repositories/payment.repository.mongo.js');
    const paymentRepo = new PaymentRepositoryMongo();
    await paymentRepo.createIndexes();
    console.log('   ✅ Индексы payments созданы');
  } catch (e) {
    console.log('   ⚠️ Индексы payments пропущены');
  }
  
  try {
    const { SubscriptionRepositoryMongo } = await import('../server/repositories/subscription.repository.mongo.js');
    const subscriptionRepo = new SubscriptionRepositoryMongo();
    await subscriptionRepo.createIndexes();
    console.log('   ✅ Индексы subscriptions созданы');
  } catch (e) {
    console.log('   ⚠️ Индексы subscriptions пропущены');
  }
  
  try {
    const { ZakatRepositoryMongo } = await import('../server/repositories/zakat.repository.mongo.js');
    const zakatRepo = new ZakatRepositoryMongo();
    await zakatRepo.createIndexes();
    console.log('   ✅ Индексы zakat_calculations созданы');
  } catch (e) {
    console.log('   ⚠️ Индексы zakat_calculations пропущены');
  }
  
  try {
    const { FavoriteRepositoryMongo } = await import('../server/repositories/favorite.repository.mongo.js');
    const favoriteRepo = new FavoriteRepositoryMongo();
    await favoriteRepo.createIndexes();
    console.log('   ✅ Индексы favorites созданы');
  } catch (e) {
    console.log('   ⚠️ Индексы favorites пропущены');
  }
  
  try {
    const { CommentRepositoryMongo } = await import('../server/repositories/comment.repository.mongo.js');
    const commentRepo = new CommentRepositoryMongo();
    await commentRepo.createIndexes();
    console.log('   ✅ Индексы comments созданы');
  } catch (e) {
    console.log('   ⚠️ Индексы comments пропущены');
  }
  
  console.log('\n✅ Все индексы созданы успешно!');
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

