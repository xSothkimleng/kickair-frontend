"use client";

import { Box, Typography, Paper, Grid, Avatar, Button, Chip, CircularProgress, Stack } from "@mui/material";
import { AttachMoney, ChatBubbleOutline, Star, VisibilityOutlined, ArrowRight, Shield } from "@mui/icons-material";
import { useFreelancerDashboard } from "@/hooks/useFreelancerDashboard";
import { DashboardNotification, DashboardConversation } from "@/types/dashboard";
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

const getLevelGradient = (level: string) => {
  switch (level) {
    case "Bronze": return "linear-gradient(135deg, #92400e 0%, #d97706 100%)";
    case "Silver": return "linear-gradient(135deg, #9CA3AF 0%, #D1D5DB 100%)";
    case "Gold": return "linear-gradient(135deg, #d97706 0%, #fbbf24 100%)";
    case "Platinum": return "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)";
    default: return "linear-gradient(135deg, #9CA3AF 0%, #D1D5DB 100%)";
  }
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
    case "cancelled": return { bg: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.4)" };
    default: return { bg: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.4)" };
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

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  onTabChange: (tab: Tab) => void;
}

export default function DashboardContent({ onTabChange }: Props) {
  const { data, loading, error } = useFreelancerDashboard();

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight={400}>
        <Typography color='error'>{error ?? "Failed to load dashboard."}</Typography>
      </Box>
    );
  }

  const { profile, stats, recentOrders, activeServices, recentConversations, recentNotifications } = data;

  return (
    <Box>
      {/* Profile Overview Card */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 4,
          border: "1px solid rgba(0, 0, 0, 0.08)",
        }}>
        <Box sx={{ display: "flex", alignItems: "start", justifyContent: "space-between", mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "start", gap: 2 }}>
            <Avatar src={profile.avatarUrl ?? undefined} alt={profile.name} sx={{ width: 80, height: 80 }} />
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                <Typography sx={{ fontSize: 20, fontWeight: 600, color: "black" }}>{profile.name}</Typography>
                {profile.verified && <Shield sx={{ fontSize: 16, color: "#2563eb" }} />}
              </Box>
              {profile.tagline && (
                <Typography sx={{ fontSize: 13, color: "rgba(0, 0, 0, 0.6)", mb: 1.5 }}>{profile.tagline}</Typography>
              )}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                {profile.level && (
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      background: getLevelGradient(profile.level),
                      borderRadius: 2,
                    }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: "white" }}>{profile.level}</Typography>
                  </Box>
                )}

                {profile.rating !== null && profile.totalReviews > 0 && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Star sx={{ fontSize: 14, color: "#f59e0b", fill: "#f59e0b" }} />
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: "black" }}>{profile.rating}</Typography>
                    <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)" }}>({profile.totalReviews} reviews)</Typography>
                  </Box>
                )}

                {profile.responseRate !== null && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <ChatBubbleOutline sx={{ fontSize: 14, color: "#2563eb" }} />
                    <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)" }}>
                      {profile.responseRate}% response rate
                    </Typography>
                  </Box>
                )}

                <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.5)" }}>
                  Member since {formatMemberSince(profile.memberSince)}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Button
            startIcon={<VisibilityOutlined sx={{ fontSize: 14 }} />}
            sx={{
              px: 2,
              height: 36,
              fontSize: 12,
              color: "black",
              bgcolor: "rgba(0, 0, 0, 0.05)",
              borderRadius: 10,
              textTransform: "none",
              "&:hover": { bgcolor: "rgba(0, 0, 0, 0.1)" },
            }}>
            View Public Profile
          </Button>
        </Box>

        {/* Profile Stats */}
        <Grid
          container
          spacing={2}
          sx={{ pt: 3, borderTop: "1px solid rgba(0, 0, 0, 0.08)" }}>
          <Grid size={3}>
            <Typography sx={{ fontSize: 20, fontWeight: 600, color: "black", mb: 0.5 }}>
              {stats.completedProjectsCount}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>Completed Projects</Typography>
          </Grid>
          <Grid size={3}>
            <Typography sx={{ fontSize: 20, fontWeight: 600, color: "black", mb: 0.5 }}>{profile.profileViews}</Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>Profile Views</Typography>
          </Grid>
          <Grid size={3}>
            <Typography sx={{ fontSize: 20, fontWeight: 600, color: "black", mb: 0.5 }}>
              {profile.profileCompleteness}%
            </Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>Profile Completeness</Typography>
          </Grid>
          <Grid size={3}>
            <Typography sx={{ fontSize: 20, fontWeight: 600, color: "#16a34a", mb: 0.5 }}>Active</Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>Account Status</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Stats Overview */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              border: "1px solid rgba(0, 0, 0, 0.08)",
              p: 3,
              cursor: "pointer",
              transition: "all 0.3s",
              "&:hover": { borderColor: "rgba(0, 0, 0, 0.2)", "& .arrow-icon": { opacity: 1 } },
            }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <AttachMoney sx={{ fontSize: 20, color: "#9333ea" }} />
              <ArrowRight className='arrow-icon' sx={{ fontSize: 16, color: "rgba(0, 0, 0, 0.4)", opacity: 0, transition: "opacity 0.3s" }} />
            </Box>
            <Typography sx={{ fontSize: 28, fontWeight: 600, color: "black", mb: 0.5 }}>
              {formatCurrency(stats.totalEarnings)}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>Total Earnings</Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              border: "1px solid rgba(34, 197, 94, 0.2)",
              background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)",
              p: 3,
              cursor: "pointer",
              transition: "all 0.3s",
              "&:hover": { borderColor: "rgba(34, 197, 94, 0.3)", "& .arrow-icon": { opacity: 1 } },
            }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <AttachMoney sx={{ fontSize: 20, color: "#16a34a" }} />
              <ArrowRight className='arrow-icon' sx={{ fontSize: 16, color: "rgba(22, 163, 74, 0.4)", opacity: 0, transition: "opacity 0.3s" }} />
            </Box>
            <Typography sx={{ fontSize: 28, fontWeight: 600, color: "rgb(21, 128, 61)", mb: 0.5 }}>
              {formatCurrency(stats.availableBalance)}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(21, 128, 61, 0.7)" }}>Available Balance</Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              border: "1px solid rgba(0, 0, 0, 0.08)",
              p: 3,
              cursor: "pointer",
              position: "relative",
              transition: "all 0.3s",
              "&:hover": { borderColor: "rgba(0, 0, 0, 0.2)", "& .arrow-icon": { opacity: 1 } },
            }}
            onClick={() => onTabChange("messages")}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <ChatBubbleOutline sx={{ fontSize: 20, color: "#2563eb" }} />
              <ArrowRight className='arrow-icon' sx={{ fontSize: 16, color: "rgba(0, 0, 0, 0.4)", opacity: 0, transition: "opacity 0.3s" }} />
            </Box>
            <Typography sx={{ fontSize: 28, fontWeight: 600, color: "black", mb: 0.5 }}>{stats.unreadMessagesCount}</Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>Unread Messages</Typography>
            {stats.unreadMessagesCount > 0 && (
              <Box
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  width: 8,
                  height: 8,
                  bgcolor: "#2563eb",
                  borderRadius: "50%",
                }}
              />
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              border: "1px solid rgba(0, 0, 0, 0.08)",
              p: 3,
              cursor: "pointer",
              transition: "all 0.3s",
              "&:hover": { borderColor: "rgba(0, 0, 0, 0.2)", "& .arrow-icon": { opacity: 1 } },
            }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <AttachMoney sx={{ fontSize: 20, color: "#ea580c" }} />
              <ArrowRight className='arrow-icon' sx={{ fontSize: 16, color: "rgba(0, 0, 0, 0.4)", opacity: 0, transition: "opacity 0.3s" }} />
            </Box>
            <Typography sx={{ fontSize: 28, fontWeight: 600, color: "black", mb: 0.5 }}>
              {formatCurrency(stats.inEscrow)}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>In Escrow</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Main Column */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Active Services */}
            <Paper
              elevation={0}
              sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black" }}>Active Services</Typography>
                <Button sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", textTransform: "none", "&:hover": { color: "black", bgcolor: "transparent" } }}>
                  View All
                </Button>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {activeServices.length === 0 ? (
                  <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.5)", textAlign: "center", py: 3 }}>
                    No active services
                  </Typography>
                ) : (
                  activeServices.map(service => (
                    <Box
                      key={service.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 2,
                        borderRadius: 3,
                        transition: "background-color 0.3s",
                        "&:hover": { bgcolor: "rgba(0, 0, 0, 0.02)" },
                      }}>
                      <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "black", mb: 0.5 }}>{service.title}</Typography>
                        <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>{service.ordersCount} orders</Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "black" }}>
                          {formatCurrency(service.revenue)}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
            </Paper>

            {/* Recent Orders */}
            <Paper
              elevation={0}
              sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black" }}>Recent Orders</Typography>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {recentOrders.length === 0 ? (
                  <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.5)", textAlign: "center", py: 3 }}>
                    No recent orders
                  </Typography>
                ) : (
                  recentOrders.map(order => {
                    const statusColors = getStatusColors(order.status);
                    return (
                      <Box
                        key={order.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          p: 2,
                          borderRadius: 3,
                          transition: "background-color 0.3s",
                          "&:hover": { bgcolor: "rgba(0, 0, 0, 0.02)" },
                        }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontSize: 13, fontWeight: 500, color: "black", mb: 0.5 }}>
                            {order.clientName}
                          </Typography>
                          <Stack direction='row' spacing={0.75} alignItems='center' mt={0.25}>
                            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>{order.title}</Typography>
                            <Chip
                              label={order.type === "job" ? "Job" : "Service"}
                              size='small'
                              sx={{
                                height: 16,
                                fontSize: 9,
                                bgcolor: order.type === "job" ? "rgba(99,102,241,0.1)" : "rgba(16,185,129,0.1)",
                                color: order.type === "job" ? "#6366f1" : "#059669",
                              }}
                            />
                          </Stack>
                          {order.dueDate && (
                            <Typography sx={{ fontSize: 10, color: "rgba(0,0,0,0.4)", mt: 0.5 }}>
                              Due:{" "}
                              {new Date(order.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Chip
                            label={getStatusLabel(order.status)}
                            sx={{
                              fontSize: 11,
                              height: 24,
                              bgcolor: statusColors.bg,
                              color: statusColors.color,
                              "& .MuiChip-label": { px: 1.5 },
                            }}
                          />
                          <Typography sx={{ fontSize: 13, fontWeight: 600, color: "black", width: 80, textAlign: "right" }}>
                            ${order.amount}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })
                )}
              </Box>
            </Paper>
          </Box>
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Recent Messages */}
            <Paper
              elevation={0}
              sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black" }}>Recent Messages</Typography>
                <Button
                  onClick={() => onTabChange("messages")}
                  sx={{
                    fontSize: 11,
                    color: "#2563eb",
                    textTransform: "none",
                    minWidth: "auto",
                    p: 0,
                    "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
                  }}>
                  View All
                </Button>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {recentConversations.length === 0 ? (
                  <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.5)", textAlign: "center", py: 3 }}>
                    No messages yet
                  </Typography>
                ) : (
                  recentConversations.map((conv: DashboardConversation) => (
                    <Button
                      key={conv.conversationId}
                      onClick={() => onTabChange("messages")}
                      sx={{
                        width: "100%",
                        display: "flex",
                        alignItems: "start",
                        gap: 1.5,
                        p: 1.5,
                        borderRadius: 3,
                        textAlign: "left",
                        textTransform: "none",
                        color: "inherit",
                        "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                      }}>
                      <Avatar src={conv.otherParticipant.avatarUrl ?? undefined} alt={conv.otherParticipant.name} sx={{ width: 40, height: 40 }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                          <Typography
                            sx={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "black",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}>
                            {conv.otherParticipant.name}
                          </Typography>
                          {conv.unreadCount > 0 && (
                            <Box
                              sx={{
                                ml: 1,
                                width: 20,
                                height: 20,
                                bgcolor: "#2563eb",
                                color: "white",
                                fontSize: 9,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 500,
                                flexShrink: 0,
                              }}>
                              {conv.unreadCount}
                            </Box>
                          )}
                        </Box>
                        <Typography
                          sx={{
                            fontSize: 11,
                            color: "rgba(0, 0, 0, 0.6)",
                            mb: 0.5,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                          {conv.orderTitle}
                        </Typography>
                        {conv.lastMessage && (
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <Typography
                              sx={{
                                fontSize: 11,
                                color: "rgba(0, 0, 0, 0.6)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                flex: 1,
                              }}>
                              {conv.lastMessage.body}
                            </Typography>
                            <Typography sx={{ fontSize: 10, color: "rgba(0, 0, 0, 0.4)", ml: 1, flexShrink: 0 }}>
                              {timeAgo(conv.lastMessage.sentAt)}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Button>
                  ))
                )}
              </Box>
            </Paper>

            {/* Notifications */}
            <Paper
              elevation={0}
              sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black" }}>Notifications</Typography>
                  {stats.unreadNotificationsCount > 0 && (
                    <Chip
                      label={`${stats.unreadNotificationsCount} new`}
                      sx={{
                        height: 20,
                        bgcolor: "#ea580c",
                        color: "white",
                        fontSize: 9,
                        fontWeight: 500,
                        "& .MuiChip-label": { px: 1 },
                      }}
                    />
                  )}
                </Box>
                <Button
                  onClick={() => onTabChange("notifications")}
                  sx={{
                    fontSize: 11,
                    color: "#2563eb",
                    textTransform: "none",
                    minWidth: "auto",
                    p: 0,
                    "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
                  }}>
                  View All
                </Button>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {recentNotifications.length === 0 ? (
                  <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.5)", textAlign: "center", py: 3 }}>
                    No notifications
                  </Typography>
                ) : (
                  recentNotifications.map((notification: DashboardNotification) => (
                    <Box
                      key={notification.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: notification.readAt === null ? "rgba(37, 99, 235, 0.05)" : "rgba(0, 0, 0, 0.02)",
                        border: notification.readAt === null ? "1px solid rgba(37, 99, 235, 0.2)" : "none",
                      }}>
                      <Box sx={{ display: "flex", alignItems: "start", gap: 1 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            mt: 0.75,
                            flexShrink: 0,
                            bgcolor: getNotificationColor(notification.type),
                          }}
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: 12, fontWeight: 600, color: "black", mb: 0.25 }}>
                            {notification.title}
                          </Typography>
                          <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 0.5 }}>
                            {notification.body}
                          </Typography>
                          <Typography sx={{ fontSize: 10, color: "rgba(0, 0, 0, 0.4)" }}>
                            {timeAgo(notification.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))
                )}
              </Box>

              <Button
                onClick={() => onTabChange("notifications")}
                sx={{
                  width: "100%",
                  mt: 1.5,
                  px: 2,
                  py: 1,
                  fontSize: 11,
                  color: "rgba(0, 0, 0, 0.6)",
                  borderRadius: 2,
                  textTransform: "none",
                  "&:hover": { color: "black", bgcolor: "rgba(0, 0, 0, 0.04)" },
                }}>
                View All Notifications
              </Button>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
