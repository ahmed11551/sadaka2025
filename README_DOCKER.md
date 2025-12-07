# Запуск приложения через Docker

## Быстрый старт

### Одна команда для запуска всего:

```bash
docker-compose up --build
```

Приложение будет доступно на `http://localhost:5000`

---

## Что включает Docker setup

1. **PostgreSQL** - база данных
2. **Приложение** - фронтенд + бэкенд
3. **Автоматические миграции** - применяются при запуске

---

## Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```env
# Database (уже настроено в docker-compose.yml)
DATABASE_URL=postgresql://sadakapass:sadakapass_password@postgres:5432/sadakapass?schema=public

# Server
PORT=5000
NODE_ENV=production

# Session
SESSION_SECRET=your-secret-key-here-change-in-production

# API (бэкенд Владимира)
API_BASE_URL=https://bot.e-replika.ru/api/v1
API_TOKEN=your-token-here
```

---

## Команды Docker

### Запуск
```bash
docker-compose up
```

### Запуск в фоне
```bash
docker-compose up -d
```

### Пересборка и запуск
```bash
docker-compose up --build
```

### Остановка
```bash
docker-compose down
```

### Остановка с удалением данных
```bash
docker-compose down -v
```

### Просмотр логов
```bash
docker-compose logs -f app
```

### Выполнение команд в контейнере
```bash
# Применить миграции вручную
docker-compose exec app npx prisma migrate deploy

# Открыть shell в контейнере
docker-compose exec app sh
```

---

## Разработка с Docker

### Для разработки используйте:

```bash
# Запустить только базу данных
docker-compose up postgres -d

# Запустить приложение локально
npm run dev
```

---

## Решение проблем

### Проблема: Порт 5000 уже занят

**Решение**: Измените порт в `docker-compose.yml`:
```yaml
ports:
  - "5001:5000"  # Внешний порт:Внутренний порт
```

### Проблема: База данных не подключается

**Решение**: 
1. Проверьте, что контейнер `postgres` запущен: `docker-compose ps`
2. Проверьте логи: `docker-compose logs postgres`
3. Убедитесь, что DATABASE_URL правильный

### Проблема: Миграции не применяются

**Решение**: 
```bash
docker-compose exec app npx prisma migrate deploy
```

### Проблема: Изображения не загружаются

**Решение**: Убедитесь, что папка `uploads` существует и имеет права на запись:
```bash
docker-compose exec app chmod -R 777 uploads
```

---

## Проверка работоспособности

После запуска проверьте:

1. **База данных**: 
   ```bash
   docker-compose exec postgres psql -U sadakapass -d sadakapass -c "SELECT 1;"
   ```

2. **Приложение**: 
   ```bash
   curl http://localhost:5000/api/health
   ```

3. **Фронтенд**: 
   Откройте в браузере: `http://localhost:5000`

---

## Безопасность

**Важно для продакшена**:

1. Измените `SESSION_SECRET` на случайную строку
2. Измените пароль базы данных
3. Используйте переменные окружения для секретов
4. Настройте HTTPS
5. Ограничьте доступ к базе данных

---

## Примечания

- Данные базы данных сохраняются в volume `postgres_data`
- Загруженные файлы сохраняются в `./uploads`
- Логи можно просмотреть через `docker-compose logs`

