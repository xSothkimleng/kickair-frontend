export interface ClientDashboardProfile {
  id: number;
  name: string;
  avatarUrl: string | null;
  company: string | null;
  location: string | null;
  memberSince: string; // ISO 8601
  verified: boolean;
  profileCompleteness: number; // 0–100
}

export interface ClientDashboardStats {
  totalSpent: string; // decimal string e.g. "250.00"
  availableBalance: string;
  inEscrow: string;
  activeProjectsCount: number;
  completedProjectsCount: number;
  unreadMessagesCount: number;
}

export interface ClientDashboardOrder {
  id: number;
  service: string;
  freelancerId: number;
  freelancerName: string;
  status: "pending" | "active" | "completed" | "cancelled";
  dueDate: string | null; // ISO 8601 or null
  amount: string; // decimal string e.g. "100.00"
}

export interface ClientDashboardActivity {
  id: number;
  type: "deposit" | "payment";
  title: string;
  description: string | null;
  createdAt: string; // ISO 8601
}

export interface ClientDashboardData {
  profile: ClientDashboardProfile;
  stats: ClientDashboardStats;
  activeOrders: ClientDashboardOrder[];
  recentActivity: ClientDashboardActivity[];
}

export interface ClientDashboardResponse {
  status: string;
  message: string;
  data: ClientDashboardData;
}

// ─── Freelancer Dashboard ─────────────────────────────────────────────────────

export interface FreelancerDashboardProfile {
  id: number;
  name: string;
  avatarUrl: string | null;
  tagline: string | null;
  location: string | null;
  memberSince: string; // ISO 8601
  verified: boolean;
  profileCompleteness: number; // 0–100
  level: string | null; // "Bronze" | "Silver" | "Gold" | "Platinum" | null
  rating: string | null; // decimal string e.g. "4.90", null until reviews exist
  totalReviews: number;
  responseRate: number | null; // 0–100, null until tracking exists
  profileViews: number;
}

export interface FreelancerDashboardStats {
  totalEarnings: string; // decimal string
  availableBalance: string;
  inEscrow: string;
  activeProjectsCount: number;
  completedProjectsCount: number;
  unreadMessagesCount: number;
}

export interface FreelancerDashboardOrder {
  id: number;
  service: string;
  clientId: number;
  clientName: string;
  status: "pending" | "active" | "completed" | "cancelled";
  dueDate: string | null;
  amount: string; // decimal string
}

export interface FreelancerDashboardService {
  id: number;
  title: string;
  ordersCount: number;
  revenue: string; // decimal string, completed orders only
}

export interface FreelancerDashboardData {
  profile: FreelancerDashboardProfile;
  stats: FreelancerDashboardStats;
  recentOrders: FreelancerDashboardOrder[];
  activeServices: FreelancerDashboardService[];
}

export interface FreelancerDashboardResponse {
  status: string;
  message: string;
  data: FreelancerDashboardData;
}
