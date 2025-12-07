#!/bin/bash
# Прямое применение миграции через SQL

set -e

echo "🚀 Применение миграции БД напрямую через SQL..."
echo ""

# Проверка DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    if [ -f .env ]; then
        echo "📝 Загрузка DATABASE_URL из .env..."
        export $(grep -v '^#' .env | grep DATABASE_URL | xargs)
    else
        echo "❌ Ошибка: DATABASE_URL не установлен и .env файл не найден"
        exit 1
    fi
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Ошибка: DATABASE_URL не установлен"
    echo ""
    echo "💡 Решение:"
    echo "1. Скопируйте PRISMA_DATABASE_URL из Vercel"
    echo "2. Добавьте в .env файл:"
    echo "   DATABASE_URL=\"ваш-prisma-database-url\""
    exit 1
fi

echo "✅ DATABASE_URL найден"
echo ""

# Проверка доступности psql или создание через Node.js
if command -v psql >/dev/null 2>&1; then
    echo "📦 Применение через psql..."
    psql "$DATABASE_URL" < prisma/migrations/add_new_features.sql
    echo "✅ Миграция применена через psql!"
elif command -v node >/dev/null 2>&1; then
    echo "📦 Применение через Node.js..."
    node -e "
    const { Client } = require('pg');
    const fs = require('fs');
    const sql = fs.readFileSync('prisma/migrations/add_new_features.sql', 'utf8');
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    client.connect()
      .then(() => client.query(sql))
      .then(() => {
        console.log('✅ Миграция применена через Node.js!');
        client.end();
      })
      .catch(err => {
        console.error('❌ Ошибка:', err.message);
        client.end();
        process.exit(1);
      });
    "
else
    echo "❌ Не найдены ни psql, ни Node.js"
    echo ""
    echo "📋 Альтернативные способы:"
    echo ""
    echo "1. Установите Node.js:"
    echo "   brew install node  # macOS"
    echo ""
    echo "2. Установите PostgreSQL клиент:"
    echo "   brew install postgresql  # macOS"
    echo ""
    echo "3. Используйте Vercel SQL Editor:"
    echo "   - Откройте Vercel Dashboard → Storage → ваша БД"
    echo "   - Найдите SQL Editor"
    echo "   - Скопируйте содержимое prisma/migrations/add_new_features.sql"
    echo "   - Выполните SQL"
    exit 1
fi

