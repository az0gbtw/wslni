# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # ESLint
```

No test suite is configured. There is no `pnpm test` command.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY   # server-only, used in lib/notifications.ts and /api/admin/*
RESEND_API_KEY               # transactional emails
```

## Stack

- **Next.js 16** App Router · **React 19** · **TypeScript**
- **Tailwind CSS v4** (PostCSS plugin, not the Vite plugin)
- **Supabase** — auth, Postgres, Storage, Realtime subscriptions
- **shadcn/ui** (Radix UI primitives) in `components/ui/`
- **Sonner** for toasts (wired in `components/providers.tsx`)
- **Resend** for transactional email (`lib/emails.ts`, `app/api/emails/`)
- **Vercel Analytics** (production only)

## Architecture

### Supabase clients
Two separate clients are used — never mix them:
- `lib/supabase/server.ts` — async `createClient()` for Server Components, Server Actions, Route Handlers. Uses `next/headers` cookies.
- `lib/supabase/client.ts` — sync `createClient()` for Client Components. Uses browser storage.
- `lib/supabase/admin.ts` — service-role client, `server-only`, used exclusively in admin API routes.

### Rendering pattern
Data-heavy pages (services list, service detail, profile, home) are **async Server Components** that fetch from Supabase and pass serialisable props down to a `*-client.tsx` Client Component for interactivity. Example: `app/services/[id]/page.tsx` → `components/service-detail-client.tsx`.

### Auth & route protection
`middleware.ts` guards these prefixes via Supabase session check: `/dashboard/*`, `/profil`, `/commandes/*`, `/messages/*`, `/parametres/*`, `/paiement/*`, `/admin/*`. Unauthenticated requests redirect to `/connexion?redirect=<original>`.

Admin-only pages (`/admin/*`) additionally check `profiles.role === 'admin'` inside the page component itself.

### i18n (FR / AR)
- Language stored in a `lang` cookie (`"fr"` or `"ar"`).
- All UI strings live in `lib/translations.ts` under a `fr` / `ar` object tree. Import `translations[lang].sectionKey`.
- `lib/i18n.ts` exposes `useTranslation()` hook and re-exports `translations`.
- Arabic uses the **Cairo** font (`--font-cairo`). RTL direction is toggled with Tailwind's `rtl:` variant and CSS logical properties. The `<html>` `lang` / `dir` attributes are set dynamically by `components/providers.tsx` via `useLanguage()`.
- `lib/language-context.tsx` provides `useLanguage()` (reads/writes the `lang` cookie client-side).

### Categories
`lib/categories.ts` is the single source of truth. It exports:
- `CATEGORY_GROUPS` — 9 top-level groups, each with `subcategories[]`. Each entry has `value` (slug), `label` (FR), `arLabel` (AR).
- `GROUP_GRADIENTS`, `GROUP_PILL_COLORS` — per-group visual tokens used on the service detail hero and service cards.
- `getCategoryLabel(value, lang)` — resolves a subcategory slug to its localised label.
- `getGroupForCategory(subcategoryValue)` — returns the parent group value.

Services store **both** `category` (subcategory slug) and `category_group` (group slug).

### Contact info filtering
`lib/contact-filter.ts` exports `filterContactInfo(text)` — strips Moroccan phone numbers, emails, WhatsApp references, and `@handles` from free-text fields. Applied to messages before insert to prevent off-platform solicitation.

## Database Schema

Run migrations in this order in the Supabase SQL Editor:

| File | What it adds |
|------|-------------|
| `supabase/schema.sql` | `profiles` table, `avatars` storage bucket |
| `supabase/services.sql` | `services` table (base columns) |
| `supabase/add_service_columns.sql` | `images`, `pricing_tiers`, `category_group`, `requirements` JSONB columns; `service-images` bucket |
| `supabase/orders.sql` | `orders` table |
| `supabase/messages.sql` | `conversations` + `messages` tables, Realtime, trigger to update `last_message_at` |
| `supabase/reviews.sql` | `reviews` table |
| `supabase/notifications.sql` | `notifications` table + DB triggers (new_message, new_order, order_status, new_review) |
| `supabase/notifications_v2.sql` | Updated notification triggers |
| `supabase/cin_verification.sql` | `profiles.cin_status`, `profiles.role`, `cin-uploads` private bucket |
| `supabase/add_profile_morocco_columns.sql` | `profiles.city`, `profiles.languages` |
| `supabase/order_messages.sql` | Order-scoped messaging |
| `supabase/delivery_columns.sql` | Delivery tracking columns |
| `supabase/profile_views.sql` | Profile view counter |
| `supabase/favorites_migration.sql` | `favorites` table |
| `supabase/portfolio_migration.sql` | `services.portfolio_items` JSONB column; `service-portfolios` public bucket |

### Key table shapes

**`profiles`**: `id (uuid, = auth.uid)`, `full_name`, `job_title`, `bio`, `skills[]`, `avatar_url`, `city`, `languages[]`, `cin_status` (`none|pending|verified|rejected`), `role` (`user|admin`), `created_at`

**`services`**: `id`, `user_id`, `title`, `description`, `category` (subcategory slug), `category_group`, `price`, `delivery_days`, `status` (`published|draft|archived`), `images` (JSONB array of URLs), `pricing_tiers` (JSONB: `{basic,standard,premium}` each with `name,description,price,delivery_days`), `requirements` (JSONB string array), `portfolio_items` (JSONB array of `{url,title?,type:"image"|"pdf"}`)

**`orders`**: `id`, `service_id`, `client_id`, `freelancer_id`, `service_title`, `price`, `status` (`en_attente→en_cours→livré|annulé`), `tier` (basic/standard/premium), `requirements_answers` (JSONB)

**`conversations`**: `participant1_id` always the lexicographically smaller UUID (enforced client-side before insert to satisfy the `UNIQUE(p1, p2)` constraint)

**`notifications`**: `user_id`, `type` (`new_message|new_order|order_status|new_review`), `title`, `body`, `link`, `is_read`. Populated entirely by DB triggers — never insert from application code except via `lib/notifications.ts`.

### Storage buckets

| Bucket | Public | Upload path |
|--------|--------|-------------|
| `avatars` | yes | `{user_id}/avatar.{ext}` |
| `service-images` | yes | `{user_id}/{timestamp}-{random}.{ext}` |
| `service-portfolios` | yes | `{service_id}/{timestamp}-{random}.{ext}` |
| `cin-uploads` | **no** | `{user_id}/cin.jpg` — accessed only via signed URL from admin API |

## Key Pages & Components

| Route | Notes |
|-------|-------|
| `/` | Server component, fetches freelancer/service counts + profiles for home sections |
| `/services` | Service listing with filter/sort, server component |
| `/services/[id]` | Server component → `ServiceDetailClient`. Hero uses `next/image fill` over a red gradient fallback. Portfolio shown as "Exemples de travaux" before the seller card |
| `/dashboard` | Freelancer dashboard — services CRUD, order management |
| `/dashboard/new-service` | 5-step wizard (Infos → Tarifs → Médias → Exigences → Aperçu). Saves draft to `localStorage` under key `khadamat-new-service-v1` |
| `/dashboard/services/[id]/edit` | Same 5-step structure, loads existing service |
| `/commande/[serviceId]` | Order placement — accepts `?tier=&price=&delivery_days=` query params |
| `/commandes/[id]` | Order detail with per-order messaging |
| `/messages` | Real-time conversation inbox (Supabase Realtime subscription) |
| `/profil/[id]` | Public profile — `profile-client.tsx` for tab interactivity |
| `/parametres` | Account settings including CIN upload |
| `/admin/verifications` | Admin-only CIN review panel, uses service-role signed URLs |

### Navbar
Client component with: hide-on-scroll, auth-aware dropdown (3 sections), language toggle (sets `lang` cookie), unread notifications count via `NotificationsBell`.

### `next.config.mjs`
Allows `*.supabase.co` as a remote image pattern. `allowedDevOrigins` includes `192.168.100.16` for LAN dev access.

## Fonts

Three Google Fonts loaded in `app/layout.tsx`:
- `--font-jakarta` (Plus Jakarta Sans 600/700/800) — display headings
- `--font-inter` (Inter 400/500/600) — body / default `font-sans`
- `--font-cairo` (Cairo, arabic+latin) — Arabic content

The `<html>` element's `dir` attribute is toggled to `"rtl"` when `lang === "ar"` by `components/providers.tsx`.
