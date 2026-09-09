# KickAir Frontend — Project Context

## Stack
- **Framework**: Next.js 16.1.1 (App Router, `app/` directory), React 19.2.3, React Compiler enabled (`babel-plugin-react-compiler`)
- **UI**: Material UI (MUI) v7.3.6 (`@mui/material`, `@mui/icons-material`, `@mui/material-nextjs` v16-appRouter, `@mui/x-charts` v8) on Emotion — no Tailwind; nearly all styling via inline `sx` props (~4,800 sites across ~170 components), a handful via `styled()`. Design tokens live as plain JS objects in `src/theme.ts` (`tokens`, payment surfaces) and `src/components/ui/inputs/tokens.ts` (`tokens`, form fields) — read inside `sx`, NOT wired into the MUI palette. Custom input system in `src/components/ui/inputs/` is fully Panda + Ark UI (recipes in `inputs/field.ts`; popups render inline, not portaled, because of MUI Dialog focus traps) — no MUI left in the kit; shared "kits" (`profileKit.tsx`, `customOrders/kit.tsx`, `dashboard/ManagementCard.tsx`) concentrate repeated patterns. **Exception: the admin console** (`src/components/admin/`, routes under `/admin`) is built with **Panda CSS** (`styled-system/css`) on its own `--td-*` tokens in `admin/ui.tsx` — new admin UI uses those primitives (`Panel`, `Pill`, `Btn`, `Drawer`, `Modal`, `Segmented`, `Pager`…), not MUI. The shared `dashboard/OrderRecord.tsx` (MUI) is embedded as-is on the admin dispute page.
- **MUI removal in progress** (from 2026-09-07): the goal is a MUI-free app. Don't add new MUI usage anywhere; new or rewritten site UI uses Panda (`components/ds/` kit or `css()`), icons from `lucide-react`. The inventory, order of work and gotchas are in `HANDOFF.md` → "Next: remove MUI from the user-facing site".
- **Auth**: `AuthContext` (`src/components/context/AuthContext.tsx`) — `useAuth()` hook; tokens stored in localStorage
- **API client**: `src/lib/api.ts` — singleton `api` instance of the `ApiClient` class; all HTTP calls go through `api.get/post/put/patch/delete`
- **Types**: `src/types/` — domain types used across the app

## Directory Structure
```
src/
  app/(main)/dashboard/
    client/          — client-side dashboard pages & content components
    freelancer/      — freelancer-side dashboard pages & content components
  components/
    admin/           — admin console (Panda CSS): Shell.tsx (sidebar/topbar/guard/realtime), one *Page.tsx per /admin route,
                       ui.tsx (tokens + primitives), queries.ts (React Query hooks, qk.admin.*), notify.ts, toast.tsx, format.ts, labels.ts
    context/         — React context providers (AuthContext)
    dashboard/       — shared order modals (OrderDetailModal, FreelancerOrderDetailModal)
  lib/
    api.ts           — ApiClient class with all API methods
  types/             — TypeScript interfaces (order.ts, user.ts, wallet.ts, job.ts, etc.)
```

## Key Patterns

**API calls**
All calls go through the `api` singleton. Always add new methods to the `ApiClient` class in `api.ts` rather than calling `api.get/post` inline in components.

**Admin pagination**
Admin list endpoints return `{ data: [...], meta: { current_page, last_page, per_page, total } }` (`PageMeta` in `api.ts`). Use `->response()->getData(true)` on the backend to preserve this structure. The console renders it with `<Pager meta onPage />`.

**Admin data & realtime**
Admin pages fetch through the hooks in `components/admin/queries.ts`; every key lives under `qk.admin.*` so `registerAdminRefresh` (fed by `GlobalNotificationToast`) and `useAdminAction` can refresh the whole console with one `invalidateQueries(qk.admin.all())`. Admin notifications are routed by type in `components/admin/notify.ts`, never by the stored `data.link`.

**Status handling**
When adding new order statuses, update both the `getStatusColor` and `getStatusLabel` maps in every component that renders a status chip — currently `OrderDetailModal`, `FreelancerOrderDetailModal`, `client/OrdersContent`, `freelancer/OrdersContent`.

**Order history = the Order Record**
`components/dashboard/OrderRecord.tsx` is the single history surface (lifecycle events + numbered deliveries/revisions with files + dispute rows). It's shared by the client and freelancer order pages and the admin dispute page. Don't add parallel history cards (a delivered-work card, a separate timeline, …) — add an event type / row style to the record instead. New `event_type`s need an `EVENT_STYLE` entry there.

**Dashboard tabs & deep links**
`dashboard/client/page.tsx` and `dashboard/freelancer/page.tsx` derive the tab from `?tab=` via `useSearchParams` (Suspense-wrapped) and keep following it after mount, so `router.push("/dashboard/freelancer?tab=orders")` from a notification switches tabs even when the dashboard is already open. Legacy `custom-orders` / `custom-requests` tab values map to `orders`.

**Unified orders list**
Both `OrdersContent` files interleave regular orders with negotiation-phase custom orders (`useMyCustomOrders` / `useIncomingCustomOrders`, excluding accepted order-flow ones) in one date-sorted list with a "requests" filter chip. Custom-order detail lives at `/dashboard/custom-orders/[id]` (accepted order-flow ones redirect to the regular order page).

---

## Order Flow (as of 2026-04-21)

### Status values
`pending` → `active` → `delivered` → `completed`
`delivered` → `revision_requested` → `delivered` (loop)
`active` / `delivered` / `revision_requested` → `disputed` → `completed` (admin refund / release / partial)
`disputed` → `active` (admin "Continue with admin feedback" — no money moves; disputes stack and are numbered per order, only one open at a time)
`pending` / `active` → `cancelled`

### Client actions per status
| Status | Actions available |
|--------|-------------------|
| `delivered` | Approve & Release Payment · Request Revision · Open Dispute |
| `active` | Open Dispute |
| `disputed` | Submit Evidence (once) |
| `completed` | Leave Review |

### Freelancer actions per status
| Status | Actions available |
|--------|-------------------|
| `pending` | Accept · Decline |
| `active` | Submit Delivery · Open Dispute |
| `revision_requested` | Resubmit Work · Open Dispute |
| `disputed` | Submit Evidence (once) |

---

## Implemented Features (as of 2026-04-21)

### Types (`src/types/order.ts`)
- `OrderStatus` extended: `delivered`, `revision_requested`, `disputed`
- `Order` extended: `delivery_note`, `revision_note`, `dispute` fields
- New interfaces: `Dispute`, `AdminDispute`

### API methods (`src/lib/api.ts`)
- `deliverOrder(orderId, deliveryNote?)` — `POST /api/orders/{id}/deliver`
- `approveOrder(orderId)` — `POST /api/orders/{id}/approve`
- `requestRevision(orderId, revisionNote)` — `POST /api/orders/{id}/request-revision`
- `resubmitOrder(orderId, deliveryNote?)` — `POST /api/orders/{id}/resubmit`
- `openDispute(orderId, reason)` — `POST /api/orders/{id}/dispute`
- `submitDisputeEvidence(orderId, evidence)` — `PUT /api/orders/{id}/dispute/evidence`
- `getAdminDisputes(page, status?)` — `GET /api/admin/disputes`
- `resolveDispute(disputeId, data)` — `POST /api/admin/disputes/{id}/resolve`

### Components updated
- **`src/components/dashboard/FreelancerOrderDetailModal.tsx`** — Submit Delivery, Resubmit, evidence, dispute form; all new statuses
- **`src/components/dashboard/OrderDetailModal.tsx`** — Approve, Request Revision, evidence, dispute form; all new statuses
- **`src/app/(main)/dashboard/client/OrdersContent.tsx`** — New status filters; `onOrderUpdate` wired to modal
- **`src/app/(main)/dashboard/freelancer/OrdersContent.tsx`** — New status filters; Deliver / Resubmit inline buttons
- Admin dispute review — now `src/components/admin/DisputesPage.tsx` + `DisputeDetailPage.tsx` (the console replaced the old `admin/trust/*` files on 2026-09-07)

### Components added
- (superseded) the old `DisputeReviewSection` table — see `DisputeDetailPage.tsx` for evidence, order record, chat and the resolve panel

### Finance tab (`src/app/(main)/dashboard/freelancer/FinanceContent.tsx`)
- "Pending Payments" renamed to "In Escrow" throughout
- Withdraw button wired to `POST /api/wallet/withdraw`
- "Pending Withdrawals" card and section added
- Transaction activity correctly handles `earning` type