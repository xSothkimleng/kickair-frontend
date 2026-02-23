"use client";

import { useState, useEffect } from "react";
import { Box, Typography, Button, Card, CardContent, Avatar, Stack, Chip, Grid, CircularProgress } from "@mui/material";
import { Message as MessageCircleIcon, CheckCircle as AcceptIcon, Cancel as CancelIcon, Done as CompleteIcon } from "@mui/icons-material";
import { api } from "@/lib/api";
import { Order, OrderStatus, FreelancerOrdersResponse } from "@/types/order";
import FreelancerOrderDetailModal from "@/components/dashboard/FreelancerOrderDetailModal";

export default function OrdersContent() {
  const [activeFilter, setActiveFilter] = useState<"all" | OrderStatus>("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response: FreelancerOrdersResponse = await api.get("/api/freelancer-orders");
      setOrders(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    if (activeFilter === "all") return true;
    return order.status === activeFilter;
  });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "active":
        return { bgcolor: "rgba(37, 99, 235, 0.1)", color: "#1e40af" };
      case "pending":
        return { bgcolor: "rgba(234, 88, 12, 0.1)", color: "#b45309" };
      case "completed":
        return { bgcolor: "rgba(22, 163, 74, 0.1)", color: "#15803d" };
      case "cancelled":
        return { bgcolor: "rgba(239, 68, 68, 0.1)", color: "#b91c1c" };
      default:
        return { bgcolor: "rgba(0,0,0,0.1)", color: "rgba(0,0,0,0.6)" };
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case "active":
        return "Active";
      case "pending":
        return "Pending";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setDetailModalOpen(false);
    setSelectedOrder(null);
  };

  const handleAcceptOrder = async (orderId: number) => {
    try {
      setActionLoading(orderId);
      await api.post(`/api/orders/${orderId}/accept`);
      await fetchOrders();
    } catch (err) {
      console.error("Failed to accept order:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteOrder = async (orderId: number) => {
    try {
      setActionLoading(orderId);
      await api.post(`/api/orders/${orderId}/complete`);
      await fetchOrders();
    } catch (err) {
      console.error("Failed to complete order:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      setActionLoading(orderId);
      await api.post(`/api/orders/${orderId}/cancel`);
      await fetchOrders();
    } catch (err) {
      console.error("Failed to cancel order:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleOrderUpdate = () => {
    fetchOrders();
    handleCloseModal();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={600} mb={0.5}>
          Orders
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage orders from your clients
        </Typography>
      </Box>

      {/* Filters */}
      <Stack direction="row" spacing={1} mb={3}>
        {(["all", "pending", "active", "completed", "cancelled"] as const).map(filter => (
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
      {filteredOrders.length === 0 ? (
        <Box textAlign="center" py={6}>
          <Typography color="text.secondary">No orders found</Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {filteredOrders.map(order => {
            const client = order.client_profile;
            const isLoading = actionLoading === order.id;

            return (
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
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Stack direction="row" spacing={2} flex={1}>
                      <Avatar
                        src={client?.user?.profile_image || undefined}
                        alt={client?.user?.name || "Client"}
                        sx={{ width: 50, height: 50 }}
                      />
                      <Box flex={1}>
                        <Typography variant="body1" fontWeight={600} mb={0.5}>
                          {order.service?.title || order.pricing_option?.service?.title || "Service"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={1}>
                          Client: {client?.user?.name || "Unknown"}
                        </Typography>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Typography variant="caption" color="text.secondary">
                            Order Date: {formatDate(order.created_at)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            •
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Delivery: {order.pricing_option?.delivery_time || "N/A"} days
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>
                    <Box textAlign="right">
                      <Typography variant="h6" fontWeight={600} mb={1}>
                        ${order.pricing_option?.price || "0"}
                      </Typography>
                      <Chip
                        label={getStatusLabel(order.status)}
                        size="small"
                        sx={{
                          fontSize: 11,
                          height: 24,
                          ...getStatusColor(order.status),
                        }}
                      />
                    </Box>
                  </Stack>

                  {/* Actions */}
                  <Grid
                    container
                    spacing={1}
                    sx={{
                      pt: 2,
                      borderTop: "1px solid",
                      borderColor: "rgba(0,0,0,0.08)",
                    }}>
                    {/* View Details - always visible */}
                    <Grid size={order.status === "pending" ? 3 : order.status === "active" ? 4 : 6}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => handleViewDetails(order)}
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

                    {/* Message Client - always visible */}
                    <Grid size={order.status === "pending" ? 3 : order.status === "active" ? 4 : 6}>
                      <Button
                        fullWidth
                        variant="contained"
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
                        Message
                      </Button>
                    </Grid>

                    {/* Pending: Accept & Cancel */}
                    {order.status === "pending" && (
                      <>
                        <Grid size={3}>
                          <Button
                            fullWidth
                            variant="contained"
                            disabled={isLoading}
                            startIcon={isLoading ? <CircularProgress size={14} /> : <AcceptIcon sx={{ fontSize: 14 }} />}
                            onClick={() => handleAcceptOrder(order.id)}
                            sx={{
                              fontSize: 12,
                              textTransform: "none",
                              borderRadius: 10,
                              bgcolor: "#16a34a",
                              color: "white",
                              "&:hover": {
                                bgcolor: "#15803d",
                              },
                            }}>
                            Accept
                          </Button>
                        </Grid>
                        <Grid size={3}>
                          <Button
                            fullWidth
                            variant="contained"
                            disabled={isLoading}
                            startIcon={isLoading ? <CircularProgress size={14} /> : <CancelIcon sx={{ fontSize: 14 }} />}
                            onClick={() => handleCancelOrder(order.id)}
                            sx={{
                              fontSize: 12,
                              textTransform: "none",
                              borderRadius: 10,
                              bgcolor: "#ef4444",
                              color: "white",
                              "&:hover": {
                                bgcolor: "#dc2626",
                              },
                            }}>
                            Decline
                          </Button>
                        </Grid>
                      </>
                    )}

                    {/* Active: Complete & Cancel */}
                    {order.status === "active" && (
                      <Grid size={4}>
                        <Button
                          fullWidth
                          variant="contained"
                          disabled={isLoading}
                          startIcon={isLoading ? <CircularProgress size={14} /> : <CompleteIcon sx={{ fontSize: 14 }} />}
                          onClick={() => handleCompleteOrder(order.id)}
                          sx={{
                            fontSize: 12,
                            textTransform: "none",
                            borderRadius: 10,
                            bgcolor: "#16a34a",
                            color: "white",
                            "&:hover": {
                              bgcolor: "#15803d",
                            },
                          }}>
                          Complete
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* Order Detail Modal */}
      <FreelancerOrderDetailModal
        open={detailModalOpen}
        order={selectedOrder}
        onClose={handleCloseModal}
        onAccept={handleAcceptOrder}
        onComplete={handleCompleteOrder}
        onCancel={handleCancelOrder}
        onOrderUpdate={handleOrderUpdate}
        actionLoading={actionLoading}
      />
    </Box>
  );
}
