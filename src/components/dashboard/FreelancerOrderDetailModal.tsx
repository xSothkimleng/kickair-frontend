"use client";

import { Dialog, DialogContent, IconButton, Box, Typography, Avatar, Stack, Chip, Button, Card, CircularProgress } from "@mui/material";
import {
  Close as CloseIcon,
  AccessTime as DeliveryIcon,
  Refresh as RevisionIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  ChatBubbleOutline as MessageIcon,
  CheckCircle as CheckIcon,
  Done as CompleteIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { Order, OrderStatus } from "@/types/order";

interface FreelancerOrderDetailModalProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onAccept: (orderId: number) => Promise<void>;
  onComplete: (orderId: number) => Promise<void>;
  onCancel: (orderId: number) => Promise<void>;
  onOrderUpdate: () => void;
  actionLoading: number | null;
}

export default function FreelancerOrderDetailModal({
  open,
  order,
  onClose,
  onAccept,
  onComplete,
  onCancel,
  actionLoading,
}: FreelancerOrderDetailModalProps) {
  if (!order) return null;

  const isLoading = actionLoading === order.id;

  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case "active":
        return { bgcolor: "rgba(0, 113, 227, 0.1)", color: "#0071e3" };
      case "pending":
        return { bgcolor: "rgba(234, 88, 12, 0.1)", color: "#ea580c" };
      case "completed":
        return { bgcolor: "rgba(22, 163, 74, 0.1)", color: "#16a34a" };
      case "cancelled":
        return { bgcolor: "rgba(239, 68, 68, 0.1)", color: "#ef4444" };
      default:
        return { bgcolor: "rgba(0, 0, 0, 0.05)", color: "rgba(0, 0, 0, 0.6)" };
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    const labels = {
      active: "In Progress",
      pending: "Pending Approval",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    return labels[status] || status;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const isJobBased = !order.pricing_option_id;
  const service = order.service;
  const client = order.client_profile;
  const pricingOption = order.pricing_option;
  const statusConfig = getStatusConfig(order.status);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          maxHeight: "90vh",
          border: "1px solid rgba(0, 0, 0, 0.08)",
        },
      }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
          borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
        }}>
        <Box>
          <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.5)", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Order #{order.id}
          </Typography>
          <Typography sx={{ fontSize: 17, fontWeight: 600 }}>Order Details</Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "rgba(0, 0, 0, 0.5)",
            "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
          }}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          {/* Status Badge */}
          <Chip
            label={getStatusLabel(order.status)}
            icon={order.status === "completed" ? <CheckIcon sx={{ fontSize: 14 }} /> : undefined}
            size="small"
            sx={{
              alignSelf: "flex-start",
              fontSize: 11,
              fontWeight: 500,
              height: 24,
              ...statusConfig,
              "& .MuiChip-icon": { color: statusConfig.color },
            }}
          />

          {/* Service Info */}
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              bgcolor: "#F5F5F7",
              borderRadius: 3,
            }}>
            <Typography sx={{ fontSize: 15, fontWeight: 600, mb: 0.5 }}>{service?.title || "Service"}</Typography>
            {service?.category && (
              <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.5)", mb: 1.5 }}>
                {service.category.category_name}
              </Typography>
            )}
            {service?.description && (
              <Typography sx={{ fontSize: 13, color: "rgba(0, 0, 0, 0.7)", lineHeight: 1.6, mb: 1.5 }}>
                {service.description.length > 150 ? `${service.description.slice(0, 150)}...` : service.description}
              </Typography>
            )}
            {service?.location && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <LocationIcon sx={{ fontSize: 14, color: "rgba(0, 0, 0, 0.4)" }} />
                <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)" }}>{service.location}</Typography>
              </Box>
            )}
          </Card>

          {/* Client Info */}
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              border: "1px solid rgba(0, 0, 0, 0.08)",
              borderRadius: 3,
            }}>
            <Typography
              sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.5)", textTransform: "uppercase", letterSpacing: 0.5, mb: 1.5 }}>
              Client
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={client?.user?.avatar_url || undefined}
                alt={client?.user?.name || "Client"}
                sx={{ width: 48, height: 48 }}>
                {client?.user?.name?.charAt(0) || "?"}
              </Avatar>
              <Box flex={1}>
                <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 0.5 }}>{client?.user?.name || "Unknown"}</Typography>
                <Stack spacing={0.5}>
                  {client?.user?.email && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <EmailIcon sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.4)" }} />
                      <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>{client.user.email}</Typography>
                    </Box>
                  )}
                  {client?.user?.telephone && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <PhoneIcon sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.4)" }} />
                      <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>{client.user.telephone}</Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Stack>
          </Card>

          {/* Package & Price */}
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              border: "1px solid rgba(0, 0, 0, 0.08)",
              borderRadius: 3,
            }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
              <Box>
                <Typography
                  sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.5)", textTransform: "uppercase", letterSpacing: 0.5, mb: 0.5 }}>
                  {isJobBased ? "Contract" : "Package"}
                </Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                  {pricingOption?.title ?? (isJobBased ? "Job Contract" : "Standard")}
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.5)", mb: 0.5 }}>Earnings</Typography>
                <Typography sx={{ fontSize: 20, fontWeight: 600, color: "#16a34a" }}>
                  ${pricingOption?.price ?? order.price ?? "0"}
                </Typography>
              </Box>
            </Box>

            {pricingOption?.description && (
              <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 2, lineHeight: 1.5 }}>
                {pricingOption.description}
              </Typography>
            )}

            <Box sx={{ display: "flex", gap: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.5,
                  py: 1,
                  bgcolor: "rgba(0, 0, 0, 0.03)",
                  borderRadius: 2,
                }}>
                <DeliveryIcon sx={{ fontSize: 14, color: "rgba(0, 0, 0, 0.5)" }} />
                <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.7)" }}>
                  {isJobBased
                    ? `${order.proposal?.timeline_days ?? "N/A"} day${order.proposal?.timeline_days !== 1 ? "s" : ""} (timeline)`
                    : `${pricingOption?.delivery_time || "N/A"} day${Number(pricingOption?.delivery_time) !== 1 ? "s" : ""}`}
                </Typography>
              </Box>
              {!isJobBased && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.5,
                    py: 1,
                    bgcolor: "rgba(0, 0, 0, 0.03)",
                    borderRadius: 2,
                  }}>
                  <RevisionIcon sx={{ fontSize: 14, color: "rgba(0, 0, 0, 0.5)" }} />
                  <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.7)" }}>
                    {Number(pricingOption?.revisions) === -1 ? "Unlimited" : pricingOption?.revisions || "N/A"} revision
                    {Number(pricingOption?.revisions) !== 1 ? "s" : ""}
                  </Typography>
                </Box>
              )}
            </Box>
          </Card>

          {/* Timeline */}
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              bgcolor: "#F5F5F7",
              borderRadius: 3,
            }}>
            <Typography
              sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.5)", textTransform: "uppercase", letterSpacing: 0.5, mb: 1.5 }}>
              Timeline
            </Typography>
            <Stack spacing={1.5}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#0071e3" }} />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 500 }}>Order Received</Typography>
                  <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.5)" }}>{formatDateTime(order.created_at)}</Typography>
                </Box>
              </Box>
              {order.updated_at !== order.created_at && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "rgba(0, 0, 0, 0.3)" }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 500 }}>Last Updated</Typography>
                    <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.5)" }}>{formatDateTime(order.updated_at)}</Typography>
                  </Box>
                </Box>
              )}
            </Stack>
          </Card>

          {/* Action Buttons */}
          <Stack spacing={1.5}>
            {/* Message Client - always visible */}
            <Button
              fullWidth
              variant="contained"
              startIcon={<MessageIcon sx={{ fontSize: 16 }} />}
              sx={{
                height: 44,
                bgcolor: "#0071e3",
                fontSize: 13,
                fontWeight: 500,
                borderRadius: 28,
                textTransform: "none",
                boxShadow: "none",
                "&:hover": {
                  bgcolor: "#0077ED",
                  boxShadow: "none",
                },
              }}>
              Message Client
            </Button>

            {/* Pending: Accept & Decline */}
            {order.status === "pending" && (
              <Stack direction="row" spacing={1.5}>
                <Button
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <CheckIcon sx={{ fontSize: 16 }} />}
                  onClick={() => onAccept(order.id)}
                  sx={{
                    height: 44,
                    bgcolor: "#16a34a",
                    fontSize: 13,
                    fontWeight: 500,
                    borderRadius: 28,
                    textTransform: "none",
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: "#15803d",
                      boxShadow: "none",
                    },
                  }}>
                  Accept Order
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <CancelIcon sx={{ fontSize: 16 }} />}
                  onClick={() => onCancel(order.id)}
                  sx={{
                    height: 44,
                    bgcolor: "#ef4444",
                    fontSize: 13,
                    fontWeight: 500,
                    borderRadius: 28,
                    textTransform: "none",
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: "#dc2626",
                      boxShadow: "none",
                    },
                  }}>
                  Decline
                </Button>
              </Stack>
            )}

            {/* Active: Complete */}
            {order.status === "active" && (
              <Button
                fullWidth
                variant="contained"
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <CompleteIcon sx={{ fontSize: 16 }} />}
                onClick={() => onComplete(order.id)}
                sx={{
                  height: 44,
                  bgcolor: "#16a34a",
                  fontSize: 13,
                  fontWeight: 500,
                  borderRadius: 28,
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: "#15803d",
                    boxShadow: "none",
                  },
                }}>
                Mark as Complete
              </Button>
            )}
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
