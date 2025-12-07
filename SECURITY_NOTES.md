# Заметки по безопасности

## ⚠️ ВАЖНО: Токены в коде

### Текущая ситуация:

1. **Токены захардкожены в коде**:
   - `client/src/lib/api.ts`: дефолтный токен `test_token_123`
   - `client/src/lib/insan-api.ts`: токен `0xRs6obpvPOx4lkGLYxepBOcMju`

2. **Проблема**: Эти токены видны в собранном JavaScript коде на клиенте

### Что сделать:

1. ✅ **Создан `.env.example`** - шаблон для env переменных
2. ✅ **Код обновлен** - использует env переменные с fallback
3. ⚠️ **Нужно сделать**:
   - Удалить токены из кода (сделать их обязательными через env)
   - В production использовать только env переменные
   - Для Vercel: добавить все токены в Environment Variables

### Для Vercel:

Добавьте в Vercel Dashboard → Settings → Environment Variables:

```
VITE_API_BASE_URL=https://bot.e-replika.ru/api/v1
VITE_API_TOKEN=ваш-реальный-токен
VITE_INSAN_API_URL=https://fondinsan.ru/api/v1
VITE_INSAN_ACCESS_TOKEN=ваш-реальный-токен-инсан
```

### Для локальной разработки:

1. Скопируйте `.env.example` в `.env`
2. Заполните реальные токены (не коммитьте `.env` в Git!)
3. `.env` уже в `.gitignore`

### Рекомендации:

- **Тестовые токены** можно оставить в коде как fallback только для разработки
- **Production токены** должны быть ТОЛЬКО в env переменных
- Рассмотрите возможность ротации токенов

