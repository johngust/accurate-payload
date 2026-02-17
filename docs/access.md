# Доступы к проекту

## Локальная разработка

- Dev-сервер: `http://localhost:3000`
- Админка Payload CMS: `http://localhost:3000/admin`
- API: `http://localhost:3000/api/` (REST), `http://localhost:3000/api/graphql` (GraphQL)

## Учётные записи

### Администратор
- Email: `admin@example.com`
- Пароль: `Password123!`
- Роль: `admin`
- Доступ: админ-панель, все коллекции, полный CRUD

### Тестовые данные в базе
- Категория: «Тестовая категория» (id: 1)
- Товар: «Тестовый товар» ($29.99, 100 шт., slug: `test-product`)
- Страница: «Тестовая страница» (slug: `test-page`)

## Роли пользователей
- `admin` — полный доступ к админ-панели и всем коллекциям
- `customer` — доступ только к фронтенду, своим заказам, корзине и адресам

## Supabase
- Dashboard: `https://supabase.com/dashboard/project/dnidncscnxxgzebkblud`
- Project ref: `dnidncscnxxgzebkblud`
- Подключение: через connection pooler (`aws-1-ap-southeast-1.pooler.supabase.com:6543`), прямой хост доступен только по IPv6

## Stripe
- Тестовые ключи настроены в `.env` (sk_test_, pk_test_) — требуют замены на реальные тестовые ключи из Stripe Dashboard
- Локальный forwarding вебхуков: `pnpm stripe-webhooks`
