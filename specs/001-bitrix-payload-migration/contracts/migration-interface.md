# Migration Interface Contract: Bitrix to Payload

## Входные данные (Environment Variables)
Скрипт миграции использует переменные окружения для подключения к API Bitrix.

| Variable | Description | Example |
|----------|-------------|---------|
| `BITRIX_REST_URL` | Полный URL вебхука Bitrix с токеном | `https://vsedlyavanny.bitrix24.kz/rest/1/abc.../` |
| `BITRIX_IBLOCK_ID` | ID информационного блока каталога товаров | `14` |
| `BITRIX_CATALOG_ID` | (Опционально) ID каталога в модуле catalog | `1` |

## CLI Интерфейс
Запуск миграции через `tsx`:

```bash
npx tsx src/scripts/migrateFromBitrix.ts [--dry-run] [--limit 100] [--type products|categories|all]
```

### Аргументы:
- `--dry-run`: Выполнение скрипта без реальных изменений в базе Payload (только логирование).
- `--limit`: Ограничение количества обрабатываемых товаров (для тестирования).
- `--type`: Выбор типа данных для миграции.

## Формат ответа Bitrix API (Примеры)

### catalog.section.list
```json
{
  "result": {
    "sections": [
      {
        "ID": "101",
        "NAME": "Ванны",
        "IBLOCK_SECTION_ID": null,
        "PICTURE": "456"
      }
    ]
  }
}
```

### catalog.product.list
```json
{
  "result": {
    "products": [
      {
        "ID": "5001",
        "NAME": "Ванна акриловая 170x70",
        "DETAIL_TEXT": "<p>Описание ванны...</p>",
        "DETAIL_PICTURE": "789",
        "IBLOCK_SECTION_ID": "101"
      }
    ]
  }
}
```

## Требования к сетевым запросам
- Использование `AbortController` для таймаутов (30 секунд на запрос).
- Реализация `Retry` механизма при сетевых ошибках или 5xx статусах от Bitrix (макс. 3 попытки).
- Логирование каждого запроса к Bitrix в стандартный поток вывода (stdout).
