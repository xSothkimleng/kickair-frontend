import {
  User,
  RegisterData,
  EmailRegisterData,
  PhoneRegisterData,
  Language,
  Expertise,
  Industry,
  FreelancerProfile,
  ClientProfile,
  FreelancerProfileRequest,
  ClientProfileRequest,
  FreelancerProfilesListResponse,
} from "@/types/user";
import {
  JobPost,
  Proposal,
  PaginatedResponse,
  CreateJobPostRequest,
  UpdateJobPostRequest,
  CreateProposalRequest,
  UpdateProposalRequest,
  JobPostFilters,
} from "@/types/job";
import { ServiceCategory } from "@/types/service";
import { Order } from "@/types/order";

export class EmailUnverifiedError extends Error {
  constructor() {
    super("Your email address is not verified.");
    this.name = "EmailUnverifiedError";
  }
}
import { ClientDashboardData, FreelancerDashboardData } from "@/types/dashboard";
import { PaginatedNotificationsResponse } from "@/types/notification";
import { Review } from "@/types/order";

export interface ReviewClientProfile {
  id: number;
  user_id: number;
  user: {
    id: number;
    name: string;
    avatar_url: string | null;
  };
}

export interface FreelancerReview extends Review {
  client_profile: ReviewClientProfile;
}

export interface SubmitReviewRequest {
  rating: number;
  comment?: string;
}

export interface SubmitReviewResponse {
  data: Review & { client_profile: ReviewClientProfile };
  message: string;
}

export interface FreelancerReviewsResponse {
  data: FreelancerReview[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const TOKEN_KEY = "auth_token";

class ApiClient {
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  private setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  clearToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_URL}${endpoint}`;
    const token = this.getToken();

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Request failed" }));
      if (response.status === 403 && error.message === "Your email address is not verified.") {
        throw new EmailUnverifiedError();
      }
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Returns the user object directly
  async login(email: string, password: string): Promise<User> {
    const response = await this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.data.token);
    return response.data.user;
  }

  // Returns the user object directly
  async register(data: RegisterData): Promise<User> {
    const response = await this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    this.setToken(response.data.token);
    return response.data.user;
  }

  async loginEmail(email: string, password: string): Promise<User> {
    const response = await this.request("/api/auth/login/email", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.data.token);
    return response.data.user;
  }

  async loginPhone(telephone: string, password: string): Promise<User> {
    const response = await this.request("/api/auth/login/phone", {
      method: "POST",
      body: JSON.stringify({ telephone, password }),
    });
    this.setToken(response.data.token);
    return response.data.user;
  }

  async registerEmail(data: EmailRegisterData): Promise<User> {
    const response = await this.request("/api/auth/register/email", {
      method: "POST",
      body: JSON.stringify(data),
    });
    this.setToken(response.data.token);
    return response.data.user;
  }

  async registerPhone(data: PhoneRegisterData): Promise<User> {
    const response = await this.request("/api/auth/register/phone", {
      method: "POST",
      body: JSON.stringify(data),
    });
    this.setToken(response.data.token);
    return response.data.user;
  }

  async resendVerificationEmail(): Promise<void> {
    await this.request("/api/auth/email/resend", { method: "POST" });
  }

  async addEmail(email: string): Promise<void> {
    await this.request("/api/auth/add-email", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async logout(): Promise<void> {
    await this.request("/api/auth/logout", {
      method: "POST",
    });
    this.clearToken();
  }

  // Returns the user object directly
  async getUser(): Promise<User> {
    const response = await this.request("/api/auth/me");
    return response.data.user;
  }

  async get(endpoint: string) {
    return this.request(endpoint, { method: "GET" });
  }

  async post(endpoint: string, data: unknown) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put(endpoint: string, data: unknown) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint: string, data: unknown) {
    return this.request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, { method: "DELETE" });
  }

  async uploadFile(endpoint: string, file: File, fieldName: string = "file") {
    const url = `${API_URL}${endpoint}`;
    const token = this.getToken();

    const formData = new FormData();
    formData.append(fieldName, file);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Upload failed" }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Upload file with additional form data fields (e.g., upload_token for temp uploads)
  async uploadFormData(endpoint: string, file: File, additionalFields: Record<string, string> = {}) {
    const url = `${API_URL}${endpoint}`;
    const token = this.getToken();

    const formData = new FormData();
    formData.append("file", file);

    // Add additional fields to the form data
    for (const [key, value] of Object.entries(additionalFields)) {
      formData.append(key, value);
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Upload failed" }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // ============================================
  // Profile Image Methods
  // ============================================

  async uploadProfileImage(file: File): Promise<User> {
    const response = await this.uploadFile("/api/auth/profile-image", file, "image");
    return response.data.user;
  }

  async deleteProfileImage(): Promise<User> {
    const response = await this.delete("/api/auth/profile-image");
    return response.data.user;
  }

  // ============================================
  // Reference Data Methods (Public - No Auth)
  // ============================================

  async getLanguages(): Promise<Language[]> {
    const response = await this.get("/api/languages");
    return response.data;
  }

  async getIndustries(): Promise<Industry[]> {
    const response = await this.get("/api/industries");
    return response.data;
  }

  async getExpertises(): Promise<Expertise[]> {
    const response = await this.get("/api/user-expertises");
    return response.data;
  }

  // ============================================
  // Freelancer Profile Methods
  // ============================================

  async getFreelancerProfiles(page: number = 1): Promise<FreelancerProfilesListResponse> {
    return this.get(`/api/freelancer-profiles?page=${page}`);
  }

  async getFreelancerProfile(id: number): Promise<FreelancerProfile> {
    const response = await this.get(`/api/freelancer-profiles/${id}`);
    return response.data;
  }

  async createFreelancerProfile(data: FreelancerProfileRequest): Promise<FreelancerProfile> {
    const response = await this.post("/api/freelancer-profiles", data);
    return response.data;
  }

  async updateFreelancerProfile(id: number, data: FreelancerProfileRequest): Promise<FreelancerProfile> {
    const response = await this.put(`/api/freelancer-profiles/${id}`, data);
    return response.data;
  }

  async deleteFreelancerProfile(id: number): Promise<void> {
    await this.delete(`/api/freelancer-profiles/${id}`);
  }

  // ============================================
  // Client Profile Methods
  // ============================================

  async getClientProfile(id: number): Promise<ClientProfile> {
    const response = await this.get(`/api/client-profiles/${id}`);
    return response.data;
  }

  async createClientProfile(data: ClientProfileRequest): Promise<ClientProfile> {
    const response = await this.post("/api/client-profiles", data);
    return response.data;
  }

  async updateClientProfile(id: number, data: ClientProfileRequest): Promise<ClientProfile> {
    const response = await this.put(`/api/client-profiles/${id}`, data);
    return response.data;
  }

  async deleteClientProfile(id: number): Promise<void> {
    await this.delete(`/api/client-profiles/${id}`);
  }

  // ============================================
  // Dashboard Methods
  // ============================================

  async getClientDashboard(): Promise<ClientDashboardData> {
    const response = await this.get("/api/client-dashboard");
    return response.data;
  }

  async getFreelancerDashboard(): Promise<FreelancerDashboardData> {
    const response = await this.get("/api/freelancer-dashboard");
    return response.data;
  }

  // ============================================
  // Review Methods
  // ============================================

  async submitReview(orderId: number, data: SubmitReviewRequest): Promise<SubmitReviewResponse> {
    return this.post(`/api/orders/${orderId}/review`, data);
  }

  async getFreelancerReviews(freelancerProfileId: number, page: number = 1): Promise<FreelancerReviewsResponse> {
    return this.get(`/api/freelancer-profiles/${freelancerProfileId}/reviews?page=${page}`);
  }

  // ============================================
  // Reference Data — Service Categories
  // ============================================

  async getServiceCategories(): Promise<ServiceCategory[]> {
    const response = await this.get("/api/service-categories");
    // API returns `category_name`; normalize to `name` used throughout the frontend
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return response.data.map((c: any) => ({ ...c, name: c.name ?? c.category_name }));
  }

  // ============================================
  // Job Post Methods (Public)
  // ============================================

  async getJobPosts(filters: JobPostFilters = {}): Promise<PaginatedResponse<JobPost>> {
    const params = new URLSearchParams();
    if (filters.category_id) params.set("category_id", String(filters.category_id));
    if (filters.budget_min) params.set("budget_min", String(filters.budget_min));
    if (filters.budget_max) params.set("budget_max", String(filters.budget_max));
    if (filters.skill_ids?.length) {
      filters.skill_ids.forEach(id => params.append("skill_ids[]", String(id)));
    }
    if (filters.page && filters.page > 1) params.set("page", String(filters.page));
    const query = params.toString();
    return this.get(`/api/job-posts${query ? `?${query}` : ""}`);
  }

  async getJobPost(id: number): Promise<JobPost> {
    const response = await this.get(`/api/job-posts/${id}`);
    return response.data;
  }

  // ============================================
  // Job Post Methods (Client)
  // ============================================

  async createJobPost(data: CreateJobPostRequest): Promise<JobPost> {
    const response = await this.post("/api/job-posts", data);
    return response.data;
  }

  async updateJobPost(id: number, data: UpdateJobPostRequest): Promise<JobPost> {
    const response = await this.put(`/api/job-posts/${id}`, data);
    return response.data;
  }

  async deleteJobPost(id: number): Promise<void> {
    await this.delete(`/api/job-posts/${id}`);
  }

  async getClientJobPosts(page: number = 1): Promise<PaginatedResponse<JobPost>> {
    return this.get(`/api/client/job-posts?page=${page}`);
  }

  // ============================================
  // Proposal Methods (Freelancer)
  // ============================================

  async submitProposal(jobPostId: number, data: CreateProposalRequest): Promise<Proposal> {
    const response = await this.post(`/api/job-posts/${jobPostId}/proposals`, data);
    return response.data;
  }

  async updateProposal(proposalId: number, data: UpdateProposalRequest): Promise<Proposal> {
    const response = await this.put(`/api/proposals/${proposalId}`, data);
    return response.data;
  }

  async withdrawProposal(proposalId: number): Promise<Proposal> {
    const response = await this.post(`/api/proposals/${proposalId}/withdraw`, {});
    return response.data;
  }

  async getFreelancerProposals(page: number = 1): Promise<PaginatedResponse<Proposal>> {
    return this.get(`/api/freelancer/proposals?page=${page}`);
  }

  // ============================================
  // Proposal Methods (Client)
  // ============================================

  async getJobProposals(jobPostId: number, page: number = 1): Promise<PaginatedResponse<Proposal>> {
    return this.get(`/api/job-posts/${jobPostId}/proposals?page=${page}`);
  }

  async getProposal(proposalId: number): Promise<Proposal> {
    const response = await this.get(`/api/proposals/${proposalId}`);
    return response.data;
  }

  async approveProposal(proposalId: number): Promise<Order> {
    const response = await this.post(`/api/proposals/${proposalId}/approve`, {});
    return response.data;
  }

  async rejectProposal(proposalId: number): Promise<Proposal> {
    const response = await this.post(`/api/proposals/${proposalId}/reject`, {});
    return response.data;
  }

  // ============================================
  // Notification Methods
  // ============================================

  async getNotifications(page: number = 1): Promise<PaginatedNotificationsResponse> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw: any = await this.get(`/api/notifications?page=${page}`);
    // Normalize: handle both { data: [], meta: {} } and { data: { data: [], meta: {} } }
    const items = Array.isArray(raw.data) ? raw.data : (Array.isArray(raw.data?.data) ? raw.data.data : []);
    const meta = raw.meta ?? raw.data?.meta ?? null;
    return { data: items, meta };
  }

  async markNotificationRead(id: string): Promise<void> {
    await this.patch(`/api/notifications/${id}/read`, {});
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.post("/api/notifications/read-all", {});
  }

  // ============================================
  // Upload Token
  // ============================================

  async getUploadToken(): Promise<string> {
    const response = await this.post("/api/upload-tokens", {});
    return response.data.upload_token;
  }
}

export const api = new ApiClient();