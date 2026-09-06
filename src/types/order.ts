import { ClientProfile } from "./service";

export type OrderStatus =
  | "pending"
  | "active"
  | "delivered"
  | "revision_requested"
  | "disputed"
  | "completed"
  | "cancelled";

export interface EvidenceFile {
  url: string;
  file_name: string;
  file_type: "image" | "pdf";
}

/** How an admin closed a dispute. `continue` returns the order to the parties with feedback; the others end it. */
export type DisputeOutcome = "full_freelancer" | "partial" | "full_client" | "continue";

export interface Dispute {
  id: number;
  order_id: number;
  /** Per-order number: disputes stack after a "continue" resolution (#1, #2, …). */
  sequence: number;
  opened_by_user_id: number;
  reason: string;
  status: "open" | "resolved";
  outcome: DisputeOutcome | null;
  partial_freelancer_amount: string | null;
  client_evidence: EvidenceFile[] | null;
  freelancer_evidence: EvidenceFile[] | null;
  client_statement: string | null;
  freelancer_statement: string | null;
  admin_note: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface AdminDispute {
  id: number;
  sequence: number;
  status: "open" | "resolved";
  outcome: DisputeOutcome | null;
  reason: string;
  client_evidence: EvidenceFile[] | null;
  freelancer_evidence: EvidenceFile[] | null;
  client_statement: string | null;
  freelancer_statement: string | null;
  admin_note: string | null;
  partial_freelancer_amount: string | null;
  resolved_at: string | null;
  opened_at: string;
  order: {
    id: number;
    price: string;
    title: string;
    conversation_id: number | null;
    created_at?: string;
    delivery_history?: Array<{ note: string | null; attachments: Array<{ url: string; file_name: string; file_type: string }>; submitted_at: string }>;
    revision_history?: Array<{ note: string | null; requested_at: string }>;
    /** Present for orders born from an accepted custom offer: the client's request + the accepted offer terms. */
    custom_order?: {
      id: number;
      description: string | null;
      budget: string | number | null;
      desired_timeline_days: number | null;
      attachments: string[];
      scope: string | null;
      total: string | number | null;
      delivery_days: number | null;
      revisions: number | null;
      offer_note: string | null;
      requested_at: string | null;
      offered_at: string | null;
    } | null;
  };
  client: {
    id: number;
    name: string;
    email: string;
    avatar_url: string | null;
  };
  freelancer: {
    id: number;
    name: string;
    email: string;
    avatar_url: string | null;
  };
  /** Prior disputes on the same order, oldest first. */
  earlier_disputes?: Array<{
    id: number;
    sequence: number;
    status: "open" | "resolved";
    outcome: DisputeOutcome | null;
    reason: string;
    admin_note: string | null;
    opened_at: string;
    resolved_at: string | null;
  }>;
}

export interface Review {
  id: number;
  order_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface OrderUser {
  id: number;
  name: string;
  email: string;
  telephone: string | null;
  avatar_url: string | null;
  is_verified_phone: boolean;
  is_verified_id: boolean;
  email_verified_at: string | null;
  created_at: string;
  is_freelancer: boolean;
  is_client: boolean;
}

export interface OrderFreelancerProfile {
  id: number;
  user_id: number;
  education: string | null;
  certification: string | null;
  created_at: string;
  updated_at: string;
  user: OrderUser;
}

export interface OrderCategory {
  id: number;
  category_name: string;
  created_at: string;
  updated_at: string;
}

export interface OrderService {
  id: number;
  freelancer_profile_id: number;
  category_id: number;
  title: string;
  description: string | null;
  search_tags: string[];
  location: string | null;
  orders_count: number;
  faqs: { question: string; answer: string }[];
  created_at: string;
  updated_at: string;
  freelancer_profile?: OrderFreelancerProfile;
  category?: OrderCategory;
}

export interface OrderPricingOption {
  id: number;
  service_id: number;
  title: string;
  description: string;
  price: string;
  price_raw: string;
  revisions: string;
  delivery_time: string;
  created_at: string;
  updated_at: string;
  service?: OrderService;
}

// Bug #13: new types for job-based order data
export interface OrderJobPost {
  id: number;
  title: string;
  description: string | null;
  category?: OrderCategory;
}

export interface OrderProposal {
  id: number;
  job_post_id: number;
  freelancer_profile_id: number;
  price: string;
  timeline_days: number;
  cover_letter: string;
  status: string;
  created_at: string;
  updated_at: string;
  job_post?: OrderJobPost;
  freelancer_profile?: OrderFreelancerProfile;
}

export interface Order {
  id: number;
  reference?: string; // human-readable id, e.g. "ORD-000123"
  client_profile_id: number;
  pricing_option_id: number | null;  // null for job-based orders
  proposal_id: number | null;        // null for service-based orders
  custom_order_id?: number | null;   // set for orders born from an accepted custom offer
  custom_order?: {
    id: number;
    delivery_days: number | null;
    revisions: number | null;
    scope: string | null;
    description?: string | null;
    budget?: string | number | null;
    desired_timeline_days?: number | null;
    attachments?: string[];
    offer_note?: string | null;
    requested_at?: string | null;
    offered_at?: string | null;
  } | null;
  price: string | null;              // locked at creation time
  status: OrderStatus;
  delivery_note: string | null;
  delivery_attachments: Array<{ url: string; file_name: string; file_type: string }>;
  delivery_history?: Array<{ note: string | null; attachments: Array<{ url: string; file_name: string; file_type: string }>; submitted_at: string }>;
  revision_history?: Array<{ note: string | null; requested_at: string }>;
  revision_note: string | null;
  created_at: string;
  updated_at: string;
  review: Review | null;
  dispute: Dispute | null;
  client_profile?: ClientProfile;
  pricing_option?: OrderPricingOption;
  proposal?: OrderProposal;          // present for job-based orders
  service?: OrderService;            // present for service-based orders
  freelancer?: OrderFreelancerProfile;
  conversation_id?: number | null;
}

export interface MyOrdersResponse {
  status: string;
  message: string;
  data: Order[];
}

export type OrderEventActorRole = "client" | "freelancer" | "admin" | "system" | null;

export interface OrderTimelineEvent {
  id: number;
  event_type: string;
  description: string;
  actor_role: OrderEventActorRole;
  created_at: string;
}

export interface CreateOrderRequest {
  pricing_option_id: number;
}

export interface CreateOrderResponse {
  status: string;
  message: string;
  data: Order;
}

export interface FreelancerOrdersResponse {
  status: string;
  message: string;
  data: Order[];
}
