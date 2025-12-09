#!/bin/bash

# Скрипт для проверки статуса работы API
# Все запросы должны идти к bot.e-replika.ru/api/v1 с токеном test_token_123

BASE_URL="https://bot.e-replika.ru/api"
TOKEN="test_token_123"

echo "🔍 Проверка статуса работы API"
echo "📍 Базовый URL: $BASE_URL"
echo "🔑 Токен: $TOKEN"
echo ""

# Цвета
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Функция проверки
check_endpoint() {
    local endpoint=$1
    local description=$2
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Проверка: $description${NC}"
    echo "Endpoint: $endpoint"
    
    response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" "$BASE_URL/v1$endpoint" 2>&1)
    http_code=$(echo "$response" | tail -1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✅ УСПЕХ (HTTP $http_code)${NC}"
        echo "Ответ: $(echo "$body" | head -c 100)..."
        return 0
    elif [ "$http_code" = "401" ]; then
        echo -e "${YELLOW}⚠️  ТРЕБУЕТСЯ АВТОРИЗАЦИЯ (HTTP 401)${NC}"
        return 1
    elif [ "$http_code" = "404" ]; then
        echo -e "${YELLOW}⚠️  НЕ НАЙДЕНО (HTTP 404)${NC}"
        return 1
    else
        echo -e "${RED}❌ ОШИБКА (HTTP $http_code)${NC}"
        echo "Ответ: $(echo "$body" | head -c 200)..."
        return 1
    fi
    echo ""
}

# Проверка основных endpoints
echo "═══════════════════════════════════════════════════════════════"
echo "                    ПРОВЕРКА ENDPOINTS"
echo "═══════════════════════════════════════════════════════════════"
echo ""

check_endpoint "/version" "Версия API"
check_endpoint "/users/me" "Текущий пользователь"
check_endpoint "/goals/" "Список целей"
check_endpoint "/subscriptions/me" "Мои подписки"
check_endpoint "/tasbih/sessions" "Сессии тасбиха"
check_endpoint "/azkar/today" "Азкары на сегодня"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "                    ПРОВЕРКА КОНФИГУРАЦИИ"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Проверка конфигурации в коде
echo "Проверка server/controllers/proxy.controller.ts:"
if grep -q "bot.e-replika.ru/api" server/controllers/proxy.controller.ts && ! grep -q "bot.e-replika.ru/api/v1" server/controllers/proxy.controller.ts; then
    echo -e "${GREEN}✅ Базовый URL правильный: bot.e-replika.ru/api${NC}"
else
    echo -e "${RED}❌ Базовый URL неправильный${NC}"
fi

echo ""
echo "Проверка client/src/lib/api.ts:"
if grep -q "bot.e-replika.ru/api" client/src/lib/api.ts && ! grep -q "bot.e-replika.ru/api/v1" client/src/lib/api.ts; then
    echo -e "${GREEN}✅ Базовый URL правильный: bot.e-replika.ru/api${NC}"
else
    echo -e "${RED}❌ Базовый URL неправильный${NC}"
fi

echo ""
echo "Проверка добавления /v1 в пути:"
if grep -q "/v1" server/controllers/proxy.controller.ts && grep -q "/v1" client/src/lib/api.ts; then
    echo -e "${GREEN}✅ /v1 добавляется автоматически в пути${NC}"
else
    echo -e "${RED}❌ /v1 не добавляется в пути${NC}"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
