"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Info, Plus, X } from "lucide-react";
import { css, cva } from "styled-system/css";
import { Dialog, iconButton } from "@/components/ds";
import { BareModal } from "@/components/ds/BareModal";
import { api } from "@/lib/api";
import { qk } from "@/lib/queryKeys";
import { CurrencyInput, parseMoney } from "@/components/ui/inputs";
import AbaMethodSelector, { type AbaMethod } from "./AbaMethodSelector";
import { usePaymentProcessing } from "./usePaymentProcessing";
import { pillButton } from "./pill";
import { fmtUsd } from "./format";
import Annot from "./Annot";

const CHIPS = [10, 25, 50, 100];

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

const noteBox = css({
  display: "flex",
  gap: "8px",
  mb: "18px",
  p: "11px 13px",
  bg: "accentFill",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "rgba(0, 113, 227, 0.2)",
  borderRadius: "tile",
});
// MUI's SvgIcon carried `flex-shrink: 0`; lucide's svg does not.
const noteIcon = css({ color: "accent", flexShrink: 0 });
const noteText = css({ fontSize: "12.5px", color: "accent" });

const amountWrap = css({ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", mb: "20px" });
const amountLabel = css({ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "ink3" });
const amountRow = css({ display: "flex", alignItems: "baseline", gap: "2px" });
const amountSymbol = css({ fontSize: "30px", fontWeight: 500, color: "ink3" });
const amountValue = css({ fontFamily: "mono", fontSize: "52px", fontWeight: 600, letterSpacing: "-0.03em", color: "ink" });

const chipGrid = css({ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px", mb: "10px" });
const chipBtn = cva({
  base: {
    h: "44px",
    borderRadius: "tile",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "15px",
    fontWeight: 600,
    borderWidth: "1px",
    borderStyle: "solid",
  },
  variants: {
    active: {
      true: { borderColor: "accent", bg: "accentFill", color: "accent" },
      false: { borderColor: "hairlineStrong", bg: "surface", color: "ink" },
    },
  },
});
const customBtn = cva({
  base: {
    w: "100%",
    h: "44px",
    borderRadius: "tile",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "14px",
    fontWeight: 500,
    borderWidth: "1px",
    borderStyle: "solid",
  },
  variants: {
    active: {
      true: { mb: "8px", borderColor: "accent", bg: "accentFill", color: "accent" },
      false: { mb: "20px", borderColor: "hairlineStrong", bg: "surface", color: "ink2" },
    },
  },
});
const customField = css({ mb: "20px" });
const methodWrap = css({ mb: "22px" });
const submitBtn = pillButton({ tone: "black", size: "lg", full: true });
const startIcon = css({ ml: "-4px" });
// The original `mt: 1.75` sat on a MUI Typography <p>, where globals.css's
// unlayered `p { margin: 0 }` already suppressed it — so it stays dropped.
const footNote = css({ textAlign: "center", fontSize: "11.5px", color: "ink3" });

/**
 * Wallet top-up. Form (amount + ABA method) → shared payment flow → success.
 * Used standalone on the wallet page and as the insufficient-balance path on
 * checkout. Hides its form while the ABA popup / result overlay is showing.
 */
export default function TopUpDialog({
  open,
  onClose,
  currentBalance,
  suggestedAmount = 25,
  returnNote,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  currentBalance: number;
  suggestedAmount?: number;
  returnNote?: string;
  onSuccess?: () => void;
}) {
  const qc = useQueryClient();
  const [amount, setAmount] = useState<string>(String(suggestedAmount));
  const [custom, setCustom] = useState(false);
  const [method, setMethod] = useState<AbaMethod | null>(null);

  // Reset the form whenever the dialog (re)opens or the suggestion changes.
  // Done during render (React "adjusting state on prop change" pattern) so the
  // React Compiler lint rule against setState in effects is satisfied.
  const [prev, setPrev] = useState({ open, suggestedAmount });
  if (prev.open !== open || prev.suggestedAmount !== suggestedAmount) {
    setPrev({ open, suggestedAmount });
    if (open) {
      setAmount(String(suggestedAmount));
      setCustom(false);
      setMethod(null);
    }
  }

  const amt = parseMoney(amount) ?? 0;
  const valid = amt >= 1 && !!method;

  const finish = () => {
    onSuccess?.();
    onClose();
  };

  const flow = usePaymentProcessing({
    context: "topup",
    perform: async () => {
      await api.post("/api/wallet/deposit", { amount: amt });
      await qc.invalidateQueries({ queryKey: qk.wallet() });
      qc.invalidateQueries({ queryKey: qk.dashboard.client() });
    },
    onSuccessPrimary: finish,
    onSuccessDone: finish,
    getNewBalance: () => currentBalance + amt,
    reference: { success: "#KA-TP-48217", failure: "#KA-ERR-90341 · ABA PayWay" },
  });

  const setChip = (v: number) => {
    setCustom(false);
    setAmount(String(v));
  };

  return (
    <>
      <BareModal open={open && !flow.active} onOpenChange={o => { if (!o) onClose(); }}>
        {/* Header */}
        <div className={headerCss}>
          <div>
            <Annot>STEP 1–3 · top up</Annot>
            <Dialog.Title className={titleCss}>Add money to wallet</Dialog.Title>
          </div>
          <Dialog.CloseTrigger asChild>
            <button type='button' aria-label='Close' className={closeBtn}>
              <X size={20} />
            </button>
          </Dialog.CloseTrigger>
        </div>

        <div className={bodyCss}>
          {returnNote && (
            <div className={noteBox}>
              <Info size={16} className={noteIcon} />
              <p className={noteText}>{returnNote}</p>
            </div>
          )}

          {/* Amount display */}
          <div className={amountWrap}>
            <p className={amountLabel}>Amount (USD)</p>
            <div className={amountRow}>
              <p className={amountSymbol}>$</p>
              <p className={amountValue}>{amt ? (amt % 1 ? amt.toFixed(2) : amt) : "0"}</p>
            </div>
          </div>

          {/* Quick-pick chips */}
          <div className={chipGrid}>
            {CHIPS.map(v => (
              <button key={v} type='button' onClick={() => setChip(v)} className={chipBtn({ active: !custom && amt === v })}>
                ${v}
              </button>
            ))}
          </div>

          {/* Custom */}
          <button
            type='button'
            onClick={() => {
              setCustom(true);
              setAmount("");
            }}
            className={customBtn({ active: custom })}>
            Custom amount
          </button>
          {custom && (
            <div className={customField}>
              <CurrencyInput autoFocus placeholder='0.00' value={amount} onChange={setAmount} />
            </div>
          )}

          {/* Method selector */}
          <div className={methodWrap}>
            <AbaMethodSelector value={method} onChange={setMethod} />
          </div>

          <button type='button' disabled={!valid} onClick={() => method && flow.startAba(method, amt)} className={submitBtn}>
            <Plus size={16} className={startIcon} />
            Add {fmtUsd(amt)} to wallet
          </button>
          <p className={footNote}>Balance is stored in your KickAir wallet · USD</p>
        </div>
      </BareModal>

      {flow.overlay}
    </>
  );
}
