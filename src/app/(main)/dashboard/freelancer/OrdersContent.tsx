"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { css } from "styled-system/css";
import { MessageCircle, CheckCircle2, XCircle, Send, RotateCcw, Hourglass, Plus, Tag } from "lucide-react";
import { Spinner } from "@/components/ds";
import { api } from "@/lib/api";
import { qk } from "@/lib/queryKeys";
import { Order, OrderStatus, FreelancerOrdersResponse } from "@/types/order";
import { CustomOrder } from "@/types/customOrder";
import { DatePicker } from "@/components/ui/inputs";
import { useIncomingCustomOrders, useCoInvalidate } from "@/components/customOrders/hooks";
import { initials } from "@/components/customOrders/kit";
import DirectOfferDialog from "@/components/customOrders/DirectOfferDialog";
import {
  ListAvatar, alertIconCss, alertMsgCss, alertWarnCss, avatarStackCss, blueDotCss, byline,
  cardBody, cardCss, centerBox, chipNeutral, clearBtnCss, colCss, dateFieldCss, dateRowCss,
  emptyTextCss, errorTextCss, filterBtn, filterNew, filterRowCss, gridCellCss, gridCss, h5Css,
  headRowCss, listBtn, listCss, metaMonoCss, metaMutedCss, metaRowCss, pageHeadRowCss, priceCss,
  proposeBtnCss, rightColCss, startIconCss, statusChipCss, subCss, titleCss, titleRowCss,
} from "@/components/dashboard/orderListKit";

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
      <div className={centerBox}>
        <Spinner size={40} style={{ color: "#1976d2" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={centerBox}>
        <p className={errorTextCss}>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className={pageHeadRowCss}>
        <div>
          <h5 className={h5Css}>
            Orders
          </h5>
          <p className={subCss}>
            Manage orders and custom requests from your clients
          </p>
        </div>
        {/* Freelancer-initiated path: draft an offer for a client who can't (or
            won't) write the request themselves. The client still has to accept. */}
        <button type="button" onClick={() => setProposing(true)} className={proposeBtnCss}>
          <span className={startIconCss}><Plus size={20} /></span>
          Propose custom order
        </button>
      </div>

      <DirectOfferDialog open={proposing} onClose={() => setProposing(false)} />

      {/* Filters */}
      <div className={filterRowCss}>
        {(["all", "requests", "pending", "active", "delivered", "revision_requested", "disputed", "completed", "cancelled"] as const).map(filter => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={filterBtn({ on: activeFilter === filter })}>
            {filter}
            {filter === "requests" && newRequestCount > 0 && (
              <span className={filterNew({ look: activeFilter === filter ? "orangeOn" : "orangeOff" })}>
                {newRequestCount} new
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Date range */}
      <div className={dateRowCss}>
        <div className={dateFieldCss}>
          <DatePicker label="From" placeholder="Any date" value={fromDate} onChange={setFromDate} maxDate={toDate ?? undefined} />
        </div>
        <div className={dateFieldCss}>
          <DatePicker label="To" placeholder="Any date" value={toDate} onChange={setToDate} minDate={fromDate ?? undefined} />
        </div>
        {(fromDate || toDate) && (
          <button type="button" onClick={() => { setFromDate(null); setToDate(null); }} className={clearBtnCss}>
            Clear dates
          </button>
        )}
      </div>

      {/* Unified list — orders and custom requests interleaved by date */}
      {rows.length === 0 ? (
        <div className={emptyTextCss}>
          <p>
            {activeFilter === "requests" ? "No custom requests found" : "No orders found"}
          </p>
        </div>
      ) : (
        <div className={listCss}>
          {rows.map(row => {
            if (row.kind === "request") {
              const r = row.request;
              const isLoading = requestActionLoading === r.id;
              const chip = getRequestChip(r);
              const price = r.status === "offered" && r.offer ? r.offer.total : r.budget;
              const timelineDays = r.status === "offered" && r.offer ? r.offer.delivery_days : r.desired_timeline_days;

              return (
                <div key={`req-${r.id}`} className={cardCss}>
                  <div className={cardBody}>
                    <div className={headRowCss}>
                      <div className={avatarStackCss}>
                        <div className={css({ position: "relative", alignSelf: "flex-start" })}>
                          <ListAvatar initials={initials(r.client.name)} />
                          {isNewRequest(r) && <span className={blueDotCss} />}
                        </div>
                        <div className={colCss}>
                          <div className={titleRowCss}>
                            <p className={titleCss}>
                              {r.service.title ?? "Custom request"}
                            </p>
                            <span className={chipNeutral}>Request</span>
                          </div>
                          <p className={byline}>
                            Client: {r.client.name ?? "Unknown"}
                          </p>
                          <div className={metaRowCss}>
                            <span className={metaMonoCss}>
                              {`REQ-${String(r.id).padStart(6, "0")}`}
                            </span>
                            <span className={metaMutedCss}>
                              •
                            </span>
                            <span className={metaMutedCss}>
                              Request Date: {formatDate(r.created_at)}
                            </span>
                            <span className={metaMutedCss}>
                              •
                            </span>
                            <span className={metaMutedCss}>
                              Timeline: {timelineDays ? `${timelineDays} days` : "Custom scope"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={rightColCss}>
                        <h6 className={priceCss}>
                          ${Number(price).toLocaleString()}
                        </h6>
                        <span className={statusChipCss} style={{ backgroundColor: chip.bgcolor, color: chip.color }}>
                          {chip.label}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className={gridCss}>
                      {/* View Details - always visible; opens the request/offer detail */}
                      <div className={gridCellCss} style={{ gridColumn: r.status === "pending" ? "span 4" : "span 12" }}>
                        <button
                          type="button"
                          onClick={() => router.push(`/dashboard/custom-orders/${r.id}`)}
                          className={listBtn({ tone: "grey" })}>
                          View Details
                        </button>
                      </div>

                      {/* Pending: Make an offer & Decline */}
                      {r.status === "pending" && (
                        <>
                          <div className={gridCellCss} style={{ gridColumn: "span 4" }}>
                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() => router.push(`/dashboard/custom-orders/${r.id}?compose=1`)}
                              className={listBtn({ tone: "green" })}>
                              <span className={startIconCss}>{isLoading ? <Spinner size={14} /> : <Tag size={20} />}</span>
                              Make an offer
                            </button>
                          </div>
                          <div className={gridCellCss} style={{ gridColumn: "span 4" }}>
                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() => handleDeclineRequest(r.id)}
                              className={listBtn({ tone: "red" })}>
                              <span className={startIconCss}>{isLoading ? <Spinner size={14} /> : <XCircle size={20} />}</span>
                              Decline
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
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
              <div key={order.id} className={cardCss}>
                <div className={cardBody}>
                  <div className={headRowCss}>
                    <div className={avatarStackCss}>
                      <ListAvatar src={client?.user?.avatar_url || undefined} alt={client?.user?.name || "Client"} />
                      <div className={colCss}>
                        <div className={titleRowCss}>
                          <p className={titleCss}>
                            {orderTitle}
                          </p>
                          {isCustom && <span className={chipNeutral}>Custom</span>}
                        </div>
                        <p className={byline}>
                          Client: {client?.user?.name || "Unknown"}
                        </p>
                        <div className={metaRowCss}>
                          <span className={metaMonoCss}>
                            {order.reference ?? `ORD-${String(order.id).padStart(6, "0")}`}
                          </span>
                          <span className={metaMutedCss}>
                            •
                          </span>
                          <span className={metaMutedCss}>
                            Order Date: {formatDate(order.created_at)}
                          </span>
                          <span className={metaMutedCss}>
                            •
                          </span>
                          <span className={metaMutedCss}>
                            {isJobBased ? "Timeline" : "Delivery"}: {deliveryLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={rightColCss}>
                      <h6 className={priceCss}>
                        ${orderPrice}
                      </h6>
                      <span className={statusChipCss} style={{ backgroundColor: getStatusColor(order.status).bgcolor, color: getStatusColor(order.status).color }}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                  </div>

                  {/* Awaiting approval banner */}
                  {order.status === "delivered" && (
                    <div className={alertWarnCss}>
                      <span className={alertIconCss} style={{ color: "#d97706" }}><Hourglass size={16} /></span>
                      <div className={alertMsgCss}>Awaiting client approval — delivery submitted</div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className={gridCss}>
                    {/* View Details - always visible */}
                    <div className={gridCellCss} style={{ gridColumn: order.status === "pending" ? "span 3" : (order.status === "active" || order.status === "revision_requested") ? "span 4" : "span 6" }}>
                      <button
                        type="button"
                        onClick={() => handleViewDetails(order)}
                        className={listBtn({ tone: "grey" })}>
                        View Details
                      </button>
                    </div>

                    {/* Message Client - always visible */}
                    <div className={gridCellCss} style={{ gridColumn: order.status === "pending" ? "span 3" : (order.status === "active" || order.status === "revision_requested") ? "span 4" : "span 6" }}>
                      <button
                        type="button"
                        onClick={() => order.conversation_id && router.push(`/dashboard/freelancer/messages?id=${order.conversation_id}`)}
                        disabled={!order.conversation_id}
                        className={listBtn({ tone: "blue" })}>
                        <span className={startIconCss}><MessageCircle size={20} /></span>
                        Message
                      </button>
                    </div>

                    {/* Pending: Accept & Cancel */}
                    {order.status === "pending" && (
                      <>
                        <div className={gridCellCss} style={{ gridColumn: "span 3" }}>
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleAcceptOrder(order.id)}
                            className={listBtn({ tone: "green" })}>
                            <span className={startIconCss}>{isLoading ? <Spinner size={14} /> : <CheckCircle2 size={20} />}</span>
                            Accept
                          </button>
                        </div>
                        <div className={gridCellCss} style={{ gridColumn: "span 3" }}>
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleCancelOrder(order.id)}
                            className={listBtn({ tone: "red" })}>
                            <span className={startIconCss}>{isLoading ? <Spinner size={14} /> : <XCircle size={20} />}</span>
                            Decline
                          </button>
                        </div>
                      </>
                    )}

                    {/* Active: Submit Delivery */}
                    {order.status === "active" && (
                      <div className={gridCellCss} style={{ gridColumn: "span 4" }}>
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleViewDetails(order)}
                          className={listBtn({ tone: "green" })}>
                          <span className={startIconCss}>{isLoading ? <Spinner size={14} /> : <Send size={20} />}</span>
                          Deliver
                        </button>
                      </div>
                    )}

                    {/* Revision Requested: Resubmit */}
                    {order.status === "revision_requested" && (
                      <div className={gridCellCss} style={{ gridColumn: "span 4" }}>
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleViewDetails(order)}
                          className={listBtn({ tone: "blue" })}>
                          <span className={startIconCss}>{isLoading ? <Spinner size={14} /> : <RotateCcw size={20} />}</span>
                          Resubmit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
