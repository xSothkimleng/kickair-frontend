/**
 * Central registry of React Query keys. Using one place for keys keeps invalidation
 * consistent (a typo'd key silently never invalidates), and lets the realtime layer
 * invalidate by prefix — e.g. invalidateQueries({ queryKey: qk.orders.all() }) refreshes
 * every order list + detail at once.
 */
export const qk = {
  dashboard: {
    client: () => ["dashboard", "client"] as const,
    freelancer: () => ["dashboard", "freelancer"] as const,
  },
  orders: {
    all: () => ["orders"] as const,
    list: (scope?: string, params?: Record<string, unknown>) =>
      ["orders", "list", scope ?? "all", params ?? {}] as const,
    detail: (id: number | string, scope?: string) => ["orders", "detail", scope ?? "any", String(id)] as const,
    timeline: (id: number | string) => ["orders", "timeline", String(id)] as const,
  },
  wallet: () => ["wallet"] as const,
  transactions: (params?: Record<string, unknown>) => ["transactions", params ?? {}] as const,
  proposals: {
    all: () => ["proposals"] as const,
    list: (params?: Record<string, unknown>) => ["proposals", "list", params ?? {}] as const,
  },
  services: {
    all: () => ["services"] as const,
    mine: () => ["services", "mine"] as const,
    explore: (params?: Record<string, unknown>) => ["services", "explore", params ?? {}] as const,
    detail: (id: number | string) => ["services", "detail", String(id)] as const,
  },
  jobs: {
    all: () => ["jobs"] as const,
    explore: (params?: Record<string, unknown>) => ["jobs", "explore", params ?? {}] as const,
    mine: () => ["jobs", "mine"] as const,
  },
  conversations: () => ["conversations"] as const,
  conversationEvents: (id: number | string) => ["conversations", "events", String(id)] as const,
  messages: {
    list: (conversationId: number | string) => ["messages", String(conversationId)] as const,
    unreadCount: () => ["messages", "unread-count"] as const,
  },
  notifications: {
    list: () => ["notifications", "list"] as const,
    unreadCount: () => ["notifications", "unread-count"] as const,
  },
  disputes: {
    all: () => ["disputes"] as const,
    adminDetail: (id: number | string) => ["disputes", "admin-detail", String(id)] as const,
  },
  // Admin console work-queues and reference data. Everything lives under one prefix so a
  // realtime admin alert (or any admin action) can refresh the whole console at once.
  admin: {
    all: () => ["admin"] as const,
    stats: () => ["admin", "stats"] as const,
    financeStats: () => ["admin", "finance-stats"] as const,
    kyc: (params?: Record<string, unknown>) => ["admin", "kyc", params ?? {}] as const,
    disputes: (params?: Record<string, unknown>) => ["admin", "disputes", params ?? {}] as const,
    services: (params?: Record<string, unknown>) => ["admin", "services", params ?? {}] as const,
    jobs: (params?: Record<string, unknown>) => ["admin", "jobs", params ?? {}] as const,
    withdrawals: (params?: Record<string, unknown>) => ["admin", "withdrawals", params ?? {}] as const,
    transactions: (params?: Record<string, unknown>) => ["admin", "transactions", params ?? {}] as const,
    users: (params?: Record<string, unknown>) => ["admin", "users", params ?? {}] as const,
    user: (id: number | string) => ["admin", "user", String(id)] as const,
    categories: () => ["admin", "categories"] as const,
    skills: () => ["admin", "skills"] as const,
  },
  customOrders: {
    all: () => ["custom-orders"] as const,
    mine: () => ["custom-orders", "mine"] as const,
    incoming: () => ["custom-orders", "incoming"] as const,
    detail: (id: number | string) => ["custom-orders", "detail", String(id)] as const,
  },
} as const;
