# KickAir — Session Handoff

Context for continuing work on KickAir, a Fiverr-like freelance marketplace. Read this first, then verify the current git state on both repos before starting anything new.

## Repos & stack
- **Backend:** `kickair-api` — Laravel 12 + PostgreSQL + Sanctum (local Postgres runs via **DBngin**, start it from the app; db `kickair`, user `postgres`)
- **Frontend:** `kickair-frontend` — Next.js 16 (App Router) + MUI (sx props; a Panda CSS migration was started earlier and parked)
- The **admin panel lives inside the frontend** under the `(admin)` route group
- Both repos push directly to `main` (GitHub: `xSothkimleng/kickair-frontend` and `/kickair-api`)
- **Payments are mocked** (no real gateway); seller-only 20% commission (`KICKAIR_COMMISSION_RATE`, 0 in tests via phpunit.xml)
- **Production:** frontend on Vercel, API on Railway (start.sh migrates + seeds-if-empty on deploy); uploads live on **Cloudflare R2**

## Working preferences (important)
- Commits: clean messages, **no `Co-Authored-By: Claude` lines**
- Push directly to `main`, and **only when explicitly asked**
- Verify before declaring done: `npx tsc --noEmit` (frontend) and `./vendor/bin/pest` (backend; 396 tests, all green at handoff)
- **Postgres gotcha:** enums are CHECK constraints — alter them with raw
  `ALTER TABLE ... DROP CONSTRAINT / ADD CONSTRAINT ... CHECK (...)`, never MySQL `MODIFY`
- **Client feedback loop:** notes from testing sessions land as files in `../kickair-feedback/`; the `/feedback` skill (in `../.claude/skills/`) triages them into a reviewable todo page saved under `kickair-feedback/rounds/` (gitignored). Triage first, execution only after review.

## Seeded test logins (all password: `password`)
| Email | Role |
|-------|------|
| john@example.com (id 1) | Freelancer |
| jane@example.com | Freelancer |
| bob@example.com | Freelancer + Client |
| alice@example.com | Client |
| charlie@example.com | Client |
| admin@kickair.com | Admin |

Email sign-in is **case-insensitive** (stored lowercase; model mutator + request trait).

## Status after client feedback round 3 (notes: 8.25.2026.pdf — 25 of 26 actionable done, 9 parked)
Full per-task log with outcomes: `kickair-feedback/rounds/8.25.2026-todo.html` (also published as a Claude artifact).

### Round 3 highlights — where things live
- **Custom orders = single payment** — milestone UI removed from OfferComposer / DirectOfferDialog / ReviewOffer; fee-deduction card in the composer sidebar.
- **Custom orders merged into orders (unified flow)** — a custom order is only the *negotiation* (request → offer → accept). Accepting a single-payment offer sets `custom_orders.flow='order'` and the created Order runs the **regular lifecycle**: deliver/approve/revision/dispute/timeline/review (review lands on the anchored service). Legacy accepted milestone orders keep `flow='milestone'` + the Workspace; milestone endpoints reject order-flow orders. The Custom Orders / Custom Requests **tabs are gone** — negotiation-phase custom orders (request → offer) render as **rows in the unified Orders list** on both sides (`client/OrdersContent`, `freelancer/OrdersContent`, with a "requests" filter chip); the old strip components were removed; old `?tab=` links redirect. Both dashboard pages now follow `?tab=` changes after mount (`useSearchParams`), so notification "View" links that only change the tab work while the dashboard is already open. Order model has three-origin accessors (`freelancer`, `service`, `display_title`) used across controllers/notifications.
- **Freelancer leveling** — Bronze→Diamond thresholds existed; now profile-completion steps award **one-time XP** (12 steps, 135 total, `ProfileXpService` + `profile_xp_awards` column, synced on `/freelancer-dashboard/level`). "Your level" dialog (`LevelDialog`) opens from the profile-strength card + level badge; badge also on the service detail page. Fixed orders double-awarding XP/completed-count (observer is the single source now).
- **Media rules** — publishing a service **requires ≥1 image** (server-enforced on create/publish/last-image-delete; drafts exempt); `feature_image_id` must be an image. `serviceCoverUrl()` (lib/serviceCover.ts) picks card covers (feature image, else first image-type media — never a PDF). Detail page gallery plays **videos**; PDFs listed in a **Documents** card.
- **Auth/UX fixes** — post-verification auto-redirect to Explore Services; PHP upload caps raised to 52M/60M (start.sh + local php.ini) — the "portfolio can't upload" bug; localStorage (form recovery, client/freelancer mode) scoped per account; draft saves never blocked (incomplete pricing/FAQ rows dropped, tier rule skips drafts); dialogs restyled (titles in body, no DialogTitle bars — keep this pattern for new dialogs); admin user table sorts server-side; admin about fields render rich text; mobile filter collapse on Explore Services.

### Open items
- **#22 (last open decision):** "add more detail on custom order card" — context changed twice; the card in question is now the **request row in the unified Orders list** (see the 2026-09-06 status below). Ask Kimleng which details.
- **Parked by client (9):** order-detail file collection removal, "feedback:" in order detail, dispute-flow items (#29, #31–34 — now automatically applicable to custom orders thanks to the unified flow), IAM in admin dashboard.
- Pre-existing lint debt: a few react-compiler errors in `Workspace.tsx` (static-components) and setState-in-effect in dashboard page.tsx files — untouched, not from this work.

## Status after the 2026-09-06 session (Kimleng's post-round-3 requests) — committed & pushed
Frontend `4be37d8`, API `a47c431`. Both trees clean.

### What changed — where things live
- **Unified Orders list on both spaces** — negotiation-phase custom orders are rows in `client/OrdersContent` and `freelancer/OrdersContent` ("requests" filter chip with an "N new" badge; client gets Review offer / Withdraw, freelancer gets Make an offer / Decline). `CustomOrdersContent` and `CustomRequestsInbox` are deleted. The freelancer's pending-request detail (inline `OfferComposer`, `?compose=1` deep link) lives in `dashboard/custom-orders/[id]/page.tsx`; the composer is stacked (form above summary, full width).
- **Order Record is the single order history** — `components/dashboard/OrderRecord.tsx` (events + numbered deliveries/revisions + files) is used by the client, freelancer **and admin dispute** pages. The delivered-work card on order detail, `OrderTimeline` and `DeliverablesReference` are gone. Kimleng's rule: don't add parallel history cards — put history in the record. Its event log is a React Query query (`qk.orders.timeline(id)`), so any `invalidateQueries(qk.orders.all())` — after an action on the page or a realtime notification — refreshes it live (2026-09-06; before that it fetched once on mount and went stale). The client page also passes the custom request/offer pre-events like the freelancer and admin pages do. Job orders now log `order_accepted` when the client approves the proposal (`ProposalController`), so their record no longer starts at the first delivery; older job orders (no backfill, Kimleng's call) get a synthetic "Order Placed" row from `created_at` because the record adds one whenever the log has no start event.
- **Notifications** — `getNotificationRoute` sends custom-order request/decline/withdraw to `/dashboard/custom-orders/{id}`. Both dashboard `page.tsx` files read `?tab=` via `useSearchParams` (Suspense-wrapped) and follow changes after mount, so tab-only links work while the dashboard is already open.
- **Service form** — `EarningsBreakdown` renders at the foot of `PricingSection`, inside the Pricing Options card.
- **Admin dispute page** — Order Record; "Agreed custom offer" card for custom-origin orders (brief, budget, timeline, scope, price, delivery, revisions, note); "Earlier disputes on this order"; Trust & Safety shows an error state instead of a fake-empty queue. `AdminDisputeResource` uses the Order origin accessors — custom-origin orders used to 500 the whole queue. `OrderCancellationService` had the same two-origin bug, fixed. The dispute itself is a React Query query (`qk.disputes.adminDetail(id)`); `admin_dispute_*` alerts invalidate disputes + orders in `realtimeInvalidation.ts`, so the page and its Order Record update without a reload. Gap: parties' `evidence_submitted` notifications go only to the counterparty, not admins, so evidence still needs a focus refetch on the admin page. Disputes are separate records, so after a "continue" the next dispute has a new id/URL; `AdminDisputeResource` exposes `newer_dispute` and the page shows a live banner linking to it (no auto-jump — Kimleng preferred the banner).

### Dispute model (agreed with Kimleng 2026-09-06)
- Disputes **stack** per order and are **numbered** (`disputes.sequence` → "Dispute #1, #2, …"); only **one open at a time** (so #2 can never be resolved before #1). `Order::dispute()` = latest (`latestOfMany`), `Order::disputes()` = history, `Order::disputeSummaryLabel()` = "Disputes #1, #2 and #3".
- Four outcomes. `full_freelancer` / `full_client` / `partial` end the order. **`continue`** ("Continue with admin feedback") is a *real* resolution: no money moves, the order goes back to **`active`** (freelancer sees Submit Delivery, client sees the waiting view), and either party may dispute again.
- **Order record rows:** `dispute_opened` ("Dispute #n was opened by the … Reason: …"); one `dispute_feedback` row per continue, rendered as **"Dispute #n"** with "Admin feedback: …" (the frontend derives n by counting opened rows); and exactly **one** `dispute_resolved` summary when the matter actually ends — written by an admin money outcome ("Disputes #1 and #2 resolved — the client was refunded in full. Admin feedback: …") or by client approval in `OrderController::approve` ("… — the client accepted the work."). Earlier rows are never rewritten.
- Admin UI: continue-outcome disputes show a blue **Continued** pill (list + detail) and sit under the Resolved filter.
- Migration `2026_09_06_100000_allow_stacked_disputes` drops the one-per-order unique, adds `sequence`, extends the `outcome` CHECK. **Rollback fails on any DB that already holds a `continue` outcome** (the old constraint rejects it) — expected for an enum extension.

### Open items (unchanged)
- **#22** — which extra fields on the request row. Client's 9 parked items. Lint debt.

## Status after the 2026-09-07 session (Telegram Gateway hardening) — committed locally, NOT pushed
API commit only; frontend untouched apart from this note.

### Decision: keep Telegram Gateway for phone OTP
- A free **bot + `request_contact`** flow was designed (user opens a bot, shares contact, Telegram vouches for the number via `contact.user_id === from.id`). Kimleng chose to stay on Gateway: codes come from the official verified **Telegram** account, the user never leaves the app, zero webhook infra. Revisit the bot plan only if Gateway pricing changes.
- Gateway is $0.01 per **delivered** code with a **$100 minimum top-up via Fragment/TON**, non-refundable. **Codes to your own number are free** — that is how dev/testing works today. Kimleng will fund at launch and **rotate the token afterwards** (only `.env` / prod env hold it; nothing else references the value).
- Dashboard: https://gateway.telegram.org — not my.telegram.org, not BotFather. The `gatewayapi.telegram.org` host in `TelegramGatewayService` is the machine endpoint only.
- After funding it just works for any Telegram-registered E.164 number — no approval, no allowlist. Non-Telegram numbers fail at send with no charge (already surfaced as a 422).

### What changed — where things live
- `routes/api.php` — `send-otp`, `register/phone`, `phone/update` use the named **`phone-code`** limiter (`AppServiceProvider::boot`): **5/min per phone number + 30/min per IP**. Bare `throttle:5,1` keys on IP only and shares one bucket across every route that uses it, so two resends plus two typos would have locked the user out — and everyone behind the same carrier NAT with them.
- `TelegramGatewayService::send()` passes `ttl` (900s, fed from `PhoneVerificationManager::TTL_SECONDS` through the new `PhoneVerificationChannel::send(string $phone, int $ttlSeconds)` signature). Telegram refunds codes it cannot deliver inside the ttl and deletes them from the chat on expiry.
- `.env.example` / `.env` — `TELEGRAM_GATEWAY_TOKEN` documented (was missing entirely; local `.env` holds Kimleng's dev token, gitignored).
- Tests: ttl assertion, send-otp throttle, register/update throttle, per-phone isolation. Suite: 400 passing.

### Deferred — for Kimleng's later "optimize / refactor / security" pass (after the whole project is signed off)
- Throttled users see Laravel's default "Too Many Attempts." in the sign-up / settings error box — friendlier copy wanted.
- `forgot-password`, `reset-password`, `email/resend-link` still share one bare per-IP `throttle:5,1` bucket — same gotcha, pre-existing; give them a named limiter.
- `login/email` and `login/phone` have **no throttle at all** — credential stuffing is open. Not touched this session; top of the security list.
- Optional: Gateway `checkSendAbility` pre-check to bounce non-Telegram numbers to email before the OTP step (it moves the fee, doesn't add one). Sign-up copy still says "we'll text you a code".

## Design workflow note
Some pages were built from **Claude Design** handoff bundles. **Find Freelancers** and **Order Detail** came from those bundles.

---
At handoff: the API has the 2026-09-07 Telegram Gateway commit **local only** (push pending). The frontend carries the untracked `/temp-dash` admin mock-up (`src/app/(temp-dash)/`, `src/components/temp-dash/`, built 2026-09-06 for client review) — not committed, not part of the app. Confirm git state before starting.
