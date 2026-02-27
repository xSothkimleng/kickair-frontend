// Types matching the API response structure
// Import profile types from user.ts to avoid duplication
import { FreelancerProfile, ClientProfile } from "./user";

export interface ServiceUser {
  id: number;
  name: string;
  email: string;
  profile_image: string | null; // Full URL to image
}

// Re-export profile types for backward compatibility
export type { FreelancerProfile, ClientProfile };

export interface ServiceCategory {
  id: number;
  name: string;
  slug: string;
}

export interface PricingOption {
  id: number;
  service_id: number;
  title: string;
  description: string;
  price: string;
  price_raw: string | number; // API returns string e.g. "11.00"
  revisions: string | number; // API returns string e.g. "1", "Unlimited"
  delivery_time: string | number; // API returns string e.g. "3 days"
  created_at: string;
  updated_at: string;
}

export interface ServiceReviewUser {
  id: number;
  name: string;
  profile_image: string | null;
}

export interface ServiceReviewClientProfile {
  id: number;
  user_id: number;
  user: ServiceReviewUser;
}

export interface ServiceReview {
  id: number;
  order_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  pricing_option: Pick<PricingOption, "id" | "title">;
  client_profile: ServiceReviewClientProfile;
}

export interface ServiceMedia {
  id: number;
  file_url: string;
  file_type: "image" | "video" | "pdf";
  file_name: string;
  file_size: number;
  mime_type: string;
  sort_order: number;
  created_at: string;
}

// Temporary upload types (for upload-before-create flow)
export interface UploadToken {
  upload_token: string;
  expires_at: string;
}

export interface TemporaryUpload {
  id: number;
  upload_token: string;
  file_url: string;
  file_type: "image" | "video" | "pdf";
  file_name: string;
  file_size: number;
  sort_order: number;
}

export interface ServiceFAQ {
  question: string;
  answer: string;
}

export interface Service {
  id: number;
  freelancer_profile_id: number;
  category_id: number;
  title: string;
  description: string | null;
  search_tags: string[] | null;
  location: string | null;
  orders_count: number;
  rating_average: string | null;
  rating_count: number;
  faqs: ServiceFAQ[] | null;
  created_at: string;
  updated_at: string;
  feature_image_id: number | null;
  feature_image: ServiceMedia | null;
  freelancer_profile?: FreelancerProfile;
  category?: ServiceCategory;
  pricing_options?: PricingOption[];
  media?: ServiceMedia[];
  reviews?: ServiceReview[];
}

// API Response types
export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface ServicesListResponse {
  status: string;
  message: string;
  data: Service[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface ServiceDetailResponse {
  status: string;
  message: string;
  data: Service;
}

// Request types for creating/updating services
export interface CreatePricingOptionRequest {
  title: string;
  description: string;
  price: number;
  revisions: number;
  delivery_time: number;
}

export interface CreateServiceRequest {
  category_id: number;
  title: string;
  description: string;
  search_tags: string[];
  location: string;
  pricing_options: CreatePricingOptionRequest[];
  faqs?: ServiceFAQ[];
  upload_token?: string; // Links temporary uploads to the new service
}

// Helper type for ServiceCard display
export interface ServiceCardData {
  id: number;
  title: string;
  category: string;
  freelancerName: string;
  freelancerAvatar: string;
  image: string;
  price: number;
  deliveryDays: number;
  ordersCount: number;
}