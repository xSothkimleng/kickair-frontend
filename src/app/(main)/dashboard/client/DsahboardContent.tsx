"use client";

import { Box, Typography, Button, Avatar, Chip, Card, CardContent, Grid, Stack, Badge, Paper } from "@mui/material";
import {
  LocationOn as MapPinIcon,
  CalendarToday as CalendarIcon,
  Visibility as EyeIcon,
  Work as BriefcaseIcon,
  Message as MessageCircleIcon,
  Notifications as BellIcon,
  AttachMoney as DollarSignIcon,
  TrendingUp as ArrowUpRightIcon,
  Shield as ShieldIcon,
} from "@mui/icons-material";

export default function DashboardContent() {
  const profileData = {
    name: "Sokha Pheakdey",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    company: "Tech Solutions Cambodia",
    location: "Phnom Penh, Cambodia",
    memberSince: "January 2024",
    verified: true,
    totalSpent: 24500,
    activeProjects: 3,
    completedProjects: 12,
    profileCompleteness: 90,
  };

  const notifications = [
    {
      id: 1,
      type: "proposal",
      title: "New proposal received",
      message: 'Sopheak Chan sent a proposal for "E-commerce Website Development"',
      time: "10 min ago",
      unread: true,
    },
    {
      id: 2,
      type: "delivery",
      title: "Order delivered",
      message: 'Sarah Kim delivered your "Logo Design - Premium Package"',
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 3,
      type: "message",
      title: "New message from David Lim",
      message: "I have a question about the project requirements...",
      time: "5 hours ago",
      unread: false,
    },
  ];

  const recentMessages = [
    {
      id: 1,
      freelancerName: "Sopheak Chan",
      freelancerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
      lastMessage: "I can start working on your project tomorrow. Looking forward to it!",
      timestamp: "5m ago",
      unread: 1,
    },
    {
      id: 2,
      freelancerName: "Sarah Kim",
      freelancerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
      lastMessage: "The final logo designs are ready for your review.",
      timestamp: "2h ago",
      unread: 0,
    },
    {
      id: 3,
      freelancerName: "David Lim",
      freelancerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
      lastMessage: "Thank you for the feedback! I'll make those changes.",
      timestamp: "1d ago",
      unread: 0,
    },
  ];

  const activeOrders = [
    {
      freelancer: "Sopheak Chan",
      service: "E-commerce Website Development",
      status: "In Progress",
      dueDate: "Jan 15, 2026",
      amount: "$1,200",
    },
    {
      freelancer: "Sarah Kim",
      service: "Logo Design - Premium Package",
      status: "Under Review",
      dueDate: "Jan 10, 2026",
      amount: "$350",
    },
    {
      freelancer: "David Lim",
      service: "Social Media Marketing Strategy",
      status: "In Progress",
      dueDate: "Jan 20, 2026",
      amount: "$900",
    },
  ];

  const recentActivity = [
    {
      type: "proposal",
      title: "New proposal received",
      description: "Sopheak Chan sent a proposal for your project",
      time: "10 min ago",
    },
    {
      type: "delivery",
      title: "Order delivered",
      description: "Sarah Kim delivered Logo Design - Premium Package",
      time: "2 hours ago",
    },
    {
      type: "payment",
      title: "Payment processed",
      description: "$350 transferred to escrow",
      time: "1 day ago",
    },
  ];

  const getActivityColor = (type: string) => {
    switch (type) {
      case "proposal":
        return "#2563eb";
      case "delivery":
        return "#16a34a";
      case "payment":
        return "#9333ea";
      default:
        return "#000";
    }
  };

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
                <Avatar src={profileData.avatar} alt={profileData.name} sx={{ width: 80, height: 80 }} />
                <Box>
                  <Stack direction='row' spacing={1} alignItems='center' mb={0.5}>
                    <Typography variant='h6' fontWeight={600}>
                      {profileData.name}
                    </Typography>
                    {profileData.verified && (
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
                  <Typography variant='body2' color='text.secondary' mb={0.5}>
                    {profileData.company}
                  </Typography>
                  <Stack direction='row' spacing={2} alignItems='center'>
                    <Stack direction='row' spacing={0.5} alignItems='center'>
                      <MapPinIcon sx={{ fontSize: 12, color: "text.secondary" }} />
                      <Typography variant='caption' color='text.secondary'>
                        {profileData.location}
                      </Typography>
                    </Stack>
                    <Stack direction='row' spacing={0.5} alignItems='center'>
                      <CalendarIcon sx={{ fontSize: 12, color: "text.secondary" }} />
                      <Typography variant='caption' color='text.secondary'>
                        Member since {profileData.memberSince}
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
                  ${profileData.totalSpent.toLocaleString()}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Total Spent
                </Typography>
              </Grid>
              <Grid size={3}>
                <Typography variant='h5' fontWeight={600} mb={0.5}>
                  {profileData.activeProjects}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Active Projects
                </Typography>
              </Grid>
              <Grid size={3}>
                <Typography variant='h5' fontWeight={600} mb={0.5}>
                  {profileData.completedProjects}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Completed Projects
                </Typography>
              </Grid>
              <Grid size={3}>
                <Typography variant='h5' fontWeight={600} mb={0.5}>
                  {profileData.profileCompleteness}%
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
                3
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
            }}>
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
                8
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Unread Messages
              </Typography>
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
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "rgba(234, 88, 12, 0.2)",
              background: "linear-gradient(135deg, rgba(234, 88, 12, 0.1) 0%, rgba(234, 88, 12, 0.05) 100%)",
              cursor: "pointer",
              transition: "all 0.2s",
              position: "relative",
              "&:hover": {
                borderColor: "rgba(234, 88, 12, 0.3)",
                "& .arrow-icon": { opacity: 1 },
              },
            }}>
            <CardContent>
              <Stack direction='row' justifyContent='space-between' alignItems='center' mb={2}>
                <BellIcon sx={{ fontSize: 20, color: "#ea580c" }} />
                <ArrowUpRightIcon
                  className='arrow-icon'
                  sx={{
                    fontSize: 16,
                    color: "rgba(234, 88, 12, 0.4)",
                    opacity: 0,
                    transition: "opacity 0.2s",
                  }}
                />
              </Stack>
              <Typography variant='h4' fontWeight={600} color='#b45309' mb={0.5}>
                {notifications.filter(n => n.unread).length}
              </Typography>
              <Typography variant='caption' sx={{ color: "rgba(180, 83, 9, 0.7)" }}>
                New Notifications
              </Typography>
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
                $2,450
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
                  {activeOrders.map((order, idx) => (
                    <Paper
                      elevation={0}
                      key={idx}
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
                            {order.service}
                          </Typography>
                          <Typography variant='caption' color='text.secondary' display='block' mb={0.5}>
                            by {order.freelancer}
                          </Typography>
                          <Stack direction='row' spacing={1} alignItems='center'>
                            <Chip
                              label={order.status}
                              size='small'
                              sx={{
                                height: 20,
                                fontSize: 10,
                                bgcolor: order.status === "Under Review" ? "rgba(234, 88, 12, 0.1)" : "rgba(37, 99, 235, 0.1)",
                                color: order.status === "Under Review" ? "#b45309" : "#1e40af",
                              }}
                            />
                            <Typography variant='caption' color='text.disabled'>
                              Due: {order.dueDate}
                            </Typography>
                          </Stack>
                        </Box>
                        <Typography variant='body2' fontWeight={600}>
                          {order.amount}
                        </Typography>
                      </Stack>
                    </Paper>
                  ))}
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
                  {recentActivity.map((activity, idx) => (
                    <Stack
                      key={idx}
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
                        <Typography variant='caption' color='text.secondary' display='block' mb={0.5}>
                          {activity.description}
                        </Typography>
                        <Typography variant='caption' color='text.disabled'>
                          {activity.time}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
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
                  {recentMessages.map(message => (
                    <Button
                      key={message.id}
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
                        <Avatar src={message.freelancerAvatar} alt={message.freelancerName} sx={{ width: 40, height: 40 }} />
                        <Box flex={1} minWidth={0}>
                          <Stack direction='row' justifyContent='space-between' alignItems='center' mb={0.5}>
                            <Typography variant='body2' fontWeight={600} noWrap sx={{ flex: 1 }}>
                              {message.freelancerName}
                            </Typography>
                            {message.unread > 0 && (
                              <Badge
                                badgeContent={message.unread}
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
                            {message.lastMessage}
                          </Typography>
                          <Typography variant='caption' color='text.disabled'>
                            {message.timestamp}
                          </Typography>
                        </Box>
                      </Stack>
                    </Button>
                  ))}
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
                  <Typography variant='h6' fontWeight={600}>
                    Notifications
                  </Typography>
                  <Chip
                    label={`${notifications.filter(n => n.unread).length} new`}
                    size='small'
                    sx={{
                      height: 20,
                      fontSize: 9,
                      fontWeight: 500,
                      bgcolor: "#ea580c",
                      color: "white",
                    }}
                  />
                </Stack>

                <Stack spacing={1}>
                  {notifications.map(notification => (
                    <Paper
                      elevation={0}
                      key={notification.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: notification.unread ? "rgba(234, 88, 12, 0.05)" : "rgba(0,0,0,0.02)",
                        border: "1px solid",
                        borderColor: notification.unread ? "rgba(234, 88, 12, 0.2)" : "transparent",
                      }}>
                      <Stack direction='row' spacing={1}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor:
                              notification.type === "proposal"
                                ? "#2563eb"
                                : notification.type === "delivery"
                                ? "#16a34a"
                                : "#9333ea",
                            mt: 0.75,
                            flexShrink: 0,
                          }}
                        />
                        <Box flex={1} minWidth={0}>
                          <Typography variant='caption' fontWeight={600} display='block' mb={0.25}>
                            {notification.title}
                          </Typography>
                          <Typography variant='caption' color='text.secondary' display='block' mb={0.5}>
                            {notification.message}
                          </Typography>
                          <Typography variant='caption' color='text.disabled'>
                            {notification.time}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>

                <Button
                  fullWidth
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
