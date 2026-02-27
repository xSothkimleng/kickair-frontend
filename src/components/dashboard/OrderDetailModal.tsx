"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Avatar,
  Stack,
  Chip,
  Button,
  Card,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Close as CloseIcon,
  AccessTime as DeliveryIcon,
  Refresh as RevisionIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  ChatBubbleOutline as MessageIcon,
  CheckCircle as CheckIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  RateReview as ReviewIcon,
} from "@mui/icons-material";
import { Order, OrderStatus, Review } from "@/types/order";
import { useAuth } from "@/components/context/AuthContext";
import { api } from "@/lib/api";

interface OrderDetailModalProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onReviewSubmitted?: (orderId: number, review: Review) => void;
}

function InteractiveStars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <Box sx={{ display: "flex", gap: 0.5 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <IconButton
          key={star}
          size="small"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          disableRipple
          sx={{ p: 0.25, color: star <= display ? "#f59e0b" : "rgba(0,0,0,0.2)" }}
        >
          {star <= display ? (
            <StarIcon sx={{ fontSize: 28 }} />
          ) : (
            <StarBorderIcon sx={{ fontSize: 28 }} />
          )}
        </IconButton>
      ))}
    </Box>
  );
}

function ReadonlyStars({ rating }: { rating: number }) {
  return (
    <Box sx={{ display: "flex", gap: 0.25 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          sx={{ fontSize: 16, color: star <= rating ? "#f59e0b" : "rgba(0,0,0,0.15)" }}
        />
      ))}
    </Box>
  );
}

export default function OrderDetailModal({ open, order, onClose, onReviewSubmitted }: OrderDetailModalProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!order) return null;

  const canReview =
    user?.is_client === true &&
    user.client_profile?.id === order.client_profile_id &&
    order.status === "completed" &&
    order.review === null;

  const showSubmittedReview =
    order.status === "completed" && order.review !== null;

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
      pending: "Pending",
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      setSubmitError("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await api.submitReview(order.id, {
        rating,
        comment: comment.trim() || undefined,
      });
      onReviewSubmitted?.(order.id, response.data);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const service = order.service || order.pricing_option?.service;
  const freelancer = order.freelancer || order.pricing_option?.service?.freelancer_profile;
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
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
          borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.5)", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Order #{order.id}
          </Typography>
          <Typography sx={{ fontSize: 17, fontWeight: 600 }}>Order Details</Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: "rgba(0, 0, 0, 0.5)", "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" } }}
        >
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
          <Card elevation={0} sx={{ p: 2.5, bgcolor: "#F5F5F7", borderRadius: 3 }}>
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

          {/* Freelancer Info */}
          <Card elevation={0} sx={{ p: 2.5, border: "1px solid rgba(0, 0, 0, 0.08)", borderRadius: 3 }}>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.5)", textTransform: "uppercase", letterSpacing: 0.5, mb: 1.5 }}>
              Service Provider
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={freelancer?.user?.avatar_url || undefined}
                alt={freelancer?.user?.name || "Freelancer"}
                sx={{ width: 48, height: 48 }}
              >
                {freelancer?.user?.name?.charAt(0) || "?"}
              </Avatar>
              <Box flex={1}>
                <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 0.5 }}>{freelancer?.user?.name || "Unknown"}</Typography>
                <Stack spacing={0.5}>
                  {freelancer?.user?.email && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <EmailIcon sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.4)" }} />
                      <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>{freelancer.user.email}</Typography>
                    </Box>
                  )}
                  {freelancer?.user?.telephone && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <PhoneIcon sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.4)" }} />
                      <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>{freelancer.user.telephone}</Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Stack>
          </Card>

          {/* Package & Price */}
          <Card elevation={0} sx={{ p: 2.5, border: "1px solid rgba(0, 0, 0, 0.08)", borderRadius: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
              <Box>
                <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.5)", textTransform: "uppercase", letterSpacing: 0.5, mb: 0.5 }}>
                  Package
                </Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{pricingOption?.title || "Standard"}</Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.5)", mb: 0.5 }}>Total</Typography>
                <Typography sx={{ fontSize: 20, fontWeight: 600 }}>${pricingOption?.price || "0"}</Typography>
              </Box>
            </Box>
            {pricingOption?.description && (
              <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 2, lineHeight: 1.5 }}>
                {pricingOption.description}
              </Typography>
            )}
            <Box sx={{ display: "flex", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.5, py: 1, bgcolor: "rgba(0, 0, 0, 0.03)", borderRadius: 2 }}>
                <DeliveryIcon sx={{ fontSize: 14, color: "rgba(0, 0, 0, 0.5)" }} />
                <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.7)" }}>
                  {pricingOption?.delivery_time || "N/A"} day{Number(pricingOption?.delivery_time) !== 1 ? "s" : ""}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.5, py: 1, bgcolor: "rgba(0, 0, 0, 0.03)", borderRadius: 2 }}>
                <RevisionIcon sx={{ fontSize: 14, color: "rgba(0, 0, 0, 0.5)" }} />
                <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.7)" }}>
                  {Number(pricingOption?.revisions) === -1 ? "Unlimited" : pricingOption?.revisions || "N/A"} revision
                  {Number(pricingOption?.revisions) !== 1 ? "s" : ""}
                </Typography>
              </Box>
            </Box>
          </Card>

          {/* Timeline */}
          <Card elevation={0} sx={{ p: 2.5, bgcolor: "#F5F5F7", borderRadius: 3 }}>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.5)", textTransform: "uppercase", letterSpacing: 0.5, mb: 1.5 }}>
              Timeline
            </Typography>
            <Stack spacing={1.5}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#0071e3" }} />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 500 }}>Order Placed</Typography>
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

          {/* ── Review Section ── */}
          {showSubmittedReview && order.review && (
            <Card elevation={0} sx={{ p: 2.5, border: "1px solid rgba(22, 163, 74, 0.2)", bgcolor: "rgba(22, 163, 74, 0.03)", borderRadius: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                <ReviewIcon sx={{ fontSize: 16, color: "#16a34a" }} />
                <Typography sx={{ fontSize: 11, color: "#16a34a", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>
                  Your Review
                </Typography>
              </Box>
              <ReadonlyStars rating={order.review.rating} />
              {order.review.comment && (
                <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.7)", mt: 1, lineHeight: 1.6 }}>
                  {order.review.comment}
                </Typography>
              )}
              <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.4)", mt: 1 }}>
                {formatDate(order.review.created_at)}
              </Typography>
            </Card>
          )}

          {canReview && (
            <Card elevation={0} sx={{ p: 2.5, border: "1px solid rgba(0,113,227,0.2)", bgcolor: "rgba(0,113,227,0.03)", borderRadius: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <ReviewIcon sx={{ fontSize: 16, color: "#0071e3" }} />
                <Typography sx={{ fontSize: 11, color: "#0071e3", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>
                  Leave a Review
                </Typography>
              </Box>

              <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.6)", mb: 1.5 }}>
                How was your experience with this freelancer?
              </Typography>

              <Box sx={{ mb: 2 }}>
                <InteractiveStars value={rating} onChange={setRating} />
              </Box>

              <TextField
                multiline
                rows={3}
                fullWidth
                placeholder="Share your experience (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                inputProps={{ maxLength: 1000 }}
                sx={{
                  mb: 1,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    fontSize: 13,
                    "& fieldset": { borderColor: "rgba(0,0,0,0.12)" },
                    "&:hover fieldset": { borderColor: "rgba(0,0,0,0.25)" },
                    "&.Mui-focused fieldset": { borderColor: "#0071e3" },
                  },
                }}
              />
              <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.4)", textAlign: "right", mb: 1.5 }}>
                {comment.length}/1000
              </Typography>

              {submitError && (
                <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2, fontSize: 13 }}>
                  {submitError}
                </Alert>
              )}

              <Button
                fullWidth
                variant="contained"
                onClick={handleSubmitReview}
                disabled={submitting}
                sx={{
                  height: 40,
                  bgcolor: "#0071e3",
                  fontSize: 13,
                  fontWeight: 500,
                  borderRadius: 28,
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#0077ED", boxShadow: "none" },
                  "&.Mui-disabled": { bgcolor: "rgba(0,0,0,0.1)", color: "rgba(0,0,0,0.4)" },
                }}
              >
                {submitting ? <CircularProgress size={16} sx={{ color: "white" }} /> : "Submit Review"}
              </Button>
            </Card>
          )}

          {/* Action Button */}
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
              "&:hover": { bgcolor: "#0077ED", boxShadow: "none" },
            }}
          >
            Message Freelancer
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
