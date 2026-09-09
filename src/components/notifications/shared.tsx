"use client";

import type { LucideIcon } from "lucide-react";
import {
  Award,
  Ban,
  Bell,
  CircleDollarSign,
  FileSignature,
  FileText,
  Flag,
  Handshake,
  Inbox,
  Lock,
  Package,
  Paperclip,
  RotateCcw,
  Scale,
  Star,
  Truck,
  UserCheck,
  XCircle,
} from "lucide-react";
import { css, cva } from "styled-system/css";
import { Notification, NotificationType } from "@/types/notification";

type ToneKey = "neutral" | "blue" | "success" | "pending" | "error" | "amber";

// Colour pairs per tone, as CSS values (Panda token variables) for consumers that
// need them outside a `css()` call. `TypeTile` below uses the matching recipe.
export const TONES: Record<ToneKey, { solid: string; tint: string }> = {
  neutral: { solid: "var(--colors-ink2)", tint: "rgba(0,0,0,0.05)" },
  blue: { solid: "var(--colors-accent)", tint: "rgba(0,113,227,0.1)" },
  success: { solid: "var(--colors-success)", tint: "var(--colors-success-tint)" },
  pending: { solid: "var(--colors-pending)", tint: "var(--colors-pending-tint)" },
  error: { solid: "var(--colors-error)", tint: "var(--colors-error-tint)" },
  amber: { solid: "#d97706", tint: "rgba(217,119,6,0.12)" },
};

interface TypeMeta {
  Icon: LucideIcon;
  tone: ToneKey;
  cta: string;
}

const FALLBACK: TypeMeta = { Icon: Bell, tone: "neutral", cta: "View" };

export const TYPE_META: Record<NotificationType, TypeMeta> = {
  // Orders & delivery
  order_placed: { Icon: Package, tone: "blue", cta: "View order" },
  order_accepted: { Icon: Package, tone: "blue", cta: "View order" },
  order_completed: { Icon: Package, tone: "success", cta: "View order" },
  work_delivered: { Icon: Truck, tone: "blue", cta: "Review delivery" },
  revision_requested: { Icon: RotateCcw, tone: "pending", cta: "View order" },
  // Money
  payment_released: { Icon: CircleDollarSign, tone: "success", cta: "View order" },
  // Cancellations / takedowns
  order_cancelled: { Icon: XCircle, tone: "error", cta: "View order" },
  service_disabled: { Icon: Ban, tone: "error", cta: "View listing" },
  // Proposals
  proposal_submitted: { Icon: FileText, tone: "blue", cta: "View proposals" },
  proposal_accepted: { Icon: FileText, tone: "success", cta: "View order" },
  proposal_rejected: { Icon: FileText, tone: "error", cta: "View proposals" },
  // Listing moderation
  service_approved: { Icon: Award, tone: "success", cta: "View listing" },
  job_approved: { Icon: Award, tone: "success", cta: "View job" },
  service_rejected: { Icon: Award, tone: "error", cta: "Edit listing" },
  job_rejected: { Icon: Award, tone: "error", cta: "Edit job" },
  // Disputes
  dispute_opened: { Icon: Scale, tone: "error", cta: "View order" },
  dispute_resolved: { Icon: Scale, tone: "success", cta: "View order" },
  evidence_submitted: { Icon: Paperclip, tone: "pending", cta: "View order" },
  // Reviews
  review_received: { Icon: Star, tone: "amber", cta: "View order" },
  // Admin queue
  admin_service_pending: { Icon: Inbox, tone: "pending", cta: "Open queue" },
  admin_job_pending: { Icon: Inbox, tone: "pending", cta: "Open queue" },
  admin_dispute_opened: { Icon: Scale, tone: "pending", cta: "Open dispute" },
  admin_kyc_pending: { Icon: UserCheck, tone: "pending", cta: "Open queue" },
  // Custom orders & milestones
  custom_order_requested: { Icon: FileSignature, tone: "blue", cta: "View request" },
  custom_order_offered: { Icon: Handshake, tone: "pending", cta: "Review offer" },
  custom_order_accepted: { Icon: Handshake, tone: "success", cta: "Open workspace" },
  custom_order_declined: { Icon: XCircle, tone: "error", cta: "View request" },
  custom_order_withdrawn: { Icon: XCircle, tone: "neutral", cta: "View request" },
  custom_order_ended: { Icon: Flag, tone: "neutral", cta: "View order" },
  milestone_funded: { Icon: Lock, tone: "pending", cta: "Open workspace" },
  milestone_submitted: { Icon: Truck, tone: "blue", cta: "Review delivery" },
  milestone_payment_released: { Icon: CircleDollarSign, tone: "success", cta: "Open workspace" },
  milestone_revision_requested: { Icon: RotateCcw, tone: "pending", cta: "Open workspace" },
  // Identity verification & payouts
  kyc_approved: { Icon: UserCheck, tone: "success", cta: "View" },
  kyc_rejected: { Icon: UserCheck, tone: "error", cta: "Resubmit" },
  withdrawal_approved: { Icon: CircleDollarSign, tone: "success", cta: "View finance" },
  withdrawal_rejected: { Icon: CircleDollarSign, tone: "error", cta: "View finance" },
};

export function typeMeta(type: NotificationType): TypeMeta {
  return TYPE_META[type] ?? FALLBACK;
}

const ORDER_TYPES: NotificationType[] = [
  "order_placed", "order_accepted", "order_completed", "order_cancelled",
  "work_delivered", "revision_requested", "payment_released",
  "dispute_opened", "dispute_resolved", "evidence_submitted", "review_received",
];

/** Where a notification should navigate, or null if it has no destination. */
export function getNotificationRoute(n: Notification): string | null {
  const { type, role, data } = n;
  const orderId = data?.order_id;

  if (ORDER_TYPES.includes(type) && orderId) {
    return role === "freelancer" ? `/dashboard/freelancer/orders/${orderId}` : `/dashboard/orders/${orderId}`;
  }
  if (type === "proposal_submitted") return `/dashboard/client?tab=service`;
  if (type === "proposal_accepted" && orderId) return `/dashboard/freelancer/orders/${orderId}`;
  if (type === "proposal_rejected") return `/dashboard/freelancer?tab=proposals`;
  if (type === "service_approved" || type === "service_rejected" || type === "service_disabled") return `/dashboard/freelancer?tab=services`;
  if (type === "job_approved" || type === "job_rejected") return `/dashboard/client?tab=service`;
  // Admin console queues
  if (type === "admin_service_pending") return `/admin/listings`;
  if (type === "admin_job_pending") return `/admin/listings?kind=job`;
  if (type === "admin_dispute_opened") return data?.dispute_id ? `/admin/disputes/${data.dispute_id}` : `/admin/disputes`;
  if (type === "admin_kyc_pending") return `/admin/verifications`;
  // Custom orders & milestones
  const customOrderId = data?.custom_order_id;
  // A new request / decline / withdrawal opens the custom order itself; without
  // an id fall back to the Orders tab, where requests & offers now live.
  if (type === "custom_order_requested" || type === "custom_order_withdrawn" || type === "custom_order_declined") {
    if (customOrderId) return `/dashboard/custom-orders/${customOrderId}`;
    return role === "client" ? `/dashboard/client?tab=orders` : `/dashboard/freelancer?tab=orders`;
  }
  if (customOrderId && (
    type === "custom_order_offered" || type === "custom_order_accepted" || type === "custom_order_ended" ||
    type === "milestone_funded" || type === "milestone_submitted" ||
    type === "milestone_payment_released" || type === "milestone_revision_requested"
  )) {
    return `/dashboard/custom-orders/${customOrderId}`;
  }
  // Identity verification & payouts
  if (type === "kyc_approved" || type === "kyc_rejected") return `/dashboard/kyc`;
  if (type === "withdrawal_approved" || type === "withdrawal_rejected") return `/dashboard/freelancer?tab=finance`;
  return null;
}

export function notifTimeAgo(dateStr: string): string {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Group key for the page: same calendar day = "Today", else "Earlier". */
export function notifGroup(dateStr: string): "Today" | "Earlier" {
  const d = new Date(dateStr);
  const now = new Date();
  return d.toDateString() === now.toDateString() ? "Today" : "Earlier";
}

const tile = cva({
  base: { display: "flex", alignItems: "center", justifyContent: "center", flex: "none" },
  variants: {
    tone: {
      neutral: { bg: "rgba(0,0,0,0.05)", color: "ink2" },
      blue: { bg: "rgba(0,113,227,0.1)", color: "accent" },
      success: { bg: "successTint", color: "success" },
      pending: { bg: "pendingTint", color: "pending" },
      error: { bg: "errorTint", color: "error" },
      amber: { bg: "rgba(217,119,6,0.12)", color: "#d97706" },
    },
  },
});

export function TypeTile({ type, size = 40 }: { type: NotificationType; size?: number }) {
  const meta = typeMeta(type);
  const Icon = meta.Icon;
  // `size` is a prop, so the geometry stays an inline style; colours come from the recipe.
  return (
    <div className={tile({ tone: meta.tone })} style={{ width: size, height: size, borderRadius: size >= 40 ? 11 : 9 }}>
      <Icon size={size * 0.5} />
    </div>
  );
}

const roleChipCss = css({ display: "inline-flex", alignItems: "center", gap: "5px", h: "20px", px: "8px", borderRadius: "999px", bg: "rgba(0,0,0,0.05)", color: "ink2", fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.01em", whiteSpace: "nowrap", flex: "none" });
const roleDot = cva({
  base: { w: "5px", h: "5px", borderRadius: "50%" },
  variants: { role: { freelancer: { bg: "accent" }, client: { bg: "ink3" }, admin: { bg: "pending" } } },
});

export function RoleChip({ role }: { role: Notification["role"] }) {
  if (!role) return null;
  return (
    <span className={roleChipCss}>
      <span className={roleDot({ role })} />
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}

const unreadDotCss = css({ borderRadius: "50%", bg: "accent", flex: "none" });

export function UnreadDot({ size = 8 }: { size?: number }) {
  return <span className={unreadDotCss} style={{ width: size, height: size }} />;
}
