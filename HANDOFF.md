# KickAir — Session Handoff

Context for continuing work on KickAir, a Fiverr-like freelance marketplace. Read this first, then verify the current git state on both repos before starting anything new.

## Repos & stack
- **Backend:** `kickair-api` — Laravel 12 + PostgreSQL + Sanctum
- **Frontend:** `kickair-frontend` — Next.js 16 (App Router) + MUI v6 (sx props only, no Tailwind)
- The **admin panel lives inside the frontend** under the `(admin)` route group
- Both repos push directly to `main` (GitHub: `xSothkimleng/kickair-frontend` and `/kickair-api`)
- **Payments are mocked** (no real gateway)

## Working preferences (important)
- Commits: clean messages, **no `Co-Authored-By: Claude` lines**
- Push directly to `main`, and **only when explicitly asked**
- Verify before declaring done: `npx tsc --noEmit` (frontend) and `php artisan route:list` (backend parse check)
- **Postgres gotcha:** enums are CHECK constraints — alter them with raw
  `ALTER TABLE ... DROP CONSTRAINT / ADD CONSTRAINT ... CHECK (...)`, never MySQL `MODIFY`

## Seeded test logins (all password: `password`)
| Email | Role |
|-------|------|
| john@example.com (id 1) | Freelancer |
| jane@example.com | Freelancer |
| bob@example.com | Freelancer + Client |
| alice@example.com | Client |
| charlie@example.com | Client |
| admin@kickair.com | Admin |

## Status: 21 of 23 tasks done (all committed & pushed)
Last commits at handoff: frontend `ff50eaa`, backend `0408806`.

### Done — key features and where they live
- **Service & job approval flows** — statuses: `draft` / `pending_review` / `active`(jobs: `open`) / `rejected`. New & edited services/jobs go to `pending_review`; admins approve/reject in the **Marketplace page** (`AdminServiceController` / `AdminJobPostController`). Public listings filter to active/open only. Rejection reasons supported.
- **Draft mode for services** — `save_as_draft` flag → `status='draft'`, relaxed validation, private (never public, no admin notify). Publishing runs full validation → `pending_review`. Pricing options sync on draft edits. `category_id` is nullable for drafts.
- **Local-storage form recovery** — `useFormRecovery` hook (`src/hooks/useFormRecovery.ts`) auto-saves the service form; shows a Restore/Discard banner on return.
- **Order timeline** — `order_events` table + `OrderEvent::log()` called across the order lifecycle and disputes; `GET /api/orders/{id}/timeline`; rendered by `OrderTimeline.tsx` on both order detail pages.
- **Real-time notifications** — `NotificationCreated` broadcast (`ShouldBroadcastNow`) fired by `DatabaseNotificationObserver` on private channel `user.{id}`. Pusher keys are in both `.env` files; Echo client in `src/lib/echo.ts`; `GlobalNotificationToast` mounted in both main + admin layouts; `AdminNotificationBell` in admin. **Verified working** via a live Pusher subscriber test.
- **Clickable notifications** → route to the relevant page; viewed-state persists (mark-all-read on bell open).
- **Order detail pages** (`/dashboard/orders/[id]` and `/dashboard/freelancer/orders/[id]`) — full pages, not modals.
- **Form UX** — inline errors + red asterisks on the service form and account settings.
- **Misc fixes** — withdrawal/top-up dialogs made consistent; users can't buy their own service (admin can); fixed pricing options disappearing on service edit; admin fake data replaced with real APIs / empty states; admin menu reordered; dashboard tabs persist via `?tab=`; Messages/Notifications tabs removed from dashboards (bell-only).

### Left — deliberately parked
- **#14** — "User can create a new item from an input field" (e.g. add a custom tag/expertise inline). Not started.
- **#16** — Multiple categories for service creation. Not started.

## Design workflow note
Some pages were built from **Claude Design** handoff bundles (a gzipped tar fetched from a design URL, extracted, then implemented to match pixel-for-pixel). **Find Freelancers** and **Order Detail** came from those bundles.

---
At handoff the working tree was clean on both repos. Confirm git state before starting.
