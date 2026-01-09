"use client";

import { useState } from "react";
import { Box, Typography, Button, Card, CardContent, Avatar, Stack, Chip, LinearProgress, Grid } from "@mui/material";
import { Message as MessageCircleIcon } from "@mui/icons-material";

export default function OrdersContent() {
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "completed" | "cancelled">("all");

  const orders = [
    {
      id: 1,
      service: "E-commerce Website Development",
      freelancer: "Sopheak Chan",
      freelancerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
      amount: 1200,
      status: "In Progress",
      orderDate: "Jan 5, 2026",
      dueDate: "Jan 15, 2026",
      progress: 45,
    },
    {
      id: 2,
      service: "Logo Design - Premium Package",
      freelancer: "Sarah Kim",
      freelancerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
      amount: 350,
      status: "Under Review",
      orderDate: "Jan 3, 2026",
      dueDate: "Jan 10, 2026",
      progress: 100,
    },
    {
      id: 3,
      service: "Social Media Marketing Strategy",
      freelancer: "David Lim",
      freelancerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
      amount: 900,
      status: "In Progress",
      orderDate: "Jan 8, 2026",
      dueDate: "Jan 20, 2026",
      progress: 20,
    },
    {
      id: 4,
      service: "Mobile App UI/UX Design",
      freelancer: "Linda Tan",
      freelancerAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
      amount: 1500,
      status: "Completed",
      orderDate: "Dec 15, 2025",
      dueDate: "Jan 2, 2026",
      progress: 100,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return { bgcolor: "rgba(37, 99, 235, 0.1)", color: "#1e40af" };
      case "Under Review":
        return { bgcolor: "rgba(234, 88, 12, 0.1)", color: "#b45309" };
      case "Completed":
        return { bgcolor: "rgba(22, 163, 74, 0.1)", color: "#15803d" };
      case "Cancelled":
        return { bgcolor: "rgba(239, 68, 68, 0.1)", color: "#b91c1c" };
      default:
        return { bgcolor: "rgba(0,0,0,0.1)", color: "rgba(0,0,0,0.6)" };
    }
  };

  return (
    <Box>
      <Box mb={3}>
        <Typography variant='h5' fontWeight={600} mb={0.5}>
          My Orders
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Track and manage all your orders
        </Typography>
      </Box>

      {/* Filters */}
      <Stack direction='row' spacing={1} mb={3}>
        {(["all", "active", "completed", "cancelled"] as const).map(filter => (
          <Button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            sx={{
              fontSize: 12,
              textTransform: "capitalize",
              borderRadius: 10,
              px: 2,
              ...(activeFilter === filter
                ? {
                    bgcolor: "black",
                    color: "white",
                    "&:hover": { bgcolor: "black" },
                  }
                : {
                    bgcolor: "rgba(0,0,0,0.05)",
                    color: "rgba(0,0,0,0.6)",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.1)" },
                  }),
            }}>
            {filter}
          </Button>
        ))}
      </Stack>

      {/* Orders List */}
      <Stack spacing={2}>
        {orders.map(order => (
          <Card
            elevation={0}
            key={order.id}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "rgba(0,0,0,0.08)",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: "rgba(0,0,0,0.2)",
              },
            }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction='row' justifyContent='space-between' alignItems='flex-start' mb={2}>
                <Stack direction='row' spacing={2} flex={1}>
                  <Avatar src={order.freelancerAvatar} alt={order.freelancer} sx={{ width: 50, height: 50 }} />
                  <Box flex={1}>
                    <Typography variant='body1' fontWeight={600} mb={0.5}>
                      {order.service}
                    </Typography>
                    <Typography variant='body2' color='text.secondary' mb={1}>
                      by {order.freelancer}
                    </Typography>
                    <Stack direction='row' spacing={1.5} alignItems='center'>
                      <Typography variant='caption' color='text.secondary'>
                        Order Date: {order.orderDate}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        •
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        Due: {order.dueDate}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
                <Box textAlign='right'>
                  <Typography variant='h6' fontWeight={600} mb={1}>
                    ${order.amount}
                  </Typography>
                  <Chip
                    label={order.status}
                    size='small'
                    sx={{
                      fontSize: 11,
                      height: 24,
                      ...getStatusColor(order.status),
                    }}
                  />
                </Box>
              </Stack>

              {/* Progress Bar */}
              {order.status === "In Progress" && (
                <Box mb={2}>
                  <Stack direction='row' justifyContent='space-between' alignItems='center' mb={1}>
                    <Typography variant='caption' color='text.secondary'>
                      Progress
                    </Typography>
                    <Typography variant='caption' fontWeight={500}>
                      {order.progress}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant='determinate'
                    value={order.progress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: "rgba(0,0,0,0.05)",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: "#2563eb",
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              )}

              {/* Actions */}
              <Grid
                container
                spacing={1}
                sx={{
                  pt: 2,
                  borderTop: "1px solid",
                  borderColor: "rgba(0,0,0,0.08)",
                }}>
                <Grid size={6}>
                  <Button
                    fullWidth
                    variant='contained'
                    sx={{
                      fontSize: 12,
                      textTransform: "none",
                      borderRadius: 10,
                      bgcolor: "rgba(0,0,0,0.05)",
                      color: "black",
                      boxShadow: "none",
                      "&:hover": {
                        bgcolor: "rgba(0,0,0,0.1)",
                        boxShadow: "none",
                      },
                    }}>
                    View Details
                  </Button>
                </Grid>
                <Grid size={6}>
                  <Button
                    fullWidth
                    variant='contained'
                    startIcon={<MessageCircleIcon sx={{ fontSize: 14 }} />}
                    sx={{
                      fontSize: 12,
                      textTransform: "none",
                      borderRadius: 10,
                      bgcolor: "#0071e3",
                      color: "white",
                      "&:hover": {
                        bgcolor: "#0077ED",
                      },
                    }}>
                    Message Freelancer
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
