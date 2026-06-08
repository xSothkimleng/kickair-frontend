"use client";

import { Box, Button, CircularProgress, Typography } from "@mui/material";
import {
  Check as CheckIcon,
  Close as CloseIcon,
  AccessTime as ClockIcon,
  AccountBalanceWallet as WalletIcon,
  VerifiedUser as ShieldIcon,
  ArrowForward as ArrowIcon,
  Refresh as RefreshIcon,
  InfoOutlined as InfoIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { tokens } from "@/theme";
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

/** Post-payment result card (waiting / success / failure). Rendered inside a Dialog by the flow controller. */
export default function PaymentResult(props: PaymentResultProps) {
  return (
    <Box sx={{ p: { xs: 3.5, sm: 5 }, textAlign: "center" }}>
      {props.kind === "waiting" && <Waiting {...props} />}
      {props.kind === "success" && <Success {...props} />}
      {props.kind === "failure" && <Failure {...props} />}
    </Box>
  );
}

function Badge({ kind }: { kind: "success" | "error" | "pending" }) {
  const cfg = {
    success: { bg: tokens.successTint, color: tokens.success, Icon: CheckIcon },
    error: { bg: tokens.errorTint, color: tokens.error, Icon: CloseIcon },
    pending: { bg: tokens.pendingTint, color: tokens.pending, Icon: ClockIcon },
  }[kind];
  return (
    <Box sx={{ width: 76, height: 76, borderRadius: "50%", bgcolor: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", mx: "auto" }}>
      <cfg.Icon sx={{ fontSize: 35, color: cfg.color }} />
    </Box>
  );
}

function Waiting({ amount, methodLabel }: PaymentResultProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Annot>STEP 7 → 8 · confirming</Annot>
      <Box sx={{ height: 24 }} />
      <CircularProgress size={64} sx={{ color: tokens.text }} />
      <Typography sx={{ mt: 3, fontSize: 22, fontWeight: 600, letterSpacing: "-0.015em" }}>Waiting for payment confirmation…</Typography>
      <Typography sx={{ mt: 1, fontSize: 15, color: tokens.text2, maxWidth: 320 }}>
        We&apos;re confirming your {fmtUsd(amount)} payment with {methodLabel || "ABA PayWay"}. This usually takes a few seconds.
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2.75, px: 2, py: 1.25, bgcolor: tokens.canvas, borderRadius: "999px" }}>
        <LockIcon sx={{ fontSize: 14, color: tokens.text3 }} />
        <Typography sx={{ fontSize: 12.5, color: tokens.text2 }}>Please don&apos;t close this window</Typography>
      </Box>
    </Box>
  );
}

function Success({ context, amount, newBalance, reference, onPrimary, onSecondary }: PaymentResultProps) {
  const isTopup = context === "topup";
  const items: [typeof WalletIcon, string, string][] = isTopup
    ? [[WalletIcon, "Balance is ready to spend", "Use it on any gig — no checkout needed."]]
    : [
        [ShieldIcon, "Funds held in escrow", "Released to the freelancer only when you approve."],
        [ClockIcon, "Order placed", "The freelancer is notified to start your delivery."],
      ];
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Annot>STEP 8 · success</Annot>
      <Box sx={{ height: 22 }} />
      <Badge kind='success' />
      <Typography sx={{ mt: 2.75, fontSize: { xs: 24, sm: 28 }, fontWeight: 600, letterSpacing: "-0.025em" }}>
        {isTopup ? "Wallet topped up" : "Payment successful"}
      </Typography>
      <Typography sx={{ fontFamily: tokens.mono, fontSize: 40, fontWeight: 600, letterSpacing: "-0.03em", mt: 1.25, mb: 0.75 }}>{fmtUsd(amount)}</Typography>
      <Typography sx={{ fontSize: 15, color: tokens.text2, maxWidth: 340 }}>
        {isTopup
          ? `Added to your KickAir wallet.${newBalance != null ? ` New balance ${fmtUsd(newBalance)}.` : ""}`
          : "Your order is placed and the funds are safely held in escrow."}
      </Typography>

      <Box sx={{ width: "100%", textAlign: "left", border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius.tile}px`, p: 2.25, mt: 2.75 }}>
        <Typography sx={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: tokens.text3, mb: 1.5 }}>What happens next</Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {items.map(([Icon, title, desc]) => (
            <Box key={title} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
              <Box sx={{ width: 30, height: 30, borderRadius: "8px", bgcolor: tokens.successTint, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                <Icon sx={{ fontSize: 16, color: tokens.success }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{title}</Typography>
                <Typography sx={{ fontSize: 12.5, color: tokens.text2 }}>{desc}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, width: "100%", mt: 3 }}>
        <Button
          fullWidth
          onClick={onPrimary}
          endIcon={<ArrowIcon sx={{ fontSize: 16 }} />}
          sx={{ height: 52, borderRadius: "999px", bgcolor: "#000", color: "#fff", textTransform: "none", fontSize: 16, fontWeight: 500, "&:hover": { bgcolor: "rgba(0,0,0,0.8)" } }}>
          {isTopup ? "Go to wallet" : "View order"}
        </Button>
        <Button fullWidth onClick={onSecondary} sx={{ height: 44, borderRadius: "999px", color: tokens.text2, textTransform: "none", fontSize: 15, "&:hover": { bgcolor: "rgba(0,0,0,0.04)" } }}>
          {isTopup ? "Done" : "Back to browsing"}
        </Button>
      </Box>
      {reference && (
        <Typography sx={{ fontSize: 11.5, color: tokens.text3, mt: 2 }}>Receipt sent · Ref {reference}</Typography>
      )}
    </Box>
  );
}

function Failure({ amount, reason, reference, onRetry, onChooseAnother }: PaymentResultProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Annot>STEP 8 · failed</Annot>
      <Box sx={{ height: 22 }} />
      <Badge kind='error' />
      <Typography sx={{ mt: 2.75, fontSize: { xs: 24, sm: 28 }, fontWeight: 600, letterSpacing: "-0.025em" }}>Payment didn&apos;t go through</Typography>
      <Typography sx={{ mt: 1, fontSize: 15, color: tokens.text2, maxWidth: 340 }}>
        We couldn&apos;t complete your {fmtUsd(amount)} payment. No money has left your account.
      </Typography>

      <Box sx={{ display: "flex", gap: 1.25, width: "100%", textAlign: "left", p: 2, mt: 2.5, bgcolor: tokens.errorTint, borderRadius: `${tokens.radius.cardSm}px` }}>
        <InfoIcon sx={{ fontSize: 18, color: tokens.errorText, flex: "none" }} />
        <Box>
          <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: tokens.errorText }}>{reason || "Payment cancelled or timed out"}</Typography>
          <Typography sx={{ fontSize: 12.5, color: tokens.errorText, opacity: 0.85 }}>{reference || "ABA PayWay"}</Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, width: "100%", mt: 3 }}>
        <Button
          fullWidth
          onClick={onRetry}
          startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
          sx={{ height: 52, borderRadius: "999px", bgcolor: "#000", color: "#fff", textTransform: "none", fontSize: 16, fontWeight: 500, "&:hover": { bgcolor: "rgba(0,0,0,0.8)" } }}>
          Try again
        </Button>
        <Button fullWidth onClick={onChooseAnother} sx={{ height: 44, borderRadius: "999px", bgcolor: "rgba(0,0,0,0.05)", color: "#000", textTransform: "none", fontSize: 15, "&:hover": { bgcolor: "rgba(0,0,0,0.1)" } }}>
          Choose another method
        </Button>
      </Box>
    </Box>
  );
}
