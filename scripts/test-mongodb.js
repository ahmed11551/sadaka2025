// Тест подключения к MongoDB
import { connectToMongoDB, getDB } from '../server/db/mongodb.js';

async function testConnection() {
  try {
    console.log('🔌 Подключение к MongoDB...');
    const db = await connectToMongoDB();
    console.log('✅ Подключено к MongoDB!');
    
    // Проверка коллекций
    const collections = await db.listCollections().toArray();
    console.log(`\n📊 Найдено коллекций: ${collections.length}`);
    if (collections.length > 0) {
      console.log('Коллекции:');
      collections.forEach(col => {
        console.log(`  - ${col.name}`);
      });
    } else {
      console.log('  (коллекций пока нет)');
    }
    
    // Тест записи
    console.log('\n🧪 Тест записи...');
    const testCollection = db.collection('test');
    const insertResult = await testCollection.insertOne({ 
      test: true, 
      timestamp: new Date(),
      message: 'Test connection'
    });
    console.log('✅ Тест записи успешен (ID:', insertResult.insertedId, ')');
    
    // Тест чтения
    console.log('🧪 Тест чтения...');
    const testDoc = await testCollection.findOne({ test: true });
    console.log('✅ Тест чтения успешен');
    
    // Удаление тестовой записи
    console.log('🧪 Тест удаления...');
    await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log('✅ Тест удаления успешен');
    
    console.log('\n🎉 Все проверки пройдены! MongoDB работает корректно.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

testConnection();
