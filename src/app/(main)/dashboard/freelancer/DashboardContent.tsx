import { Box, Typography, Paper, Grid, Avatar, Button, Chip } from "@mui/material";
import { AttachMoney, ChatBubbleOutline, NotificationsOutlined, Star, VisibilityOutlined, ArrowRight } from "@mui/icons-material";

export default function DashboardContent() {
  const profileData = {
    name: "Sopheak Chan",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    title: "Full-Stack Developer & UI/UX Designer",
    level: "Silver",
    levelColor: "linear-gradient(135deg, #9CA3AF 0%, #D1D5DB 100%)",
    rating: 4.9,
    totalReviews: 42,
    completedProjects: 47,
    responseRate: 92,
    profileViews: 1247,
    profileCompleteness: 85,
  };

  const notifications = [
    {
      id: 1,
      type: "order",
      title: "New order received",
      message: "Sarah Chen ordered your Modern Logo Design - Basic Package",
      time: "5 min ago",
      unread: true,
    },
    {
      id: 2,
      type: "message",
      title: "New message from David Kim",
      message: "When can we schedule a call to discuss the website revisions?",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      type: "review",
      title: "New 5-star review",
      message: 'Maria Santos left you a review: "Excellent work on the social media graphics!"',
      time: "3 hours ago",
      unread: true,
    },
    {
      id: 4,
      type: "achievement",
      title: "Achievement unlocked!",
      message: 'You earned the "Quick Responder" badge',
      time: "1 day ago",
      unread: false,
    },
  ];

  const recentMessages = [
    {
      id: 1,
      clientName: "Sarah Chen",
      clientAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
      lastMessage: "Thanks! The logo looks perfect. Can you send the final files?",
      timestamp: "2m ago",
      unread: 2,
    },
    {
      id: 2,
      clientName: "David Kim",
      clientAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
      lastMessage: "When can we schedule a call to discuss the website revisions?",
      timestamp: "1h ago",
      unread: 0,
    },
    {
      id: 3,
      clientName: "Maria Santos",
      clientAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
      lastMessage: "I love the color palette you chose!",
      timestamp: "3h ago",
      unread: 0,
    },
  ];

  const activeServices = [
    { title: "Modern Logo Design", orders: 12, revenue: "$3,600" },
    { title: "Website Development", orders: 5, revenue: "$4,500" },
    { title: "Social Media Graphics", orders: 18, revenue: "$2,160" },
  ];

  const recentOrders = [
    { client: "Sarah Chen", service: "Logo Design", status: "In Progress", amount: "$250" },
    { client: "David Kim", service: "Website Dev", status: "Completed", amount: "$900" },
    { client: "Maria Santos", service: "Social Media", status: "In Progress", amount: "$120" },
  ];

  return (
    <Box>
      {/* Profile Overview Card */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid rgba(0, 0, 0, 0.08)",
          p: 3,
          mb: 4,
        }}>
        <Box sx={{ display: "flex", alignItems: "start", justifyContent: "space-between", mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "start", gap: 2 }}>
            <Avatar src={profileData.avatar} alt={profileData.name} sx={{ width: 80, height: 80 }} />
            <Box>
              <Typography sx={{ fontSize: 20, fontWeight: 600, color: "black", mb: 0.5 }}>{profileData.name}</Typography>
              <Typography sx={{ fontSize: 13, color: "rgba(0, 0, 0, 0.6)", mb: 1.5 }}>{profileData.title}</Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {/* Level Badge */}
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    background: profileData.levelColor,
                    borderRadius: 2,
                  }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: "white" }}>{profileData.level}</Typography>
                </Box>

                {/* Rating */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Star sx={{ fontSize: 14, color: "#f59e0b", fill: "#f59e0b" }} />
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: "black" }}>{profileData.rating}</Typography>
                  <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)" }}>({profileData.totalReviews} reviews)</Typography>
                </Box>

                {/* Response Rate */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <ChatBubbleOutline sx={{ fontSize: 14, color: "#2563eb" }} />
                  <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)" }}>
                    {profileData.responseRate}% response rate
                  </Typography>
                </Box>
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
              "&:hover": {
                bgcolor: "rgba(0, 0, 0, 0.1)",
              },
            }}>
            View Public Profile
          </Button>
        </Box>

        {/* Profile Stats */}
        <Grid
          container
          spacing={2}
          sx={{
            pt: 3,
            borderTop: "1px solid rgba(0, 0, 0, 0.08)",
          }}>
          <Grid size={3}>
            <Typography sx={{ fontSize: 20, fontWeight: 600, color: "black", mb: 0.5 }}>
              {profileData.completedProjects}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>Completed Projects</Typography>
          </Grid>
          <Grid size={3}>
            <Typography sx={{ fontSize: 20, fontWeight: 600, color: "black", mb: 0.5 }}>{profileData.profileViews}</Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>Profile Views</Typography>
          </Grid>
          <Grid size={3}>
            <Typography sx={{ fontSize: 20, fontWeight: 600, color: "black", mb: 0.5 }}>
              {profileData.profileCompleteness}%
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
        {/* Total Earnings */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              border: "1px solid rgba(0, 0, 0, 0.08)",
              p: 3,
              cursor: "pointer",
              transition: "all 0.3s",
              "&:hover": {
                borderColor: "rgba(0, 0, 0, 0.2)",
                "& .arrow-icon": {
                  opacity: 1,
                },
              },
            }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <AttachMoney sx={{ fontSize: 20, color: "#9333ea" }} />
              <ArrowRight
                className='arrow-icon'
                sx={{ fontSize: 16, color: "rgba(0, 0, 0, 0.4)", opacity: 0, transition: "opacity 0.3s" }}
              />
            </Box>
            <Typography sx={{ fontSize: 28, fontWeight: 600, color: "black", mb: 0.5 }}>$12,450</Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>Total Earnings</Typography>
          </Paper>
        </Grid>

        {/* Available Balance */}
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
              "&:hover": {
                borderColor: "rgba(34, 197, 94, 0.3)",
                "& .arrow-icon": {
                  opacity: 1,
                },
              },
            }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <AttachMoney sx={{ fontSize: 20, color: "#16a34a" }} />
              <ArrowRight
                className='arrow-icon'
                sx={{ fontSize: 16, color: "rgba(22, 163, 74, 0.4)", opacity: 0, transition: "opacity 0.3s" }}
              />
            </Box>
            <Typography sx={{ fontSize: 28, fontWeight: 600, color: "rgb(21, 128, 61)", mb: 0.5 }}>$3,240</Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(21, 128, 61, 0.7)" }}>Available Balance</Typography>
          </Paper>
        </Grid>

        {/* Unread Messages */}
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
              "&:hover": {
                borderColor: "rgba(0, 0, 0, 0.2)",
                "& .arrow-icon": {
                  opacity: 1,
                },
              },
            }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <ChatBubbleOutline sx={{ fontSize: 20, color: "#2563eb" }} />
              <ArrowRight
                className='arrow-icon'
                sx={{ fontSize: 16, color: "rgba(0, 0, 0, 0.4)", opacity: 0, transition: "opacity 0.3s" }}
              />
            </Box>
            <Typography sx={{ fontSize: 28, fontWeight: 600, color: "black", mb: 0.5 }}>23</Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>Unread Messages</Typography>
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
          </Paper>
        </Grid>

        {/* New Notifications */}
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
              "&:hover": {
                borderColor: "rgba(0, 0, 0, 0.2)",
                "& .arrow-icon": {
                  opacity: 1,
                },
              },
            }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <NotificationsOutlined sx={{ fontSize: 20, color: "#ea580c" }} />
              <ArrowRight
                className='arrow-icon'
                sx={{ fontSize: 16, color: "rgba(0, 0, 0, 0.4)", opacity: 0, transition: "opacity 0.3s" }}
              />
            </Box>
            <Typography sx={{ fontSize: 28, fontWeight: 600, color: "black", mb: 0.5 }}>
              {notifications.filter(n => n.unread).length}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>New Notifications</Typography>
            <Box
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                width: 8,
                height: 8,
                bgcolor: "#ea580c",
                borderRadius: "50%",
              }}
            />
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
              sx={{
                borderRadius: 4,
                border: "1px solid rgba(0, 0, 0, 0.08)",
                p: 3,
              }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black" }}>Active Services</Typography>
                <Button
                  sx={{
                    fontSize: 12,
                    color: "rgba(0, 0, 0, 0.6)",
                    textTransform: "none",
                    "&:hover": {
                      color: "black",
                      bgcolor: "transparent",
                    },
                  }}>
                  View All
                </Button>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {activeServices.map((service, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 2,
                      borderRadius: 3,
                      transition: "background-color 0.3s",
                      "&:hover": {
                        bgcolor: "rgba(0, 0, 0, 0.02)",
                      },
                    }}>
                    <Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 500, color: "black", mb: 0.5 }}>{service.title}</Typography>
                      <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>{service.orders} orders</Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, color: "black" }}>{service.revenue}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>

            {/* Recent Orders */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                border: "1px solid rgba(0, 0, 0, 0.08)",
                p: 3,
              }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black" }}>Recent Orders</Typography>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {recentOrders.map((order, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 2,
                      borderRadius: 3,
                      transition: "background-color 0.3s",
                      "&:hover": {
                        bgcolor: "rgba(0, 0, 0, 0.02)",
                      },
                    }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 500, color: "black", mb: 0.5 }}>{order.client}</Typography>
                      <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>{order.service}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Chip
                        label={order.status}
                        sx={{
                          fontSize: 11,
                          height: 24,
                          bgcolor: order.status === "Completed" ? "rgba(34, 197, 94, 0.1)" : "rgba(37, 99, 235, 0.1)",
                          color: order.status === "Completed" ? "rgb(21, 128, 61)" : "rgb(29, 78, 216)",
                          "& .MuiChip-label": {
                            px: 1.5,
                          },
                        }}
                      />
                      <Typography sx={{ fontSize: 13, fontWeight: 600, color: "black", width: 80, textAlign: "right" }}>
                        {order.amount}
                      </Typography>
                    </Box>
                  </Box>
                ))}
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
              sx={{
                borderRadius: 4,
                border: "1px solid rgba(0, 0, 0, 0.08)",
                p: 3,
              }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black" }}>Recent Messages</Typography>
                <Button
                  sx={{
                    fontSize: 11,
                    color: "#2563eb",
                    textTransform: "none",
                    minWidth: "auto",
                    p: 0,
                    "&:hover": {
                      bgcolor: "transparent",
                      textDecoration: "underline",
                    },
                  }}>
                  View All
                </Button>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {recentMessages.map(message => (
                  <Button
                    key={message.id}
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
                      "&:hover": {
                        bgcolor: "rgba(0, 0, 0, 0.04)",
                      },
                    }}>
                    <Avatar src={message.clientAvatar} alt={message.clientName} sx={{ width: 40, height: 40 }} />
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
                          {message.clientName}
                        </Typography>
                        {message.unread > 0 && (
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
                            {message.unread}
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
                        {message.lastMessage}
                      </Typography>
                      <Typography sx={{ fontSize: 10, color: "rgba(0, 0, 0, 0.4)" }}>{message.timestamp}</Typography>
                    </Box>
                  </Button>
                ))}
              </Box>
            </Paper>

            {/* Notifications */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                border: "1px solid rgba(0, 0, 0, 0.08)",
                p: 3,
              }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black" }}>Notifications</Typography>
                <Chip
                  label={`${notifications.filter(n => n.unread).length} new`}
                  sx={{
                    height: 20,
                    bgcolor: "#ea580c",
                    color: "white",
                    fontSize: 9,
                    fontWeight: 500,
                    "& .MuiChip-label": {
                      px: 1,
                    },
                  }}
                />
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {notifications.slice(0, 4).map(notification => (
                  <Box
                    key={notification.id}
                    sx={{
                      p: 1.5,
                      borderRadius: 3,
                      bgcolor: notification.unread ? "rgba(37, 99, 235, 0.05)" : "rgba(0, 0, 0, 0.02)",
                      border: notification.unread ? "1px solid rgba(37, 99, 235, 0.2)" : "none",
                    }}>
                    <Box sx={{ display: "flex", alignItems: "start", gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          mt: 0.75,
                          flexShrink: 0,
                          bgcolor:
                            notification.type === "order"
                              ? "#16a34a"
                              : notification.type === "message"
                              ? "#2563eb"
                              : notification.type === "review"
                              ? "#f59e0b"
                              : "#9333ea",
                        }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "black", mb: 0.25 }}>
                          {notification.title}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 0.5 }}>
                          {notification.message}
                        </Typography>
                        <Typography sx={{ fontSize: 10, color: "rgba(0, 0, 0, 0.4)" }}>{notification.time}</Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>

              <Button
                sx={{
                  width: "100%",
                  mt: 1.5,
                  px: 2,
                  py: 1,
                  fontSize: 11,
                  color: "rgba(0, 0, 0, 0.6)",
                  borderRadius: 2,
                  textTransform: "none",
                  "&:hover": {
                    color: "black",
                    bgcolor: "rgba(0, 0, 0, 0.04)",
                  },
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
