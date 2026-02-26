# Project Overview

This is a full-stack **Ecommerce Application** built using **Next.js** (App Router) for the frontend and **Payload CMS** for the backend. It serves as a comprehensive template for building online stores with features like product management, shopping carts, orders, and Stripe payments.

## Key Technologies

*   **Framework:** Next.js 15 (React 19)
*   **CMS:** Payload CMS 3.0
*   **Database:** PostgreSQL (via `@payloadcms/db-postgres`)
*   **Styling:** Tailwind CSS, Shadcn UI, Lucide React Icons
*   **Language:** TypeScript
*   **Payments:** Stripe (via `@payloadcms/plugin-ecommerce`)
*   **Plugins:**
    *   `@payloadcms/plugin-ecommerce`: Handles carts, orders, products, and payments.
    *   `@payloadcms/plugin-seo`: Manages SEO metadata.
    *   `@payloadcms/plugin-form-builder`: Allows creating dynamic forms.

## Architecture

The project follows a monorepo-style structure where both the Next.js frontend and Payload CMS backend reside in the same repository, sharing the `src` directory.

*   `src/app`: Next.js App Router structure.
    *   `src/app/(app)`: Frontend application routes.
    *   `src/app/(payload)`: Payload CMS admin panel and API routes.
*   `src/payload.config.ts`: Main configuration for Payload CMS (collections, globals, db, plugins).
*   `src/collections`: Payload collection definitions (Users, Pages, Products, etc.).
*   `src/globals`: Payload global definitions (Header, Footer).
*   `src/components`: React components (UI, blocks, etc.).
*   `src/blocks`: Payload block components used in the Layout Builder.

## Building and Running

The project uses `pnpm` as the package manager.

### Prerequisites

*   Node.js (>=18.20.2 or >=20.9.0)
*   PostgreSQL database
*   Stripe account (for payments)

### Environment Setup

1.  Copy `.env.example` to `.env`.
2.  Configure `DATABASE_URL` with your PostgreSQL connection string.
3.  Configure `PAYLOAD_SECRET` and Stripe keys (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOKS_SIGNING_SECRET`).

### Scripts

*   **Development:**
    ```bash
    pnpm dev
    ```
    Starts the development server on `http://localhost:3000`.

*   **Production Build:**
    ```bash
    pnpm build
    ```
    Builds the Next.js application for production.

*   **Start Production Server:**
    ```bash
    pnpm start
    ```
    Starts the built application.

*   **Database Migrations:**
    ```bash
    pnpm payload migrate:create
    pnpm payload migrate
    ```

*   **Testing:**
    *   **All Tests:** `pnpm test`
    *   **Integration Tests (Vitest):** `pnpm test:int`
    *   **E2E Tests (Playwright):** `pnpm test:e2e`

*   **Linting:**
    ```bash
    pnpm lint
    ```

*   **Type Generation:**
    ```bash
    pnpm generate:types
    ```
    Generates TypeScript types for Payload collections.

## Development Conventions

*   **Code Style:** Adheres to `eslint` and `prettier` configurations.
*   **Component Structure:** Components are located in `src/components`. Reusable UI components are in `src/components/ui`.
*   **Access Control:** Implemented in `src/access` (e.g., `adminOnly`, `customerOnly`).
*   **Testing:**
    *   E2E tests are located in `tests/e2e` and run with Playwright.
    *   Integration tests are located in `tests/int` and run with Vitest.

## Deployment, Migrations & Media

### Hosting

*   **Vercel** (Hobby plan) — deploy via CLI only: `npx vercel --prod`. GitHub integration is broken.
*   **Database:** Supabase PostgreSQL via connection pooler (`aws-1-ap-southeast-1.pooler.supabase.com:6543`). Direct host (IPv6) is unreachable.
*   **Media:** Vercel Blob Storage via `@payloadcms/storage-vercel-blob` with `clientUploads: true`.

### Migration Workflow

After schema changes:

```bash
pnpm generate:types          # Regenerate types
pnpm payload migrate:create  # Create migration
npx tsc --noEmit             # Verify TypeScript
# Commit, then deploy
```

**CRITICAL — `dev` record trap:** Running Payload locally (`pnpm dev` or `npx tsx src/scripts/*.ts`) creates a `dev` row in `payload_migrations` table. This causes Vercel builds to hang on an interactive question. **Delete before every deploy:**

```sql
DELETE FROM payload_migrations WHERE name = 'dev';
```

### Media & Vercel Blob

*   DB stores relative URLs: `/api/media/file/<filename>`. Payload proxies from Blob.
*   `BLOB_READ_WRITE_TOKEN` required in `.env` for local uploads to Blob.
*   Each `payload.update()` with a file increments filename suffix (`-1`, `-2`, ...) — needs force redeploy to update static pages.

**Scripts** (run with `npx tsx`):

*   `src/scripts/uploadMedia.ts` — Creates media records from `public/images/`
*   `src/scripts/reuploadMediaToBlob.ts` — Re-uploads existing media to Blob
*   `src/scripts/uploadMissingPlaceholders.ts` — Generates placeholder PNGs
*   `src/scripts/seedClone.ts` — Seeds content (expects media already uploaded)

### Deploy Checklist

1.  `DELETE FROM payload_migrations WHERE name = 'dev'`
2.  `npx vercel --prod` (or `--force` if images stale)

### Required Vercel Environment Variables

`DATABASE_URL`, `PAYLOAD_SECRET`, `PAYLOAD_PUBLIC_SERVER_URL`, `NEXT_PUBLIC_SERVER_URL`, `BLOB_READ_WRITE_TOKEN`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOKS_SIGNING_SECRET`, `COMPANY_NAME`, `SITE_NAME`, `PREVIEW_SECRET`

**WARNING:** Use `echo -n` when adding env vars via CLI to avoid trailing newline.

## Agent Guidelines

*   **Language:** All communication, explanations, and code comments must be in **Russian** (Русский).
