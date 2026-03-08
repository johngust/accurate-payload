# Research: Миграция из Bitrix в Payload CMS

## Decision: Использование Bitrix REST API (Входящий вебхук) и Payload Local API

### Rationale
- **Входящий вебхук Bitrix**: Самый простой способ интеграции, не требующий регистрации полноценного приложения в Bitrix24. Позволяет получать данные о разделах (категориях) и элементах (товарах) по протоколу HTTP/JSON.
- **Payload Local API**: Обеспечивает прямой программный доступ к базе данных и системе хранения файлов Payload, минуя HTTP-оверхед. Это критично для массовой загрузки данных и обработки изображений.

## Findings

### 1. Структура данных Bitrix (Catalog)
- **Категории (`catalog.section.list`)**:
  - `ID`: Уникальный идентификатор в Bitrix.
  - `NAME`: Название категории.
  - `IBLOCK_SECTION_ID`: ID родительской категории (null для корневых).
  - `PICTURE`: Ссылка или ID изображения (требует скачивания).
- **Товары (`catalog.product.list` или `crm.product.list`)**:
  - `ID`: Уникальный идентификатор.
  - `NAME`: Название.
  - `DETAIL_TEXT`: Описание товара (HTML).
  - `DETAIL_PICTURE`: Основное изображение.
  - `PRICE`: Цена (может храниться в отдельном IBLOCK или через `catalog.price.list`).

### 2. Маппинг полей
| Bitrix Field | Payload Collection | Payload Field | Transformation |
|--------------|--------------------|---------------|----------------|
| Section NAME | Categories         | title         | Plain string   |
| Section ID   | Categories         | bitrixId      | New field (number) |
| Parent ID    | Categories         | parent        | Relationship (lookup by bitrixId) |
| Product NAME | Products           | title         | Plain string   |
| Product ID   | Products           | bitrixId      | New field (number) |
| Detail Text  | Products           | description   | HTML to Lexical conversion |
| Detail Pic   | Media              | file          | Download -> Upload to Vercel Blob |

### 3. Обработка изображений
Bitrix REST API часто возвращает URL-адреса изображений в формате `/upload/iblock/...`. Для миграции необходимо:
1.  Сформировать полный URL изображения.
2.  Скачать файл во временное хранилище или буфер.
3.  Создать запись в коллекции `media` в Payload, передав буфер файла. Payload автоматически загрузит его в Vercel Blob (согласно конфигурации `Media` коллекции).
4.  Связать полученный ID медиа-объекта с товаром или категорией.

### 4. Пагинация и ограничения
- Bitrix возвращает максимум 50 элементов за раз.
- Необходимо использовать параметр `start` для циклического обхода.
- Рекомендуется задержка (sleep) между запросами при больших объемах, чтобы избежать блокировки по rate-limit.

## Alternatives Considered
- **Прямой доступ к БД MySQL (Bitrix)**:
  - *Плюсы*: Очень высокая скорость.
  - *Минусы*: Сложность (требует SSH/VPN доступа), риск нарушения целостности данных Bitrix, сложность структуры таблиц Bitrix.
  - *Вердикт*: Отклонено в пользу REST API для чистоты и переносимости решения.
- **Экспорт в CSV/Excel**:
  - *Минусы*: Сложность автоматизации переноса картинок и иерархии категорий.
  - *Вердикт*: Отклонено.

## Резюме для реализации
Необходимо добавить поле `bitrixId` в коллекции `Products`, `Categories` и `Media` (опционально для дедупликации) для обеспечения идемпотентности скрипта миграции.
