#!/bin/bash
# Скрипт для применения миграции БД

set -e

echo "🚀 Применение миграции базы данных..."
echo ""

# Проверка DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    if [ -f .env ]; then
        echo "📝 Загрузка DATABASE_URL из .env..."
        export $(grep -v '^#' .env | xargs)
    else
        echo "❌ Ошибка: DATABASE_URL не установлен и .env файл не найден"
        echo "   Установите DATABASE_URL или создайте .env файл"
        exit 1
    fi
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Ошибка: DATABASE_URL не установлен"
    exit 1
fi

echo "✅ DATABASE_URL найден"
echo ""

# Способ 1: Через Prisma (если доступен)
if command -v npx >/dev/null 2>&1; then
    echo "📦 Способ 1: Применение через Prisma..."
    if npx prisma migrate deploy; then
        echo "✅ Миграция успешно применена через Prisma!"
        exit 0
    else
        echo "⚠️ Ошибка при применении через Prisma, пробуем способ 2..."
    fi
else
    echo "⚠️ npx не найден, пробуем способ 2..."
fi

echo ""

# Способ 2: Через SQL напрямую (если доступен psql)
if command -v psql >/dev/null 2>&1; then
    echo "📦 Способ 2: Применение через psql..."
    if psql "$DATABASE_URL" < prisma/migrations/add_new_features.sql; then
        echo "✅ Миграция успешно применена через psql!"
        exit 0
    else
        echo "❌ Ошибка при применении через psql"
        exit 1
    fi
else
    echo "❌ psql не найден"
    echo ""
    echo "📋 Альтернативные способы:"
    echo ""
    echo "1. Установите Node.js и Prisma:"
    echo "   brew install node  # macOS"
    echo "   npm install"
    echo "   npx prisma migrate deploy"
    echo ""
    echo "2. Установите PostgreSQL клиент:"
    echo "   brew install postgresql  # macOS"
    echo "   psql \$DATABASE_URL < prisma/migrations/add_new_features.sql"
    echo ""
    echo "3. Используйте Docker:"
    echo "   docker-compose exec postgres psql -U sadakapass -d sadakapass < prisma/migrations/add_new_features.sql"
    echo ""
    echo "4. Используйте онлайн инструмент (pgAdmin, DBeaver, etc.)"
    echo "   Скопируйте содержимое prisma/migrations/add_new_features.sql"
    echo "   и выполните в вашем SQL клиенте"
    exit 1
fi

