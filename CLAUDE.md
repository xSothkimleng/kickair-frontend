# KickAir Frontend — Project Context

## Stack
- **Framework**: Next.js 14 (App Router, `app/` directory)
- **UI**: Material UI (MUI) v6 — no Tailwind; all styling via `sx` props and MUI components
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
    admin/           — admin panel components
      dashboard/     — admin dashboard
      trust/         — Trust & Safety page (KYC, disputes)
      users/         — User Management
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
Admin endpoints return `{ data: [...], meta: { current_page, last_page, total } }`. Use `->response()->getData(true)` on the backend to preserve this structure.

**Status handling**
When adding new order statuses, update both the `getStatusColor` and `getStatusLabel` maps in every component that renders a status chip — currently `OrderDetailModal`, `FreelancerOrderDetailModal`, `client/OrdersContent`, `freelancer/OrdersContent`.

---

## Order Flow (as of 2026-04-21)

### Status values
`pending` → `active` → `delivered` → `completed`
`delivered` → `revision_requested` → `delivered` (loop)
`active` / `delivered` → `disputed` → `completed`
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
- **`src/components/admin/trust/TrustSafetyPage.tsx`** — Dispute section added above KYC

### Components added
- **`src/components/admin/trust/DisputeReviewSection.tsx`** — Paginated dispute table with expandable evidence rows and resolve dialog (outcome radio, partial amount, admin note)

### Finance tab (`src/app/(main)/dashboard/freelancer/FinanceContent.tsx`)
- "Pending Payments" renamed to "In Escrow" throughout
- Withdraw button wired to `POST /api/wallet/withdraw`
- "Pending Withdrawals" card and section added
- Transaction activity correctly handles `earning` type