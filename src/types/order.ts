import { ClientProfile } from "./service";

export type OrderStatus =
  | "pending"
  | "active"
  | "delivered"
  | "revision_requested"
  | "disputed"
  | "completed"
  | "cancelled";

export interface Dispute {
  id: number;
  order_id: number;
  opened_by_user_id: number;
  reason: string;
  status: "open" | "resolved";
  outcome: "full_freelancer" | "partial" | "full_client" | null;
  partial_freelancer_amount: string | null;
  client_evidence: string | null;
  freelancer_evidence: string | null;
  admin_note: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface AdminDispute {
  id: number;
  status: "open" | "resolved";
  outcome: "full_freelancer" | "partial" | "full_client" | null;
  reason: string;
  client_evidence: string | null;
  freelancer_evidence: string | null;
  admin_note: string | null;
  partial_freelancer_amount: string | null;
  resolved_at: string | null;
  opened_at: string;
  order: {
    id: number;
    price: string;
    title: string;
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
  client_profile_id: number;
  pricing_option_id: number | null;  // null for job-based orders
  proposal_id: number | null;        // null for service-based orders
  price: string | null;              // locked at creation time
  status: OrderStatus;
  delivery_note: string | null;
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
}

export interface MyOrdersResponse {
  status: string;
  message: string;
  data: Order[];
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
