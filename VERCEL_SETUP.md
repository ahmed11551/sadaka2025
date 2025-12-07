# Полная инструкция по настройке Vercel

## 🎯 Критически важно: Environment Variables

Без этих переменных приложение не будет работать на Vercel!

### Шаг 1: Добавить Environment Variables в Vercel

1. Зайдите на https://vercel.com
2. Выберите ваш проект `sadaka2025`
3. Перейдите в **Settings** → **Environment Variables**
4. Добавьте следующие переменные для **Production**, **Preview** и **Development**:

```
VITE_API_BASE_URL=https://bot.e-replika.ru/api/v1
VITE_API_TOKEN=test_token_123
VITE_INSAN_API_URL=https://fondinsan.ru/api/v1
VITE_INSAN_ACCESS_TOKEN=0xRs6obpvPOx4lkGLYxepBOcMju
```

### Шаг 2: Пересобрать проект

После добавления переменных:
1. Перейдите в **Deployments**
2. Найдите последний deployment
3. Нажмите **"..."** → **Redeploy**
4. Или сделайте новый commit и push (Vercel автоматически пересоберет)

### Шаг 3: Проверить работу

1. Откройте https://sadaka2025.vercel.app
2. Откройте DevTools (F12) → Console
3. Проверьте что нет ошибок CORS или 401
4. Проверьте Network tab - запросы должны возвращать 200 или 404 (не 401)

---

## 🔧 Решение проблем с CORS

### Проблема: CORS ошибки в консоли

Если видите ошибки типа:
```
Access to fetch at 'https://bot.e-replika.ru/api/v1/...' from origin 'https://sadaka2025.vercel.app' has been blocked by CORS policy
```

### Решение 1: Проверить что API разрешает CORS

Некоторые API автоматически разрешают запросы с любых доменов. Проверьте:
- Откройте Network tab в DevTools
- Посмотрите на заголовки ответа
- Если есть `Access-Control-Allow-Origin: *` - CORS работает

### Решение 2: Использовать Vercel Edge Functions для прокси

Если API блокирует CORS, создайте Edge Function:

**Создайте файл `api/proxy/[...path].ts`:**

```typescript
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const pathname = url.pathname.replace('/api/proxy', '');
  
  // Определяем какой API использовать
  const apiBase = pathname.startsWith('/insan') 
    ? 'https://fondinsan.ru/api/v1'
    : 'https://bot.e-replika.ru/api/v1';
  
  const targetUrl = `${apiBase}${pathname}${url.search}`;
  
  // Получаем токен из env
  const token = pathname.startsWith('/insan')
    ? process.env.VITE_INSAN_ACCESS_TOKEN
    : process.env.VITE_API_TOKEN;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    if (pathname.startsWith('/insan')) {
      // Для Insan API токен в query параметре
      const separator = url.search ? '&' : '?';
      const newUrl = `${targetUrl}${separator}access-token=${token}`;
      const response = await fetch(newUrl, {
        method: req.method,
        headers: req.headers.get('content-type') ? {
          'Content-Type': req.headers.get('content-type')!,
        } : {},
        body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined,
      });
      
      return new Response(response.body, {
        status: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Content-Type': 'application/json',
        },
      });
    } else {
      // Для основного API токен в заголовке
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  const response = await fetch(targetUrl, {
    method: req.method,
    headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined,
  });
  
  return new Response(response.body, {
    status: response.status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': response.headers.get('content-type') || 'application/json',
    },
  });
}
```

**Обновите `client/src/lib/api.ts` для использования прокси:**

```typescript
const getDefaultApiUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    // Используем Edge Function прокси на Vercel
    return '/api/proxy';
  }
  return '/api/external';
};
```

---

## 📊 Проверка работы API

### Локальная проверка

```bash
# 1. Скопируйте .env.example в .env
cp .env.example .env

# 2. Заполните токены в .env
# VITE_API_TOKEN=test_token_123
# VITE_INSAN_ACCESS_TOKEN=0xRs6obpvPOx4lkGLYxepBOcMju

# 3. Запустите локально
npm run dev

# 4. Откройте http://localhost:5000
# 5. Проверьте Console и Network tab
```

### Проверка на Vercel

1. Откройте https://sadaka2025.vercel.app
2. Откройте DevTools (F12)
3. Перейдите в **Console** - проверьте ошибки
4. Перейдите в **Network** - проверьте запросы:
   - Запросы к `/api/v1/campaigns` должны возвращать 200 или 404 (не 401)
   - Запросы к `/api/v1/programs` (Insan) должны возвращать 200 или 404

---

## ✅ Чек-лист настройки Vercel

- [ ] Environment Variables добавлены в Vercel Dashboard
- [ ] Все 4 переменные добавлены (VITE_API_BASE_URL, VITE_API_TOKEN, VITE_INSAN_API_URL, VITE_INSAN_ACCESS_TOKEN)
- [ ] Переменные добавлены для Production, Preview и Development
- [ ] Проект пересобран после добавления переменных
- [ ] Проверена работа на https://sadaka2025.vercel.app
- [ ] Нет ошибок CORS в консоли
- [ ] Нет ошибок 401 (Unauthorized) в Network tab
- [ ] Кампании загружаются (или показывают EmptyState, но не белый экран)

---

## 🐛 Troubleshooting

### Проблема: Кампании не загружаются

**Проверьте**:
1. Environment Variables добавлены в Vercel?
2. Проект пересобран после добавления переменных?
3. В Network tab запросы возвращают 401? → Добавьте токены
4. В Network tab запросы блокируются CORS? → Используйте Edge Function прокси

### Проблема: Белый экран

**Проверьте**:
1. Console tab - есть ли ошибки JavaScript?
2. Network tab - все ли ресурсы загружаются (200)?
3. Проверьте что `base: "/"` в `client/vite.config.ts`

### Проблема: 404 на всех страницах

**Проверьте**:
1. `vercel.json` содержит rewrites для SPA?
2. `outputDirectory` указан правильно (`dist/public`)?

---

## 📚 Дополнительные ресурсы

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions)
- [CORS объяснение](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**После настройки env переменных приложение должно работать!** 🚀

