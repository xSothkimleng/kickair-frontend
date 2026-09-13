"use client";

import { useRouter } from "next/navigation";
import { DollarSign, MessageCircle, Eye, ArrowRight } from "lucide-react";
import { css, cx } from "styled-system/css";
import { Avatar, Spinner } from "@/components/ds";
import { ProfileAvatar, LevelBadge, Stars5 } from "@/components/profile/profileKit";
import { useAuth } from "@/components/context/AuthContext";
import { useFreelancerDashboard } from "@/hooks/useFreelancerDashboard";
import { DashboardNotification, DashboardConversation } from "@/types/dashboard";
import { Notification } from "@/types/notification";
import { getNotificationRoute } from "@/components/notifications/shared";
import { invalidateForNotification } from "@/lib/realtimeInvalidation";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Tab } from "./page";

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatCurrency = (value: string) =>
  `$${parseFloat(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatMemberSince = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" });

const timeAgo = (iso: string) => {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

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
    case "active": return { bg: "rgba(37, 99, 235, 0.1)", color: "rgb(29, 78, 216)" };
    case "completed": return { bg: "rgba(34, 197, 94, 0.1)", color: "rgb(21, 128, 61)" };
    case "cancelled": return { bg: "rgba(0,0,0,0.06)", color: "ink3" };
    default: return { bg: "rgba(0,0,0,0.06)", color: "ink3" };
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

const paper = css({
  bg: "surface", color: "ink", borderRadius: "16px",
  borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(0, 0, 0, 0.08)",
});
const paper24 = css({ p: "24px" });
const profileCard = css({ mb: "32px" });

const headRow = css({ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", mb: "24px" });
const identity = css({ display: "flex", alignItems: "center", gap: "16px", minW: 0 });
const nameRow = css({ display: "flex", alignItems: "center", gap: "9px", flexWrap: "wrap" });
const nameCss = css({ textStyle: "title", fontWeight: 600, color: "black" });
const taglineCss = css({ textStyle: "ui", color: "ink2" });
const metaRow = css({ display: "flex", alignItems: "center", gap: "8px", mt: "8px", flexWrap: "wrap" });
const ratingValue = css({ textStyle: "ui", fontWeight: 600, color: "black" });
const metaText = css({ textStyle: "meta", color: "ink2" });
const metaDot = css({ w: "3px", h: "3px", borderRadius: "50%", bg: "rgba(0,0,0,0.25)", flexShrink: 0 });
const memberText = css({ textStyle: "meta", color: "ink2" });

const publicBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px",
  minW: "64px", px: "16px", h: "36px", borderRadius: "40px", border: "none",
  bg: "rgba(0, 0, 0, 0.05)", color: "black", textStyle: "meta", fontWeight: 500, cursor: "pointer", flexShrink: 0,
  _hover: { bg: "rgba(0, 0, 0, 0.1)" },
  _disabled: { color: "rgba(0,0,0,0.26)", cursor: "default", pointerEvents: "none" },
  "& svg": { display: "block" },
});

const profileStats = css({
  display: "grid", gap: "16px", gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  pt: "24px", borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "rgba(0, 0, 0, 0.08)",
});
const profileStatValue = css({ textStyle: "title", fontWeight: 600, color: "black" });
const profileStatValueGreen = css({ textStyle: "title", fontWeight: 600, color: "#16a34a" });
const profileStatLabel = css({ textStyle: "micro", color: "ink2" });

const statsGrid = css({
  display: "grid", gap: "16px", mb: "32px",
  gridTemplateColumns: { base: "repeat(1, minmax(0, 1fr))", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" },
});
// The green "Available balance" variant hangs off `data-green` so its colours
// beat the base class by selector specificity (atomic order is not reliable).
const statCard = css({
  bg: "surface", color: "ink", borderRadius: "16px", p: "24px",
  borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(0, 0, 0, 0.08)",
  cursor: "pointer", transition: "all 0.3s",
  _hover: { borderColor: "rgba(0, 0, 0, 0.2)", "& .arrow-icon": { opacity: 1 } },
  "&[data-green]": {
    borderColor: "rgba(34, 197, 94, 0.2)",
    background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)",
    _hover: { borderColor: "rgba(34, 197, 94, 0.3)" },
    "& .arrow-icon": { color: "rgba(22, 163, 74, 0.4)" },
  },
});
const statCardRelative = css({ position: "relative" });
const statTop = css({ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "16px" });
const arrowIcon = css({ color: "ink3", opacity: 0, transition: "opacity 0.3s", display: "block" });
const statValue = css({ textStyle: "stat", fontWeight: 600, color: "black" });
const statValueGreen = css({ textStyle: "stat", fontWeight: 600, color: "rgb(21, 128, 61)" });
const statLabel = css({ textStyle: "micro", color: "ink2" });
const statLabelGreen = css({ textStyle: "micro", color: "rgba(21, 128, 61, 0.7)" });
const unreadDot = css({ position: "absolute", top: "16px", right: "16px", w: "8px", h: "8px", bg: "#2563eb", borderRadius: "50%" });

// The old grid = flex + gap with calc() widths; reproduced so the 8/4 split keeps
// its 760/368 columns inside the 1152px container.
const mainGrid = css({ display: "flex", flexWrap: "wrap", gap: "24px" });
const mainCol = css({ w: { base: "100%", lg: "calc(66.6667% - 8px)" }, minW: 0 });
const sideCol = css({ w: { base: "100%", lg: "calc(33.3333% - 16px)" }, minW: 0 });
const colStack = css({ display: "flex", flexDirection: "column", gap: "24px" });

const sectionHead = css({ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "24px" });
const sectionHeadTight = css({ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "16px" });
const sectionTitle = css({ textStyle: "lead", fontWeight: 600, color: "black" });
const listStack = css({ display: "flex", flexDirection: "column", gap: "12px" });
const listStackTight = css({ display: "flex", flexDirection: "column", gap: "8px" });
const emptyText = css({ textStyle: "ui", color: "ink2", textAlign: "center", py: "24px" });

const viewAllBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  minW: "64px", px: "8px", py: "6px", border: "none", borderRadius: "4px", bg: "transparent",
  textStyle: "meta", fontWeight: 500, color: "ink2", cursor: "pointer",
  _hover: { color: "black", bg: "transparent" },
});
const linkBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  minW: "auto", p: 0, border: "none", borderRadius: "4px", bg: "transparent",
  textStyle: "micro", fontWeight: 500, color: "#2563eb", cursor: "pointer",
  _hover: { bg: "transparent", textDecoration: "underline" },
});
const wideBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  w: "100%", boxSizing: "border-box", mt: "12px", px: "16px", py: "8px",
  border: "none", borderRadius: "8px", bg: "transparent",
  textStyle: "micro", fontWeight: 500, color: "ink2", cursor: "pointer",
  _hover: { color: "black", bg: "rgba(0, 0, 0, 0.04)" },
});

const listRow = css({
  display: "flex", alignItems: "center", justifyContent: "space-between",
  p: "16px", borderRadius: "12px", transition: "background-color 0.3s",
  _hover: { bg: "rgba(0, 0, 0, 0.02)" },
});
const rowTitle = css({ textStyle: "ui", fontWeight: 500, color: "black" });
const rowSub = css({ textStyle: "micro", color: "ink2" });
const rowAmount = css({ textStyle: "ui", fontWeight: 600, color: "black" });
const rowAmountFixed = css({ textStyle: "ui", fontWeight: 600, color: "black", w: "80px", textAlign: "right" });
const orderMetaRow = css({ display: "flex", alignItems: "center", gap: "6px", mt: "2px" });
const typeChip = css({
  display: "inline-flex", alignItems: "center", h: "16px", px: "8px", borderRadius: "pill",
  textStyle: "micro", whiteSpace: "nowrap",
});
const dueText = css({ textStyle: "micro", color: "ink3" });
const orderRight = css({ display: "flex", alignItems: "center", gap: "16px" });
const statusChip = css({
  display: "inline-flex", alignItems: "center", h: "24px", px: "12px", borderRadius: "pill",
  textStyle: "micro", whiteSpace: "nowrap",
});

const convBtn = css({
  display: "flex", alignItems: "flex-start", gap: "12px", w: "100%", boxSizing: "border-box",
  p: "12px", borderRadius: "12px", border: "none", bg: "transparent", textAlign: "left",
  color: "inherit", textStyle: "body", fontWeight: 500, cursor: "pointer",
  _hover: { bg: "rgba(0, 0, 0, 0.04)" },
});
const convHead = css({ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "4px" });
const convName = css({ textStyle: "meta", fontWeight: 600, color: "black", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });
const convBadge = css({
  display: "flex", alignItems: "center", justifyContent: "center", ml: "8px",
  w: "20px", h: "20px", borderRadius: "50%", bg: "#2563eb", color: "white",
  textStyle: "micro", fontWeight: 500, flexShrink: 0,
});
const convOrder = css({ display: "block", textStyle: "micro", color: "ink2", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });
const convFoot = css({ display: "flex", alignItems: "center", justifyContent: "space-between" });
const convPreview = css({ flex: 1, textStyle: "micro", color: "ink2", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });
const convTime = css({ textStyle: "micro", color: "ink3", ml: "8px", flexShrink: 0 });

const newChip = css({
  display: "inline-flex", alignItems: "center", h: "20px", px: "8px", borderRadius: "pill",
  bg: "#ea580c", color: "white", textStyle: "micro", fontWeight: 500, whiteSpace: "nowrap",
});
const notifRow = css({
  p: "12px", borderRadius: "12px", cursor: "pointer", transition: "background 0.15s",
  bg: "rgba(0, 0, 0, 0.02)", border: "none",
  _hover: { bg: "rgba(0,0,0,0.05)" },
  "&[data-unread]": {
    bg: "rgba(37, 99, 235, 0.05)",
    borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(37, 99, 235, 0.2)",
  },
});
const notifInner = css({ display: "flex", alignItems: "flex-start", gap: "8px" });
const notifDot = css({ w: "8px", h: "8px", borderRadius: "50%", mt: "6px", flexShrink: 0 });
const notifTitle = css({ textStyle: "meta", fontWeight: 600, color: "black" });
const notifBody = css({ textStyle: "micro", color: "ink2" });
const notifTime = css({ textStyle: "micro", color: "ink3" });

const flex1 = css({ flex: 1, minW: 0 });
// It used a bare `flex: 1` here (min-width: auto), so the row never collapses below its content.
const flexAuto = css({ flex: 1 });

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  onTabChange: (tab: Tab) => void;
}

export default function DashboardContent({ onTabChange }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data, loading, error } = useFreelancerDashboard();
  // The public profile route is keyed by the freelancer PROFILE id (the dashboard
  // payload's profile.id is the user id) — same source as the Profile tab's preview.
  const freelancerProfileId = user?.freelancer_profile?.id;

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

  const { profile, stats, recentOrders, activeServices, recentConversations, recentNotifications } = data;

  const openNotification = (n: DashboardNotification) => {
    if (n.readAt === null) api.markNotificationRead(n.id).catch(() => {});
    // Refresh the destination's cached queries so the page shows fresh data.
    invalidateForNotification(queryClient, n.type);
    const route = getNotificationRoute({ ...n, role: "freelancer" } as unknown as Notification);
    if (route) router.push(route);
  };

  return (
    <div>
      {/* Profile Overview Card */}
      <div className={cx(paper, paper24, profileCard)}>
        <div className={headRow}>
          <div className={identity}>
            <ProfileAvatar name={profile.name} src={profile.avatarUrl} size={80} verified={profile.verified} />
            <div className={css({ minW: 0 })}>
              <div className={nameRow}>
                <p className={nameCss}>{profile.name}</p>
                {profile.level && <LevelBadge level={profile.level} small />}
              </div>
              {profile.tagline && <p className={taglineCss}>{profile.tagline}</p>}
              <div className={metaRow}>
                {profile.rating !== null && profile.totalReviews > 0 && (
                  <>
                    <Stars5 rating={parseFloat(profile.rating)} size={14} />
                    <span className={ratingValue}>{profile.rating}</span>
                    <span className={metaText}>({profile.totalReviews} reviews)</span>
                    <span className={metaDot} />
                  </>
                )}
                {profile.responseRate !== null && (
                  <>
                    <MessageCircle size={14} color="#2563eb" />
                    <span className={metaText}>{profile.responseRate}% response rate</span>
                    <span className={metaDot} />
                  </>
                )}
                <span className={memberText}>Member since {formatMemberSince(profile.memberSince)}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className={publicBtn}
            onClick={() => freelancerProfileId && router.push(`/find-freelancer/${freelancerProfileId}`)}
            disabled={!freelancerProfileId}>
            <Eye size={14} />
            View Public Profile
          </button>
        </div>

        {/* Profile Stats */}
        <div className={profileStats}>
          <div>
            <p className={profileStatValue}>{stats.completedProjectsCount}</p>
            <p className={profileStatLabel}>Completed Projects</p>
          </div>
          <div>
            <p className={profileStatValue}>{profile.profileViews}</p>
            <p className={profileStatLabel}>Profile Views</p>
          </div>
          <div>
            <p className={profileStatValue}>{profile.profileCompleteness}%</p>
            <p className={profileStatLabel}>Profile Completeness</p>
          </div>
          <div>
            <p className={profileStatValueGreen}>Active</p>
            <p className={profileStatLabel}>Account Status</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className={statsGrid}>
        <div className={statCard}>
          <div className={statTop}>
            <DollarSign size={20} color="#9333ea" />
            <ArrowRight size={16} className={cx("arrow-icon", arrowIcon)} />
          </div>
          <p className={statValue}>{formatCurrency(stats.totalEarnings)}</p>
          <p className={statLabel}>Total Earnings</p>
        </div>

        <div className={statCard} data-green="">
          <div className={statTop}>
            <DollarSign size={20} color="#16a34a" />
            <ArrowRight size={16} className={cx("arrow-icon", arrowIcon)} />
          </div>
          <p className={statValueGreen}>{formatCurrency(stats.availableBalance)}</p>
          <p className={statLabelGreen}>Available Balance</p>
        </div>

        <div className={cx(statCard, statCardRelative)} onClick={() => router.push("/dashboard/freelancer/messages")}>
          <div className={statTop}>
            <MessageCircle size={20} color="#2563eb" />
            <ArrowRight size={16} className={cx("arrow-icon", arrowIcon)} />
          </div>
          <p className={statValue}>{stats.unreadMessagesCount}</p>
          <p className={statLabel}>Unread Messages</p>
          {stats.unreadMessagesCount > 0 && <span className={unreadDot} />}
        </div>

        <div className={statCard}>
          <div className={statTop}>
            <DollarSign size={20} color="#ea580c" />
            <ArrowRight size={16} className={cx("arrow-icon", arrowIcon)} />
          </div>
          <p className={statValue}>{formatCurrency(stats.inEscrow)}</p>
          <p className={statLabel}>In Escrow</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className={mainGrid}>
        {/* Main Column */}
        <div className={mainCol}>
          <div className={colStack}>
            {/* Active Services */}
            <div className={cx(paper, paper24)}>
              <div className={sectionHead}>
                <p className={sectionTitle}>Active Services</p>
                <button type="button" className={viewAllBtn}>View All</button>
              </div>

              <div className={listStack}>
                {activeServices.length === 0 ? (
                  <p className={emptyText}>No active services</p>
                ) : (
                  activeServices.map(service => (
                    <div key={service.id} className={listRow}>
                      <div>
                        <p className={rowTitle}>{service.title}</p>
                        <p className={rowSub}>{service.ordersCount} orders</p>
                      </div>
                      <div className={css({ textAlign: "right" })}>
                        <p className={rowAmount}>{formatCurrency(service.revenue)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className={cx(paper, paper24)}>
              <div className={sectionHead}>
                <p className={sectionTitle}>Recent Orders</p>
              </div>

              <div className={listStack}>
                {recentOrders.length === 0 ? (
                  <p className={emptyText}>No recent orders</p>
                ) : (
                  recentOrders.map(order => {
                    const statusColors = getStatusColors(order.status);
                    return (
                      <div key={order.id} className={listRow}>
                        <div className={flexAuto}>
                          <p className={rowTitle}>{order.clientName}</p>
                          <div className={orderMetaRow}>
                            <p className={rowSub}>{order.title}</p>
                            <span
                              className={typeChip}
                              style={{
                                background: order.type === "job" ? "rgba(99,102,241,0.1)" : "rgba(16,185,129,0.1)",
                                color: order.type === "job" ? "#6366f1" : "#059669",
                              }}>
                              {order.type === "job" ? "Job" : "Service"}
                            </span>
                          </div>
                          {order.dueDate && (
                            <p className={dueText}>
                              Due:{" "}
                              {new Date(order.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                          )}
                        </div>
                        <div className={orderRight}>
                          <span className={statusChip} style={{ background: statusColors.bg, color: statusColors.color }}>
                            {getStatusLabel(order.status)}
                          </span>
                          <p className={rowAmountFixed}>${order.amount}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className={sideCol}>
          <div className={colStack}>
            {/* Recent Messages */}
            <div className={cx(paper, paper24)}>
              <div className={sectionHeadTight}>
                <p className={sectionTitle}>Recent Messages</p>
                <button type="button" className={linkBtn} onClick={() => router.push("/dashboard/freelancer/messages")}>
                  View All
                </button>
              </div>

              <div className={listStack}>
                {recentConversations.length === 0 ? (
                  <p className={emptyText}>No messages yet</p>
                ) : (
                  recentConversations.map((conv: DashboardConversation) => (
                    <button
                      key={conv.conversationId}
                      type="button"
                      className={convBtn}
                      onClick={() => router.push("/dashboard/freelancer/messages")}>
                      <Avatar name={conv.otherParticipant.name} src={conv.otherParticipant.avatarUrl ?? undefined} px={40} />
                      <span className={flex1}>
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
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Notifications */}
            <div className={cx(paper, paper24)}>
              <div className={sectionHeadTight}>
                <div className={css({ display: "flex", alignItems: "center", gap: "8px" })}>
                  <p className={sectionTitle}>Notifications</p>
                  {stats.unreadNotificationsCount > 0 && (
                    <span className={newChip}>{stats.unreadNotificationsCount} new</span>
                  )}
                </div>
                <button type="button" className={linkBtn} onClick={() => router.push("/notifications")}>
                  View All
                </button>
              </div>

              <div className={listStackTight}>
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
                        <div className={flex1}>
                          <p className={notifTitle}>{notification.title}</p>
                          <p className={notifBody}>{notification.body}</p>
                          <p className={notifTime}>{timeAgo(notification.createdAt)}</p>
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
  );
}
