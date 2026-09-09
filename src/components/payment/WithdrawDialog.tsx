"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowUp, Clock, Landmark, X } from "lucide-react";
import { css } from "styled-system/css";
import { Dialog, Spinner, iconButton } from "@/components/ds";
import { BareModal } from "@/components/ds/BareModal";
import { api } from "@/lib/api";
import { qk } from "@/lib/queryKeys";
import { CurrencyInput, parseMoney } from "@/components/ui/inputs";
import PaymentOption from "./PaymentOption";
import StatusChip from "./StatusChip";
import { pillButton } from "./pill";
import { fmtUsd } from "./format";
import Annot from "./Annot";

type Destination = "aba" | "other";

const DESTINATIONS: { id: Destination; name: string; sub: string }[] = [
  { id: "aba", name: "ABA Bank", sub: "Your registered ABA account" },
  { id: "other", name: "Wing / other bank", sub: "Add transfer details in the note" },
];

/* ---- success view ---- */
const doneBody = css({ p: { base: "28px", sm: "32px" }, textAlign: "center" });
const spacer22 = css({ h: "22px" });
const doneIconWrap = css({
  w: "76px",
  h: "76px",
  borderRadius: "50%",
  bg: "pendingTint",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  mx: "auto",
});
// MUI's SvgIcon carried `flex-shrink: 0`; lucide's svg does not.
const doneIcon = css({ color: "pending", flexShrink: 0 });
// globals.css's unlayered `p, h1-h6 { margin: 0 }` already suppressed the
// `mt`/`mb`/`mx` these three carried as MUI Typography, so they stay dropped.
const doneTitle = css({ fontSize: { base: "24px", sm: "28px" }, fontWeight: 600, letterSpacing: "-0.025em", color: "ink" });
const doneAmount = css({ fontFamily: "mono", fontSize: "36px", fontWeight: 600, letterSpacing: "-0.03em", color: "ink" });
const doneCopy = css({ fontSize: "15px", color: "ink2", maxW: "340px" });
const doneStrong = css({ color: "ink" });
const doneCard = css({
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hairline",
  borderRadius: "tile",
  p: "16px",
  mt: "22px",
  textAlign: "left",
});
const spacer10 = css({ h: "10px" });
const rowCss = css({ display: "flex", justifyContent: "space-between", alignItems: "center" });
const capCss = css({ fontSize: "12px", fontWeight: 500, letterSpacing: "0.02em", color: "ink2" });
const rowValue = css({ fontSize: "13px", fontWeight: 600, color: "ink" });
const backBtn = css(pillButton.raw({ tone: "black", size: "lg", full: true }), { mt: "24px" });

/* ---- form view ---- */
const headerCss = css({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  p: "20px 24px",
  borderBottomWidth: "1px",
  borderBottomStyle: "solid",
  borderBottomColor: "hairline",
});
const titleCss = css({ fontSize: "22px", fontWeight: 600, letterSpacing: "-0.015em", color: "ink" });
// Merged into one style object (Panda's `cx` only concatenates — it can't
// resolve conflicting atomic classes), so these beat the recipe's own colours.
const closeBtn = css(iconButton.raw({ size: "md", shape: "round", variant: "ghost", tone: "default" }), {
  color: "ink2",
  _hover: { bg: "rgba(0,0,0,0.04)", color: "ink" },
});
const bodyCss = css({ p: "24px" });
const availableRow = css({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  p: "14px 16px",
  bg: "canvas",
  borderRadius: "cardSm",
  mb: "22px",
});
const availableLabel = css({ fontSize: "13.5px", color: "ink2" });
const availableValue = css({ fontFamily: "mono", fontSize: "20px", fontWeight: 600, color: "ink" });
const fieldLabelCss = css({ display: "block", fontSize: "13px", fontWeight: 500, color: "ink2", mb: "7px" });
const amountFieldTight = css({ mb: "6px" });
const amountField = css({ mb: "20px" });
const overspendText = css({ fontSize: "12px", color: "errorText" });
const destList = css({ display: "flex", flexDirection: "column", gap: "10px", mb: "20px" });
const destRow = css({ display: "flex", alignItems: "center", gap: "12px" });
const destIcon = css({ color: "ink2", flexShrink: 0 });
const destName = css({ fontSize: "14.5px", fontWeight: 600, color: "ink" });
const destSub = css({ fontSize: "12px", color: "ink2" });
const noteArea = css({
  w: "100%",
  boxSizing: "border-box",
  p: "12px 14px",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hairlineStrong",
  borderRadius: "input",
  bg: "surface",
  fontFamily: "inherit",
  fontSize: "15px",
  lineHeight: 1.5,
  resize: "vertical",
  outline: "none",
  _focus: { borderColor: "accent", boxShadow: "0 0 0 3px rgba(0, 113, 227, 0.05)" },
});
const hintBox = css({
  display: "flex",
  gap: "10px",
  mt: "18px",
  p: "12px 14px",
  bg: "pendingTint",
  borderRadius: "tile",
});
const hintIcon = css({ color: "pendingText", flex: "none" });
const hintText = css({ fontSize: "12.5px", color: "pendingText", lineHeight: 1.45 });
const errorText = css({ fontSize: "12.5px", color: "errorText" });
const submitBtn = css(pillButton.raw({ tone: "black", size: "lg", full: true }), { mt: "18px" });
const startIcon = css({ ml: "-4px" });

/**
 * Freelancer payout request. Payouts are sent MANUALLY by an admin (no automated
 * disbursement yet — matches the existing admin withdrawals approve/reject flow),
 * so this submits a request and lands in a "pending review" state.
 *
 * The remark is the user's own reference note — it's stored on the transaction
 * and shown back in their Finance history, not a message to the payout team.
 */
export default function WithdrawDialog({
  open,
  onClose,
  available,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  available: number;
  onSuccess?: () => void;
}) {
  const qc = useQueryClient();
  const [amount, setAmount] = useState("");
  const [dest, setDest] = useState<Destination>("aba");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setAmount("");
      setDest("aba");
      setNote("");
      setSubmitting(false);
      setSubmitted(false);
      setError(null);
    }
  }, [open]);

  const amt = parseMoney(amount) ?? 0;
  const valid = amt >= 1 && amt <= available;

  const submit = async () => {
    if (!valid) {
      setError(amt > available ? "Amount exceeds your available balance." : "Please enter a valid amount.");
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await api.post("/api/wallet/withdraw", { amount: amt, destination: dest, note: note.trim() || null });
      await qc.invalidateQueries({ queryKey: qk.wallet() });
      qc.invalidateQueries({ queryKey: qk.dashboard.freelancer() });
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Withdrawal failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const finish = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <BareModal open={open} onOpenChange={o => { if (!o && !submitting) onClose(); }}>
      {submitted ? (
        <div className={doneBody}>
          <Annot>Withdrawal · pending (manual payout)</Annot>
          <div className={spacer22} />
          <div className={doneIconWrap}>
            <Clock size={35} className={doneIcon} />
          </div>
          <Dialog.Title className={doneTitle}>Withdrawal requested</Dialog.Title>
          <p className={doneAmount}>{fmtUsd(amt)}</p>
          <p className={doneCopy}>
            Your request is in review. Our team processes payouts{" "}
            <strong className={doneStrong}>manually within 3 business days</strong> to your selected destination.
          </p>

          <div className={doneCard}>
            <Row label='Destination' value={DESTINATIONS.find(d => d.id === dest)!.name} />
            <div className={spacer10} />
            <div className={rowCss}>
              <Cap>Status</Cap>
              <StatusChip status='pending'>Pending review</StatusChip>
            </div>
          </div>

          <button type='button' onClick={finish} className={backBtn}>
            Back to wallet
          </button>
        </div>
      ) : (
        <>
          <div className={headerCss}>
            <div>
              <Annot>Wallet withdrawal · manual payout</Annot>
              <Dialog.Title className={titleCss}>Withdraw funds</Dialog.Title>
            </div>
            <Dialog.CloseTrigger asChild>
              <button type='button' aria-label='Close' disabled={submitting} className={closeBtn}>
                <X size={20} />
              </button>
            </Dialog.CloseTrigger>
          </div>

          <div className={bodyCss}>
            <div className={availableRow}>
              <p className={availableLabel}>Available to withdraw</p>
              <p className={availableValue}>{fmtUsd(available)}</p>
            </div>

            <FieldLabel>Amount (USD)</FieldLabel>
            <div className={amt > available ? amountFieldTight : amountField}>
              <CurrencyInput
                placeholder='0.00'
                value={amount}
                onChange={(v) => {
                  setAmount(v);
                  setError(null);
                }}
              />
            </div>
            {amt > available && <p className={overspendText}>Amount exceeds your available balance.</p>}

            <FieldLabel>Payout destination</FieldLabel>
            <div className={destList}>
              {DESTINATIONS.map(d => (
                <PaymentOption key={d.id} selected={dest === d.id} onClick={() => setDest(d.id)}>
                  <div className={destRow}>
                    <Landmark size={20} className={destIcon} />
                    <div>
                      <p className={destName}>{d.name}</p>
                      <p className={destSub}>{d.sub}</p>
                    </div>
                  </div>
                </PaymentOption>
              ))}
            </div>

            <FieldLabel>Remarks (optional)</FieldLabel>
            <textarea
              rows={3}
              placeholder='A note for yourself — stays on this transaction in your history'
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={noteArea}
            />

            <div className={hintBox}>
              <Clock size={16} className={hintIcon} />
              <p className={hintText}>
                Payouts are reviewed and sent manually by our team within 3 business days. You&apos;ll get a notification when it&apos;s on the way.
              </p>
            </div>

            {error && <p className={errorText}>{error}</p>}

            <button type='button' disabled={!valid || submitting} onClick={submit} className={submitBtn}>
              {submitting ? (
                <Spinner size={20} />
              ) : (
                <>
                  <ArrowUp size={16} className={startIcon} />
                  {`Request withdrawal of ${fmtUsd(amt)}`}
                </>
              )}
            </button>
          </div>
        </>
      )}
    </BareModal>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className={fieldLabelCss}>{children}</label>;
}
function Cap({ children }: { children: React.ReactNode }) {
  return <p className={capCss}>{children}</p>;
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className={rowCss}>
      <Cap>{label}</Cap>
      <p className={rowValue}>{value}</p>
    </div>
  );
}
