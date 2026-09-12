"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { css } from "styled-system/css";
import { MessageCircle, BellRing, XCircle, Handshake } from "lucide-react";
import { Spinner } from "@/components/ds";
import { api } from "@/lib/api";
import { qk } from "@/lib/queryKeys";
import { Order, OrderStatus, MyOrdersResponse } from "@/types/order";
import { CustomOrder } from "@/types/customOrder";
import { DatePicker } from "@/components/ui/inputs";
import { useMyCustomOrders, useCoInvalidate } from "@/components/customOrders/hooks";
import { initials } from "@/components/customOrders/kit";
import {
  ListAvatar, alertIconCss, alertInfoCss, alertMsgCss, avatarStackCss, blueDotCss, byline,
  cardBody, cardCss, centerBox, chipNeutral, clearBtnCss, colCss, dateFieldCss, dateRowCss,
  emptyTextCss, errorTextCss, filterBtn, filterNew, filterRowCss, gridCellCss, gridCss, h5Css,
  headRowCss, headWrapCss, listBtn, listCss, metaMonoCss, metaMutedCss, metaRowCss, priceCss,
  rightColCss, startIconCss, statusChipCss, subCss, titleCss, titleRowCss,
} from "@/components/dashboard/orderListKit";

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
      <div className={headWrapCss}>
        <h5 className={h5Css}>
          My Orders
        </h5>
        <p className={subCss}>
          Track your orders, custom requests and offers
        </p>
      </div>

      {/* Filters */}
      <div className={filterRowCss}>
        {(["all", "requests", "pending", "active", "delivered", "revision_requested", "disputed", "completed", "cancelled"] as const).map(filter => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={filterBtn({ on: activeFilter === filter })}>
            {filter}
            {filter === "requests" && newOfferCount > 0 && (
              <span className={filterNew({ look: activeFilter === filter ? "blueOn" : "blueOff" })}>
                {newOfferCount} new
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

      {/* Unified list — orders and custom requests/offers interleaved by date */}
      {rows.length === 0 ? (
        <div className={emptyTextCss}>
          <p>
            {activeFilter === "requests" ? "No custom requests or offers found" : "No orders found"}
          </p>
        </div>
      ) : (
        <div className={listCss}>
          {rows.map(row => {
            if (row.kind === "request") {
              const r = row.request;
              const isLoading = requestActionLoading === r.id;
              const chip = getRequestChip(r);
              const hasOffer = r.status !== "pending" && !!r.offer;
              const price = hasOffer && r.offer ? r.offer.total : r.budget;
              const timelineDays = hasOffer && r.offer ? r.offer.delivery_days : r.desired_timeline_days;

              return (
                <div key={`req-${r.id}`} className={cardCss}>
                  <div className={cardBody}>
                    <div className={headRowCss}>
                      <div className={avatarStackCss}>
                        <div className={css({ position: "relative", alignSelf: "flex-start" })}>
                          <ListAvatar initials={initials(r.freelancer.name)} />
                          {isNewOffer(r) && <span className={blueDotCss} />}
                        </div>
                        <div className={colCss}>
                          <div className={titleRowCss}>
                            <p className={titleCss}>
                              {r.service.title ?? "Custom request"}
                            </p>
                            <span className={chipNeutral}>Request</span>
                          </div>
                          <p className={byline}>
                            by {r.freelancer.name ?? "Unknown"}
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

                    {/* Offer received banner */}
                    {r.status === "offered" && (
                      <div className={alertInfoCss}>
                        <span className={alertIconCss} style={{ color: "#0071e3" }}><BellRing size={16} /></span>
                        <div className={alertMsgCss}>Custom offer received — review and accept to start the order</div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className={gridCss}>
                      {/* View Details - always visible; opens the request/offer detail */}
                      <div className={gridCellCss} style={{ gridColumn: r.status === "pending" || r.status === "offered" ? "span 6" : "span 12" }}>
                        <button
                          type="button"
                          onClick={() => router.push(`/dashboard/custom-orders/${r.id}`)}
                          className={listBtn({ tone: "grey" })}>
                          View Details
                        </button>
                      </div>

                      {/* Offered: Review offer (accept / decline happens on the detail page) */}
                      {r.status === "offered" && (
                        <div className={gridCellCss} style={{ gridColumn: "span 6" }}>
                          <button
                            type="button"
                            onClick={() => router.push(`/dashboard/custom-orders/${r.id}`)}
                            className={listBtn({ tone: "blue" })}>
                            <span className={startIconCss}><Handshake size={20} /></span>
                            Review offer
                          </button>
                        </div>
                      )}

                      {/* Pending: Withdraw the request */}
                      {r.status === "pending" && (
                        <div className={gridCellCss} style={{ gridColumn: "span 6" }}>
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleWithdrawRequest(r.id)}
                            className={listBtn({ tone: "red" })}>
                            <span className={startIconCss}>{isLoading ? <Spinner size={14} /> : <XCircle size={20} />}</span>
                            Withdraw
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
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
            <div key={order.id} className={cardCss}>
              <div className={cardBody}>
                <div className={headRowCss}>
                  <div className={avatarStackCss}>
                    <ListAvatar src={freelancer?.user?.avatar_url || undefined} alt={freelancer?.user?.name || "Freelancer"} />
                    <div className={colCss}>
                      <div className={titleRowCss}>
                        <p className={titleCss}>
                          {orderTitle}
                        </p>
                        {isCustom && <span className={chipNeutral}>Custom</span>}
                      </div>
                      <p className={byline}>
                        by {freelancer?.user?.name || "Unknown"}
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

                {/* Delivery received banner */}
                {order.status === "delivered" && (
                  <div className={alertInfoCss}>
                    <span className={alertIconCss} style={{ color: "#0071e3" }}><BellRing size={16} /></span>
                    <div className={alertMsgCss}>Work delivered — please review and approve or request a revision</div>
                  </div>
                )}

                {/* Actions */}
                <div className={gridCss}>
                  <div className={gridCellCss} style={{ gridColumn: "span 6" }}>
                    <button
                      type="button"
                      onClick={() => handleViewDetails(order)}
                      className={listBtn({ tone: "grey" })}>
                      View Details
                    </button>
                  </div>
                  <div className={gridCellCss} style={{ gridColumn: "span 6" }}>
                    <button
                      type="button"
                      onClick={() => order.conversation_id && router.push(`/dashboard/client/messages?id=${order.conversation_id}`)}
                      disabled={!order.conversation_id}
                      className={listBtn({ tone: "blue" })}>
                      <span className={startIconCss}><MessageCircle size={20} /></span>
                      Message Freelancer
                    </button>
                  </div>
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
