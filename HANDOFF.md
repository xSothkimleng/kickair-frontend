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
- Verify before declaring done: `npx tsc --noEmit` (frontend) and `./vendor/bin/pest` (backend; 391 tests, all green at handoff)
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
- **#22 (last open decision):** "add more detail on custom order card" — context changed by the merge; the card in question is now the Requests & offers strip card. Ask Kimleng which details.
- **Parked by client (9):** order-detail file collection removal, "feedback:" in order detail, dispute-flow items (#29, #31–34 — now automatically applicable to custom orders thanks to the unified flow), IAM in admin dashboard.
- Pre-existing lint debt: a few react-compiler errors in `Workspace.tsx` (static-components) and setState-in-effect in dashboard page.tsx files — untouched, not from this work.

## Design workflow note
Some pages were built from **Claude Design** handoff bundles. **Find Freelancers** and **Order Detail** came from those bundles.

---
At handoff both repos are clean and pushed. Confirm git state before starting.
