// User and Authentication types

export interface Education {
  school: string;       // School/University name
  degree: string;       // Degree/Major
  field?: string;       // Field of study
  from?: string;        // Start year e.g. "2018"
  to?: string | null;   // End year, null if ongoing
}

export interface Certificate {
  name: string;    // Certificate name
  issuer: string;  // Issuing organization
  year?: string;   // Year issued
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

export interface User {
  id: number;
  name: string;
  email: string;
  telephone: string | null;
  profile_image: string | null;
  is_verified_phone: boolean;
  is_verified_id: boolean;
  email_verified_at: string | null;
  created_at?: string;
  is_freelancer: boolean;
  is_client: boolean;
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
  profile_image?: string;
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
