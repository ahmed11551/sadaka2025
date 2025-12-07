#!/bin/bash

# Тестовый скрипт для проверки API
# Использование: ./test-api.sh

BASE_URL="http://localhost:5000/api"
TOKEN="test_token_123"

echo "🧪 Тестирование API..."
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для проверки ответа
check_response() {
    local name=$1
    local response=$2
    
    if echo "$response" | grep -q "error\|Error\|ERROR"; then
        echo -e "${RED}❌ $name: ОШИБКА${NC}"
        echo "$response" | head -5
        return 1
    else
        echo -e "${GREEN}✅ $name: OK${NC}"
        return 0
    fi
}

# 1. Проверка здоровья сервера
echo "1. Проверка здоровья сервера..."
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/health" 2>&1)
http_code=$(echo "$response" | tail -1)
if [ "$http_code" = "200" ] || [ "$http_code" = "404" ]; then
    echo -e "${GREEN}✅ Сервер отвечает (HTTP $http_code)${NC}"
else
    echo -e "${RED}❌ Сервер не отвечает (HTTP $http_code)${NC}"
    echo "Убедитесь, что сервер запущен: npm run dev"
    exit 1
fi
echo ""

# 2. Регистрация пользователя
echo "2. Тестирование регистрации..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "test@example.com",
        "password": "test123456",
        "fullName": "Test User"
    }' 2>&1)

if echo "$REGISTER_RESPONSE" | grep -q "user\|id\|email"; then
    echo -e "${GREEN}✅ Регистрация: OK${NC}"
    USER_ID=$(echo "$REGISTER_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
else
    echo -e "${YELLOW}⚠️  Регистрация: Возможно пользователь уже существует${NC}"
    echo "$REGISTER_RESPONSE" | head -3
fi
echo ""

# 3. Логин
echo "3. Тестирование логина..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "test@example.com",
        "password": "test123456"
    }' \
    -c /tmp/cookies.txt 2>&1)

if echo "$LOGIN_RESPONSE" | grep -q "user\|id\|email"; then
    echo -e "${GREEN}✅ Логин: OK${NC}"
else
    echo -e "${RED}❌ Логин: ОШИБКА${NC}"
    echo "$LOGIN_RESPONSE" | head -3
fi
echo ""

# 4. Получение текущего пользователя
echo "4. Тестирование получения текущего пользователя..."
ME_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/me" \
    -b /tmp/cookies.txt 2>&1)

check_response "Получение текущего пользователя" "$ME_RESPONSE"
echo ""

# 5. Получение кампаний
echo "5. Тестирование получения кампаний..."
CAMPAIGNS_RESPONSE=$(curl -s -X GET "$BASE_URL/campaigns" \
    -b /tmp/cookies.txt 2>&1)

check_response "Получение кампаний" "$CAMPAIGNS_RESPONSE"
echo ""

# 6. Получение партнеров
echo "6. Тестирование получения партнеров..."
PARTNERS_RESPONSE=$(curl -s -X GET "$BASE_URL/partners" \
    -b /tmp/cookies.txt 2>&1)

check_response "Получение партнеров" "$PARTNERS_RESPONSE"
echo ""

# 7. Создание кампании
echo "7. Тестирование создания кампании..."
CAMPAIGN_DATA='{
    "title": "Test Campaign",
    "description": "Test description",
    "fullDescription": "Full test description with more details",
    "category": "education",
    "goal": 10000,
    "currency": "RUB",
    "type": "private",
    "urgent": false
}'

CREATE_CAMPAIGN_RESPONSE=$(curl -s -X POST "$BASE_URL/campaigns" \
    -H "Content-Type: application/json" \
    -b /tmp/cookies.txt \
    -d "$CAMPAIGN_DATA" 2>&1)

check_response "Создание кампании" "$CREATE_CAMPAIGN_RESPONSE"
CAMPAIGN_ID=$(echo "$CREATE_CAMPAIGN_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo ""

# 8. Создание пожертвования
if [ ! -z "$CAMPAIGN_ID" ]; then
    echo "8. Тестирование создания пожертвования..."
    DONATION_DATA="{
        \"campaignId\": \"$CAMPAIGN_ID\",
        \"amount\": 100,
        \"currency\": \"RUB\",
        \"anonymous\": false
    }"
    
    DONATION_RESPONSE=$(curl -s -X POST "$BASE_URL/donations" \
        -H "Content-Type: application/json" \
        -b /tmp/cookies.txt \
        -d "$DONATION_DATA" 2>&1)
    
    check_response "Создание пожертвования" "$DONATION_RESPONSE"
    echo ""
fi

# 9. Создание комментария
if [ ! -z "$CAMPAIGN_ID" ]; then
    echo "9. Тестирование создания комментария..."
    COMMENT_DATA='{
        "campaignId": "'"$CAMPAIGN_ID"'",
        "content": "Test comment"
    }'
    
    COMMENT_RESPONSE=$(curl -s -X POST "$BASE_URL/comments" \
        -H "Content-Type: application/json" \
        -b /tmp/cookies.txt \
        -d "$COMMENT_DATA" 2>&1)
    
    check_response "Создание комментария" "$COMMENT_RESPONSE"
    echo ""
fi

# 10. Загрузка файла (требует реального файла)
echo "10. Тестирование загрузки файла..."
if [ -f "test-image.jpg" ] || [ -f "test-image.png" ]; then
    TEST_FILE=$(ls test-image.* 2>/dev/null | head -1)
    UPLOAD_RESPONSE=$(curl -s -X POST "$BASE_URL/upload/image" \
        -b /tmp/cookies.txt \
        -F "image=@$TEST_FILE" 2>&1)
    
    check_response "Загрузка файла" "$UPLOAD_RESPONSE"
else
    echo -e "${YELLOW}⚠️  Загрузка файла: Пропущено (нет тестового файла)${NC}"
    echo "Создайте test-image.jpg или test-image.png для тестирования"
fi
echo ""

# Очистка
rm -f /tmp/cookies.txt

echo -e "${GREEN}✅ Тестирование завершено!${NC}"
echo ""
echo "Для детального тестирования используйте:"
echo "  - Postman: импортируйте коллекцию API"
echo "  - Браузер: откройте http://localhost:5000"
echo "  - DevTools: проверьте Network tab"

