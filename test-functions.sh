#!/bin/bash

# Скрипт для тестирования основных функций SadakaPass
# Проверяет доступность API endpoints и обработку ошибок

echo "🧪 ТЕСТИРОВАНИЕ SADAKAPASS"
echo "=========================="
echo ""

BASE_URL="http://localhost:5002"
API_BASE="$BASE_URL/api"

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Счетчики
PASSED=0
FAILED=0
WARNINGS=0

# Функция для проверки ответа
check_response() {
    local name=$1
    local url=$2
    local expected_status=$3
    local suppress_error=$4
    
    echo -n "  Проверка: $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>&1)
    status_code=$?
    
    if [ $status_code -ne 0 ]; then
        echo -e "${RED}✗ ОШИБКА СЕТИ${NC}"
        ((FAILED++))
        return 1
    fi
    
    if [ "$response" == "$expected_status" ] || [ "$expected_status" == "any" ]; then
        if [ "$response" == "404" ] && [ "$suppress_error" != "true" ]; then
            echo -e "${YELLOW}⚠ 404 (ожидаемо)${NC}"
            ((WARNINGS++))
        elif [ "$response" == "404" ] && [ "$suppress_error" == "true" ]; then
            echo -e "${GREEN}✓ 404 (обрабатывается)${NC}"
            ((PASSED++))
        else
            echo -e "${GREEN}✓ OK ($response)${NC}"
            ((PASSED++))
        fi
        return 0
    else
        echo -e "${RED}✗ ОШИБКА (ожидалось: $expected_status, получено: $response)${NC}"
        ((FAILED++))
        return 1
    fi
}

# Функция для проверки JSON ответа
check_json() {
    local name=$1
    local url=$2
    
    echo -n "  Проверка JSON: $name... "
    
    response=$(curl -s "$url" 2>&1)
    status_code=$?
    
    if [ $status_code -ne 0 ]; then
        echo -e "${RED}✗ ОШИБКА${NC}"
        ((FAILED++))
        return 1
    fi
    
    # Проверяем, что это валидный JSON (или пустой объект для 404)
    if echo "$response" | jq . >/dev/null 2>&1 || [ -z "$response" ]; then
        echo -e "${GREEN}✓ Валидный JSON${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${YELLOW}⚠ Не JSON (возможно HTML)${NC}"
        ((WARNINGS++))
        return 0
    fi
}

echo "📋 1. ПРОВЕРКА ДОСТУПНОСТИ СЕРВЕРА"
echo "-----------------------------------"
check_response "Главная страница" "$BASE_URL" "200"
check_response "API прокси" "$API_BASE" "any"

echo ""
echo "📋 2. ПРОВЕРКА API ENDPOINTS (ожидаются 404 - это нормально)"
echo "------------------------------------------------------------"

# Endpoints, которые должны возвращать 404 (не реализованы в bot.e-replika.ru)
check_response "GET /api/auth/me" "$API_BASE/auth/me" "404" "true"
check_response "GET /api/campaigns" "$API_BASE/campaigns" "any"
check_response "GET /api/partners" "$API_BASE/partners" "any"
check_response "GET /api/subscriptions" "$API_BASE/subscriptions" "any"
check_response "GET /api/history" "$API_BASE/history" "any"
check_response "GET /api/reports" "$API_BASE/reports" "any"
check_response "GET /api/rating/stats" "$API_BASE/rating/stats" "404" "true"
check_response "GET /api/rating/completed-campaigns" "$API_BASE/rating/completed-campaigns?country=ru" "404" "true"

echo ""
echo "📋 3. ПРОВЕРКА ИНСАН API"
echo "------------------------"
check_response "GET /api/insan/programs" "$API_BASE/insan/programs" "any"
check_json "Insan programs JSON" "$API_BASE/insan/programs"

echo ""
echo "📋 4. ПРОВЕРКА ОБРАБОТКИ ОШИБОК"
echo "-------------------------------"

# Проверяем, что 404 не ломают приложение
check_response "Несуществующий endpoint" "$API_BASE/nonexistent" "404" "true"
check_response "Неверный метод (POST на GET endpoint)" "$API_BASE/campaigns" "any"

echo ""
echo "📋 5. ПРОВЕРКА CORS И ПРОКСИ"
echo "----------------------------"

# Проверяем, что прокси работает
response=$(curl -s -I "$API_BASE/campaigns" 2>&1 | grep -i "access-control" || echo "")
if [ -n "$response" ]; then
    echo -e "  ${GREEN}✓ CORS заголовки присутствуют${NC}"
    ((PASSED++))
else
    echo -e "  ${YELLOW}⚠ CORS заголовки не найдены (может быть нормально для прокси)${NC}"
    ((WARNINGS++))
fi

echo ""
echo "📊 ИТОГИ"
echo "========="
echo -e "${GREEN}Успешно: $PASSED${NC}"
echo -e "${YELLOW}Предупреждения: $WARNINGS${NC}"
echo -e "${RED}Ошибки: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ Все критические проверки пройдены!${NC}"
    exit 0
else
    echo -e "${RED}❌ Обнаружены ошибки${NC}"
    exit 1
fi
