import {
  User,
  RegisterData,
  EmailRegisterData,
  PhoneRegisterData,
  Language,
  Expertise,
  Industry,
  FreelancerProfile,
  PortfolioItem,
  ClientProfile,
  FreelancerProfileRequest,
  ClientProfileRequest,
  FreelancerProfilesListResponse,
  IdentityVerification,
  AdminKycSubmission,
  OtpChannel,
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
import { ServiceCategory, Service } from "@/types/service";
import { AdminDispute, Order, OrderTimelineEvent } from "@/types/order";

export class EmailUnverifiedError extends Error {
  constructor() {
    super("Your email address is not verified.");
    this.name = "EmailUnverifiedError";
  }
}
import { ClientDashboardData, FreelancerDashboardData, LevelStats } from "@/types/dashboard";
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

const GENERIC_SERVER_ERROR = "Something went wrong on our end. Please try again.";
const NETWORK_ERROR = "Unable to reach the server. Check your connection and try again.";

// Translates an API error response into a message safe to show the user.
// Unexpected server failures (5xx) are masked behind a generic message while the
// real developer error is logged to the browser console only. Intentional 4xx
// errors (validation, auth, etc.) keep their server message — those are for the user.
function toUserFacingError(status: number, body: { message?: string; debug?: unknown }): Error {
  if (status >= 500) {
    console.error(`[API ${status}]`, body?.debug ?? body?.message ?? "Server error");
    return new Error(GENERIC_SERVER_ERROR);
  }
  return new Error(body?.message || `Request failed (${status})`);
}

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

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      });
    } catch (networkErr) {
      console.error("[API network error]", networkErr);
      throw new Error(NETWORK_ERROR);
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Request failed" }));
      if (response.status === 403 && error.message === "Your email address is not verified.") {
        throw new EmailUnverifiedError();
      }
      throw toUserFacingError(response.status, error);
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

  async sendPhoneOtp(phone: string, channel: OtpChannel = "telegram"): Promise<void> {
    await this.request("/api/auth/phone/send-otp", {
      method: "POST",
      body: JSON.stringify({ phone, channel }),
    });
  }

  // Enable the second account role (Start selling / Start hiring). No KYC gate.
  async enableRole(role: "client" | "freelancer"): Promise<User> {
    const response = await this.request("/api/account/enable-role", {
      method: "POST",
      body: JSON.stringify({ role }),
    });
    return response.data;
  }

  async updatePhone(phone: string, code: string): Promise<User> {
    const response = await this.request("/api/auth/phone/update", {
      method: "POST",
      body: JSON.stringify({ phone, code }),
    });
    return response.data;
  }

  async resendVerificationEmail(): Promise<void> {
    await this.request("/api/auth/email/resend", { method: "POST" });
  }

  // Add an email to an account that signed up with phone only. Sends a verification
  // link and returns the updated user. Backend rejects accounts that already have one.
  async addEmail(email: string): Promise<User> {
    const response = await this.request("/api/auth/add-email", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return response.data;
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

  async updateUserProfile(data: { name?: string; email?: string }): Promise<User> {
    const response = await this.put("/api/auth/profile", data);
    return response.data;
  }

  async changePassword(data: { current_password: string; password: string; password_confirmation: string }): Promise<void> {
    await this.put("/api/auth/password", data);
  }

  async getSessions(): Promise<Array<{ id: number; name: string; last_used_at: string | null; created_at: string; current: boolean }>> {
    const response = await this.get("/api/auth/sessions");
    return response.data;
  }

  async revokeSession(tokenId: number): Promise<void> {
    await this.delete(`/api/auth/sessions/${tokenId}`);
  }

  async revokeOtherSessions(): Promise<void> {
    await this.delete("/api/auth/sessions/other");
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
      throw toUserFacingError(response.status, error);
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
      throw toUserFacingError(response.status, error);
    }

    return response.json();
  }

  // Post a caller-built FormData body (multipart) — used for endpoints that mix
  // text fields with one or more file uploads (e.g. portfolio items).
  private async postMultipart(endpoint: string, formData: FormData) {
    const url = `${API_URL}${endpoint}`;
    const token = this.getToken();

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Request failed" }));
      throw toUserFacingError(response.status, error);
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

  // ── Portfolio items ──────────────────────────────────────────────────────
  // Caller builds the FormData (title/description/project_url/completed_on +
  // images[] files; update also takes removed_image_ids[]).
  async createPortfolioItem(formData: FormData): Promise<PortfolioItem> {
    const response = await this.postMultipart("/api/portfolio-items", formData);
    return response.data;
  }

  async updatePortfolioItem(id: number, formData: FormData): Promise<PortfolioItem> {
    const response = await this.postMultipart(`/api/portfolio-items/${id}`, formData);
    return response.data;
  }

  async deletePortfolioItem(id: number): Promise<void> {
    await this.delete(`/api/portfolio-items/${id}`);
  }

  // Distinct education/certification values other freelancers have entered, for
  // the profile editor typeahead (merged with a curated seed list on the client).
  async getProfileSuggestions(): Promise<{ schools: string[]; degrees: string[]; cert_names: string[]; cert_issuers: string[] }> {
    const response = await this.get("/api/profile-suggestions");
    return response.data;
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

  async getLevelStats(): Promise<LevelStats> {
    const response = await this.get("/api/freelancer-dashboard/level");
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

  // The category tree: aisles (top-level) each with a `children` array of shelves.
  async getCategoryTree(): Promise<ServiceCategory[]> {
    const response = await this.get("/api/service-categories");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const norm = (c: any): ServiceCategory => ({
      ...c,
      name: c.name ?? c.category_name,
      children: Array.isArray(c.children) ? c.children.map(norm) : [],
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (response.data as any[]).map(norm);
  }

  // Flattened list of every category (aisles + shelves). Kept for the legacy flat
  // dropdowns/filters; the create forms use getCategoryTree() for the grouped picker.
  async getServiceCategories(): Promise<ServiceCategory[]> {
    const tree = await this.getCategoryTree();
    const flat: ServiceCategory[] = [];
    tree.forEach(aisle => {
      flat.push(aisle);
      (aisle.children ?? []).forEach(shelf => flat.push(shelf));
    });
    return flat;
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

  async deleteService(id: number): Promise<void> {
    await this.delete(`/api/services/${id}`);
  }

  async deleteJobPost(id: number): Promise<void> {
    await this.delete(`/api/job-posts/${id}`);
  }

  // Publish a draft → sends it to admin review. Enforces the publish gate (KYC,
  // optionally a verified email + phone); throws with the gate message if blocked.
  async publishService(id: number): Promise<Service> {
    const response = await this.post(`/api/services/${id}/publish`, {});
    return response.data;
  }

  async publishJobPost(id: number): Promise<JobPost> {
    const response = await this.post(`/api/job-posts/${id}/publish`, {});
    return response.data;
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
  // Upload Token
  // ============================================

  async getUploadToken(): Promise<string> {
    const response = await this.post("/api/upload-tokens", {});
    return response.data.upload_token;
  }

  // ============================================
  // Admin Methods
  // ============================================

  async getAdminStats(): Promise<AdminStats> {
    const response = await this.get("/api/admin/stats");
    return response.data;
  }

  async getAdminTransactions(page = 1, type?: string, status?: string): Promise<AdminTransactionsResponse> {
    const params = new URLSearchParams({ page: String(page) });
    if (type) params.set("type", type);
    if (status) params.set("status", status);
    return this.get(`/api/admin/transactions?${params}`);
  }

  async getAdminWithdrawals(page = 1, status?: string): Promise<AdminTransactionsResponse> {
    const params = new URLSearchParams({ page: String(page) });
    if (status) params.set("status", status);
    return this.get(`/api/admin/withdrawals?${params}`);
  }

  async approveWithdrawal(transactionId: number): Promise<void> {
    await this.post(`/api/admin/withdrawals/${transactionId}/approve`, {});
  }

  async rejectWithdrawal(transactionId: number, note?: string): Promise<void> {
    await this.post(`/api/admin/withdrawals/${transactionId}/reject`, { note: note ?? "" });
  }

  // ── KYC (user-facing) ────────────────────────────────────────────────────

  async getKycStatus(): Promise<IdentityVerification | null> {
    const response = await this.get("/api/kyc/status");
    return response.data ?? null;
  }

  // Submit KYC: a document type, the front (and back, for ID cards/licenses) of the
  // document, and a live selfie. `back` is null for passports.
  async submitKyc(documentType: string, front: File, back: File | null, selfie: File): Promise<IdentityVerification> {
    const formData = new FormData();
    formData.append("document_type", documentType);
    formData.append("id_document", front);
    if (back) formData.append("document_back", back);
    formData.append("selfie", selfie);

    const url = `${API_URL}/api/kyc/submit`;
    const token = this.getToken();

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        Accept: "application/json",
      },
      body: formData,
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || "KYC submission failed.");
    }
    return json.data;
  }

  // ── KYC (admin) ──────────────────────────────────────────────────────────

  async getAdminKyc(page = 1, status?: string): Promise<{ data: AdminKycSubmission[]; meta: { current_page: number; last_page: number; total: number } }> {
    const params = new URLSearchParams({ page: String(page) });
    if (status) params.set("status", status);
    const response = await this.get(`/api/admin/kyc?${params}`);
    return response;
  }

  async approveKyc(kycId: number): Promise<AdminKycSubmission> {
    const response = await this.post(`/api/admin/kyc/${kycId}/approve`, {});
    return response.data;
  }

  async rejectKyc(kycId: number, adminNote: string): Promise<AdminKycSubmission> {
    const response = await this.post(`/api/admin/kyc/${kycId}/reject`, { admin_note: adminNote });
    return response.data;
  }

  // ── Admin Dashboard ──────────────────────────────────────────────────────

  async getAdminDashboardStats(): Promise<AdminDashboardStats> {
    const response = await this.get("/api/admin/dashboard/stats");
    return response.data;
  }

  // ── Admin Users ──────────────────────────────────────────────────────────

  // ============================================
  // Order Actions
  // ============================================

  async deliverOrder(orderId: number, deliveryNote?: string, deliveryAttachments?: { url: string; file_name: string; file_type: string }[]): Promise<Order> {
    const response = await this.post(`/api/orders/${orderId}/deliver`, { delivery_note: deliveryNote ?? null, delivery_attachments: deliveryAttachments ?? [] });
    return response.data;
  }

  async approveOrder(orderId: number): Promise<Order> {
    const response = await this.post(`/api/orders/${orderId}/approve`, {});
    return response.data;
  }

  async requestRevision(orderId: number, revisionNote: string): Promise<Order> {
    const response = await this.post(`/api/orders/${orderId}/request-revision`, { revision_note: revisionNote });
    return response.data;
  }

  async resubmitOrder(orderId: number, deliveryNote?: string, deliveryAttachments?: { url: string; file_name: string; file_type: string }[]): Promise<Order> {
    const response = await this.post(`/api/orders/${orderId}/resubmit`, { delivery_note: deliveryNote ?? null, delivery_attachments: deliveryAttachments ?? [] });
    return response.data;
  }

  async openDispute(orderId: number, reason: string, evidenceFiles?: { url: string; file_name: string; file_type: string }[]): Promise<{ dispute: AdminDispute; order_status: string }> {
    const response = await this.post(`/api/orders/${orderId}/dispute`, { reason, evidence_files: evidenceFiles ?? null });
    return response.data;
  }

  async submitDisputeEvidence(orderId: number, evidenceFiles: { url: string; file_name: string; file_type: string }[], statement?: string): Promise<void> {
    await this.put(`/api/orders/${orderId}/dispute/evidence`, { evidence_files: evidenceFiles, statement });
  }

  // ── Admin Disputes ────────────────────────────────────────────────────────

  async getAdminDisputes(page = 1, status?: string): Promise<{ data: AdminDispute[]; meta: { current_page: number; last_page: number; total: number } }> {
    const params = new URLSearchParams({ page: String(page) });
    if (status) params.set("status", status);
    const response = await this.get(`/api/admin/disputes?${params}`);
    return response.data;
  }

  async getAdminDispute(disputeId: number): Promise<AdminDispute> {
    const response = await this.get(`/api/admin/disputes/${disputeId}`);
    return response.data;
  }

  async resolveDispute(disputeId: number, data: { outcome: string; partial_freelancer_amount?: number; admin_note: string }): Promise<AdminDispute> {
    const response = await this.post(`/api/admin/disputes/${disputeId}/resolve`, data);
    return response.data;
  }

  // ── Conversation messages (used by dashboards + admin dispute chat) ─────────
  async getConversationMessages(conversationId: number): Promise<{ data: import("@/types/message").Message[] }> {
    return this.get(`/api/conversations/${conversationId}/messages`);
  }

  async sendConversationMessage(conversationId: number, body: string): Promise<{ data: import("@/types/message").Message }> {
    return this.post(`/api/conversations/${conversationId}/messages`, { body });
  }

  async getUnreadMessageCount(): Promise<number> {
    const response = await this.get("/api/messages/unread-count");
    return response.data.count;
  }

  // ── Notifications ─────────────────────────────────────────────────────────

  async getNotifications(page: number = 1): Promise<PaginatedNotificationsResponse> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paginator: any = (await this.get(`/api/notifications?page=${page}`)).data;
    return {
      data: paginator.data ?? [],
      meta: paginator.current_page != null
        ? { current_page: paginator.current_page, last_page: paginator.last_page, per_page: paginator.per_page, total: paginator.total }
        : null,
    };
  }

  async getUnreadCount(): Promise<number> {
    const response = await this.get("/api/notifications/unread-count");
    return response.data.count;
  }

  async markNotificationRead(id: string): Promise<void> {
    await this.patch(`/api/notifications/${id}/read`, {});
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.post("/api/notifications/read-all", {});
  }

  // ── Admin: Service moderation ──────────────────────────────────────────────
  async getAdminServices(status?: string): Promise<Service[]> {
    const q = status ? `?status=${status}` : "";
    const res = await this.get(`/api/admin/services${q}`);
    return res.data?.data ?? res.data ?? [];
  }
  async approveService(id: number): Promise<void> { await this.post(`/api/admin/services/${id}/approve`, {}); }
  async rejectService(id: number, reason?: string): Promise<void> { await this.post(`/api/admin/services/${id}/reject`, { reason }); }
  async disableService(id: number, reason?: string): Promise<void> { await this.post(`/api/admin/services/${id}/disable`, { reason }); }
  async enableService(id: number): Promise<void> { await this.post(`/api/admin/services/${id}/enable`, {}); }

  // ── Admin: Job post moderation ─────────────────────────────────────────────
  async getAdminJobPosts(status?: string): Promise<JobPost[]> {
    const q = status ? `?status=${status}` : "";
    const res = await this.get(`/api/admin/job-posts${q}`);
    return res.data?.data ?? res.data ?? [];
  }
  async approveJobPost(id: number): Promise<void> { await this.post(`/api/admin/job-posts/${id}/approve`, {}); }
  async rejectJobPost(id: number, reason?: string): Promise<void> { await this.post(`/api/admin/job-posts/${id}/reject`, { reason }); }

  // ── Order timeline ─────────────────────────────────────────────────────────
  async getOrderTimeline(orderId: number): Promise<{ data: OrderTimelineEvent[] }> {
    return this.get(`/api/orders/${orderId}/timeline`);
  }

  async getAdminUsers(params: {
    page?: number;
    search?: string;
    role?: string;
    kyc?: string;
  } = {}): Promise<{ data: AdminUser[]; meta: { current_page: number; last_page: number; per_page: number; total: number } }> {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.search) query.set("search", params.search);
    if (params.role) query.set("role", params.role);
    if (params.kyc) query.set("kyc", params.kyc);
    const res = await this.get(`/api/admin/users?${query}`);
    return res.data;
  }

  // Full detail for one user (admin User Detail page).
  async getAdminUser(id: number): Promise<AdminUserDetail> {
    const res = await this.get(`/api/admin/users/${id}`);
    return res.data;
  }

  // ── Admin Categories ──────────────────────────────────────────────────────
  async getAdminCategories(): Promise<AdminCategory[]> {
    const res = await this.get("/api/admin/categories");
    return res.data;
  }

  async createAdminCategory(name: string, parentId?: number | null): Promise<AdminCategory> {
    const res = await this.post("/api/admin/categories", {
      category_name: name,
      ...(parentId ? { parent_id: parentId } : {}),
    });
    return res.data;
  }

  // Assign/replace a service's category (admin) — used for reviewing requested categories
  // and re-filing live listings. Clears any pending request and notifies the owner.
  async setServiceCategory(serviceId: number, categoryId: number, reason?: string): Promise<void> {
    await this.post(`/api/admin/services/${serviceId}/category`, { category_id: categoryId, ...(reason ? { reason } : {}) });
  }

  async setJobPostCategory(jobPostId: number, categoryId: number, reason?: string): Promise<void> {
    await this.post(`/api/admin/job-posts/${jobPostId}/category`, { category_id: categoryId, ...(reason ? { reason } : {}) });
  }

  async updateAdminCategory(id: number, data: Partial<{ category_name: string; is_active: boolean }>): Promise<AdminCategory> {
    const res = await this.put(`/api/admin/categories/${id}`, data);
    return res.data;
  }

  async deleteAdminCategory(id: number): Promise<void> {
    await this.delete(`/api/admin/categories/${id}`);
  }

  // ── Admin Skills ──────────────────────────────────────────────────────────
  async getAdminSkills(): Promise<AdminSkill[]> {
    const res = await this.get("/api/admin/skills");
    return res.data;
  }

  async createAdminSkill(name: string): Promise<AdminSkill> {
    const res = await this.post("/api/admin/skills", { expertise_name: name });
    return res.data;
  }

  async deleteAdminSkill(id: number): Promise<void> {
    await this.delete(`/api/admin/skills/${id}`);
  }
}

export interface AdminDashboardStats {
  users: {
    total: number;
    new_today: number;
    new_freelancers_today: number;
    new_clients_today: number;
  };
  orders: {
    active: number;
    completed_today: number;
    total_completed: number;
  };
  gmv: {
    today: string;
    total: string;
  };
  withdrawals: {
    pending_count: number;
    pending_amount: string;
  };
  kyc: {
    pending_count: number;
  };
}

export interface AdminUser {
  id: number;
  name: string;
  email: string | null;
  telephone: string | null;
  avatar_url: string | null;
  is_client: boolean;
  is_freelancer: boolean;
  is_admin: boolean;
  is_verified_id: boolean;
  email_verified_at: string | null;
  kyc_status: string | null;
  freelancer_rating: string | null;
  completed_orders: number | null;
  created_at: string;
}

export interface AdminUserKycDocument {
  label: string;
  url: string;
  kind: "doc" | "selfie";
}

export interface AdminUserKyc {
  id: number;
  status: "pending" | "approved" | "rejected";
  document_type: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewer: string | null;
  admin_note: string | null;
  documents: AdminUserKycDocument[];
}

export interface AdminUserDetail {
  id: number;
  name: string;
  email: string | null;
  telephone: string | null;
  avatar_url: string | null;
  is_client: boolean;
  is_freelancer: boolean;
  is_verified_id: boolean;
  is_verified_phone: boolean;
  email_verified_at: string | null;
  created_at: string;
  last_active_at: string | null;
  location: string | null;
  freelancer_profile: {
    tagline: string | null;
    about: string | null;
    location: string | null;
    level: string;
    rating: number | null;
    rating_count: number;
    completed_orders: number;
    skills: string[];
    languages: { name: string; proficiency: string }[];
  } | null;
  client_profile: {
    company_name: string | null;
    industry: string | null;
    location: string | null;
    website: string | null;
    about: string | null;
  } | null;
  activity: {
    orders_placed?: number;
    orders_completed_as_client?: number;
    job_posts?: number;
    total_spent?: number;
    orders_completed?: number;
    services?: number;
    rating?: number | null;
    reviews?: number;
    total_earned?: number;
  };
  kyc: AdminUserKyc | null;
}

export interface AdminStats {
  gmv_today: string;
  total_gmv: string;
  pending_payouts_amount: string;
  pending_payouts_count: number;
  refunds_today_amount: string;
  refunds_today_count: number;
}

export interface AdminTransaction {
  id: number;
  wallet_id: number;
  order_id: number | null;
  type: string;
  amount: string;
  balance_after: string;
  status: "pending" | "completed" | "cancelled";
  description: string;
  admin_note: string | null;
  metadata: Record<string, string | undefined>;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface AdminTransactionsResponse {
  status: string;
  message: string;
  data: {
    data: AdminTransaction[];
    meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface AdminCategory {
  id: number;
  category_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminSkill {
  id: number;
  expertise_name: string;
  created_at: string;
  updated_at: string;
}

export const api = new ApiClient();