// Простой тест подключения к MongoDB (без TypeScript)
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Загрузка .env
dotenv.config({ path: join(__dirname, '..', '.env') });

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI не установлен в переменных окружения');
    process.exit(1);
  }

  console.log('🔌 Подключение к MongoDB...');
  console.log('URI:', uri.replace(/:[^:@]+@/, ':****@')); // Скрыть пароль

  let client;
  try {
    client = new MongoClient(uri);
    await client.connect();
    console.log('✅ Подключено к MongoDB!');
    
    // Получить базу данных
    const dbName = uri.match(/\/([^?]+)/)?.[1] || 'sadaka2025';
    const db = client.db(dbName);
    console.log(`📊 Используется база данных: ${dbName}`);
    
    // Проверка коллекций
    const collections = await db.listCollections().toArray();
    console.log(`\n📊 Найдено коллекций: ${collections.length}`);
    if (collections.length > 0) {
      console.log('Коллекции:');
      collections.forEach(col => {
        console.log(`  - ${col.name}`);
      });
    } else {
      console.log('  (коллекций пока нет - это нормально для нового проекта)');
    }
    
    // Тест записи
    console.log('\n🧪 Тест записи...');
    const testCollection = db.collection('test');
    const insertResult = await testCollection.insertOne({ 
      test: true, 
      timestamp: new Date(),
      message: 'Test connection from script'
    });
    console.log('✅ Тест записи успешен (ID:', insertResult.insertedId, ')');
    
    // Тест чтения
    console.log('🧪 Тест чтения...');
    const testDoc = await testCollection.findOne({ test: true });
    if (testDoc) {
      console.log('✅ Тест чтения успешен');
      console.log('   Документ:', JSON.stringify(testDoc, null, 2));
    }
    
    // Удаление тестовой записи
    console.log('🧪 Тест удаления...');
    const deleteResult = await testCollection.deleteOne({ _id: insertResult.insertedId });
    if (deleteResult.deletedCount > 0) {
      console.log('✅ Тест удаления успешен');
    }
    
    console.log('\n🎉 Все проверки пройдены! MongoDB работает корректно.');
    console.log('\n📋 Следующие шаги:');
    console.log('   1. Создать индексы: npm run db:mongo:indexes');
    console.log('   2. Начать использовать репозитории в коде');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Ошибка подключения к MongoDB:');
    console.error('   Сообщение:', error.message);
    
    if (error.message.includes('authentication')) {
      console.error('\n💡 Возможные причины:');
      console.error('   - Неправильный пароль в connection string');
      console.error('   - Пользователь не имеет прав доступа');
    } else if (error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Возможные причины:');
      console.error('   - Кластер не создан в MongoDB Atlas');
      console.error('   - IP адрес не добавлен в whitelist');
      console.error('   - Проблемы с интернет-соединением');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('\n💡 Возможные причины:');
      console.error('   - Неправильный hostname в connection string');
      console.error('   - Кластер удалён или не существует');
    }
    
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Соединение закрыто');
    }
  }
}

testConnection();

