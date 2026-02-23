import { ClientProfile } from "./service";

export type OrderStatus = "pending" | "active" | "completed" | "cancelled";

export interface OrderUser {
  id: number;
  name: string;
  email: string;
  telephone: string | null;
  profile_image: string | null;
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

export interface Order {
  id: number;
  client_profile_id: number;
  pricing_option_id: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  client_profile?: ClientProfile;
  pricing_option?: OrderPricingOption;
  service?: OrderService;
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