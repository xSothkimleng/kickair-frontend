export type NotificationType =
  | "proposal_submitted"
  | "proposal_accepted"
  | "proposal_rejected"
  | "order_placed"
  | "order_completed"
  | "order_cancelled"
  | "review_received";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, number>;
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
