"use client";

import type { LucideIcon } from "lucide-react";
import { ArrowRight, Check, Clock, Info, Lock, RotateCw, ShieldCheck, Wallet, X } from "lucide-react";
import { css, cva } from "styled-system/css";
import { Spinner } from "@/components/ds";
import { pillButton } from "./pill";
import { fmtUsd } from "./format";
import Annot from "./Annot";

export type ResultKind = "waiting" | "success" | "failure";
export type PaymentContext = "checkout" | "topup";

export interface PaymentResultProps {
  kind: ResultKind;
  context: PaymentContext;
  amount: number;
  methodLabel?: string;
  newBalance?: number;
  reason?: string;
  reference?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
  onRetry?: () => void;
  onChooseAnother?: () => void;
}

const rootCss = css({ p: { base: "28px", sm: "40px" }, textAlign: "center" });
const columnCss = css({ display: "flex", flexDirection: "column", alignItems: "center" });

const badgeCss = cva({
  base: {
    width: "76px",
    height: "76px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    mx: "auto",
  },
  variants: {
    kind: {
      success: { bg: "successTint", color: "success" },
      error: { bg: "errorTint", color: "error" },
      pending: { bg: "pendingTint", color: "pending" },
    },
  },
});

const BADGE_ICON = { success: Check, error: X, pending: Clock } as const;

const spacer24 = css({ height: "24px" });
const spacer22 = css({ height: "22px" });

const spinnerCss = css({ color: "ink" });
const waitTitleCss = css({ mt: "24px", fontSize: "22px", fontWeight: 600, letterSpacing: "-0.015em", lineHeight: 1.5 });
const waitBodyCss = css({ mt: "8px", fontSize: "15px", color: "ink2", maxWidth: "320px", lineHeight: 1.5 });
const waitNoteCss = css({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  mt: "22px",
  px: "16px",
  py: "10px",
  bg: "canvas",
  borderRadius: "pill",
  color: "ink3",
});
const waitNoteTextCss = css({ fontSize: "12.5px", color: "ink2", lineHeight: 1.5 });

const resultTitleCss = css({
  mt: "22px",
  fontSize: { base: "24px", sm: "28px" },
  fontWeight: 600,
  letterSpacing: "-0.025em",
  lineHeight: 1.5,
});
const amountCss = css({
  fontFamily: "mono",
  fontSize: "40px",
  fontWeight: 600,
  letterSpacing: "-0.03em",
  mt: "10px",
  mb: "6px",
  lineHeight: 1.5,
});
const leadCss = css({ fontSize: "15px", color: "ink2", maxWidth: "340px", lineHeight: 1.5 });
const leadTopCss = css({ mt: "8px", fontSize: "15px", color: "ink2", maxWidth: "340px", lineHeight: 1.5 });

const nextCardCss = css({
  width: "100%",
  boxSizing: "border-box",
  textAlign: "left",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hairline",
  borderRadius: "tile",
  p: "18px",
  mt: "22px",
});
const nextLabelCss = css({
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "ink3",
  mb: "12px",
  lineHeight: 1.5,
});
const nextListCss = css({ display: "flex", flexDirection: "column", gap: "12px" });
const nextRowCss = css({ display: "flex", gap: "12px", alignItems: "flex-start" });
const nextTileCss = css({
  width: "30px",
  height: "30px",
  borderRadius: "8px",
  bg: "successTint",
  color: "success",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flex: "none",
});
const nextTitleCss = css({ fontSize: "14px", fontWeight: 600, lineHeight: 1.5 });
const nextDescCss = css({ fontSize: "12.5px", color: "ink2", lineHeight: 1.5 });

const actionsCss = css({ display: "flex", flexDirection: "column", gap: "10px", width: "100%", mt: "24px" });
const refCss = css({ fontSize: "11.5px", color: "ink3", mt: "16px", lineHeight: 1.5 });

const primaryBtn = pillButton({ tone: "black", size: "lg", full: true });
const ghostBtn = pillButton({ tone: "ghost", size: "md", full: true });
const greyBtn = pillButton({ tone: "grey", size: "md", full: true });

const errorBoxCss = css({
  display: "flex",
  gap: "10px",
  width: "100%",
  boxSizing: "border-box",
  textAlign: "left",
  p: "16px",
  mt: "20px",
  bg: "errorTint",
  borderRadius: "cardSm",
  color: "errorText",
});
const errorIconCss = css({ flex: "none" });
const errorTitleCss = css({ fontSize: "13.5px", fontWeight: 600, color: "errorText", lineHeight: 1.5 });
const errorSubCss = css({ fontSize: "12.5px", color: "errorText", opacity: 0.85, lineHeight: 1.5 });

/** Post-payment result card (waiting / success / failure). Rendered inside a Dialog by the flow controller. */
export default function PaymentResult(props: PaymentResultProps) {
  return (
    <div className={rootCss}>
      {props.kind === "waiting" && <Waiting {...props} />}
      {props.kind === "success" && <Success {...props} />}
      {props.kind === "failure" && <Failure {...props} />}
    </div>
  );
}

function Badge({ kind }: { kind: "success" | "error" | "pending" }) {
  const Icon = BADGE_ICON[kind];
  return (
    <div className={badgeCss({ kind })}>
      <Icon size={35} />
    </div>
  );
}

function Waiting({ amount, methodLabel }: PaymentResultProps) {
  return (
    <div className={columnCss}>
      <Annot>STEP 7 → 8 · confirming</Annot>
      <div className={spacer24} />
      <Spinner size={64} className={spinnerCss} />
      <div className={waitTitleCss}>Waiting for payment confirmation…</div>
      <div className={waitBodyCss}>
        We&apos;re confirming your {fmtUsd(amount)} payment with {methodLabel || "ABA PayWay"}. This usually takes a few seconds.
      </div>
      <div className={waitNoteCss}>
        <Lock size={14} />
        <span className={waitNoteTextCss}>Please don&apos;t close this window</span>
      </div>
    </div>
  );
}

function Success({ context, amount, newBalance, reference, onPrimary, onSecondary }: PaymentResultProps) {
  const isTopup = context === "topup";
  const items: [LucideIcon, string, string][] = isTopup
    ? [[Wallet, "Balance is ready to spend", "Use it on any gig — no checkout needed."]]
    : [
        [ShieldCheck, "Funds held in escrow", "Released to the freelancer only when you approve."],
        [Clock, "Order placed", "The freelancer is notified to start your delivery."],
      ];
  return (
    <div className={columnCss}>
      <Annot>STEP 8 · success</Annot>
      <div className={spacer22} />
      <Badge kind='success' />
      <div className={resultTitleCss}>{isTopup ? "Wallet topped up" : "Payment successful"}</div>
      <div className={amountCss}>{fmtUsd(amount)}</div>
      <div className={leadCss}>
        {isTopup
          ? `Added to your KickAir wallet.${newBalance != null ? ` New balance ${fmtUsd(newBalance)}.` : ""}`
          : "Your order is placed and the funds are safely held in escrow."}
      </div>

      <div className={nextCardCss}>
        <div className={nextLabelCss}>What happens next</div>
        <div className={nextListCss}>
          {items.map(([Icon, title, desc]) => (
            <div key={title} className={nextRowCss}>
              <div className={nextTileCss}>
                <Icon size={16} />
              </div>
              <div>
                <div className={nextTitleCss}>{title}</div>
                <div className={nextDescCss}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={actionsCss}>
        <button type='button' onClick={onPrimary} className={primaryBtn}>
          {isTopup ? "Go to wallet" : "View order"}
          <ArrowRight size={16} />
        </button>
        <button type='button' onClick={onSecondary} className={ghostBtn}>
          {isTopup ? "Done" : "Back to browsing"}
        </button>
      </div>
      {reference && <div className={refCss}>Receipt sent · Ref {reference}</div>}
    </div>
  );
}

function Failure({ amount, reason, reference, onRetry, onChooseAnother }: PaymentResultProps) {
  return (
    <div className={columnCss}>
      <Annot>STEP 8 · failed</Annot>
      <div className={spacer22} />
      <Badge kind='error' />
      <div className={resultTitleCss}>Payment didn&apos;t go through</div>
      <div className={leadTopCss}>
        We couldn&apos;t complete your {fmtUsd(amount)} payment. No money has left your account.
      </div>

      <div className={errorBoxCss}>
        <Info size={18} className={errorIconCss} />
        <div>
          <div className={errorTitleCss}>{reason || "Payment cancelled or timed out"}</div>
          <div className={errorSubCss}>{reference || "ABA PayWay"}</div>
        </div>
      </div>

      <div className={actionsCss}>
        <button type='button' onClick={onRetry} className={primaryBtn}>
          <RotateCw size={16} />
          Try again
        </button>
        <button type='button' onClick={onChooseAnother} className={greyBtn}>
          Choose another method
        </button>
      </div>
    </div>
  );
}
