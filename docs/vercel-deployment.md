# Деплой на Vercel

## Проект

- **URL**: https://accurate-payload-eight.vercel.app
- **Админка**: https://accurate-payload-eight.vercel.app/admin
- **Vercel Dashboard**: https://vercel.com/kmamleev/accurate-payload
- **План**: Hobby (бесплатный, лимит 1 ГБ RAM при сборке)

## Переменные окружения

Настраиваются в Vercel Dashboard → Settings → Environment Variables:

| Переменная | Описание |
|---|---|
| `DATABASE_URL` | PostgreSQL (Supabase connection pooler) |
| `PAYLOAD_SECRET` | Секрет шифрования Payload CMS |
| `NEXT_PUBLIC_SERVER_URL` | URL приложения (`https://accurate-payload-eight.vercel.app`) |
| `PAYLOAD_PUBLIC_SERVER_URL` | То же, что и `NEXT_PUBLIC_SERVER_URL` |
| `BLOB_READ_WRITE_TOKEN` | Токен Vercel Blob Store (создаётся автоматически при подключении store) |
| `STRIPE_SECRET_KEY` | Секретный ключ Stripe |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Публичный ключ Stripe |
| `STRIPE_WEBHOOKS_SIGNING_SECRET` | Секрет для проверки вебхуков Stripe |
| `COMPANY_NAME` | Название компании |
| `SITE_NAME` | Название сайта |
| `PREVIEW_SECRET` | Секрет для preview-режима |

## Хранение медиафайлов

Используется **Vercel Blob Storage** (`@payloadcms/storage-vercel-blob`), т.к. файловая система Vercel эфемерна — локальные файлы теряются при каждом деплое.

- **Blob Store**: `accurate-payload-media` (регион iad1)
- Конфигурация: `src/plugins/index.ts` → `vercelBlobStorage()`
- Клиентские загрузки включены (`clientUploads: true`)

## Миграции базы данных

Скрипт сборки (`pnpm build`) автоматически запускает `payload migrate` перед `next build`.

### Важно: запись `dev` в `payload_migrations`

При локальной разработке с `push: true` (авто-синхронизация схемы) Payload создаёт запись `dev` в таблице `payload_migrations`. На Vercel команда `payload migrate` при обнаружении этой записи задаёт интерактивный вопрос, что **вешает сборку**.

**Решение**: перед первым продакшен-деплоем удалить запись `dev` из базы:

```sql
DELETE FROM payload_migrations WHERE name = 'dev';
```

## Деплой

### Через CLI

```bash
vercel --prod
```

### Через Git

Push в `master` автоматически запускает деплой (если подключена интеграция с GitHub в Vercel Dashboard).

## Обработка изображений

В конфигурации Payload (`src/payload.config.ts`) подключён `sharp` — обязательно для обработки изображений на серверлесс-платформах.
