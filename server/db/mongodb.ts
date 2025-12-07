// Подключение к MongoDB
import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToMongoDB(): Promise<Db> {
  if (db) {
    return db;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI не установлен в переменных окружения');
  }

  try {
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('✅ Подключено к MongoDB');

    // Используем имя базы данных из URI или по умолчанию
    const dbName = process.env.MONGODB_DB_NAME || 'sadaka2025';
    db = client.db(dbName);

    return db;
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error);
    throw error;
  }
}

export async function closeMongoDB(): Promise<void> {
  if (client) {
    await client.close();
    console.log('🔌 Отключено от MongoDB');
    client = null;
    db = null;
  }
}

export function getDB(): Db {
  if (!db) {
    throw new Error('База данных не подключена. Вызовите connectToMongoDB() сначала.');
  }
  return db;
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await closeMongoDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeMongoDB();
  process.exit(0);
});

export default { connectToMongoDB, closeMongoDB, getDB };

