"use client";

import { useRouter } from "next/navigation";
import {
  MapPin as MapPinIcon,
  Calendar as CalendarIcon,
  Briefcase as BriefcaseIcon,
  MessageCircle as MessageCircleIcon,
  Wallet as WalletIcon,
  DollarSign as DollarSignIcon,
  TrendingUp as ArrowUpRightIcon,
  Shield as ShieldIcon,
} from "lucide-react";
import { css, cx } from "styled-system/css";
import { Avatar, Spinner } from "@/components/ds";
import { ProfileAvatar } from "@/components/profile/profileKit";
import { useClientDashboard } from "@/hooks/useClientDashboard";
import { DashboardNotification, DashboardConversation } from "@/types/dashboard";
import { Notification } from "@/types/notification";
import { getNotificationRoute } from "@/components/notifications/shared";
import { api } from "@/lib/api";
import type { Tab } from "./page";

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatMemberSince = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" });

const timeAgo = (iso: string) => {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const formatCurrency = (value: string) =>
  `$${parseFloat(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const getStatusLabel = (status: string) => {
  switch (status) {
    case "pending": return "Awaiting Acceptance";
    case "active": return "In Progress";
    case "completed": return "Completed";
    case "cancelled": return "Cancelled";
    default: return status;
  }
};

const getStatusColors = (status: string) => {
  switch (status) {
    case "pending": return { bg: "rgba(234, 88, 12, 0.1)", color: "#b45309" };
    case "active": return { bg: "rgba(37, 99, 235, 0.1)", color: "#1e40af" };
    case "completed": return { bg: "rgba(22, 163, 74, 0.1)", color: "#15803d" };
    case "cancelled": return { bg: "rgba(0,0,0,0.06)", color: "ink3" };
    default: return { bg: "rgba(0,0,0,0.06)", color: "ink3" };
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case "deposit": return "#16a34a";
    case "payment": return "#9333ea";
    default: return "#000";
  }
};

const getNotificationColor = (type: DashboardNotification["type"]) => {
  switch (type) {
    case "proposal_submitted": return "#2563eb";
    case "proposal_accepted": return "#16a34a";
    case "proposal_rejected": return "#dc2626";
    case "order_placed": return "#9333ea";
    case "order_completed": return "#16a34a";
    case "order_cancelled": return "#6b7280";
    case "review_received": return "#f59e0b";
    default: return "#6b7280";
  }
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const centerBlock = css({ display: "flex", justifyContent: "center", alignItems: "center", minH: "400px" });
const errorText = css({ textStyle: "lead", color: "#d32f2f" });

const card = css({
  bg: "surface", color: "ink", borderRadius: "12px",
  borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(0,0,0,0.08)",
});
const cardBody24 = css({ p: "24px" });
// Card content default: 16px, with 24px bottom padding on the last child.
const cardBody16 = css({ p: "16px", pb: "24px" });
const profileCard = css({ mb: "32px" });
const stack24 = css({ display: "flex", flexDirection: "column", gap: "24px" });
const stack16 = css({ display: "flex", flexDirection: "column", gap: "16px" });
const stack12 = css({ display: "flex", flexDirection: "column", gap: "12px" });
const stack8 = css({ display: "flex", flexDirection: "column", gap: "8px" });

const identityRow = css({ display: "flex", alignItems: "center", gap: "16px" });
const minW0 = css({ minW: 0 });
const nameRow = css({ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" });
const nameCss = css({ textStyle: "title", fontWeight: 600, color: "ink" });
const verifiedChip = css({
  display: "inline-flex", alignItems: "center", gap: "4px", h: "20px", pl: "6px", pr: "8px",
  borderRadius: "pill", bg: "rgba(37, 99, 235, 0.1)", color: "#2563eb",
  textStyle: "micro", fontWeight: 500, whiteSpace: "nowrap",
  "& svg": { display: "block" },
});
const companyCss = css({ textStyle: "body", color: "ink2" });
const metaRow = css({ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", mt: "8px" });
const metaItem = css({ display: "flex", alignItems: "center", gap: "4px", color: "ink2" });
const metaText = css({ textStyle: "meta", color: "ink2" });

const statsInner = css({
  display: "grid", gap: "16px", gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  pt: "24px", borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "rgba(0,0,0,0.08)",
});
const statValue = css({ textStyle: "heading", fontWeight: 600, color: "ink" });
const statLabel = css({ textStyle: "meta", color: "ink2" });

const statsGrid = css({
  display: "grid", gap: "16px", mb: "32px",
  gridTemplateColumns: { base: "repeat(1, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" },
});
const statCard = css({
  cursor: "pointer", transition: "all 0.2s",
  _hover: { borderColor: "rgba(0,0,0,0.2)", "& .arrow-icon": { opacity: 1 } },
});
const statCardRelative = css({ position: "relative" });
const statTopRow = css({ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "16px" });
const arrowIcon = css({ color: "ink3", opacity: 0, transition: "opacity 0.2s", display: "block" });
const bigValue = css({ textStyle: "stat", fontWeight: 600, color: "ink" });
const unreadDot = css({ position: "absolute", top: "16px", right: "16px", w: "8px", h: "8px", bg: "#9333ea", borderRadius: "50%" });

// The old grid was flex + gap with calc() widths — reproduced exactly so the
// 8/4 split keeps its 760/368 columns inside the 1152px container.
const mainGrid = css({ display: "flex", flexWrap: "wrap", gap: "24px" });
const mainCol = css({ w: { base: "100%", lg: "calc(66.6667% - 8px)" }, minW: 0 });
const sideCol = css({ w: { base: "100%", lg: "calc(33.3333% - 16px)" }, minW: 0 });

const sectionHead = css({ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "24px" });
const sectionHeadTight = css({ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "16px" });
const sectionTitle = css({ textStyle: "title", fontWeight: 600, color: "ink" });

// Text button metrics (6px/8px padding, 64px min width, 4px radius).
const textBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  minW: "64px", px: "8px", py: "6px", border: "none", borderRadius: "4px", bg: "transparent",
  textStyle: "meta", fontWeight: 500, color: "ink2", cursor: "pointer",
  _hover: { color: "black", bg: "rgba(0,0,0,0.04)" },
});
const linkBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  minW: "auto", p: 0, border: "none", borderRadius: "4px", bg: "transparent",
  textStyle: "micro", fontWeight: 500, color: "#0071e3", cursor: "pointer",
  _hover: { textDecoration: "underline", bg: "transparent" },
});
const wideBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  w: "100%", boxSizing: "border-box", mt: "12px", px: "8px", py: "6px",
  border: "none", borderRadius: "4px", bg: "transparent",
  textStyle: "micro", fontWeight: 500, color: "ink2", cursor: "pointer",
  _hover: { color: "black", bg: "rgba(0,0,0,0.04)" },
});

const emptyText = css({ textStyle: "body", color: "ink2", textAlign: "center", py: "24px" });

const orderRow = css({
  p: "16px", borderRadius: "8px", bg: "surface",
  borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(0,0,0,0.08)",
  transition: "all 0.2s", _hover: { bg: "rgba(0,0,0,0.02)" },
});
const orderRowInner = css({ display: "flex", justifyContent: "space-between", alignItems: "center" });
const orderTitle = css({ textStyle: "body", fontWeight: 500, color: "ink" });
const orderSub = css({ display: "block", textStyle: "meta", color: "ink2", mb: "4px" });
const chipRow = css({ display: "flex", alignItems: "center", gap: "8px" });
const smallChip = css({
  display: "inline-flex", alignItems: "center", h: "20px", px: "8px", borderRadius: "pill",
  textStyle: "micro", fontWeight: 400, whiteSpace: "nowrap",
});
const dueText = css({ textStyle: "meta", color: "ink3" });
const amountText = css({ textStyle: "body", fontWeight: 600, color: "ink" });

const activityRow = css({
  display: "flex", gap: "12px", p: "12px", borderRadius: "8px",
  transition: "all 0.2s", _hover: { bg: "rgba(0,0,0,0.02)" },
});
const activityDot = css({ w: "8px", h: "8px", borderRadius: "50%", mt: "8px", flexShrink: 0 });
const activityTitle = css({ textStyle: "body", fontWeight: 500, color: "ink" });
const activityDesc = css({ display: "block", textStyle: "meta", color: "ink2", mb: "4px" });
const activityTime = css({ textStyle: "meta", color: "ink3" });

const convBtn = css({
  display: "flex", alignItems: "center", w: "100%", boxSizing: "border-box",
  p: "12px", borderRadius: "8px", border: "none", bg: "transparent",
  textAlign: "left", justifyContent: "flex-start", color: "inherit",
  textStyle: "body", fontWeight: 500, cursor: "pointer",
  _hover: { bg: "rgba(0,0,0,0.04)" },
});
const convInner = css({ display: "flex", gap: "12px", w: "100%" });
const convHead = css({ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "4px" });
const convName = css({ flex: 1, textStyle: "body", fontWeight: 600, color: "ink", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });
const convBadge = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  minW: "18px", h: "18px", px: "5px", borderRadius: "pill",
  bg: "#9333ea", color: "white", textStyle: "micro", fontWeight: 500, flexShrink: 0,
});
const convOrder = css({ display: "block", textStyle: "meta", color: "ink2", mb: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });
const convFoot = css({ display: "flex", justifyContent: "space-between", alignItems: "center" });
const convPreview = css({ flex: 1, textStyle: "meta", color: "ink2", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });
const convTime = css({ ml: "8px", flexShrink: 0, textStyle: "meta", color: "ink3" });

const newChip = css({
  display: "inline-flex", alignItems: "center", h: "20px", px: "8px", borderRadius: "pill",
  bg: "#ea580c", color: "white", textStyle: "micro", fontWeight: 500, whiteSpace: "nowrap",
});
const notifRow = css({
  p: "12px", borderRadius: "8px", cursor: "pointer", transition: "background 0.15s",
  bg: "rgba(0,0,0,0.02)", borderWidth: "1px", borderStyle: "solid", borderColor: "transparent",
  _hover: { bg: "rgba(0,0,0,0.05)" },
  "&[data-unread]": { bg: "rgba(234, 88, 12, 0.05)", borderColor: "rgba(234, 88, 12, 0.2)" },
});
const notifInner = css({ display: "flex", gap: "8px" });
const notifDot = css({ w: "8px", h: "8px", borderRadius: "50%", mt: "6px", flexShrink: 0 });
const notifTitle = css({ display: "block", textStyle: "meta", fontWeight: 600, color: "ink", mb: "2px" });
const notifBody = css({ display: "block", textStyle: "meta", color: "ink2", mb: "4px" });
const notifTime = css({ textStyle: "meta", color: "ink3" });

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  onTabChange: (tab: Tab) => void;
}

export default function DashboardContent({ onTabChange }: Props) {
  const router = useRouter();
  const { data, loading, error } = useClientDashboard();

  const openNotification = (n: DashboardNotification) => {
    if (n.readAt === null) api.markNotificationRead(n.id).catch(() => {});
    const route = getNotificationRoute({ ...n, role: "client" } as unknown as Notification);
    if (route) router.push(route);
  };

  if (loading) {
    return (
      <div className={centerBlock}>
        <Spinner size={40} style={{ color: "#1976d2" }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={centerBlock}>
        <p className={errorText}>{error ?? "Failed to load dashboard."}</p>
      </div>
    );
  }

  const { profile, stats, activeOrders, recentActivity, recentConversations, recentNotifications } = data;

  return (
    <div>
      {/* Profile Overview Card */}
      <div className={cx(card, profileCard)}>
        <div className={cardBody24}>
          <div className={stack24}>
            {/* No public client profile route exists, so there is no "View Public Profile" button here. */}
            <div className={identityRow}>
              <ProfileAvatar name={profile.name} src={profile.avatarUrl} size={80} />
              <div className={minW0}>
                <div className={nameRow}>
                  <h6 className={nameCss}>{profile.name}</h6>
                  {profile.verified && (
                    <span className={verifiedChip}>
                      <ShieldIcon size={12} />
                      Verified
                    </span>
                  )}
                </div>
                {profile.company && <p className={companyCss}>{profile.company}</p>}
                <div className={metaRow}>
                  {profile.location && (
                    <div className={metaItem}>
                      <MapPinIcon size={12} />
                      <span className={metaText}>{profile.location}</span>
                    </div>
                  )}
                  <div className={metaItem}>
                    <CalendarIcon size={12} />
                    <span className={metaText}>Member since {formatMemberSince(profile.memberSince)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Stats */}
            <div className={statsInner}>
              <div>
                <p className={statValue}>{formatCurrency(stats.totalSpent)}</p>
                <span className={statLabel}>Total Spent</span>
              </div>
              <div>
                <p className={statValue}>{stats.activeProjectsCount}</p>
                <span className={statLabel}>Active Projects</span>
              </div>
              <div>
                <p className={statValue}>{stats.completedProjectsCount}</p>
                <span className={statLabel}>Completed Projects</span>
              </div>
              <div>
                <p className={statValue}>{profile.profileCompleteness}%</p>
                <span className={statLabel}>Profile Completeness</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className={statsGrid}>
        <div className={cx(card, statCard)}>
          <div className={cardBody16}>
            <div className={statTopRow}>
              <BriefcaseIcon size={20} color="#2563eb" />
              <ArrowUpRightIcon size={16} className={cx("arrow-icon", arrowIcon)} />
            </div>
            <p className={bigValue}>{stats.activeProjectsCount}</p>
            <span className={statLabel}>Active Orders</span>
          </div>
        </div>

        <div className={cx(card, statCard, statCardRelative)} onClick={() => router.push("/dashboard/client/messages")}>
          <div className={cardBody16}>
            <div className={statTopRow}>
              <MessageCircleIcon size={20} color="#9333ea" />
              <ArrowUpRightIcon size={16} className={cx("arrow-icon", arrowIcon)} />
            </div>
            <p className={bigValue}>{stats.unreadMessagesCount}</p>
            <span className={statLabel}>Unread Messages</span>
            {stats.unreadMessagesCount > 0 && <span className={unreadDot} />}
          </div>
        </div>

        <div className={cx(card, statCard)}>
          <div className={cardBody16}>
            <div className={statTopRow}>
              <WalletIcon size={20} color="#2563eb" />
              <ArrowUpRightIcon size={16} className={cx("arrow-icon", arrowIcon)} />
            </div>
            <p className={bigValue}>{formatCurrency(stats.availableBalance)}</p>
            <span className={statLabel}>Available Balance</span>
          </div>
        </div>

        <div className={cx(card, statCard)}>
          <div className={cardBody16}>
            <div className={statTopRow}>
              <DollarSignIcon size={20} color="#16a34a" />
              <ArrowUpRightIcon size={16} className={cx("arrow-icon", arrowIcon)} />
            </div>
            <p className={bigValue}>{formatCurrency(stats.inEscrow)}</p>
            <span className={statLabel}>In Escrow</span>
          </div>
        </div>
      </div>

      <div className={mainGrid}>
        {/* Main Column */}
        <div className={mainCol}>
          <div className={stack24}>
            {/* Active Orders */}
            <div className={card}>
              <div className={cardBody24}>
                <div className={sectionHead}>
                  <h6 className={sectionTitle}>Active Orders</h6>
                  <button type="button" className={textBtn}>View All</button>
                </div>

                <div className={stack12}>
                  {activeOrders.length === 0 ? (
                    <p className={emptyText}>No active orders</p>
                  ) : (
                    activeOrders.map(order => {
                      const statusColors = getStatusColors(order.status);
                      return (
                        <div key={order.id} className={orderRow}>
                          <div className={orderRowInner}>
                            <div className={css({ flex: 1 })}>
                              <p className={orderTitle}>{order.title}</p>
                              <span className={orderSub}>by {order.freelancerName}</span>
                              <div className={chipRow}>
                                <span className={smallChip} style={{ background: statusColors.bg, color: statusColors.color }}>
                                  {getStatusLabel(order.status)}
                                </span>
                                <span
                                  className={smallChip}
                                  style={{
                                    background: order.type === "job" ? "rgba(99,102,241,0.1)" : "rgba(16,185,129,0.1)",
                                    color: order.type === "job" ? "#6366f1" : "#059669",
                                  }}>
                                  {order.type === "job" ? "Job" : "Service"}
                                </span>
                                {order.dueDate ? (
                                  <span className={dueText}>
                                    Due: {new Date(order.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                  </span>
                                ) : (
                                  <span className={dueText}>Due: TBD</span>
                                )}
                              </div>
                            </div>
                            <p className={amountText}>${order.amount}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className={card}>
              <div className={cardBody24}>
                {/* The `mb` on this <h6> never rendered (globals.css resets h* margins) — dropped. */}
                <h6 className={sectionTitle}>Recent Activity</h6>

                <div className={stack16}>
                  {recentActivity.length === 0 ? (
                    <p className={emptyText}>No recent activity</p>
                  ) : (
                    recentActivity.map(activity => (
                      <div key={activity.id} className={activityRow}>
                        <span className={activityDot} style={{ background: getActivityColor(activity.type) }} />
                        <div className={css({ flex: 1 })}>
                          <p className={activityTitle}>{activity.title}</p>
                          {activity.description && <span className={activityDesc}>{activity.description}</span>}
                          <span className={activityTime}>{timeAgo(activity.createdAt)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className={sideCol}>
          <div className={stack24}>
            {/* Recent Messages */}
            <div className={card}>
              <div className={cardBody24}>
                <div className={sectionHeadTight}>
                  <h6 className={sectionTitle}>Recent Messages</h6>
                  <button type="button" className={linkBtn} onClick={() => router.push("/dashboard/client/messages")}>
                    View All
                  </button>
                </div>

                <div className={stack12}>
                  {recentConversations.length === 0 ? (
                    <p className={emptyText}>No messages yet</p>
                  ) : (
                    recentConversations.map((conv: DashboardConversation) => (
                      <button
                        key={conv.conversationId}
                        type="button"
                        className={convBtn}
                        onClick={() => router.push("/dashboard/client/messages")}>
                        <span className={convInner}>
                          <Avatar name={conv.otherParticipant.name} src={conv.otherParticipant.avatarUrl ?? undefined} px={40} />
                          <span className={css({ flex: 1, minW: 0 })}>
                            <span className={convHead}>
                              <span className={convName}>{conv.otherParticipant.name}</span>
                              {conv.unreadCount > 0 && <span className={convBadge}>{conv.unreadCount}</span>}
                            </span>
                            <span className={convOrder}>{conv.orderTitle}</span>
                            {conv.lastMessage && (
                              <span className={convFoot}>
                                <span className={convPreview}>{conv.lastMessage.body}</span>
                                <span className={convTime}>{timeAgo(conv.lastMessage.sentAt)}</span>
                              </span>
                            )}
                          </span>
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className={card}>
              <div className={cardBody24}>
                <div className={sectionHeadTight}>
                  <div className={css({ display: "flex", alignItems: "center", gap: "8px" })}>
                    <h6 className={sectionTitle}>Notifications</h6>
                    {stats.unreadNotificationsCount > 0 && (
                      <span className={newChip}>{stats.unreadNotificationsCount} new</span>
                    )}
                  </div>
                  <button type="button" className={linkBtn} onClick={() => router.push("/notifications")}>
                    View All
                  </button>
                </div>

                <div className={stack8}>
                  {recentNotifications.length === 0 ? (
                    <p className={emptyText}>No notifications</p>
                  ) : (
                    recentNotifications.map((notification: DashboardNotification) => (
                      <div
                        key={notification.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => openNotification(notification)}
                        className={notifRow}
                        data-unread={notification.readAt === null ? "" : undefined}>
                        <div className={notifInner}>
                          <span className={notifDot} style={{ background: getNotificationColor(notification.type) }} />
                          <div className={css({ flex: 1, minW: 0 })}>
                            <span className={notifTitle}>{notification.title}</span>
                            <span className={notifBody}>{notification.body}</span>
                            <span className={notifTime}>{timeAgo(notification.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <button type="button" className={wideBtn} onClick={() => router.push("/notifications")}>
                  View All Notifications
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
