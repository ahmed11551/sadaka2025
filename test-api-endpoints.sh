#!/bin/bash

# Скрипт для проверки всех API endpoints с токеном test_token_123
# Использование: ./test-api-endpoints.sh

BASE_URL="https://bot.e-replika.ru/api/v1"
TOKEN="test_token_123"

echo "🧪 Тестирование API endpoints с токеном: $TOKEN"
echo "📍 Базовый URL: $BASE_URL"
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Счетчики
TOTAL=0
SUCCESS=0
FAILED=0
NO_RESPONSE=0

# Функция для проверки endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    TOTAL=$((TOTAL + 1))
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Тест $TOTAL: $description${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo "Method: $method"
    echo "Endpoint: $endpoint"
    
    # Подготовка curl команды
    local curl_cmd="curl -s -w '\n%{http_code}' -X $method"
    curl_cmd="$curl_cmd -H 'Authorization: Bearer $TOKEN'"
    curl_cmd="$curl_cmd -H 'Content-Type: application/json'"
    
    if [ "$method" != "GET" ] && [ -n "$data" ]; then
        curl_cmd="$curl_cmd -d '$data'"
    fi
    
    curl_cmd="$curl_cmd '$BASE_URL$endpoint'"
    
    # Выполнение запроса
    local response=$(eval $curl_cmd 2>&1)
    local http_code=$(echo "$response" | tail -1)
    local body=$(echo "$response" | sed '$d')
    
    echo "HTTP Code: $http_code"
    
    # Анализ ответа
    if [ -z "$http_code" ] || [ "$http_code" = "000" ]; then
        echo -e "${RED}❌ НЕТ ОТВЕТА (timeout или ошибка сети)${NC}"
        NO_RESPONSE=$((NO_RESPONSE + 1))
        echo ""
        return 1
    fi
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✅ УСПЕХ (HTTP $http_code)${NC}"
        SUCCESS=$((SUCCESS + 1))
        if [ -n "$body" ] && [ "$body" != "null" ]; then
            echo "Ответ: $(echo "$body" | head -c 200)..."
        fi
        echo ""
        return 0
    elif [ "$http_code" = "401" ]; then
        echo -e "${YELLOW}⚠️  ТРЕБУЕТСЯ АВТОРИЗАЦИЯ (HTTP 401)${NC}"
        echo "Ответ: $(echo "$body" | head -c 200)..."
        FAILED=$((FAILED + 1))
        echo ""
        return 1
    elif [ "$http_code" = "403" ]; then
        echo -e "${YELLOW}⚠️  ДОСТУП ЗАПРЕЩЕН (HTTP 403)${NC}"
        echo "Ответ: $(echo "$body" | head -c 200)..."
        FAILED=$((FAILED + 1))
        echo ""
        return 1
    elif [ "$http_code" = "404" ]; then
        echo -e "${YELLOW}⚠️  НЕ НАЙДЕНО (HTTP 404)${NC}"
        echo "Ответ: $(echo "$body" | head -c 200)..."
        FAILED=$((FAILED + 1))
        echo ""
        return 1
    else
        echo -e "${RED}❌ ОШИБКА (HTTP $http_code)${NC}"
        echo "Ответ: $(echo "$body" | head -c 200)..."
        FAILED=$((FAILED + 1))
        echo ""
        return 1
    fi
}

echo "═══════════════════════════════════════════════════════════════"
echo "                    AUTH ENDPOINTS"
echo "═══════════════════════════════════════════════════════════════"
echo ""

test_endpoint "GET" "/auth/me" "" "Получение текущего пользователя"
test_endpoint "GET" "/auth/profile" "" "Получение профиля пользователя"
test_endpoint "POST" "/auth/register" '{"email":"test@example.com","username":"testuser","password":"test123456","fullName":"Test User"}' "Регистрация пользователя"
test_endpoint "POST" "/auth/login" '{"email":"test@example.com","password":"test123456"}' "Вход в систему"
test_endpoint "POST" "/auth/logout" "" "Выход из системы"
test_endpoint "PATCH" "/auth/profile" '{"fullName":"Updated Name"}' "Обновление профиля"
test_endpoint "POST" "/auth/change-password" '{"currentPassword":"old","newPassword":"new"}' "Смена пароля"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "                  CAMPAIGN ENDPOINTS"
echo "═══════════════════════════════════════════════════════════════"
echo ""

test_endpoint "GET" "/campaigns" "" "Получение списка кампаний"
test_endpoint "GET" "/campaigns?page=1&limit=10" "" "Получение кампаний с пагинацией"
test_endpoint "GET" "/campaigns/favorites" "" "Получение избранных кампаний"
test_endpoint "GET" "/campaigns/123" "" "Получение кампании по ID"
test_endpoint "GET" "/campaigns/slug/test-campaign" "" "Получение кампании по slug"
test_endpoint "POST" "/campaigns" '{"title":"Test Campaign","description":"Test","category":"education","goal":10000,"type":"private"}' "Создание кампании"
test_endpoint "PATCH" "/campaigns/123" '{"title":"Updated Campaign"}' "Обновление кампании"
test_endpoint "DELETE" "/campaigns/123" "" "Удаление кампании"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "                  DONATION ENDPOINTS"
echo "═══════════════════════════════════════════════════════════════"
echo ""

test_endpoint "POST" "/donations" '{"amount":1000,"currency":"RUB","type":"one-time","category":"education","paymentMethod":"card"}' "Создание пожертвования"
test_endpoint "GET" "/donations/my" "" "Получение моих пожертвований"
test_endpoint "GET" "/donations/campaign/123" "" "Получение пожертвований кампании"
test_endpoint "GET" "/donations/stats" "" "Получение статистики пожертвований"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "                  PARTNER ENDPOINTS"
echo "═══════════════════════════════════════════════════════════════"
echo ""

test_endpoint "GET" "/partners" "" "Получение списка партнеров"
test_endpoint "GET" "/partners?page=1&limit=10" "" "Получение партнеров с пагинацией"
test_endpoint "GET" "/partners/123" "" "Получение партнера по ID"
test_endpoint "GET" "/partners/slug/test-partner" "" "Получение партнера по slug"
test_endpoint "GET" "/partners/123/campaigns" "" "Получение кампаний партнера"
test_endpoint "POST" "/partners" '{"orgName":"Test Org","country":"RU","website":"https://test.com","email":"test@test.com","categories":["education"],"telegram":"@test"}' "Создание партнера"
test_endpoint "PATCH" "/partners/123" '{"orgName":"Updated Org"}' "Обновление партнера"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "                  FAVORITE ENDPOINTS"
echo "═══════════════════════════════════════════════════════════════"
echo ""

test_endpoint "POST" "/favorites/toggle" '{"campaignId":"123"}' "Переключение избранного"
test_endpoint "GET" "/favorites" "" "Получение избранных"
test_endpoint "GET" "/favorites/123" "" "Проверка избранного"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "                  COMMENT ENDPOINTS"
echo "═══════════════════════════════════════════════════════════════"
echo ""

test_endpoint "POST" "/comments" '{"campaignId":"123","content":"Test comment"}' "Создание комментария"
test_endpoint "GET" "/comments/campaign/123" "" "Получение комментариев кампании"
test_endpoint "DELETE" "/comments/123" "" "Удаление комментария"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "                SUBSCRIPTION ENDPOINTS"
echo "═══════════════════════════════════════════════════════════════"
echo ""

test_endpoint "GET" "/subscriptions/me" "" "Получение моих подписок"
test_endpoint "POST" "/subscriptions/checkout" '{"tier":"basic"}' "Оформление подписки"
test_endpoint "PATCH" "/subscriptions/123" '{"action":"pause"}' "Обновление подписки"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "                    ZAKAT ENDPOINTS"
echo "═══════════════════════════════════════════════════════════════"
echo ""

test_endpoint "POST" "/zakat/calc" '{"assets":{"cash_total":100000},"nisab_currency":"RUB"}' "Расчет закята"
test_endpoint "POST" "/zakat/pay" '{"amount":2500,"currency":"RUB"}' "Оплата закята"
test_endpoint "GET" "/zakat/history" "" "История закята"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "                    FUNDS ENDPOINTS"
echo "═══════════════════════════════════════════════════════════════"
echo ""

test_endpoint "GET" "/funds" "" "Получение списка фондов"
test_endpoint "GET" "/funds?page=1&limit=10" "" "Получение фондов с пагинацией"
test_endpoint "GET" "/funds/123" "" "Получение фонда по ID"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "                    REPORTS ENDPOINTS"
echo "═══════════════════════════════════════════════════════════════"
echo ""

test_endpoint "GET" "/reports/summary" "" "Получение сводки отчетов"
test_endpoint "GET" "/reports/summary?period=month" "" "Получение сводки за период"
test_endpoint "GET" "/me/history" "" "Получение истории"
test_endpoint "GET" "/reports/funds" "" "Получение отчетов фондов"
test_endpoint "GET" "/reports/donations/export" "" "Экспорт отчетов пожертвований"
test_endpoint "GET" "/reports/stats" "" "Получение статистики"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "                    PAYMENT ENDPOINTS"
echo "═══════════════════════════════════════════════════════════════"
echo ""

test_endpoint "POST" "/payments/initiate" '{"amount":1000,"currency":"RUB","type":"donation"}' "Инициация платежа"
test_endpoint "GET" "/payments/123/status" "" "Получение статуса платежа"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "                    ADMIN ENDPOINTS"
echo "═══════════════════════════════════════════════════════════════"
echo ""

test_endpoint "GET" "/admin/stats" "" "Получение статистики админа"
test_endpoint "GET" "/admin/campaigns/pending" "" "Получение ожидающих кампаний"
test_endpoint "POST" "/admin/campaigns/123/approve" "" "Одобрение кампании"
test_endpoint "POST" "/admin/campaigns/123/reject" "" "Отклонение кампании"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "                    ИТОГОВАЯ СТАТИСТИКА"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo -e "Всего протестировано: ${BLUE}$TOTAL${NC}"
echo -e "${GREEN}✅ Успешных: $SUCCESS${NC}"
echo -e "${RED}❌ Ошибок: $FAILED${NC}"
echo -e "${YELLOW}⚠️  Без ответа: $NO_RESPONSE${NC}"
echo ""
echo "═══════════════════════════════════════════════════════════════"

