"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Info } from "lucide-react";
import { css, cva, cx } from "styled-system/css";
import { Alert, Spinner } from "@/components/ds";
import { sanitizeMoneyInput } from "@/components/ui/inputs";
import { api } from "@/lib/api";
import { CustomOrder } from "@/types/customOrder";
import { useCommissionRate } from "@/hooks/useCommissionRate";
import { CoInput, CoTextArea, Money, coAvatar, coBtn, coBtnEnd, coCard, coLabel, initials } from "./kit";
import { useCoInvalidate } from "./hooks";

const layout = css({ display: "grid", gridTemplateColumns: "1fr", gap: "24px", alignItems: "start" });
const card = cx(coCard, css({ p: { base: "18px", md: "24px" } }));
const labelCss = css({ textStyle: "meta", fontWeight: 600, color: "ink" });
const labelSub = css({ color: "ink3", fontWeight: 400 });

const gap20 = css({ mb: "20px" });
const gap16 = css({ mb: "16px" });
const twoCol = css({ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", mb: "20px" });
const priceField = css({ maxW: "220px", mb: "20px" });
const expiryField = css({ maxW: "200px" });
const noteBlock = css({ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "hairline", pt: "18px" });

const clientRow = css({ display: "flex", alignItems: "center", gap: "10px", mt: "14px", mb: "14px" });
const clientName = css({ fontWeight: 600, textStyle: "body", color: "ink" });
const clientMeta = css({ textStyle: "micro", color: "ink2" });

const totalRow = css({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  py: "12px",
  borderTopWidth: "1px",
  borderTopStyle: "solid",
  borderTopColor: "hairlineStrong",
});
const totalLabel = css({ fontWeight: 600, textStyle: "lead", color: "ink" });

const feeBox = css({
  mt: "4px",
  mb: "10px",
  p: "12px",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hairline",
  borderRadius: "10px",
  bg: "surface2",
});
const feeRow = css({ display: "flex", justifyContent: "space-between", py: "3px" });
const feeLabel = css({ textStyle: "meta", color: "ink2" });
const feeValue = css({ textStyle: "meta", fontVariantNumeric: "tabular-nums", fontWeight: 600, color: "ink" });
const feeValueWarn = css({ textStyle: "meta", fontVariantNumeric: "tabular-nums", fontWeight: 600, color: "pendingText" });
const feeDivider = css({ height: "1px", bg: "hairline", my: "4px" });
const netLabel = css({ textStyle: "meta", fontWeight: 700, color: "ink" });
const netValue = css({ textStyle: "ui", fontVariantNumeric: "tabular-nums", fontWeight: 700, color: "successText" });

const statusBox = cva({
  base: { display: "flex", gap: "8px", p: "12px", borderRadius: "10px", mt: "4px" },
  variants: { over: { true: { bg: "errorTint" }, false: { bg: "successTint" } } },
});
const statusText = cva({
  base: { textStyle: "meta", fontWeight: 500 },
  variants: { over: { true: { color: "errorText" }, false: { color: "successText" } } },
});
const monoSpan = css({ fontVariantNumeric: "tabular-nums" });
const alertGap = css({ mt: "14px" });
const sendBtn = css({ mt: "18px" });
const cancelBtn = css({ mt: "8px" });

/** Composer defaults — also what "Accept request" sends alongside the client's own budget and timeline. */
export const OFFER_DEFAULTS = { deliveryDays: 30, revisions: 3, expiresInDays: 3 } as const;

export default function OfferComposer({ order, onSent, onCancel }: { order: CustomOrder; onSent: () => void; onCancel: () => void }) {
  const invalidate = useCoInvalidate();
  const rate = useCommissionRate();
  const clientLabel = order.client.name ?? "the client";

  const [scope, setScope] = useState(order.description ?? "");
  const [deliveryDays, setDeliveryDays] = useState(String(OFFER_DEFAULTS.deliveryDays));
  const [revisions, setRevisions] = useState(String(OFFER_DEFAULTS.revisions));
  const [note, setNote] = useState("");
  const [expiresIn, setExpiresIn] = useState(String(OFFER_DEFAULTS.expiresInDays));
  const [amount, setAmount] = useState(String(order.budget || ""));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = Number(amount) || 0;
  const over = total - order.budget;
  const overBudget = over > 0;
  const commission = rate != null ? total * rate : null;
  const net = commission != null ? total - commission : null;

  const handleSend = async () => {
    if (!scope.trim()) { setError("Add a scope of work."); return; }
    if (!total) { setError("Add a project price."); return; }

    setSubmitting(true);
    setError(null);
    try {
      // One-time payment: the offer is a single "Complete project" payment.
      await api.sendCustomOffer(order.id, {
        offer_scope: scope.trim(),
        offer_delivery_days: Number(deliveryDays) || OFFER_DEFAULTS.deliveryDays,
        offer_revisions: revisions ? Number(revisions) : null,
        offer_note: note.trim() || null,
        offer_expires_in_days: expiresIn ? Number(expiresIn) : null,
        is_split: false,
        milestones: [{ title: "Complete project", amount: total, due_days: Number(deliveryDays) || null }],
      });
      await invalidate();
      onSent();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send the offer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={layout}>
      {/* ── Builder ── */}
      <div className={card}>
        <p className={labelCss}>Scope of work</p>
        <CoTextArea radius="9" minRows={3} value={scope} onChange={setScope} className={gap20} placeholder="What you'll deliver overall…" />

        <div className={twoCol}>
          <div>
            <p className={labelCss}>Delivery</p>
            <CoInput mono radius="9" value={deliveryDays} onChange={(v) => setDeliveryDays(v.replace(/[^0-9]/g, ""))} end="days" />
          </div>
          <div>
            <p className={labelCss}>Revisions</p>
            <CoInput mono radius="9" value={revisions} onChange={(v) => setRevisions(v.replace(/[^0-9]/g, ""))} end="rounds" />
          </div>
        </div>

        <p className={labelCss}>Project price <span className={labelSub}>· one-time payment</span></p>
        <CoInput mono radius="9" size="sm" className={priceField} value={amount} onChange={(v) => setAmount(sanitizeMoneyInput(v))} start="$" />

        <div className={noteBlock}>
          <p className={labelCss}>Note to client <span className={labelSub}>· optional</span></p>
          <CoTextArea radius="9" minRows={2} value={note} onChange={setNote} className={gap16} placeholder="Anything the client should know about the plan…" />
          <p className={labelCss}>Offer to client expires in</p>
          <CoInput mono radius="9" size="sm" className={expiryField} value={expiresIn} onChange={(v) => setExpiresIn(v.replace(/[^0-9]/g, ""))} end="days" />
        </div>
      </div>

      {/* ── Summary — stacked full-width below the builder ── */}
      <div className={card}>
        <p className={coLabel}>Offer summary</p>
        <div className={clientRow}>
          <span className={coAvatar({ size: "sm" })}>{initials(clientLabel)}</span>
          <div>
            <p className={clientName}>For {clientLabel}</p>
            <p className={clientMeta}>
              Budget ${order.budget.toLocaleString()}{order.desired_timeline_days ? ` · ${order.desired_timeline_days} days` : ""}
            </p>
          </div>
        </div>

        <div className={totalRow}>
          <p className={totalLabel}>Total</p>
          <Money value={total} size="title" weight={600} color={overBudget ? "var(--colors-error-text)" : "var(--colors-ink)"} />
        </div>

        {/* Fee deduction — what actually lands in the freelancer's wallet. */}
        {rate != null && commission != null && net != null && (
          <div className={feeBox}>
            <div className={feeRow}>
              <p className={feeLabel}>Client pays</p>
              <p className={feeValue}>${total.toFixed(2)}</p>
            </div>
            <div className={feeRow}>
              <p className={feeLabel}>Platform fee ({Math.round(rate * 100)}%)</p>
              <p className={feeValueWarn}>−${commission.toFixed(2)}</p>
            </div>
            <div className={feeDivider} />
            <div className={feeRow}>
              <p className={netLabel}>You receive</p>
              <p className={netValue}>${net.toFixed(2)}</p>
            </div>
          </div>
        )}

        <div className={statusBox({ over: overBudget })}>
          {overBudget
            ? <Info size={16} className={css({ color: "errorText", flexShrink: 0 })} />
            : <CheckCircle2 size={16} className={css({ color: "success", flexShrink: 0 })} />}
          <p className={statusText({ over: overBudget })}>
            {overBudget
              ? <>Over the client&apos;s budget by <span className={monoSpan}>${over.toLocaleString()}</span>. They may counter or decline.</>
              : over === 0
                ? <>Matches the client&apos;s ${order.budget.toLocaleString()} budget exactly.</>
                : <><span className={monoSpan}>${(-over).toLocaleString()}</span> under budget — comfortable room.</>}
          </p>
        </div>

        {error && <Alert tone="error" className={alertGap}>{error}</Alert>}

        <button type="button" onClick={handleSend} disabled={submitting} className={cx(coBtn({ tone: "black", size: "xl", strong: true, full: true }), sendBtn)}>
          {submitting ? <Spinner size={20} className={css({ color: "#fff" })} /> : (
            <>
              Send offer
              <ArrowRight size={20} className={coBtnEnd} />
            </>
          )}
        </button>
        <button type="button" onClick={onCancel} disabled={submitting} className={cx(coBtn({ tone: "quiet", font: "ui", strong: true, full: true }), cancelBtn)}>
          Cancel
        </button>
      </div>
    </div>
  );
}
