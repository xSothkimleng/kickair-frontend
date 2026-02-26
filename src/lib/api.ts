import {
  User,
  RegisterData,
  Language,
  Expertise,
  Industry,
  FreelancerProfile,
  ClientProfile,
  FreelancerProfileRequest,
  ClientProfileRequest,
  FreelancerProfilesListResponse,
} from "@/types/user";
import { ClientDashboardData, FreelancerDashboardData } from "@/types/dashboard";

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
}

export const api = new ApiClient();