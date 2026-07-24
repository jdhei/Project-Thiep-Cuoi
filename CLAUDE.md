# CLAUDE.md

## Project Overview

**Thiệp Ước** is an online wedding invitation management platform built with Next.js.

The system allows a single administrator to create and manage multiple wedding invitations. Each published invitation is available through a unique public URL:

```text
/w/[slug]
```

Guests do not need an account. They can view the invitation, confirm attendance through RSVP, send wishes, open map links, add wedding events to their calendar, and receive personalized invitation content.

This project is not an e-commerce platform and is not a Canva-style drag-and-drop invitation editor.

Live application:

```text
https://thiepcuoi-five.vercel.app
```

Example invitation:

```text
https://thiepcuoi-five.vercel.app/w/quan-linh
```

---

## Core User Roles

### Admin

The administrator can:

- Log in using credentials configured through environment variables.
- Create and manage multiple wedding invitations.
- Edit couple information, wedding date, introduction, and love story.
- Enable or disable individual invitation sections.
- Manage wedding events and locations.
- Upload cover images, gallery images, music, and gift-related media.
- Create personalized guest records.
- Generate invitation codes and individual guest URLs.
- Preview draft invitations.
- Publish or archive invitations.
- View and filter RSVP submissions.
- Review, approve, hide, or delete guest wishes.
- Export RSVP data as CSV.
- Generate QR codes and calendar files.

### Guest

Guests can:

- Open a published invitation without authentication.
- View couple and wedding information.
- View countdown, love story, event schedule, gallery, and gift information.
- Open map links.
- Download an `.ics` calendar file.
- Submit RSVP information.
- Send a message with their RSVP.
- Submit a wedding wish.
- Play or pause wedding music.
- Receive personalized content through a guest invitation code.

Personalized guest URLs use this format:

```text
/w/[slug]?guest=[invitationCode]
```

A valid guest code can:

- Pre-fill the guest's name.
- Display a personalized message.
- Limit the number of attendees the guest can submit.

---

## Main Business Rules

### Wedding lifecycle

```text
DRAFT -> PUBLISHED -> ARCHIVED
```

- `DRAFT`: editable and only visible through admin preview.
- `PUBLISHED`: publicly available through `/w/[slug]`.
- `ARCHIVED`: no longer publicly available.

Do not hard-delete weddings from the admin UI. Archive them instead.

A wedding must have the following before publishing:

- A wedding date.
- A cover image — a `WeddingMedia` record with type `cover` (the normal upload flow). The legacy `Wedding.coverPath` field is also accepted for backward compatibility.
- At least one wedding event.

Only `PUBLISHED` weddings may be returned by the public wedding route. This includes uploaded media: `/media/[id]` only serves files belonging to `PUBLISHED` weddings (an authenticated admin can still access draft media, which is what `/preview/[id]` relies on).

### RSVP statuses

```text
ATTENDING
NOT_ATTENDING
MAYBE
```

RSVP rules:

- `numberOfPeople` must normally be between `0` and `20`.
- When attendance is `NOT_ATTENDING`, `numberOfPeople` must be `0`.
- When an invitation code is supplied, it must exist for that wedding — an unknown code is rejected with HTTP 400 (it is never silently ignored).
- When a valid invitation code is supplied, the attendee count must not exceed the guest's `maximumPeople`.
- Raw IP addresses must never be stored.
- The server stores a SHA-256 IP hash using `IP_HASH_SECRET`.
- RSVP creation is idempotent through a server-generated `submissionKey` (see below).
- Public submissions are rate-limited per IP hash: 10 RSVPs and 5 wishes per 10 minutes per wedding (in-memory, best-effort on serverless).

### Wish statuses

```text
PENDING
APPROVED
HIDDEN
```

Wish rules:

- New wishes are created as `PENDING`.
- Only `APPROVED` wishes may appear publicly.
- User-generated wish content must be stored and rendered as plain text.
- Do not store or render user-provided HTML.

### Slugs

Wedding slugs must:

- Be lowercase.
- Be Vietnamese-diacritic-free.
- Contain only letters, numbers, and hyphens.
- Be unique.
- Not use reserved words. The authoritative list lives in `src/lib/utils/slug.ts` and currently includes:
  - `admin`
  - `api`
  - `login`
  - `logout`
  - `preview`
  - `w`
  - `media`
  - `static`
  - `_next`

---

## Technology Stack

### Application

- Next.js 14
- App Router
- React 18
- TypeScript
- Tailwind CSS v3
- Server Components
- Client Components
- Route Handlers

### Database

- Supabase PostgreSQL
- Prisma ORM

Database environment variables:

- `DATABASE_URL`: pooled runtime connection.
- `DIRECT_URL`: direct connection for Prisma schema operations.

The project currently synchronizes the schema primarily with:

```bash
npm run db:push
```

Prisma migrations are not the main schema-management mechanism at this stage.

### Forms and validation

- Zod is the application-level source of truth for validation.
- React Hook Form is used for client-side forms.
- Every Route Handler and Server Action must validate untrusted input again on the server.

### Authentication

- `bcryptjs` for admin password verification.
- `jose` for JWT signing and verification.
- Admin session cookie name: `admin_session`.
- Session lifetime: 24 hours.
- Cookie settings:
  - `HttpOnly`
  - `SameSite=Lax`
  - `Secure` in production (both when setting and when clearing)
- **Middleware enforces the `admin_session` JWT centrally** for `/admin/*` (except `/admin/login`), `/preview/*`, `/api/admin/*`, `/api/uploads`, and `/api/exports/*`. Pages redirect to `/admin/login`; API routes return 401 JSON. Per-page/route guards (`requireAdminSession`, `getAdminSession`) remain as defense-in-depth. Cloudflare Zero Trust is an optional extra layer — it is only active when `CF_ACCESS_*` variables are configured.

### Testing

- Vitest for unit tests.
- Playwright for end-to-end tests.

### Deployment

- Vercel for the Next.js application.
- Supabase PostgreSQL for persistent data.
- Cloudflare Zero Trust may optionally protect `/admin/*` and `/preview/*`.

---

## Important Project Structure

```text
src/
├── app/
│   ├── page.tsx
│   ├── w/[slug]/page.tsx
│   ├── preview/[id]/
│   ├── admin/
│   ├── api/
│   └── media/[id]/
│
├── components/
│   ├── landing/
│   ├── wedding/
│   └── ui/
│
├── features/
│   └── weddings/
│       ├── repositories
│       ├── schemas
│       ├── validators
│       └── public DTO mapping
│
└── lib/
    ├── auth/
    ├── db.ts
    ├── domain.ts
    ├── env.ts
    └── utils/

prisma/
├── schema.prisma
└── seed.ts

docs/
├── SPEC.md
├── PLAN.md
├── TASKS-status.md
├── SECURITY-REVIEW.md
└── DECISIONS.md
```

The repository also preserves the original static prototype:

```text
index.html
css/
js/
```

The prototype is a design and animation reference for the current Next.js implementation. Do not remove or rewrite it unless explicitly requested.

---

## Database Models

### Wedding

Represents one wedding invitation.

Important fields include:

- `slug`
- `status`
- `groomName`
- `brideName`
- `weddingDate`
- `title`
- `introduction`
- `loveStory`
- `primaryColor`
- `giftData`
- `showCountdown`
- `showStory`
- `showGallery`
- `showRsvp`
- `showWishes`
- `showGift`
- `showMusic`

Relations:

- `events`
- `media`
- `guests`
- `rsvps`
- `wishes`

### WeddingEvent

Represents one ceremony, reception, or wedding-related event.

Important fields:

- `title`
- `startsAt`
- `address`
- `mapUrl`
- `description`
- `sortOrder`

### WeddingMedia

Stores media metadata.

Supported media types:

```text
cover
gallery
music
gift
```

Important fields:

- `path`
- `mimeType`
- `sizeBytes`
- `caption`
- `sortOrder`

### Guest

Represents a guest created by the administrator.

Important fields:

- `fullName`
- `phone`
- `invitationCode`
- `maximumPeople`
- `personalizedMessage`

`invitationCode` is generated server-side with a CSPRNG (Web Crypto, rejection-sampled over an ambiguity-free alphabet).

### Rsvp

Stores attendance confirmation.

Important fields:

- `guestId`
- `fullName`
- `phone`
- `attendance`
- `numberOfPeople`
- `message`
- `submissionKey`
- `ipHash`

### Wish

Stores guest wishes requiring moderation.

Important fields:

- `guestName`
- `content`
- `status`
- `ipHash`
- `createdAt`

Business statuses are stored as database strings and validated with Zod in the application layer.

---

## Main Routes

### Public

```text
GET  /w/[slug]
GET  /api/calendar/[slug]    (.ics — local times with TZID Asia/Ho_Chi_Minh + VTIMEZONE)
GET  /api/qr/[slug]          (supports ?guest=CODE — only embedded when the code exists)
POST /api/public/weddings/[slug]/rsvp
POST /api/public/weddings/[slug]/wishes
GET  /media/[id]             (PUBLISHED weddings only; admin session can access drafts)
```

The Open Graph image (`/w/[slug]/opengraph-image`) uses the wedding's real cover photo (WeddingMedia type `cover`) with a dark overlay when available, falling back to the Classic Gold gradient otherwise.

### Authentication

```text
POST /api/auth/login
POST /api/auth/logout
```

### Admin

```text
/admin/login
/admin
/admin/weddings
/admin/weddings/new
/admin/weddings/[id]/content
/admin/weddings/[id]/events
/admin/weddings/[id]/gallery
/admin/weddings/[id]/guests
/admin/weddings/[id]/rsvps
/admin/weddings/[id]/wishes
/admin/weddings/[id]/publish
```

Admin APIs:

```text
GET  /api/admin/weddings/[id]
GET  /api/admin/weddings/check-slug
```

### Upload and export

```text
POST /api/uploads
GET  /api/exports/weddings/[id]/rsvps
```

CSV export escapes cells that could be interpreted as formulas (`=`, `@`, and `+`/`-` when not a plain number or phone-like value) to prevent CSV/formula injection.

### Preview

```text
/preview/[id]
```

Preview routes require administrator access and may render draft invitations.

---

## Public Data Safety

Never expose Prisma models directly to the public client.

Public wedding data must be mapped through `PublicWeddingDto`.

The public DTO may contain:

- Slug.
- Couple names.
- Wedding date.
- Public introduction.
- Love story.
- Cover and music URLs.
- Public events.
- Gallery items.
- Approved wishes.
- Visibility flags.
- Public gift information.

The public DTO must not contain:

- Guest phone numbers.
- Raw or hashed IP information.
- RSVP `submissionKey`.
- Internal guest lists.
- Internal notes.
- Data belonging to other guests.

When adding fields to Prisma models, explicitly decide whether they are safe for the public DTO. Do not expose new fields automatically.

---

## Public Invitation UI

The current MVP template is called **Classic Gold**.

Possible sections include:

1. Hero and cover.
2. Couple names.
3. Countdown.
4. Love story.
5. Wedding events.
6. Map links.
7. Add-to-calendar action.
8. Gallery.
9. RSVP form.
10. Gift section.
11. Wish list and form.
12. Music player.

Each section must check:

- Its corresponding visibility flag.
- Whether required data exists.
- Appropriate empty-state behavior.

The UI is mobile-first. Test layouts from approximately `360px` width before desktop.

Existing interactions include:

- Envelope opening (currently prototype-only; not yet ported to the React template).
- Dynamic countdown.
- Scroll reveal.
- Button ripple.
- Gallery lightbox.
- Toast notifications.
- Confetti.
- Music player.

Accessibility requirements:

- Respect `prefers-reduced-motion`.
- Maintain visible keyboard focus.
- Keep touch targets at least approximately 44px.
- Avoid mobile form input font sizes below 16px.
- Do not autoplay music before user interaction.

---

## Architecture Rules

Follow these rules when changing the project:

1. Do not expose raw Prisma models to public clients.

2. Use `PublicWeddingDto` for public wedding responses.

3. Validate all client input on the server with Zod.

4. Prefer repository or service functions over scattering Prisma access through UI components.

5. Do not make a wedding public unless its status is `PUBLISHED`.

6. Do not show wishes publicly unless their status is `APPROVED`.

7. Do not hard-delete weddings through normal admin workflows.

8. Store user-provided content as plain text, not HTML.

9. Do not commit secrets, `.env` files, uploaded media, or database credentials.

10. Keep public and admin concerns separate.

11. Preserve mobile responsiveness and accessibility.

12. When changing business behavior, update:
    - Validation schemas.
    - Route handlers or server actions.
    - UI behavior.
    - Tests.
    - Relevant documentation.

13. When documentation and implementation disagree, inspect the current code and database schema. Treat implementation as the final source of truth, then update the documentation.

---

## Upload Rules

The current upload route performs:

1. Admin session validation.
2. Query parameter validation.
3. Wedding existence validation.
4. Multipart file extraction.
5. MIME validation.
6. File-size validation.
7. Double-extension rejection.
8. UUID filename generation.
9. File writing.
10. Database metadata insertion.
11. File rollback if database insertion fails.

Never use the original filename as the stored filename.

Current local storage layout:

```text
storage/uploads/weddings/[weddingId]/[type]/[uuid].[ext]
```

When deleting media, remove both:

- The database record.
- The physical file or object.

### Production limitation

The current implementation writes media to a filesystem configured by `UPLOAD_ROOT`.

This is suitable for local development or a host with persistent storage, but Vercel serverless filesystem storage is not a durable production media solution.

Future production media work should use persistent object storage, such as:

- Supabase Storage.
- Cloudflare R2.
- Another compatible object-storage service.

Do not extend local filesystem upload behavior as if it were a permanent Vercel production solution.

---

## RSVP Submission Key

The RSVP `submissionKey` is generated **server-side**:

```text
submissionKey = sha256(weddingId + ":" + fullName.toLowerCase() + ":" + ipHash)[:32]
```

The browser never creates or sends a submission key, and the value is never returned to the client. The RSVP route performs an `upsert` on `(weddingId, submissionKey)`, making submissions idempotent.

Known accepted limitation: two different guests with the same full name submitting from the same IP (shared wifi/NAT) will overwrite each other's RSVP.

`docs/SPEC.md` was synchronized with this behavior on 2026-07-24 (v1.3). If you find older documents describing a browser-generated UUID key, the server-side description above is the correct one.

---

## Environment Variables

Main environment variables:

```text
DATABASE_URL
DIRECT_URL
APP_URL
ADMIN_EMAIL
ADMIN_PASSWORD_HASH
SESSION_SECRET
UPLOAD_ROOT
MEDIA_BASE_URL
IP_HASH_SECRET
CF_ACCESS_TEAM_NAME
CF_ACCESS_AUD
```

Rules:

- Never commit real values.
- `SESSION_SECRET` and `IP_HASH_SECRET` must be different.
- Passwords must not be stored directly; use `ADMIN_PASSWORD_HASH`.
- Cloudflare variables are optional for local development.

---

## Common Commands

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Check TypeScript:

```bash
npm run typecheck
```

Run unit tests:

```bash
npm run test
```

Run E2E tests:

```bash
npm run test:e2e
```

Build application:

```bash
npm run build
```

Push Prisma schema:

```bash
npm run db:push
```

Seed demo data:

```bash
npm run db:seed
```

Open Prisma Studio:

```bash
npm run db:studio
```

Before considering a code change complete, run at least:

```bash
npm run typecheck
npm run test
npm run build
```

Also run Playwright when changing:

- Authentication.
- Admin workflows.
- Wedding publishing.
- RSVP.
- Wishes.
- Public invitation behavior.

---

## Out-of-Scope Features

Do not implement these unless explicitly requested:

- Public account registration.
- Separate bride and groom user accounts.
- Self-service customer editing.
- Online payments.
- Orders, invoices, or discount codes.
- Automated subscriptions or pricing-plan enforcement.
- Full multi-tenancy.
- Complex Row Level Security.
- Custom domains or subdomains per wedding.
- Canva-style drag-and-drop editing.
- Automatic email, SMS, or Zalo sending.

---

## Current Project Status

The MVP is almost complete.

Implemented areas include:

- Landing page.
- Admin login and session handling (middleware-enforced JWT since 2026-07-24).
- Wedding CRUD.
- Preview, publish, and archive.
- Public invitation template.
- Events and media.
- RSVP and wishes (rate-limited public endpoints).
- Personalized guests.
- CSV export (formula-injection safe).
- `.ics` calendar export.
- QR code.
- Open Graph metadata.
- Unit tests.
- Playwright E2E tests.

An audit & hardening pass (FIX-01…FIX-07, DOCS-01) was completed on 2026-07-24 — see `docs/TASKS-status.md` (FIX section) and `docs/SECURITY-REVIEW.md`.

FIX-08…FIX-11 (admin list status filter, per-guest QR download, OG image from the real cover, `.ics` with `VTIMEZONE` Asia/Ho_Chi_Minh) were completed on 2026-07-24 — the FIX group in `docs/TASKS-status.md` is now 14/14.

Remaining known tasks:

- TEST-M1: real-device testing (Android Chrome, iPhone Safari, slow network, mobile forms with the virtual keyboard open).
- Porting the prototype's envelope-opening animation (and richer animations) to the React template — planned as the next phase.

---

## Instructions for Claude Code

Before making a substantial change:

1. Read this file.
2. Read `docs/SPEC.md`.
3. Read `docs/DECISIONS.md`.
4. Read `docs/TASKS-status.md`.
5. Inspect the implementation of the affected route, schema, repository, and components.
6. Identify whether the change affects admin, public, or both.
7. Check whether any private data could be exposed.
8. Update tests.
9. Run validation commands.
10. Update documentation when behavior changes.

When asked to implement a feature:

- First identify the existing pattern in the repository.
- Reuse existing validation, DTO, repository, and UI conventions.
- Prefer small changes over unnecessary rewrites.
- Do not introduce a second architectural pattern without a clear reason.
- Preserve backwards compatibility unless the task explicitly requires a breaking change.
- Explain important assumptions in the final summary.
