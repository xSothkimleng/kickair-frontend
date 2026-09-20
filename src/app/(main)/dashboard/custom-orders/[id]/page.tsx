"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Check, ChevronLeft, Clock } from "lucide-react";
import { css, cx } from "styled-system/css";
import { Alert, Spinner } from "@/components/ds";
import { api } from "@/lib/api";
import { useCustomOrder, useCoInvalidate } from "@/components/customOrders/hooks";
import {
  AttachChip, Money, coAvatar, coBtn, coBtnEnd, coBtnStart, coCard, coLabel, initials,
} from "@/components/customOrders/kit";
import ReviewOffer from "@/components/customOrders/ReviewOffer";
import OfferComposer, { OFFER_DEFAULTS } from "@/components/customOrders/OfferComposer";
import Workspace from "@/components/customOrders/Workspace";

const STATUS_TEXT: Record<string, string> = {
  pending: "Your request was sent. You'll be notified when a custom offer arrives.",
  declined: "This request was declined.",
  withdrawn: "This request was withdrawn.",
  expired: "This offer expired before it was accepted.",
};

const page = css({ minHeight: "100vh", bg: "canvas" });
const centered = css({ minHeight: "100vh", bg: "canvas", display: "grid", placeItems: "center" });
const missing = css({ minHeight: "100vh", bg: "canvas", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" });
const missingText = css({ textStyle: "lead", color: "ink2" });
const spinner = css({ color: "ink" });
const spinnerOnBlack = css({ color: "#fff" });

const container = css({
  w: "100%",
  mx: "auto",
  boxSizing: "border-box",
  px: { base: "16px", sm: "32px" },
  py: { base: "24px", sm: "40px" },
});
const narrow = css({ maxW: "720px" });
const wide = css({ maxW: "1080px" });

const backBtn = css({ mb: "16px" });

const headerRow = css({ display: "flex", alignItems: "center", gap: "14px", mb: "24px" });
const headerTitle = css({ textStyle: "title", fontWeight: 600, color: "ink" });
const headerSub = css({ textStyle: "ui", color: "ink2" });
const monoSpan = css({ fontVariantNumeric: "tabular-nums" });

const detailCard = cx(coCard, css({ p: { base: "20px", md: "28px" } }));
const statsRow = css({ display: "flex", borderWidth: "1px", borderStyle: "solid", borderColor: "hairline", borderRadius: "12px", overflow: "hidden", mb: "20px" });
const statCell = css({ flex: 1, p: "14px 18px" });
const statSplit = css({ width: "1px", bg: "hairline" });
const statDays = css({ fontVariantNumeric: "tabular-nums", textStyle: "title", fontWeight: 600, color: "ink" });
const briefText = css({ textStyle: "body", color: "ink" });
const attachBlock = css({ mb: "20px" });
const attachRow = css({ display: "flex", gap: "8px", flexWrap: "wrap" });
const actionAlert = css({ mt: "20px" });
// Footer row under a hairline: Decline (quiet) on the left, the two ways to
// respond on the right — counter with an offer, or accept the request as-is.
const detailActions = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "12px",
  mt: "24px",
  pt: "20px",
  borderTopWidth: "1px",
  borderTopStyle: "solid",
  borderTopColor: "hairline",
});
const detailActionsMain = css({ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px", ml: "auto" });

const summaryCard = cx(coCard, css({ p: { base: "20px", md: "24px" } }));
// Waiting on the client is a neutral state, not a warning: a quiet line (no box, no status tint).
const awaitNote = css({ display: "flex", alignItems: "center", gap: "8px", mb: "16px", pb: "16px", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "hairline" });
const awaitIcon = css({ flexShrink: 0, color: "ink3" });
const awaitText = css({ textStyle: "ui", color: "ink2", "& strong": { fontWeight: 600, color: "ink" } });
const msRow = css({ display: "flex", justifyContent: "space-between", alignItems: "center", py: "10px" });
const msRowLine = css({ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "hairline" });
const msTitle = css({ textStyle: "body", fontWeight: 500, color: "ink" });
const totalRow = css({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  pt: "12px",
  mt: "4px",
  borderTopWidth: "1px",
  borderTopStyle: "solid",
  borderTopColor: "hairlineStrong",
});
const totalLabel = css({ fontWeight: 600, textStyle: "lead", color: "ink" });

const statusCard = cx(coCard, css({ p: { base: "24px", md: "32px" }, textAlign: "center" }));
const statusText = css({ textStyle: "body", color: "ink2", maxW: "420px", mx: "auto" });

export default function CustomOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { data: order, isLoading, error, refetch } = useCustomOrder(id);
  const invalidate = useCoInvalidate();
  const [composing, setComposing] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // "Make an offer" in the orders list deep-links straight into the composer.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("compose") === "1") setComposing(true);
  }, []);

  // Unified flow: once accepted, the work IS a regular order — send each party
  // to the standard order page. The milestone Workspace only serves legacy orders.
  const unifiedOrderId = order?.status === "accepted" && order.flow === "order" ? order.order?.id : null;
  const role = order?.viewer_role ?? "client";
  useEffect(() => {
    if (unifiedOrderId) {
      router.replace(role === "freelancer" ? `/dashboard/freelancer/orders/${unifiedOrderId}` : `/dashboard/orders/${unifiedOrderId}`);
    }
  }, [unifiedOrderId, role, router]);

  if (isLoading || unifiedOrderId) {
    return (
      <div className={centered}>
        <Spinner size={40} className={spinner} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={missing}>
        <p className={missingText}>This custom order could not be found.</p>
        <button type="button" onClick={() => router.back()} className={coBtn({ tone: "outline", size: "px16" })}>Go back</button>
      </div>
    );
  }

  // Accepted (legacy milestone flow) → the live milestone workspace (role-aware)
  if (order.status === "accepted") {
    return <Workspace order={order} role={role} />;
  }

  // Pending + freelancer → the full request detail: brief, budget/timeline,
  // attachments, and the Decline / Make an offer / Accept actions (composer inline).
  if (order.status === "pending" && role === "freelancer") {
    const busy = declining || accepting;

    const handleDecline = async () => {
      setDeclining(true);
      setActionError(null);
      try {
        await api.declineCustomOrder(order.id);
        await invalidate();
        await refetch();
      } catch (e) {
        setActionError(e instanceof Error ? e.message : "Failed to decline the request.");
      } finally {
        setDeclining(false);
      }
    };

    // Accept the request as-is: an offer at exactly the client's budget and
    // timeline, with the composer's defaults for everything else. The client
    // still reviews and pays it like any other offer — nothing is self-approved.
    const requestScope = order.description?.trim() ?? "";
    const requestDays = order.desired_timeline_days ?? null;
    const canAccept = requestScope.length > 0 && requestDays != null && requestDays > 0 && order.budget > 0;

    const handleAccept = async () => {
      if (!canAccept || requestDays == null) return;
      setAccepting(true);
      setActionError(null);
      try {
        await api.sendCustomOffer(order.id, {
          offer_scope: requestScope,
          offer_delivery_days: requestDays,
          offer_revisions: OFFER_DEFAULTS.revisions,
          offer_note: null,
          offer_expires_in_days: OFFER_DEFAULTS.expiresInDays,
          is_split: false,
          milestones: [{ title: "Complete project", amount: order.budget, due_days: requestDays }],
        });
        await invalidate();
        await refetch();
      } catch (e) {
        setActionError(e instanceof Error ? e.message : "Failed to accept the request.");
      } finally {
        setAccepting(false);
      }
    };

    return (
      <div className={page}>
        <div className={cx(container, narrow)}>
          <BackBtn onClick={() => router.push("/dashboard/freelancer?tab=orders")} label="Back to orders" />
          <Header order={order} />

          {composing ? (
            <OfferComposer order={order} onSent={() => setComposing(false)} onCancel={() => setComposing(false)} />
          ) : (
            <div className={detailCard}>
              <div className={statsRow}>
                <div className={statCell}>
                  <p className={coLabel}>Budget</p>
                  <Money value={order.budget} size="title" weight={600} />
                </div>
                <div className={statSplit} />
                <div className={statCell}>
                  <p className={coLabel}>Timeline</p>
                  <span className={statDays}>{order.desired_timeline_days ?? "—"} days</span>
                </div>
              </div>

              <p className={coLabel}>The brief</p>
              <p className={briefText}>{order.description}</p>

              {order.attachments.length > 0 && (
                <div className={attachBlock}>
                  <p className={coLabel}>Attachments</p>
                  <div className={attachRow}>
                    {order.attachments.map((a) => <AttachChip key={a} name={a} />)}
                  </div>
                </div>
              )}

              {actionError && <Alert tone="error" className={actionAlert}>{actionError}</Alert>}

              <div className={detailActions}>
                <button type="button" onClick={handleDecline} disabled={busy} className={coBtn({ tone: "quiet", strong: true })}>
                  {declining ? <Spinner size={16} /> : "Decline"}
                </button>
                <div className={detailActionsMain}>
                  <button type="button" onClick={() => setComposing(true)} disabled={busy} className={coBtn({ tone: canAccept ? "outline" : "black", size: "sm", strong: true })}>
                    Make an offer
                    <ArrowRight size={18} className={coBtnEnd} />
                  </button>
                  {canAccept && (
                    <button type="button" onClick={handleAccept} disabled={busy} className={coBtn({ tone: "black", size: "sm", strong: true })}>
                      {accepting ? <Spinner size={16} className={spinnerOnBlack} /> : (
                        <>
                          <Check size={18} className={coBtnStart} />
                          Accept request
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Offered → client reviews + accepts; freelancer sees a read-only summary
  if (order.status === "offered" && role === "client") {
    return (
      <div className={page}>
        <div className={cx(container, wide)}>
          <BackBtn onClick={() => router.push("/dashboard/client?tab=orders")} label="Back to orders" />
          <Header order={order} />
          <ReviewOffer order={order} onChanged={() => refetch()} />
        </div>
      </div>
    );
  }

  // Everything else → a compact status panel
  return (
    <div className={page}>
      <div className={cx(container, narrow)}>
        <BackBtn onClick={() => router.push(role === "freelancer" ? "/dashboard/freelancer?tab=orders" : "/dashboard/client?tab=orders")} label="Back to orders" />
        <Header order={order} />

        {order.status === "offered" && role === "freelancer" ? (
          <div className={summaryCard}>
            <div className={awaitNote}>
              <Clock size={16} className={awaitIcon} />
              <p className={awaitText}><strong>Offer sent</strong> — awaiting the client&apos;s decision.</p>
            </div>
            <p className={coLabel}>{order.milestones.length > 1 ? `Your milestone plan · ${order.milestones.length} phases` : "Your offer"}</p>
            {order.milestones.map((m, i) => (
              <div key={m.id} className={i < order.milestones.length - 1 ? cx(msRow, msRowLine) : msRow}>
                <p className={msTitle}>{m.seq}. {m.title}</p>
                <Money value={m.amount} size="body" weight={600} />
              </div>
            ))}
            <div className={totalRow}>
              <p className={totalLabel}>Total</p>
              <Money value={order.offer?.total ?? 0} size="title" weight={600} />
            </div>
          </div>
        ) : (
          <div className={statusCard}>
            <p className={statusText}>
              {STATUS_TEXT[order.status] ?? "This custom order is no longer active."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function BackBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} className={cx(coBtn({ tone: "link" }), backBtn)}>
      <ChevronLeft size={16} className={coBtnStart} />
      {label}
    </button>
  );
}

function Header({ order }: { order: import("@/types/customOrder").CustomOrder }) {
  const other = order.viewer_role === "freelancer" ? order.client.name : order.freelancer.name;
  return (
    <div className={headerRow}>
      <span className={coAvatar({ size: "xl" })}>{initials(other)}</span>
      <div className={css({ flex: 1, minW: 0 })}>
        <p className={headerTitle}>{order.service.title ?? "Custom order"}</p>
        <p className={headerSub}>with {other} · <span className={monoSpan}>${order.budget.toLocaleString()}</span> budget</p>
      </div>
    </div>
  );
}
