"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Box, Typography, Button, Card, CardContent, Avatar, Stack, Chip, Grid, CircularProgress, Alert } from "@mui/material";
import { Message as MessageCircleIcon, CheckCircle as AcceptIcon, Cancel as CancelIcon, Send as DeliverIcon, Replay as ResubmitIcon, HourglassTop as WaitingIcon, AddRounded, LocalOfferOutlined as OfferIcon } from "@mui/icons-material";
import { api } from "@/lib/api";
import { qk } from "@/lib/queryKeys";
import { Order, OrderStatus, FreelancerOrdersResponse } from "@/types/order";
import { CustomOrder } from "@/types/customOrder";
import { DatePicker } from "@/components/ui/inputs";
import { useIncomingCustomOrders, useCoInvalidate } from "@/components/customOrders/hooks";
import { initials } from "@/components/customOrders/kit";
import DirectOfferDialog from "@/components/customOrders/DirectOfferDialog";

const toYmd = (d: Date | null) => (d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` : "");

const isNewRequest = (r: CustomOrder) => r.status === "pending" && !r.freelancer_read_at;

/** Orders and negotiation-phase custom requests interleave in one list. */
type Row = { kind: "order"; at: string; order: Order } | { kind: "request"; at: string; request: CustomOrder };

export default function OrdersContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const coInvalidate = useCoInvalidate();
  const [activeFilter, setActiveFilter] = useState<"all" | "requests" | OrderStatus>("all");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [requestActionLoading, setRequestActionLoading] = useState<number | null>(null);
  const [proposing, setProposing] = useState(false);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  const { data: orders = [], isLoading: ordersLoading, error: queryError } = useQuery({
    queryKey: qk.orders.list("freelancer", { from: toYmd(fromDate), to: toYmd(toDate) }),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (fromDate) params.set("from", toYmd(fromDate));
      if (toDate) params.set("to", toYmd(toDate));
      const qs = params.toString();
      const response: FreelancerOrdersResponse = await api.get(`/api/freelancer-orders${qs ? `?${qs}` : ""}`);
      return response.data;
    },
  });
  const { data: allRequests = [], isLoading: requestsLoading } = useIncomingCustomOrders();
  const loading = ordersLoading || requestsLoading;
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to fetch orders") : null;

  // After an action, refresh all order lists/details + wallet + dashboard.
  const fetchOrders = async () => {
    await queryClient.invalidateQueries({ queryKey: qk.orders.all() });
    queryClient.invalidateQueries({ queryKey: qk.wallet() });
    queryClient.invalidateQueries({ queryKey: qk.dashboard.freelancer() });
  };

  // Accepted offers on the unified flow already live in the orders list as real
  // orders — everything else (new / offered / declined / legacy milestone) rows here.
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
  const newRequestCount = requests.filter(isNewRequest).length;

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

  const getRequestChip = (r: CustomOrder): { label: string; bgcolor: string; color: string } => {
    switch (r.status) {
      case "pending":
        return { label: "New request", bgcolor: "rgba(234, 88, 12, 0.1)", color: "#b45309" };
      case "offered":
        return { label: "Offer sent", bgcolor: "rgba(37, 99, 235, 0.1)", color: "#1e40af" };
      case "accepted": // legacy milestone flow — work continues in the Workspace
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
    router.push(`/dashboard/freelancer/orders/${order.id}`);
  };

  const handleAcceptOrder = async (orderId: number) => {
    try {
      setActionLoading(orderId);
      await api.post(`/api/orders/${orderId}/accept`, {});
      await fetchOrders();
    } catch (err) {
      console.error("Failed to accept order:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      setActionLoading(orderId);
      await api.post(`/api/orders/${orderId}/cancel`, {});
      await fetchOrders();
    } catch (err) {
      console.error("Failed to cancel order:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineRequest = async (requestId: number) => {
    try {
      setRequestActionLoading(requestId);
      await api.declineCustomOrder(requestId);
      await coInvalidate();
    } catch (err) {
      console.error("Failed to decline request:", err);
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
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" flexWrap="wrap" useFlexGap gap={1.5} mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={600} mb={0.5}>
            Orders
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage orders and custom requests from your clients
          </Typography>
        </Box>
        {/* Freelancer-initiated path: draft an offer for a client who can't (or
            won't) write the request themselves. The client still has to accept. */}
        <Button onClick={() => setProposing(true)} startIcon={<AddRounded />}
          sx={{ textTransform: "none", fontWeight: 600, fontSize: 13.5, borderRadius: "999px", bgcolor: "black", color: "#fff", px: 2.25, height: 40, boxShadow: "none", "&:hover": { bgcolor: "rgba(0,0,0,0.82)", boxShadow: "none" } }}>
          Propose custom order
        </Button>
      </Stack>

      <DirectOfferDialog open={proposing} onClose={() => setProposing(false)} />

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
            {filter === "requests" && newRequestCount > 0 && (
              <Box component="span"
                sx={{ ml: 0.75, px: 0.75, py: 0.1, borderRadius: 8, fontSize: 10.5, fontWeight: 700, bgcolor: activeFilter === filter ? "rgba(255,255,255,0.25)" : "rgba(234, 88, 12, 0.12)", color: activeFilter === filter ? "white" : "#b45309" }}>
                {newRequestCount} new
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

      {/* Unified list — orders and custom requests interleaved by date */}
      {rows.length === 0 ? (
        <Box textAlign="center" py={6}>
          <Typography color="text.secondary">
            {activeFilter === "requests" ? "No custom requests found" : "No orders found"}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {rows.map(row => {
            if (row.kind === "request") {
              const r = row.request;
              const isLoading = requestActionLoading === r.id;
              const chip = getRequestChip(r);
              const price = r.status === "offered" && r.offer ? r.offer.total : r.budget;
              const timelineDays = r.status === "offered" && r.offer ? r.offer.delivery_days : r.desired_timeline_days;

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
                            {initials(r.client.name)}
                          </Avatar>
                          {isNewRequest(r) && (
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
                            Client: {r.client.name ?? "Unknown"}
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
                      <Grid size={r.status === "pending" ? 4 : 12}>
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

                      {/* Pending: Make an offer & Decline */}
                      {r.status === "pending" && (
                        <>
                          <Grid size={4}>
                            <Button
                              fullWidth
                              variant="contained"
                              disabled={isLoading}
                              startIcon={isLoading ? <CircularProgress size={14} /> : <OfferIcon sx={{ fontSize: 14 }} />}
                              onClick={() => router.push(`/dashboard/custom-orders/${r.id}?compose=1`)}
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
                              Make an offer
                            </Button>
                          </Grid>
                          <Grid size={4}>
                            <Button
                              fullWidth
                              variant="contained"
                              disabled={isLoading}
                              startIcon={isLoading ? <CircularProgress size={14} /> : <CancelIcon sx={{ fontSize: 14 }} />}
                              onClick={() => handleDeclineRequest(r.id)}
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
                    </Grid>
                  </CardContent>
                </Card>
              );
            }

            const order = row.order;
            const client = order.client_profile;
            const isLoading = actionLoading === order.id;
            const isCustom = !!order.custom_order_id;
            const isJobBased = !order.pricing_option_id && !isCustom;
            const orderTitle = order.service?.title ?? order.proposal?.job_post?.title ?? "Order";
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
                        src={client?.user?.avatar_url || undefined}
                        alt={client?.user?.name || "Client"}
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
                          Client: {client?.user?.name || "Unknown"}
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

                  {/* Awaiting approval banner */}
                  {order.status === "delivered" && (
                    <Alert
                      icon={<WaitingIcon sx={{ fontSize: 16 }} />}
                      severity="warning"
                      sx={{ mb: 2, py: 0.5, fontSize: 12, borderRadius: 2, bgcolor: "rgba(234, 179, 8, 0.08)", color: "#92400e", border: "1px solid rgba(234, 179, 8, 0.2)", "& .MuiAlert-icon": { color: "#d97706" } }}>
                      Awaiting client approval — delivery submitted
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
                    {/* View Details - always visible */}
                    <Grid size={order.status === "pending" ? 3 : (order.status === "active" || order.status === "revision_requested") ? 4 : 6}>
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
                    <Grid size={order.status === "pending" ? 3 : (order.status === "active" || order.status === "revision_requested") ? 4 : 6}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<MessageCircleIcon sx={{ fontSize: 14 }} />}
                        onClick={() => order.conversation_id && router.push(`/dashboard/freelancer/messages?id=${order.conversation_id}`)}
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

                    {/* Active: Submit Delivery */}
                    {order.status === "active" && (
                      <Grid size={4}>
                        <Button
                          fullWidth
                          variant="contained"
                          disabled={isLoading}
                          startIcon={isLoading ? <CircularProgress size={14} /> : <DeliverIcon sx={{ fontSize: 14 }} />}
                          onClick={() => handleViewDetails(order)}
                          sx={{
                            fontSize: 12,
                            textTransform: "none",
                            borderRadius: 10,
                            bgcolor: "#16a34a",
                            color: "white",
                            "&:hover": { bgcolor: "#15803d" },
                          }}>
                          Deliver
                        </Button>
                      </Grid>
                    )}

                    {/* Revision Requested: Resubmit */}
                    {order.status === "revision_requested" && (
                      <Grid size={4}>
                        <Button
                          fullWidth
                          variant="contained"
                          disabled={isLoading}
                          startIcon={isLoading ? <CircularProgress size={14} /> : <ResubmitIcon sx={{ fontSize: 14 }} />}
                          onClick={() => handleViewDetails(order)}
                          sx={{
                            fontSize: 12,
                            textTransform: "none",
                            borderRadius: 10,
                            bgcolor: "#0071e3",
                            color: "white",
                            "&:hover": { bgcolor: "#0077ED" },
                          }}>
                          Resubmit
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

    </Box>
  );
}
