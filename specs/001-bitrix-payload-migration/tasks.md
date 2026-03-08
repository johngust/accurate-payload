# Tasks: Миграция товаров из Bitrix в Payload CMS

**Input**: Design documents from `/specs/001-bitrix-payload-migration/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/migration-interface.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 [P] Установить зависимости `cross-fetch` и `slugify` через `pnpm install`
- [x] T002 Создать директорию `src/lib/migration` для логики трансформации данных
- [x] T003 Создать шаблон файла `.env` с переменными `BITRIX_REST_URL` и `BITRIX_IBLOCK_ID`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure and data model updates

- [x] T004 [P] Добавить поле `bitrixId` в коллекцию Categories в `src/collections/Categories.ts`
- [x] T005 [P] Добавить поле `bitrixId` в коллекцию Products в `src/collections/Products/index.ts`
- [x] T006 [P] Добавить поле `bitrixId` в коллекцию Media в `src/collections/Media.ts`
- [x] T007 Запустить `pnpm generate:types` для обновления типов Payload
- [x] T008 [P] Создать клиент Bitrix API с поддержкой вебхуков в `src/lib/bitrix.ts`
- [x] T009 [P] Реализовать базовый логгер для процесса миграции в `src/lib/migration/logger.ts`

**Checkpoint**: Foundation ready - external IDs added and API client initialized.

---

## Phase 3: User Story 1 - Первоначальное подключение к Bitrix (Priority: P1)

**Goal**: Настроить и проверить соединение с REST API Bitrix

**Independent Test**: Запуск `npx tsx src/scripts/migrateFromBitrix.ts --dry-run` возвращает версию Bitrix и статус подключения.

- [x] T010 [US1] Реализовать метод проверки соединения (получение версии/информации) в `src/lib/bitrix.ts`
- [x] T011 [US1] Создать основной файл скрипта `src/scripts/migrateFromBitrix.ts` с обработкой CLI аргументов
- [x] T012 [US1] Добавить интеграционный тест для проверки подключения в `tests/int/bitrix-connection.test.ts`

**Checkpoint**: US1 complete - connectivity verified.

---

## Phase 4: User Story 2 - Миграция категорий (Priority: P2)

**Goal**: Перенос иерархии категорий (разделов) из Bitrix в Payload

**Independent Test**: Сравнение структуры категорий в Bitrix и Payload после запуска миграции с типом `categories`.

- [x] T013 [US2] Реализовать метод получения списка разделов `catalog.section.list` в `src/lib/bitrix.ts`
- [x] T014 [US2] Написать сервис миграции категорий в `src/lib/migration/category-service.ts`
- [x] T015 [US2] Добавить логику восстановления иерархии (parentId) на основе `bitrixId` в `src/lib/migration/category-service.ts`
- [x] T016 [US2] Интегрировать миграцию категорий в основной скрипт `src/scripts/migrateFromBitrix.ts`
- [x] T017 [US2] Добавить тест миграции категорий в `tests/int/category-migration.test.ts`

**Checkpoint**: US2 complete - categories tree migrated.

---

## Phase 5: User Story 3 - Миграция товаров и изображений (Priority: P1)

**Goal**: Перенос товаров, описаний и загрузка изображений в Vercel Blob

**Independent Test**: Наличие товаров с прикрепленными изображениями и корректными описаниями в админке Payload.

- [x] T018 [US3] Реализовать метод получения товаров `catalog.product.list` в `src/lib/bitrix.ts`
- [x] T019 [P] [US3] Создать утилиту `MediaUploader` для загрузки в Vercel Blob в `src/lib/migration/media-uploader.ts`
- [x] T020 [US3] Реализовать конвертацию HTML описания Bitrix в Lexical JSON в `src/lib/migration/html-to-lexical.ts`
- [x] T021 [US3] Написать сервис миграции товаров в `src/lib/migration/product-service.ts`
- [x] T022 [US3] Добавить логику привязки товаров к категориям по `bitrixId`
- [x] T023 [US3] Реализовать дедупликацию изображений по `bitrixId` в `MediaUploader`
- [x] T024 [US3] Интегрировать миграцию товаров в основной скрипт `src/scripts/migrateFromBitrix.ts`
- [x] T025 [US3] Добавить тест миграции товаров с изображениями в `tests/int/product-migration.test.ts`

**Checkpoint**: US3 complete - catalog migration fully functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Доработки, пагинация и отказоустойчивость

- [x] T026 Реализовать автоматическую пагинацию (обработку `start` в Bitrix) для всех методов API
- [x] T027 Добавить механизм повторных попыток (Retry) при сетевых ошибках в `src/lib/bitrix.ts`
- [x] T028 Оптимизировать скорость миграции (параллельная загрузка изображений)
- [x] T029 Обновить `quickstart.md` финальными командами и примерами
- [x] T030 Провести финальный прогон миграции с ограничением `--limit 100`

---

## Dependencies & Execution Order

1. **Setup & Foundational** (Phase 1 & 2): Обязательны перед началом любой истории.
2. **US1**: Обязательна (проверка связи).
3. **US2**: Рекомендуется перед US3 (товары ссылаются на категории).
4. **US3**: Зависит от завершения US2 для корректной привязки категорий.

### Parallel Opportunities

- T004, T005, T006 (обновление коллекций)
- T019 (загрузчик медиа) может разрабатываться параллельно с сервисами миграции.

---

## Implementation Strategy

### MVP First (User Story 1 & 3)
1. Настроить фундамент и добавить `bitrixId`.
2. Проверить связь (US1).
3. Реализовать базовый перенос товаров без категорий (US3), чтобы подтвердить возможность загрузки в Vercel Blob.

### Incremental Delivery
1. Добавить миграцию категорий (US2).
2. Связать товары с категориями.
3. Добавить конвертацию описаний и пагинацию.
