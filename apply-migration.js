// Применение миграции напрямую через Node.js
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Загрузка DATABASE_URL из .env
dotenv.config();

const { Client } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Ошибка: DATABASE_URL не установлен');
  console.error('💡 Убедитесь, что DATABASE_URL есть в .env файле');
  process.exit(1);
}

console.log('✅ DATABASE_URL найден');
console.log('📝 Чтение файла миграции...');

const sqlFile = path.join(__dirname, 'prisma/migrations/add_new_features.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

console.log('🔌 Подключение к базе данных...');

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes('vercel') ? { rejectUnauthorized: false } : false
});

client.connect()
  .then(() => {
    console.log('✅ Подключено к базе данных');
    console.log('🚀 Применение миграции...');
    return client.query(sql);
  })
  .then(() => {
    console.log('✅ Миграция применена успешно!');
    console.log('');
    console.log('📋 Проверка созданных таблиц...');
    return client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name IN ('payments', 'reports', 'zakat_calculations')
      ORDER BY table_name;
    `);
  })
  .then((result) => {
    if (result.rows.length > 0) {
      console.log('✅ Созданные таблицы:');
      result.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    }
    console.log('');
    console.log('✅ Проверка колонки role в users...');
    return client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role';
    `);
  })
  .then((result) => {
    if (result.rows.length > 0) {
      console.log('✅ Колонка role добавлена в users');
    }
    console.log('');
    console.log('🎉 Миграция завершена успешно!');
    client.end();
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Ошибка при применении миграции:');
    console.error(err.message);
    if (err.code) {
      console.error(`Код ошибки: ${err.code}`);
    }
    client.end();
    process.exit(1);
  });

