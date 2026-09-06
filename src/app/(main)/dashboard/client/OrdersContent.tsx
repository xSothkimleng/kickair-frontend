"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Box, Typography, Button, Card, CardContent, Avatar, Stack, Chip, Grid, CircularProgress, Alert } from "@mui/material";
import { Message as MessageCircleIcon, NotificationsActive as ActionIcon, Cancel as CancelIcon, HandshakeOutlined as OfferIcon } from "@mui/icons-material";
import { api } from "@/lib/api";
import { qk } from "@/lib/queryKeys";
import { Order, OrderStatus, MyOrdersResponse } from "@/types/order";
import { CustomOrder } from "@/types/customOrder";
import { DatePicker } from "@/components/ui/inputs";
import { useMyCustomOrders, useCoInvalidate } from "@/components/customOrders/hooks";
import { initials } from "@/components/customOrders/kit";

const toYmd = (d: Date | null) => (d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` : "");

const isNewOffer = (r: CustomOrder) => r.status === "offered" && !r.client_read_at;

/** Orders and negotiation-phase custom requests/offers interleave in one list. */
type Row = { kind: "order"; at: string; order: Order } | { kind: "request"; at: string; request: CustomOrder };

export default function OrdersContent() {
  const router = useRouter();
  const coInvalidate = useCoInvalidate();
  const [activeFilter, setActiveFilter] = useState<"all" | "requests" | OrderStatus>("all");
  const [requestActionLoading, setRequestActionLoading] = useState<number | null>(null);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  const { data: orders = [], isLoading: ordersLoading, error: queryError } = useQuery({
    queryKey: qk.orders.list("client", { from: toYmd(fromDate), to: toYmd(toDate) }),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (fromDate) params.set("from", toYmd(fromDate));
      if (toDate) params.set("to", toYmd(toDate));
      const qs = params.toString();
      const response: MyOrdersResponse = await api.get(`/api/my-orders${qs ? `?${qs}` : ""}`);
      return response.data;
    },
  });
  const { data: allRequests = [], isLoading: requestsLoading } = useMyCustomOrders();
  const loading = ordersLoading || requestsLoading;
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to fetch orders") : null;

  // Accepted offers on the unified flow already live in the orders list as real
  // orders — everything else (awaiting offer / offer received / declined /
  // withdrawn / legacy milestone) rows here.
  const inDateRange = (iso: string) => {
    const t = new Date(iso);
    if (fromDate) {
      const f = new Date(fromDate);
      f.setHours(0, 0, 0, 0);
      if (t < f) return false;
    }
    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      if (t > end) return false;
    }
    return true;
  };
  const requests = allRequests.filter((r: CustomOrder) => !(r.status === "accepted" && r.flow === "order") && inDateRange(r.created_at));
  const newOfferCount = requests.filter(isNewOffer).length;

  const filteredOrders = activeFilter === "requests" ? [] : orders.filter(order => {
    if (activeFilter === "all") return true;
    return order.status === activeFilter;
  });
  const filteredRequests = activeFilter === "all" || activeFilter === "requests" ? requests : [];

  const rows: Row[] = [
    ...filteredOrders.map((order): Row => ({ kind: "order", at: order.created_at, order })),
    ...filteredRequests.map((request): Row => ({ kind: "request", at: request.created_at, request })),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "active":
        return { bgcolor: "rgba(37, 99, 235, 0.1)", color: "#1e40af" };
      case "pending":
        return { bgcolor: "rgba(234, 88, 12, 0.1)", color: "#b45309" };
      case "delivered":
        return { bgcolor: "rgba(124, 58, 237, 0.1)", color: "#6d28d9" };
      case "revision_requested":
        return { bgcolor: "rgba(234, 88, 12, 0.1)", color: "#b45309" };
      case "disputed":
        return { bgcolor: "rgba(239, 68, 68, 0.1)", color: "#b91c1c" };
      case "completed":
        return { bgcolor: "rgba(22, 163, 74, 0.1)", color: "#15803d" };
      case "cancelled":
        return { bgcolor: "rgba(239, 68, 68, 0.1)", color: "#b91c1c" };
      default:
        return { bgcolor: "rgba(0,0,0,0.1)", color: "rgba(0,0,0,0.6)" };
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    const labels: Record<OrderStatus, string> = {
      active: "Active",
      pending: "Pending",
      delivered: "Delivered",
      revision_requested: "Revision",
      disputed: "Disputed",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    return labels[status] ?? status;
  };

  // Client-side view of a negotiation-phase custom order. Once accepted (legacy
  // milestone flow) the real state lives on the linked order, so mirror it.
  const getRequestChip = (r: CustomOrder): { label: string; bgcolor: string; color: string } => {
    switch (r.status) {
      case "pending":
        return { label: "Awaiting offer", bgcolor: "rgba(234, 88, 12, 0.1)", color: "#b45309" };
      case "offered":
        return { label: "Offer received", bgcolor: "rgba(37, 99, 235, 0.1)", color: "#1e40af" };
      case "accepted":
        if (r.order?.status === "completed") return { label: "Completed", bgcolor: "rgba(22, 163, 74, 0.1)", color: "#15803d" };
        if (r.order?.status === "cancelled") return { label: "Ended", bgcolor: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.55)" };
        return { label: "Active", bgcolor: "rgba(37, 99, 235, 0.1)", color: "#1e40af" };
      case "declined":
        return { label: "Declined", bgcolor: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.55)" };
      case "withdrawn":
        return { label: "Withdrawn", bgcolor: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.55)" };
      case "expired":
        return { label: "Expired", bgcolor: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.55)" };
      default:
        return { label: r.status, bgcolor: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.55)" };
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
    router.push(`/dashboard/orders/${order.id}`);
  };

  const handleWithdrawRequest = async (requestId: number) => {
    try {
      setRequestActionLoading(requestId);
      await api.withdrawCustomOrder(requestId);
      await coInvalidate();
    } catch (err) {
      console.error("Failed to withdraw request:", err);
    } finally {
      setRequestActionLoading(null);
    }
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
          My Orders
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track your orders, custom requests and offers
        </Typography>
      </Box>

      {/* Filters */}
      <Stack direction="row" spacing={1} mb={3} flexWrap="wrap" useFlexGap>
        {(["all", "requests", "pending", "active", "delivered", "revision_requested", "disputed", "completed", "cancelled"] as const).map(filter => (
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
            {filter === "requests" && newOfferCount > 0 && (
              <Box component="span"
                sx={{ ml: 0.75, px: 0.75, py: 0.1, borderRadius: 8, fontSize: 10.5, fontWeight: 700, bgcolor: activeFilter === filter ? "rgba(255,255,255,0.25)" : "rgba(37, 99, 235, 0.12)", color: activeFilter === filter ? "white" : "#1e40af" }}>
                {newOfferCount} new
              </Box>
            )}
          </Button>
        ))}
      </Stack>

      {/* Date range */}
      <Stack direction="row" spacing={1.5} mb={3} alignItems="flex-end" flexWrap="wrap" useFlexGap>
        <Box sx={{ width: 190 }}>
          <DatePicker label="From" placeholder="Any date" value={fromDate} onChange={setFromDate} maxDate={toDate ?? undefined} />
        </Box>
        <Box sx={{ width: 190 }}>
          <DatePicker label="To" placeholder="Any date" value={toDate} onChange={setToDate} minDate={fromDate ?? undefined} />
        </Box>
        {(fromDate || toDate) && (
          <Button onClick={() => { setFromDate(null); setToDate(null); }}
            sx={{ fontSize: 12, textTransform: "none", color: "rgba(0,0,0,0.6)", mb: 0.5 }}>
            Clear dates
          </Button>
        )}
      </Stack>

      {/* Unified list — orders and custom requests/offers interleaved by date */}
      {rows.length === 0 ? (
        <Box textAlign="center" py={6}>
          <Typography color="text.secondary">
            {activeFilter === "requests" ? "No custom requests or offers found" : "No orders found"}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {rows.map(row => {
            if (row.kind === "request") {
              const r = row.request;
              const isLoading = requestActionLoading === r.id;
              const chip = getRequestChip(r);
              const hasOffer = r.status !== "pending" && !!r.offer;
              const price = hasOffer && r.offer ? r.offer.total : r.budget;
              const timelineDays = hasOffer && r.offer ? r.offer.delivery_days : r.desired_timeline_days;

              return (
                <Card
                  elevation={0}
                  key={`req-${r.id}`}
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
                        <Box sx={{ position: "relative", alignSelf: "flex-start" }}>
                          <Avatar sx={{ width: 50, height: 50, bgcolor: "black", fontSize: 15, fontWeight: 600 }}>
                            {initials(r.freelancer.name)}
                          </Avatar>
                          {isNewOffer(r) && (
                            <Box sx={{ position: "absolute", top: 0, right: 0, width: 10, height: 10, borderRadius: "50%", bgcolor: "#0071e3", boxShadow: "0 0 0 2px #fff" }} />
                          )}
                        </Box>
                        <Box flex={1}>
                          <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                            <Typography variant="body1" fontWeight={600}>
                              {r.service.title ?? "Custom request"}
                            </Typography>
                            <Chip label="Request" size="small" sx={{ height: 20, fontSize: 11, fontWeight: 600, bgcolor: "rgba(0,0,0,0.06)" }} />
                          </Stack>
                          <Typography variant="body2" color="text.secondary" mb={1}>
                            by {r.freelancer.name ?? "Unknown"}
                          </Typography>
                          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                            <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 700, color: "rgba(0,0,0,0.55)" }}>
                              {`REQ-${String(r.id).padStart(6, "0")}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              •
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Request Date: {formatDate(r.created_at)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              •
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Timeline: {timelineDays ? `${timelineDays} days` : "Custom scope"}
                            </Typography>
                          </Stack>
                        </Box>
                      </Stack>
                      <Box textAlign="right">
                        <Typography variant="h6" fontWeight={600} mb={1}>
                          ${Number(price).toLocaleString()}
                        </Typography>
                        <Chip
                          label={chip.label}
                          size="small"
                          sx={{
                            fontSize: 11,
                            height: 24,
                            bgcolor: chip.bgcolor,
                            color: chip.color,
                          }}
                        />
                      </Box>
                    </Stack>

                    {/* Offer received banner */}
                    {r.status === "offered" && (
                      <Alert
                        icon={<ActionIcon sx={{ fontSize: 16 }} />}
                        severity="info"
                        sx={{ mb: 2, py: 0.5, fontSize: 12, borderRadius: 2, bgcolor: "rgba(0, 113, 227, 0.06)", color: "#1e40af", border: "1px solid rgba(0, 113, 227, 0.2)", "& .MuiAlert-icon": { color: "#0071e3" } }}>
                        Custom offer received — review and accept to start the order
                      </Alert>
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
                      {/* View Details - always visible; opens the request/offer detail */}
                      <Grid size={r.status === "pending" || r.status === "offered" ? 6 : 12}>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => router.push(`/dashboard/custom-orders/${r.id}`)}
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

                      {/* Offered: Review offer (accept / decline happens on the detail page) */}
                      {r.status === "offered" && (
                        <Grid size={6}>
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={<OfferIcon sx={{ fontSize: 14 }} />}
                            onClick={() => router.push(`/dashboard/custom-orders/${r.id}`)}
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
                            Review offer
                          </Button>
                        </Grid>
                      )}

                      {/* Pending: Withdraw the request */}
                      {r.status === "pending" && (
                        <Grid size={6}>
                          <Button
                            fullWidth
                            variant="contained"
                            disabled={isLoading}
                            startIcon={isLoading ? <CircularProgress size={14} /> : <CancelIcon sx={{ fontSize: 14 }} />}
                            onClick={() => handleWithdrawRequest(r.id)}
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
                            Withdraw
                          </Button>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              );
            }

            const order = row.order;
            const isCustom = !!order.custom_order_id;
            const isJobBased = !order.pricing_option_id && !isCustom;
            const orderTitle = order.service?.title ?? order.proposal?.job_post?.title ?? "Order";
            const freelancer = order.freelancer ?? order.proposal?.freelancer_profile;
            const orderPrice = order.pricing_option?.price ?? order.price ?? "0";
            const deliveryLabel = isCustom
              ? "Custom scope"
              : isJobBased
                ? `${order.proposal?.timeline_days ?? "N/A"} days (timeline)`
                : `${order.pricing_option?.delivery_time ?? "N/A"} days`;

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
                      src={freelancer?.user?.avatar_url || undefined}
                      alt={freelancer?.user?.name || "Freelancer"}
                      sx={{ width: 50, height: 50 }}
                    />
                    <Box flex={1}>
                      <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                        <Typography variant="body1" fontWeight={600}>
                          {orderTitle}
                        </Typography>
                        {isCustom && <Chip label="Custom" size="small" sx={{ height: 20, fontSize: 11, fontWeight: 600, bgcolor: "rgba(0,0,0,0.06)" }} />}
                      </Stack>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        by {freelancer?.user?.name || "Unknown"}
                      </Typography>
                      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                        <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 700, color: "rgba(0,0,0,0.55)" }}>
                          {order.reference ?? `ORD-${String(order.id).padStart(6, "0")}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          •
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Order Date: {formatDate(order.created_at)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          •
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {isJobBased ? "Timeline" : "Delivery"}: {deliveryLabel}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                  <Box textAlign="right">
                    <Typography variant="h6" fontWeight={600} mb={1}>
                      ${orderPrice}
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

                {/* Delivery received banner */}
                {order.status === "delivered" && (
                  <Alert
                    icon={<ActionIcon sx={{ fontSize: 16 }} />}
                    severity="info"
                    sx={{ mb: 2, py: 0.5, fontSize: 12, borderRadius: 2, bgcolor: "rgba(0, 113, 227, 0.06)", color: "#1e40af", border: "1px solid rgba(0, 113, 227, 0.2)", "& .MuiAlert-icon": { color: "#0071e3" } }}>
                    Work delivered — please review and approve or request a revision
                  </Alert>
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
                  <Grid size={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<MessageCircleIcon sx={{ fontSize: 14 }} />}
                      onClick={() => order.conversation_id && router.push(`/dashboard/client/messages?id=${order.conversation_id}`)}
                      disabled={!order.conversation_id}
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
          );
          })}
        </Stack>
      )}

    </Box>
  );
}
