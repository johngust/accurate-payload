# Quickstart: Миграция из Bitrix в Payload CMS

## Подготовка Bitrix
1. Перейдите в **Bitrix24 -> Маркетплейс -> Вебхуки**.
2. Создайте **Входящий вебхук**.
3. В правах доступа выберите: `catalog`, `iblock`, `crm` (если используется CRM каталог).
4. Скопируйте полученный URL.

## Настройка окружения
Добавьте в `.env` файл следующие переменные:

```env
BITRIX_REST_URL="https://vsedlyavanny.kz/rest/1/ваш_токен/"
BITRIX_IBLOCK_ID=14
```

## Установка зависимостей
Убедитесь, что установлены `tsx` и необходимые библиотеки для запросов:

```bash
pnpm install cross-fetch slugify
```

## Запуск миграции

### Тестовый запуск (первые 5 товаров)
Проверьте логику сопоставления полей без загрузки всех данных:

```bash
npx tsx src/scripts/migrateFromBitrix.ts --limit 5 --dry-run
```

### Полная миграция

1.  **Миграция категорий**:
    ```bash
    npx tsx src/scripts/migrateFromBitrix.ts --type categories
    ```
2.  **Миграция товаров**:
    ```bash
    npx tsx src/scripts/migrateFromBitrix.ts --type products
    ```

## Верификация результатов
1. Зайдите в админ-панель Payload: `/admin/collections/products`.
2. Проверьте наличие товаров и корректность отображения изображений (они должны загружаться из Vercel Blob).
3. Убедитесь, что у товаров в сайдбаре заполнен `ID в Bitrix`.
