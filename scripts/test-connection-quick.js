// Быстрая проверка connection string (минимальные зависимости)
import { MongoClient } from 'mongodb';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Чтение .env файла напрямую
function getEnvVar(name) {
  try {
    const envContent = readFileSync(join(__dirname, '..', '.env'), 'utf8');
    const match = envContent.match(new RegExp(`^${name}="?([^"]+)"?`, 'm'));
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
}

const uri = getEnvVar('MONGODB_URI') || process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI не найден');
  process.exit(1);
}

console.log('🔌 Подключение к MongoDB...');
console.log('Host:', uri.match(/@([^/]+)/)?.[1] || 'unknown');

let client;
try {
  client = new MongoClient(uri);
  
  // Таймаут 10 секунд
  const connectPromise = client.connect();
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Connection timeout')), 10000)
  );
  
  await Promise.race([connectPromise, timeoutPromise]);
  
  console.log('✅ Подключено к MongoDB успешно!');
  
  // Быстрая проверка
  const db = client.db();
  const collections = await db.listCollections().toArray();
  console.log(`📊 Найдено коллекций: ${collections.length}`);
  
  console.log('\n🎉 Connection string работает корректно!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Ошибка подключения:');
  console.error('   ', error.message);
  
  if (error.message.includes('authentication')) {
    console.error('\n💡 Проверьте правильность пароля в connection string');
  } else if (error.message.includes('ENOTFOUND')) {
    console.error('\n💡 Проверьте правильность hostname (cluster0.qplwh5b.mongodb.net)');
  } else if (error.message.includes('timeout')) {
    console.error('\n💡 Проверьте Network Access в MongoDB Atlas');
  }
  
  process.exit(1);
} finally {
  if (client) {
    await client.close();
  }
}

