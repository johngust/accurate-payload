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

## Agent Guidelines

*   **Language:** All communication, explanations, and code comments must be in **Russian** (Русский).
