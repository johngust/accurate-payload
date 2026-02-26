# Deployment, Migrations & Media

## Hosting

- **Vercel** (Hobby plan, account `kmamleyev`)
- **Database**: Supabase PostgreSQL via connection pooler (`aws-1-ap-southeast-1.pooler.supabase.com:6543`)
- **Media storage**: Vercel Blob via `@payloadcms/storage-vercel-blob`
- **Deploy**: Only via Vercel CLI (`npx vercel --prod`). GitHub integration is broken (repo `johngust/accurate-payload` belongs to a different account).

## Migration Workflow

### After schema changes (adding/modifying collections, fields, globals)

```bash
pnpm generate:types          # 1. Regenerate TypeScript types
pnpm payload migrate:create  # 2. Create migration file in src/migrations/
npx tsc --noEmit             # 3. Verify TypeScript compiles
# 4. Commit migration files, then deploy
```

### The `dev` record trap

**CRITICAL:** When Payload runs locally with `push: true` (default in dev mode), it creates a `dev` row in the `payload_migrations` table (batch = -1). This record makes `payload migrate` on Vercel ask an interactive question, which **hangs the build indefinitely**.

**Before every production deploy**, check and delete the `dev` record:

```sql
-- Check
SELECT * FROM payload_migrations WHERE name = 'dev';
-- Delete if exists
DELETE FROM payload_migrations WHERE name = 'dev';
```

This also happens when running local scripts via `npx tsx src/scripts/*.ts` — they initialize Payload in dev mode and trigger `push: true`.

### Checking migration status

```sql
SELECT name, batch FROM payload_migrations ORDER BY created_at;
```

Migrations run automatically during `pnpm build` (which Vercel runs on deploy). If a migration has already been applied via dev-mode push, insert its record manually to skip it:

```sql
INSERT INTO payload_migrations (name, batch, created_at, updated_at)
VALUES ('20260225_175615', 4, NOW(), NOW());
```

## Media & Vercel Blob Storage

### How it works

The plugin is configured with `disablePayloadAccessControl: false` (default). This means:

- **DB stores relative URLs**: `/api/media/file/<filename>`
- **Payload proxies requests**: browser → `/api/media/file/x.png` → Payload → Vercel Blob → response
- **Blob URLs are never exposed** to the frontend

### Filename suffix problem

Every `payload.update()` with a file increments the filename suffix: `photo.png` → `photo-1.png` → `photo-2.png`. This happens because Payload deduplicates filenames.

**After bulk media re-uploads**, static pages contain stale filenames. Fix with a force deploy:

```bash
npx vercel --prod --force  # Rebuilds without cache
```

### Uploading media to Blob

**Requirement:** `BLOB_READ_WRITE_TOKEN` must be in `.env` for local uploads to reach Blob.

Scripts in `src/scripts/`:

| Script | Purpose | When to use |
|--------|---------|-------------|
| `uploadMedia.ts` | Creates new media records from `public/images/` | Fresh setup, adding new images |
| `reuploadMediaToBlob.ts` | Re-uploads existing media records from `media/` to Blob | After adding BLOB token, migrating to Blob |
| `uploadMissingPlaceholders.ts` | Generates placeholder PNGs via `sharp` for specific IDs | Replacing missing images |
| `seedClone.ts` | Seeds pages, categories, products (uses existing media by filename) | Fresh content setup |

Run with: `npx tsx src/scripts/<script>.ts`

### Typical sequence for fresh deploy

```bash
# 1. Ensure BLOB_READ_WRITE_TOKEN is in .env
# 2. Upload images (creates media records + uploads to Blob)
npx tsx src/scripts/uploadMedia.ts
# 3. Seed content (references media by filename)
npx tsx src/scripts/seedClone.ts
# 4. Delete dev migration record
# DELETE FROM payload_migrations WHERE name = 'dev';
# 5. Deploy
npx vercel --prod
```

## Deploy Checklist

1. `DELETE FROM payload_migrations WHERE name = 'dev'` — remove dev push marker
2. `npx vercel --prod` — deploy via CLI
3. If static pages show stale images, use `npx vercel --prod --force`

## Required Environment Variables on Vercel

All of these must be set in Vercel project settings (Production environment):

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase PostgreSQL via **pooler** (not direct host) |
| `PAYLOAD_SECRET` | Encryption secret |
| `PAYLOAD_PUBLIC_SERVER_URL` | `https://accurate-payload-eight.vercel.app` (no trailing `\n`!) |
| `NEXT_PUBLIC_SERVER_URL` | Same as above |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob store token |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOKS_SIGNING_SECRET` | Stripe webhook secret |
| `COMPANY_NAME` | Company name |
| `SITE_NAME` | Site name |
| `PREVIEW_SECRET` | Draft preview secret |

**IMPORTANT:** When adding env vars via CLI, use `echo -n` to avoid trailing newline:

```bash
echo -n 'https://example.com' | npx vercel env add NEXT_PUBLIC_SERVER_URL production
```

## Common Pitfalls

| Problem | Cause | Fix |
|---------|-------|-----|
| Build hangs on interactive question | `dev` row in `payload_migrations` | Delete the `dev` row |
| Images 404 on Vercel | Files not in Blob | Run `reuploadMediaToBlob.ts` with `BLOB_READ_WRITE_TOKEN` |
| `%0A` in image URLs | `\n` in `NEXT_PUBLIC_SERVER_URL` env var | Recreate env var with `echo -n` |
| Static pages show old images | Build cache + filename suffix increment | `npx vercel --prod --force` |
| `BLOB_READ_WRITE_TOKEN` not working | Broken line in `.env` (no newline before key) | Check `.env` with `cat -A`, ensure each var on its own line |
| Script uploads go to local disk, not Blob | `BLOB_READ_WRITE_TOKEN` missing or malformed in `.env` | Verify with `grep '^BLOB' .env \| cat -A` |
