"use client";

import type { SvgIconComponent } from "@mui/icons-material";
import {
  Inventory2Outlined,
  LocalShippingOutlined,
  ReplayOutlined,
  PaidOutlined,
  CancelOutlined,
  BlockOutlined,
  DescriptionOutlined,
  WorkspacePremiumOutlined,
  BalanceOutlined,
  AttachFileOutlined,
  StarBorderOutlined,
  MoveToInboxOutlined,
  HowToRegOutlined,
  NotificationsNoneOutlined,
  HandshakeOutlined,
  RequestQuoteOutlined,
  FlagOutlined,
  LockOutlined,
} from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import { tokens } from "@/theme";
import { Notification, NotificationType } from "@/types/notification";

type ToneKey = "neutral" | "blue" | "success" | "pending" | "error" | "amber";

export const TONES: Record<ToneKey, { solid: string; tint: string }> = {
  neutral: { solid: tokens.text2, tint: "rgba(0,0,0,0.05)" },
  blue: { solid: tokens.accent, tint: `rgba(${tokens.accentRgb},0.1)` },
  success: { solid: tokens.success, tint: tokens.successTint },
  pending: { solid: tokens.pending, tint: tokens.pendingTint },
  error: { solid: tokens.error, tint: tokens.errorTint },
  amber: { solid: "#d97706", tint: "rgba(217,119,6,0.12)" },
};

interface TypeMeta {
  Icon: SvgIconComponent;
  tone: ToneKey;
  cta: string;
}

const FALLBACK: TypeMeta = { Icon: NotificationsNoneOutlined, tone: "neutral", cta: "View" };

export const TYPE_META: Record<NotificationType, TypeMeta> = {
  // Orders & delivery
  order_placed: { Icon: Inventory2Outlined, tone: "blue", cta: "View order" },
  order_accepted: { Icon: Inventory2Outlined, tone: "blue", cta: "View order" },
  order_completed: { Icon: Inventory2Outlined, tone: "success", cta: "View order" },
  work_delivered: { Icon: LocalShippingOutlined, tone: "blue", cta: "Review delivery" },
  revision_requested: { Icon: ReplayOutlined, tone: "pending", cta: "View order" },
  // Money
  payment_released: { Icon: PaidOutlined, tone: "success", cta: "View order" },
  // Cancellations / takedowns
  order_cancelled: { Icon: CancelOutlined, tone: "error", cta: "View order" },
  service_disabled: { Icon: BlockOutlined, tone: "error", cta: "View listing" },
  // Proposals
  proposal_submitted: { Icon: DescriptionOutlined, tone: "blue", cta: "View proposals" },
  proposal_accepted: { Icon: DescriptionOutlined, tone: "success", cta: "View order" },
  proposal_rejected: { Icon: DescriptionOutlined, tone: "error", cta: "View proposals" },
  // Listing moderation
  service_approved: { Icon: WorkspacePremiumOutlined, tone: "success", cta: "View listing" },
  job_approved: { Icon: WorkspacePremiumOutlined, tone: "success", cta: "View job" },
  service_rejected: { Icon: WorkspacePremiumOutlined, tone: "error", cta: "Edit listing" },
  job_rejected: { Icon: WorkspacePremiumOutlined, tone: "error", cta: "Edit job" },
  // Disputes
  dispute_opened: { Icon: BalanceOutlined, tone: "error", cta: "View order" },
  dispute_resolved: { Icon: BalanceOutlined, tone: "success", cta: "View order" },
  evidence_submitted: { Icon: AttachFileOutlined, tone: "pending", cta: "View order" },
  // Reviews
  review_received: { Icon: StarBorderOutlined, tone: "amber", cta: "View order" },
  // Admin queue
  admin_service_pending: { Icon: MoveToInboxOutlined, tone: "pending", cta: "Open queue" },
  admin_job_pending: { Icon: MoveToInboxOutlined, tone: "pending", cta: "Open queue" },
  admin_dispute_opened: { Icon: BalanceOutlined, tone: "pending", cta: "Open dispute" },
  admin_kyc_pending: { Icon: HowToRegOutlined, tone: "pending", cta: "Open queue" },
  // Custom orders & milestones
  custom_order_requested: { Icon: RequestQuoteOutlined, tone: "blue", cta: "View request" },
  custom_order_offered: { Icon: HandshakeOutlined, tone: "pending", cta: "Review offer" },
  custom_order_accepted: { Icon: HandshakeOutlined, tone: "success", cta: "Open workspace" },
  custom_order_declined: { Icon: CancelOutlined, tone: "error", cta: "View request" },
  custom_order_ended: { Icon: FlagOutlined, tone: "neutral", cta: "View order" },
  milestone_funded: { Icon: LockOutlined, tone: "pending", cta: "Open workspace" },
  milestone_submitted: { Icon: LocalShippingOutlined, tone: "blue", cta: "Review milestone" },
  milestone_payment_released: { Icon: PaidOutlined, tone: "success", cta: "Open workspace" },
  milestone_revision_requested: { Icon: ReplayOutlined, tone: "pending", cta: "Open workspace" },
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
  // Admin queue
  if (type === "admin_service_pending" || type === "admin_job_pending" || type === "admin_dispute_opened") return `/admin/marketplace`;
  if (type === "admin_kyc_pending") return `/admin/trust`;
  // Custom orders & milestones
  const customOrderId = data?.custom_order_id;
  if (type === "custom_order_requested") return `/dashboard/freelancer?tab=custom-requests`;
  if (type === "custom_order_declined") return `/dashboard/client?tab=custom-orders`;
  if (customOrderId && (
    type === "custom_order_offered" || type === "custom_order_accepted" || type === "custom_order_ended" ||
    type === "milestone_funded" || type === "milestone_submitted" ||
    type === "milestone_payment_released" || type === "milestone_revision_requested"
  )) {
    return `/dashboard/custom-orders/${customOrderId}`;
  }
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

export function TypeTile({ type, size = 40 }: { type: NotificationType; size?: number }) {
  const meta = typeMeta(type);
  const tone = TONES[meta.tone];
  const Icon = meta.Icon;
  return (
    <Box sx={{ width: size, height: size, borderRadius: size >= 40 ? "11px" : "9px", bgcolor: tone.tint, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
      <Icon sx={{ fontSize: size * 0.5, color: tone.solid }} />
    </Box>
  );
}

export function RoleChip({ role }: { role: Notification["role"] }) {
  if (!role) return null;
  const dot = role === "freelancer" ? tokens.accent : role === "client" ? tokens.text3 : tokens.pending;
  return (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.625, height: 20, px: 1, borderRadius: "999px", bgcolor: "rgba(0,0,0,0.05)", color: tokens.text2, fontSize: 10.5, fontWeight: 600, letterSpacing: "0.01em", whiteSpace: "nowrap", flex: "none" }}>
      <Box component="span" sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: dot }} />
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </Box>
  );
}

export function UnreadDot({ size = 8 }: { size?: number }) {
  return <Box component="span" sx={{ width: size, height: size, borderRadius: "50%", bgcolor: tokens.accent, flex: "none" }} />;
}
