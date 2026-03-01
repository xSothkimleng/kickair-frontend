"use client";

import { Box, Typography, Button, Avatar, Chip, Card, CardContent, Grid, Stack, Badge, Paper, CircularProgress } from "@mui/material";
import {
  LocationOn as MapPinIcon,
  CalendarToday as CalendarIcon,
  Visibility as EyeIcon,
  Work as BriefcaseIcon,
  Message as MessageCircleIcon,
  AccountBalanceWallet as WalletIcon,
  AttachMoney as DollarSignIcon,
  TrendingUp as ArrowUpRightIcon,
  Shield as ShieldIcon,
} from "@mui/icons-material";
import { useClientDashboard } from "@/hooks/useClientDashboard";
import { DashboardNotification, DashboardConversation } from "@/types/dashboard";
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
    case "cancelled": return { bg: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.4)" };
    default: return { bg: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.4)" };
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

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  onTabChange: (tab: Tab) => void;
}

export default function DashboardContent({ onTabChange }: Props) {
  const { data, loading, error } = useClientDashboard();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <Typography color="error">{error ?? "Failed to load dashboard."}</Typography>
      </Box>
    );
  }

  const { profile, stats, activeOrders, recentActivity, recentConversations, recentNotifications } = data;

  return (
    <Box>
      {/* Profile Overview Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "rgba(0,0,0,0.08)",
          mb: 4,
        }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Stack direction='row' justifyContent='space-between' alignItems='flex-start'>
              <Stack direction='row' spacing={2} alignItems='flex-start'>
                <Avatar src={profile.avatarUrl ?? undefined} alt={profile.name} sx={{ width: 80, height: 80 }} />
                <Box>
                  <Stack direction='row' spacing={1} alignItems='center' mb={0.5}>
                    <Typography variant='h6' fontWeight={600}>
                      {profile.name}
                    </Typography>
                    {profile.verified && (
                      <Chip
                        icon={<ShieldIcon sx={{ fontSize: 12 }} />}
                        label='Verified'
                        size='small'
                        sx={{
                          height: 20,
                          fontSize: 10,
                          fontWeight: 500,
                          bgcolor: "rgba(37, 99, 235, 0.1)",
                          color: "#2563eb",
                          "& .MuiChip-icon": { color: "#2563eb" },
                        }}
                      />
                    )}
                  </Stack>
                  {profile.company && (
                    <Typography variant='body2' color='text.secondary' mb={0.5}>
                      {profile.company}
                    </Typography>
                  )}
                  <Stack direction='row' spacing={2} alignItems='center'>
                    {profile.location && (
                      <Stack direction='row' spacing={0.5} alignItems='center'>
                        <MapPinIcon sx={{ fontSize: 12, color: "text.secondary" }} />
                        <Typography variant='caption' color='text.secondary'>
                          {profile.location}
                        </Typography>
                      </Stack>
                    )}
                    <Stack direction='row' spacing={0.5} alignItems='center'>
                      <CalendarIcon sx={{ fontSize: 12, color: "text.secondary" }} />
                      <Typography variant='caption' color='text.secondary'>
                        Member since {formatMemberSince(profile.memberSince)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>

              <Button
                variant='contained'
                startIcon={<EyeIcon sx={{ fontSize: 14 }} />}
                sx={{
                  bgcolor: "rgba(0,0,0,0.05)",
                  color: "black",
                  fontSize: 12,
                  textTransform: "none",
                  borderRadius: 10,
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: "rgba(0,0,0,0.1)",
                    boxShadow: "none",
                  },
                }}>
                View Public Profile
              </Button>
            </Stack>

            {/* Profile Stats */}
            <Grid
              container
              spacing={2}
              sx={{
                pt: 3,
                borderTop: "1px solid",
                borderColor: "rgba(0,0,0,0.08)",
              }}>
              <Grid size={3}>
                <Typography variant='h5' fontWeight={600} mb={0.5}>
                  {formatCurrency(stats.totalSpent)}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Total Spent
                </Typography>
              </Grid>
              <Grid size={3}>
                <Typography variant='h5' fontWeight={600} mb={0.5}>
                  {stats.activeProjectsCount}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Active Projects
                </Typography>
              </Grid>
              <Grid size={3}>
                <Typography variant='h5' fontWeight={600} mb={0.5}>
                  {stats.completedProjectsCount}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Completed Projects
                </Typography>
              </Grid>
              <Grid size={3}>
                <Typography variant='h5' fontWeight={600} mb={0.5}>
                  {profile.profileCompleteness}%
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Profile Completeness
                </Typography>
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <Grid container spacing={2} mb={4}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "rgba(0,0,0,0.08)",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: "rgba(0,0,0,0.2)",
                "& .arrow-icon": { opacity: 1 },
              },
            }}>
            <CardContent>
              <Stack direction='row' justifyContent='space-between' alignItems='center' mb={2}>
                <BriefcaseIcon sx={{ fontSize: 20, color: "#2563eb" }} />
                <ArrowUpRightIcon
                  className='arrow-icon'
                  sx={{
                    fontSize: 16,
                    color: "rgba(0,0,0,0.4)",
                    opacity: 0,
                    transition: "opacity 0.2s",
                  }}
                />
              </Stack>
              <Typography variant='h4' fontWeight={600} mb={0.5}>
                {stats.activeProjectsCount}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Active Orders
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "rgba(0,0,0,0.08)",
              cursor: "pointer",
              transition: "all 0.2s",
              position: "relative",
              "&:hover": {
                borderColor: "rgba(0,0,0,0.2)",
                "& .arrow-icon": { opacity: 1 },
              },
            }}
            onClick={() => onTabChange("messages")}>
            <CardContent>
              <Stack direction='row' justifyContent='space-between' alignItems='center' mb={2}>
                <MessageCircleIcon sx={{ fontSize: 20, color: "#9333ea" }} />
                <ArrowUpRightIcon
                  className='arrow-icon'
                  sx={{
                    fontSize: 16,
                    color: "rgba(0,0,0,0.4)",
                    opacity: 0,
                    transition: "opacity 0.2s",
                  }}
                />
              </Stack>
              <Typography variant='h4' fontWeight={600} mb={0.5}>
                {stats.unreadMessagesCount}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Unread Messages
              </Typography>
              {stats.unreadMessagesCount > 0 && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    width: 8,
                    height: 8,
                    bgcolor: "#9333ea",
                    borderRadius: "50%",
                  }}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "rgba(0,0,0,0.08)",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: "rgba(0,0,0,0.2)",
                "& .arrow-icon": { opacity: 1 },
              },
            }}>
            <CardContent>
              <Stack direction='row' justifyContent='space-between' alignItems='center' mb={2}>
                <WalletIcon sx={{ fontSize: 20, color: "#2563eb" }} />
                <ArrowUpRightIcon
                  className='arrow-icon'
                  sx={{
                    fontSize: 16,
                    color: "rgba(0,0,0,0.4)",
                    opacity: 0,
                    transition: "opacity 0.2s",
                  }}
                />
              </Stack>
              <Typography variant='h4' fontWeight={600} mb={0.5}>
                {formatCurrency(stats.availableBalance)}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Available Balance
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "rgba(0,0,0,0.08)",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: "rgba(0,0,0,0.2)",
                "& .arrow-icon": { opacity: 1 },
              },
            }}>
            <CardContent>
              <Stack direction='row' justifyContent='space-between' alignItems='center' mb={2}>
                <DollarSignIcon sx={{ fontSize: 20, color: "#16a34a" }} />
                <ArrowUpRightIcon
                  className='arrow-icon'
                  sx={{
                    fontSize: 16,
                    color: "rgba(0,0,0,0.4)",
                    opacity: 0,
                    transition: "opacity 0.2s",
                  }}
                />
              </Stack>
              <Typography variant='h4' fontWeight={600} mb={0.5}>
                {formatCurrency(stats.inEscrow)}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                In Escrow
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Main Column */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={3}>
            {/* Active Orders */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor: "rgba(0,0,0,0.08)",
              }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction='row' justifyContent='space-between' alignItems='center' mb={3}>
                  <Typography variant='h6' fontWeight={600}>
                    Active Orders
                  </Typography>
                  <Button
                    sx={{
                      fontSize: 12,
                      color: "text.secondary",
                      textTransform: "none",
                      "&:hover": { color: "black" },
                    }}>
                    View All
                  </Button>
                </Stack>

                <Stack spacing={1.5}>
                  {activeOrders.length === 0 ? (
                    <Typography variant='body2' color='text.secondary' textAlign='center' py={3}>
                      No active orders
                    </Typography>
                  ) : (
                    activeOrders.map(order => {
                      const statusColors = getStatusColors(order.status);
                      return (
                        <Paper
                          elevation={0}
                          key={order.id}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: "rgba(0,0,0,0.08)",
                            transition: "all 0.2s",
                            "&:hover": { bgcolor: "rgba(0,0,0,0.02)" },
                          }}>
                          <Stack direction='row' justifyContent='space-between' alignItems='center'>
                            <Box flex={1}>
                              <Typography variant='body2' fontWeight={500} mb={0.5}>
                                {order.title}
                              </Typography>
                              <Typography variant='caption' color='text.secondary' display='block' mb={0.5}>
                                by {order.freelancerName}
                              </Typography>
                              <Stack direction='row' spacing={1} alignItems='center'>
                                <Chip
                                  label={getStatusLabel(order.status)}
                                  size='small'
                                  sx={{
                                    height: 20,
                                    fontSize: 10,
                                    bgcolor: statusColors.bg,
                                    color: statusColors.color,
                                  }}
                                />
                                <Chip
                                  label={order.type === "job" ? "Job" : "Service"}
                                  size='small'
                                  sx={{
                                    height: 20,
                                    fontSize: 10,
                                    bgcolor: order.type === "job" ? "rgba(99,102,241,0.1)" : "rgba(16,185,129,0.1)",
                                    color: order.type === "job" ? "#6366f1" : "#059669",
                                  }}
                                />
                                {order.dueDate ? (
                                  <Typography variant='caption' color='text.disabled'>
                                    Due: {new Date(order.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                  </Typography>
                                ) : (
                                  <Typography variant='caption' color='text.disabled'>
                                    Due: TBD
                                  </Typography>
                                )}
                              </Stack>
                            </Box>
                            <Typography variant='body2' fontWeight={600}>
                              ${order.amount}
                            </Typography>
                          </Stack>
                        </Paper>
                      );
                    })
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor: "rgba(0,0,0,0.08)",
              }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant='h6' fontWeight={600} mb={3}>
                  Recent Activity
                </Typography>

                <Stack spacing={2}>
                  {recentActivity.length === 0 ? (
                    <Typography variant='body2' color='text.secondary' textAlign='center' py={3}>
                      No recent activity
                    </Typography>
                  ) : (
                    recentActivity.map(activity => (
                      <Stack
                        key={activity.id}
                        direction='row'
                        spacing={1.5}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          transition: "all 0.2s",
                          "&:hover": { bgcolor: "rgba(0,0,0,0.02)" },
                        }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: getActivityColor(activity.type),
                            mt: 1,
                            flexShrink: 0,
                          }}
                        />
                        <Box flex={1}>
                          <Typography variant='body2' fontWeight={500} mb={0.25}>
                            {activity.title}
                          </Typography>
                          {activity.description && (
                            <Typography variant='caption' color='text.secondary' display='block' mb={0.5}>
                              {activity.description}
                            </Typography>
                          )}
                          <Typography variant='caption' color='text.disabled'>
                            {timeAgo(activity.createdAt)}
                          </Typography>
                        </Box>
                      </Stack>
                    ))
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3}>
            {/* Recent Messages */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor: "rgba(0,0,0,0.08)",
              }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction='row' justifyContent='space-between' alignItems='center' mb={2}>
                  <Typography variant='h6' fontWeight={600}>
                    Recent Messages
                  </Typography>
                  <Button
                    onClick={() => onTabChange("messages")}
                    sx={{
                      fontSize: 11,
                      color: "#0071e3",
                      textTransform: "none",
                      minWidth: "auto",
                      p: 0,
                      "&:hover": { textDecoration: "underline", bgcolor: "transparent" },
                    }}>
                    View All
                  </Button>
                </Stack>

                <Stack spacing={1.5}>
                  {recentConversations.length === 0 ? (
                    <Typography variant='body2' color='text.secondary' textAlign='center' py={3}>
                      No messages yet
                    </Typography>
                  ) : (
                    recentConversations.map((conv: DashboardConversation) => (
                      <Button
                        key={conv.conversationId}
                        onClick={() => onTabChange("messages")}
                        sx={{
                          width: "100%",
                          p: 1.5,
                          borderRadius: 2,
                          textAlign: "left",
                          textTransform: "none",
                          color: "inherit",
                          justifyContent: "flex-start",
                          "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
                        }}>
                        <Stack direction='row' spacing={1.5} width='100%'>
                          <Avatar src={conv.otherParticipant.avatarUrl ?? undefined} alt={conv.otherParticipant.name} sx={{ width: 40, height: 40 }} />
                          <Box flex={1} minWidth={0}>
                            <Stack direction='row' justifyContent='space-between' alignItems='center' mb={0.5}>
                              <Typography variant='body2' fontWeight={600} noWrap sx={{ flex: 1 }}>
                                {conv.otherParticipant.name}
                              </Typography>
                              {conv.unreadCount > 0 && (
                                <Badge
                                  badgeContent={conv.unreadCount}
                                  sx={{
                                    "& .MuiBadge-badge": {
                                      bgcolor: "#9333ea",
                                      color: "white",
                                      fontSize: 9,
                                      height: 18,
                                      minWidth: 18,
                                    },
                                  }}
                                />
                              )}
                            </Stack>
                            <Typography variant='caption' color='text.secondary' display='block' noWrap mb={0.5}>
                              {conv.orderTitle}
                            </Typography>
                            {conv.lastMessage && (
                              <Stack direction='row' justifyContent='space-between' alignItems='center'>
                                <Typography variant='caption' color='text.secondary' noWrap sx={{ flex: 1 }}>
                                  {conv.lastMessage.body}
                                </Typography>
                                <Typography variant='caption' color='text.disabled' sx={{ ml: 1, flexShrink: 0 }}>
                                  {timeAgo(conv.lastMessage.sentAt)}
                                </Typography>
                              </Stack>
                            )}
                          </Box>
                        </Stack>
                      </Button>
                    ))
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor: "rgba(0,0,0,0.08)",
              }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction='row' justifyContent='space-between' alignItems='center' mb={2}>
                  <Stack direction='row' spacing={1} alignItems='center'>
                    <Typography variant='h6' fontWeight={600}>
                      Notifications
                    </Typography>
                    {stats.unreadNotificationsCount > 0 && (
                      <Chip
                        label={`${stats.unreadNotificationsCount} new`}
                        size='small'
                        sx={{
                          height: 20,
                          fontSize: 9,
                          fontWeight: 500,
                          bgcolor: "#ea580c",
                          color: "white",
                        }}
                      />
                    )}
                  </Stack>
                  <Button
                    onClick={() => onTabChange("notifications")}
                    sx={{
                      fontSize: 11,
                      color: "#0071e3",
                      textTransform: "none",
                      minWidth: "auto",
                      p: 0,
                      "&:hover": { textDecoration: "underline", bgcolor: "transparent" },
                    }}>
                    View All
                  </Button>
                </Stack>

                <Stack spacing={1}>
                  {recentNotifications.length === 0 ? (
                    <Typography variant='body2' color='text.secondary' textAlign='center' py={3}>
                      No notifications
                    </Typography>
                  ) : (
                    recentNotifications.map((notification: DashboardNotification) => (
                      <Paper
                        elevation={0}
                        key={notification.id}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: notification.readAt === null ? "rgba(234, 88, 12, 0.05)" : "rgba(0,0,0,0.02)",
                          border: "1px solid",
                          borderColor: notification.readAt === null ? "rgba(234, 88, 12, 0.2)" : "transparent",
                        }}>
                        <Stack direction='row' spacing={1}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: getNotificationColor(notification.type),
                              mt: 0.75,
                              flexShrink: 0,
                            }}
                          />
                          <Box flex={1} minWidth={0}>
                            <Typography variant='caption' fontWeight={600} display='block' mb={0.25}>
                              {notification.title}
                            </Typography>
                            <Typography variant='caption' color='text.secondary' display='block' mb={0.5}>
                              {notification.body}
                            </Typography>
                            <Typography variant='caption' color='text.disabled'>
                              {timeAgo(notification.createdAt)}
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    ))
                  )}
                </Stack>

                <Button
                  fullWidth
                  onClick={() => onTabChange("notifications")}
                  sx={{
                    mt: 1.5,
                    fontSize: 11,
                    color: "text.secondary",
                    textTransform: "none",
                    "&:hover": {
                      color: "black",
                      bgcolor: "rgba(0,0,0,0.04)",
                    },
                  }}>
                  View All Notifications
                </Button>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
