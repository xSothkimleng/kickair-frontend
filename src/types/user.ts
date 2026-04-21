// User and Authentication types

export interface Education {
  facility: string;     // School/University name
  studies: string;      // Degree/Field of study
}

export interface Certificate {
  title: string;   // Certificate name
  source: string;  // Issuing organization
}

export interface LanguageWithProficiency {
  id: number;
  name: string;
  proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
}

export interface Language {
  id: number;
  name: string;
}

export interface Expertise {
  id: number;
  expertise_name: string;
}

export interface Industry {
  id: number;
  name: string;
}

// Minimal service shape returned inside a FreelancerProfile response
// (avoids circular dependency with service.ts)
export interface FreelancerProfileServicePricingOption {
  id: number;
  service_id: number;
  title: string;
  description: string | null;
  price: string;
  price_raw: number;
  revisions: number | null;
  delivery_time: number | null;
  created_at: string;
  updated_at: string;
}

export interface FreelancerProfileService {
  id: number;
  freelancer_profile_id: number;
  category_id: number | null;
  title: string;
  description: string | null;
  search_tags: string[] | null;
  location: string | null;
  orders_count: number;
  faqs: Array<{ question: string; answer: string }> | null;
  created_at: string;
  updated_at: string;
  pricing_options?: FreelancerProfileServicePricingOption[];
}

export interface FreelancerProfile {
  id: number;
  user_id: number;
  tagline: string | null;
  about: string | null;
  location: string | null;
  educations: Education[] | null;
  certificates: Certificate[] | null;
  created_at: string;
  updated_at: string;
  rating_average: string | null;
  rating_count: number;
  completed_orders_count: number;
  user?: User;
  expertises?: Expertise[];
  languages?: LanguageWithProficiency[];
  services?: FreelancerProfileService[];
}

export interface ClientProfile {
  id: number;
  user_id: number;
  company_name: string | null;
  industry_id: number | null;
  company_size: '1-10' | '11-50' | '51-200' | '201-500' | '500+' | null;
  location: string | null;
  website: string | null;
  about: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
  industry?: Industry;
}

export type KycStatus = 'pending' | 'approved' | 'rejected';

export interface IdentityVerification {
  id: number;
  status: KycStatus;
  admin_note: string | null;
  id_document_url: string | null;
  selfie_url: string | null;
  submitted_at: string;
  reviewed_at: string | null;
}

export interface AdminKycSubmission extends IdentityVerification {
  user: {
    id: number;
    name: string;
    email: string | null;
    telephone: string | null;
    avatar_url: string | null;
    is_freelancer: boolean;
    is_client: boolean;
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  telephone: string | null;
  avatar_url: string | null;
  is_verified_phone: boolean;
  is_verified_id: boolean;
  kyc_status?: KycStatus | null;
  email_verified_at: string | null;
  created_at?: string;
  is_freelancer: boolean;
  is_client: boolean;
  is_admin: boolean;
  freelancer_profile?: FreelancerProfile | null;
  client_profile?: ClientProfile | null;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  is_client: boolean;
  is_freelancer: boolean;
  telephone?: string;
  avatar_url?: string;
}

export interface EmailRegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  is_client: boolean;
  is_freelancer: boolean;
}

export interface PhoneRegisterData {
  name: string;
  firebase_id_token: string;
  password: string;
  password_confirmation: string;
  is_client: boolean;
  is_freelancer: boolean;
}

// Request types for profile updates
export interface FreelancerProfileRequest {
  tagline?: string;
  about?: string;
  location?: string;
  educations?: Education[];
  certificates?: Certificate[];
  expertise_ids?: number[];
  languages?: { language_id: number; proficiency: 'basic' | 'conversational' | 'fluent' | 'native' }[];
}

export interface ClientProfileRequest {
  company_name?: string;
  industry_id?: number;
  company_size?: '1-10' | '11-50' | '51-200' | '201-500' | '500+';
  location?: string;
  website?: string;
  about?: string;
}

// Pagination types for freelancer profile list
export interface FreelancerProfilesListResponse {
  status: string;
  message: string;
  data: FreelancerProfile[];
  links?: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta?: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}
