# Implementation Plan: Миграция товаров из Bitrix в Payload CMS

**Branch**: `001-bitrix-payload-migration` | **Date**: 2026-03-06 | **Spec**: [specs/001-bitrix-payload-migration/spec.md]
**Input**: Feature specification from `/specs/001-bitrix-payload-migration/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Разработка отказоустойчивого скрипта миграции на TypeScript, использующего Bitrix REST API (через входящие вебхуки) и Payload Local API. Основные возможности:
- Автоматическая загрузка изображений в Vercel Blob Storage.
- Сохранение иерархии категорий (разделов).
- Предотвращение дубликатов с помощью внешних ID (`bitrixId`).
- Использование Lexical для переноса описаний товаров.

## Technical Context

**Language/Version**: TypeScript / Node.js >= 20  
**Primary Dependencies**: `payload` (Local API), `cross-fetch`, `@payloadcms/storage-vercel-blob`  
**Storage**: PostgreSQL (Supabase), Vercel Blob Storage  
**Testing**: vitest (интеграционные тесты миграции), playwright (проверка в админке)  
**Target Platform**: Node.js / Vercel  
**Project Type**: Migration Script / CLI Utility  
**Performance Goals**: Миграция 100 товаров < 5 минут, обработка пагинации Bitrix (50 элементов за запрос)  
**Constraints**: Ограничения Bitrix REST API на количество запросов, лимиты Vercel Blob на размер файлов  
**Scale/Scope**: Полный перенос IBLOCK каталога (разделы и элементы)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Payload-First**: Подход соответствует архитектуре Payload CMS 3.0?
- [x] **II. Next.js 15**: Используются современные паттерны App Router?
- [x] **III. Types & Standards**: Запланирована генерация типов и соблюдение линтинга?
- [x] **IV. Language**: Вся документация и комментарии будут на русском языке?
- [x] **V. Testing**: Запланированы ли интеграционные или E2E тесты?
- [x] **Deploy**: Учтен ли критический шаг удаления 'dev' миграций?

## Project Structure

### Documentation (this feature)

```text
specs/001-bitrix-payload-migration/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── scripts/
│   └── migrateFromBitrix.ts  # Основной скрипт миграции
├── lib/
│   ├── bitrix.ts            # Клиент для Bitrix API
│   └── migration/           # Логика трансформации данных
└── migrations/              # SQL миграции для хранения внешних ID (если нужно)
```

**Structure Decision**: Использование директории `src/scripts` для автономных скриптов миграции, использующих Local API Payload.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
