// Custom orders — negotiated, off-menu work paid in progress-based milestones.

export type CustomOrderStatus =
  | "pending"
  | "offered"
  | "accepted"
  | "declined"
  | "withdrawn"
  | "expired";

export type MilestoneStatus =
  | "upcoming"
  | "funded"
  | "in_progress"
  | "submitted"
  | "approved"
  | "released"
  | "cancelled";

export interface MilestoneDeliverable {
  url: string;
  file_name: string;
  file_type?: string | null;
}

export interface CustomOrderMilestone {
  id: number;
  seq: number;
  title: string;
  description: string | null;
  amount: number;
  due_days: number | null;
  status: MilestoneStatus;
  deliverables: MilestoneDeliverable[];
  submission_note: string | null;
  revision_note: string | null;
  funded_at: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  released_at: string | null;
}

export interface CustomOrderEscrow {
  total_value: number;
  released_total: number;
  in_escrow_total: number;
  unfunded_remaining: number;
  percent_released: number;
}

export interface CustomOrderOffer {
  scope: string | null;
  total: number;
  delivery_days: number | null;
  revisions: number | null;
  note: string | null;
  is_split: boolean;
  expires_at: string | null;
  offered_at: string | null;
}

export interface CustomOrder {
  id: number;
  status: CustomOrderStatus;
  viewer_role: "client" | "freelancer" | null;
  budget: number;
  description: string;
  desired_timeline_days: number | null;
  attachments: string[];
  created_at: string;
  client_read_at: string | null;
  freelancer_read_at: string | null;
  service: { id: number | null; title: string | null };
  client: { id: number | null; name: string | null };
  freelancer: { id: number | null; name: string | null };
  offer: CustomOrderOffer | null;
  milestones: CustomOrderMilestone[];
  escrow: CustomOrderEscrow;
  order: { id: number; status: string; conversation_id: number | null } | null;
}

export interface CreateCustomOrderRequest {
  budget: number;
  description: string;
  desired_timeline_days?: number | null;
  attachments?: string[];
}

export interface MilestoneInput {
  title: string;
  description?: string | null;
  amount: number;
  due_days?: number | null;
}

export interface SendCustomOfferRequest {
  offer_scope: string;
  offer_delivery_days: number;
  offer_revisions?: number | null;
  offer_note?: string | null;
  offer_expires_in_days?: number | null;
  is_split: boolean;
  milestones: MilestoneInput[];
}
