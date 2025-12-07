# Запуск приложения через Docker

## Быстрый старт

### Вариант 1: MongoDB в Docker + Приложение локально (рекомендуется)

```bash
# 1. Запустить только MongoDB
docker-compose up mongodb -d

# 2. Запустить приложение локально
. "$HOME/.nvm/nvm.sh"
MONGODB_URI="mongodb://sadakapass:sadakapass_password@localhost:27017/sadaka2025?authSource=admin" npm run dev
```

Приложение будет доступно на `http://localhost:5001`

---

### Вариант 2: Всё в Docker (если нужно)

```bash
# Использовать .env.docker вместо .env
docker-compose --env-file .env.docker up --build
```

---

## Что включает Docker setup

1. **MongoDB** - база данных (порт 27017)
2. **Приложение** - фронтенд + бэкенд (порт 5000)

---

## Настройка переменных окружения

### Для локального запуска (MongoDB в Docker):

Создайте файл `.env` в корне проекта:

```env
# MongoDB (Docker)
MONGODB_URI=mongodb://sadakapass:sadakapass_password@localhost:27017/sadaka2025?authSource=admin

# Server
PORT=5000
NODE_ENV=development
# Примечание: Внешний порт будет 5001 (см. docker-compose.yml)

# Session
SESSION_SECRET=your-secret-key-here-change-in-production

# API (бэкенд Владимира)
API_BASE_URL=https://bot.e-replika.ru/api/v1
API_TOKEN=test_token_123

# Frontend
VITE_API_BASE_URL=http://localhost:5001/api
VITE_API_TOKEN=test_token_123
VITE_INSAN_API_URL=https://fondinsan.ru/api/v1
VITE_INSAN_ACCESS_TOKEN=your-token-here
```

---

## Команды Docker

### Запуск только MongoDB
```bash
docker-compose up mongodb -d
```

### Остановка MongoDB
```bash
docker-compose stop mongodb
```

### Остановка и удаление данных
```bash
docker-compose down -v
```

### Просмотр логов MongoDB
```bash
docker-compose logs -f mongodb
```

### Выполнение команд в MongoDB
```bash
# Подключиться к MongoDB
docker-compose exec mongodb mongosh -u sadakapass -p sadakapass_password --authenticationDatabase admin

# Создать индексы
docker-compose exec mongodb mongosh -u sadakapass -p sadakapass_password --authenticationDatabase admin sadaka2025 --eval "db.users.createIndex({email: 1})"
```

---

## Разработка

### Рекомендуемый способ:

```bash
# 1. Запустить MongoDB в Docker
docker-compose up mongodb -d

# 2. Запустить приложение локально
npm run dev
```

### Создание индексов MongoDB:

```bash
# После запуска MongoDB
npm run db:mongo:indexes
```

---

## Решение проблем

### Проблема: Порт 27017 уже занят

**Решение**: Измените порт в `docker-compose.yml`:
```yaml
ports:
  - "27018:27017"  # Внешний порт:Внутренний порт
```

И обновите `MONGODB_URI`:
```env
MONGODB_URI=mongodb://sadakapass:sadakapass_password@localhost:27018/sadaka2025?authSource=admin
```

### Проблема: MongoDB не подключается

**Решение**: 
1. Проверьте, что контейнер запущен: `docker-compose ps`
2. Проверьте логи: `docker-compose logs mongodb`
3. Убедитесь, что `MONGODB_URI` правильный

### Проблема: Ошибка аутентификации

**Решение**: 
1. Проверьте имя пользователя и пароль в `docker-compose.yml`
2. Убедитесь, что используете `authSource=admin` в connection string

---

## Проверка работоспособности

После запуска проверьте:

1. **MongoDB**: 
   ```bash
   docker-compose exec mongodb mongosh -u sadakapass -p sadakapass_password --authenticationDatabase admin --eval "db.adminCommand('ping')"
   ```

2. **Приложение**: 
   ```bash
   curl http://localhost:5001
   ```

3. **API**: 
   ```bash
   curl http://localhost:5001/api/health
   ```

---

## Безопасность

**Важно для продакшена**:

1. Измените `SESSION_SECRET` на случайную строку
2. Измените пароль MongoDB
3. Используйте переменные окружения для секретов
4. Настройте HTTPS
5. Ограничьте доступ к MongoDB

---

## Примечания

- Данные MongoDB сохраняются в volume `mongodb_data`
- Загруженные файлы сохраняются в `./uploads`
- Логи можно просмотреть через `docker-compose logs`
