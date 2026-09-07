import type { Tone } from "./ui";
import type { DisputeOutcome } from "@/types/order";

/** KYC state as the People list shows it (derived from AdminUser.kyc_status). */
export type KycState = "none" | "pending" | "approved" | "rejected";
export type AccountState = "active" | "suspended" | "banned";
/** Listing moderation state, unified across services and job posts. */
export type ListingStatus = "pending" | "live" | "rejected" | "disabled";

export const kycLabel: Record<KycState, { tone: Tone; label: string }> = {
  none: { tone: "neutral", label: "Not verified" },
  pending: { tone: "amber", label: "Awaiting review" },
  approved: { tone: "green", label: "Verified" },
  rejected: { tone: "red", label: "Rejected" },
};
export function kycState(status: string | null | undefined): KycState {
  return status === "pending" || status === "approved" || status === "rejected" ? status : "none";
}

export const accountLabel: Record<AccountState, { tone: Tone; label: string }> = {
  active: { tone: "green", label: "Active" },
  suspended: { tone: "amber", label: "Suspended" },
  banned: { tone: "red", label: "Banned" },
};
export function accountState(u: { suspended_at: string | null; banned_at: string | null }): AccountState {
  if (u.banned_at) return "banned";
  if (u.suspended_at) return "suspended";
  return "active";
}

export const listingLabel: Record<ListingStatus, { tone: Tone; label: string }> = {
  pending: { tone: "amber", label: "Needs review" },
  live: { tone: "green", label: "Live" },
  rejected: { tone: "red", label: "Rejected" },
  disabled: { tone: "neutral", label: "Disabled" },
};

export const outcomeLabel: Record<DisputeOutcome, { tone: Tone; label: string; long: string }> = {
  full_client: { tone: "red", label: "Refunded", long: "Refunded to the client in full" },
  full_freelancer: { tone: "green", label: "Paid out", long: "Paid to the freelancer in full" },
  partial: { tone: "purple", label: "Split", long: "Amount split between both parties" },
  continue: { tone: "blue", label: "Continued", long: "Continued with admin feedback" },
};

export const payoutLabel = {
  pending: { tone: "amber" as Tone, label: "Awaiting approval" },
  completed: { tone: "green" as Tone, label: "Paid" },
  cancelled: { tone: "neutral" as Tone, label: "Rejected" },
};

/** Every transaction type the ledger can hold, with a reader-friendly label. */
export const txnLabel: Record<string, { tone: Tone; label: string }> = {
  payment: { tone: "blue", label: "Payment" },
  deposit: { tone: "blue", label: "Deposit" },
  earning: { tone: "green", label: "Earning" },
  release: { tone: "green", label: "Release" },
  clearance: { tone: "green", label: "Clearance" },
  refund: { tone: "purple", label: "Refund" },
  dispute_release: { tone: "purple", label: "Dispute release" },
  dispute_refund: { tone: "purple", label: "Dispute refund" },
  withdrawal: { tone: "amber", label: "Payout" },
};
export function txnMeta(type: string): { tone: Tone; label: string } {
  return txnLabel[type] ?? { tone: "neutral", label: type.replace(/_/g, " ") };
}

export const docTypeLabel: Record<string, string> = {
  national_id: "National ID",
  passport: "Passport",
  drivers_license: "Driver's licence",
};

export function roleLabels(u: { is_client: boolean; is_freelancer: boolean }): string[] {
  const out: string[] = [];
  if (u.is_freelancer) out.push("Freelancer");
  if (u.is_client) out.push("Client");
  return out;
}
