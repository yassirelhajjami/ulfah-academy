# أكاديمية أُلفة — Oulfa Academy

Marketing website for Oulfa Academy, an online Quran memorization / tajweed / Islamic studies academy for children and teens. See [`docs/PRD.md`](docs/PRD.md) for the full product spec and [`docs/database-schema.md`](docs/database-schema.md) for the data model.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS v4, Supabase (Postgres/Auth), deployed to Vercel.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/ar` (default) or `/en` based on the browser's `Accept-Language` header.

## i18n

Bilingual (Arabic/English, RTL/LTR) via a manual `app/[locale]/` routing setup — no i18n library. Locale detection/redirect lives in `proxy.ts`. Copy lives in `lib/i18n/dictionaries/{ar,en}.ts`, typed against `lib/i18n/dictionary-type.ts` so a missing translation key is a compile error, not a silent gap.

## Supabase

- `supabase/migrations/*.sql` — run these in order against your Supabase project (SQL Editor, or `supabase db push` once the CLI is linked) before the "book assessment" / contact forms will actually persist data.
- `.env.local` holds `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` (server-only — used by `lib/supabase/service-role.ts` from Server Actions for the two public lead-capture forms) and placeholders for `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (needed once Phase 2 auth work starts).
- **Never** import `lib/supabase/service-role.ts` from a Client Component — it bypasses every RLS policy.

## Project structure

```
app/[locale]/        route pages (marketing site)
components/marketing  page sections specific to the marketing site
components/ui          generic, reusable UI primitives
lib/i18n/               locale config, dictionaries, path helpers
lib/actions/            Server Actions (book-assessment, contact)
lib/supabase/           Supabase client helpers
supabase/migrations/    SQL schema, in order
docs/                   PRD + data model docs
```
