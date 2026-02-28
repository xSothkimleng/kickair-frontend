// Job Post + Proposal types

export type JobPostStatus = "open" | "in_progress" | "completed" | "cancelled";
export type ProposalStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export interface JobCategory {
  id: number;
  category_name: string;
}

export interface JobSkill {
  id: number;
  expertise_name: string;
}

export interface JobMedia {
  id: number;
  file_url: string;
  file_type: "image" | "pdf" | string;
  file_name: string;
  file_size: number;
  mime_type: string;
  sort_order: number;
  created_at: string;
}

export interface JobClientProfile {
  id: number;
  user_id: number;
  company_name: string | null;
  industry_id: number | null;
  company_size: string | null;
  location: string | null;
  website: string | null;
  about: string | null;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    email: string | null;
    telephone: string | null;
    avatar_url: string | null;
    is_verified_phone: boolean;
    is_verified_id: boolean;
    email_verified_at: string | null;
    created_at: string;
    is_freelancer: boolean;
    is_client: boolean;
  };
}

export interface JobFreelancerProfile {
  id: number;
  user: {
    name: string;
    avatar_url: string | null;
  };
}

export interface JobPost {
  id: number;
  title: string;
  description: string;
  budget_min: string;
  budget_max: string;
  deadline: string;
  status: JobPostStatus;
  max_proposals: number;
  proposal_count: number;
  created_at: string;
  updated_at: string;
  category: JobCategory;
  skills: JobSkill[];
  media: JobMedia[];
  client_profile: JobClientProfile;
  my_proposal?: Proposal | null;
}

export interface Proposal {
  id: number;
  job_post_id: number;
  freelancer_profile_id: number;
  price: string;
  timeline_days: number;
  cover_letter: string;
  status: ProposalStatus;
  client_read_at: string | null;
  is_updated: boolean;
  created_at: string;
  updated_at: string;
  job_post?: JobPost;
  freelancer_profile?: JobFreelancerProfile;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface CreateJobPostRequest {
  category_id: number;
  title: string;
  description: string;
  budget_min: number;
  budget_max: number;
  deadline: string;
  max_proposals?: number;
  skill_ids?: number[];
  upload_token?: string;
}

export type UpdateJobPostRequest = Partial<CreateJobPostRequest>;

export interface CreateProposalRequest {
  price: number;
  timeline_days: number;
  cover_letter: string;
}

export type UpdateProposalRequest = Partial<CreateProposalRequest>;

export interface JobPostFilters {
  category_id?: number;
  budget_min?: number;
  budget_max?: number;
  skill_ids?: number[];
  page?: number;
}
