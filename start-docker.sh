#!/bin/bash

# Скрипт для запуска Docker контейнеров

echo "🔍 Проверка Docker..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker daemon не запущен!"
    echo "📝 Пожалуйста, запустите Docker Desktop и попробуйте снова."
    exit 1
fi

echo "✅ Docker запущен"
echo ""

echo "🛑 Остановка существующих контейнеров..."
docker-compose --env-file .env.docker down

echo ""
echo "🔨 Сборка и запуск контейнеров..."
docker-compose --env-file .env.docker up -d --build

echo ""
echo "⏳ Ожидание запуска сервисов (10 секунд)..."
sleep 10

echo ""
echo "📊 Статус контейнеров:"
docker-compose --env-file .env.docker ps

echo ""
echo "📝 Логи приложения (последние 30 строк):"
docker-compose --env-file .env.docker logs app --tail=30

echo ""
echo "✅ Готово! Приложение доступно по адресу: http://localhost:5002"
echo "📝 Для просмотра логов используйте: docker-compose --env-file .env.docker logs -f app"
