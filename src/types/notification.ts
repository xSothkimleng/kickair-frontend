export type NotificationType =
  | "proposal_submitted"
  | "proposal_accepted"
  | "proposal_rejected"
  | "order_placed"
  | "order_completed"
  | "order_cancelled"
  | "work_delivered"
  | "revision_requested"
  | "payment_released"
  | "dispute_opened"
  | "dispute_resolved"
  | "review_received";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  role: "freelancer" | "client" | null;
  data: Record<string, number | string>;
  readAt: string | null;
  createdAt: string;
}

export interface PaginatedNotificationsResponse {
  data: Notification[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  } | null;
}
