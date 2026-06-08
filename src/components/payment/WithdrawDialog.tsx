"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Box, Button, CircularProgress, Dialog, IconButton, Typography } from "@mui/material";
import {
  Close as CloseIcon,
  AccountBalance as BankIcon,
  AccessTime as ClockIcon,
  ArrowUpward as ArrowUpIcon,
} from "@mui/icons-material";
import { api } from "@/lib/api";
import { qk } from "@/lib/queryKeys";
import { tokens } from "@/theme";
import PaymentOption from "./PaymentOption";
import StatusChip from "./StatusChip";
import { fmtUsd } from "./format";
import Annot from "./Annot";

type Destination = "aba" | "other";

const DESTINATIONS: { id: Destination; name: string; sub: string }[] = [
  { id: "aba", name: "ABA Bank", sub: "Your registered ABA account" },
  { id: "other", name: "Wing / other bank", sub: "Add transfer details in the note" },
];

/**
 * Freelancer payout request. Payouts are sent MANUALLY by an admin (no automated
 * disbursement yet — matches the existing admin withdrawals approve/reject flow),
 * so this submits a request and lands in a "pending review" state.
 *
 * Note: destination + note are UI-only until the backend stores them; only
 * `amount` is sent to POST /api/wallet/withdraw today.
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

  const amt = Number(amount) || 0;
  const valid = amt >= 1 && amt <= available;

  const submit = async () => {
    if (!valid) {
      setError(amt > available ? "Amount exceeds your available balance." : "Please enter a valid amount.");
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await api.post("/api/wallet/withdraw", { amount: amt });
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
    <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth='xs' PaperProps={{ sx: { borderRadius: `${tokens.radius.card}px` } }}>
      {submitted ? (
        <Box sx={{ p: { xs: 3.5, sm: 4 }, textAlign: "center" }}>
          <Annot>Withdrawal · pending (manual payout)</Annot>
          <Box sx={{ height: 22 }} />
          <Box sx={{ width: 76, height: 76, borderRadius: "50%", bgcolor: tokens.pendingTint, display: "flex", alignItems: "center", justifyContent: "center", mx: "auto" }}>
            <ClockIcon sx={{ fontSize: 35, color: tokens.pending }} />
          </Box>
          <Typography sx={{ mt: 2.75, fontSize: { xs: 24, sm: 28 }, fontWeight: 600, letterSpacing: "-0.025em" }}>Withdrawal requested</Typography>
          <Typography sx={{ fontFamily: tokens.mono, fontSize: 36, fontWeight: 600, letterSpacing: "-0.03em", mt: 1.25, mb: 0.75 }}>{fmtUsd(amt)}</Typography>
          <Typography sx={{ fontSize: 15, color: tokens.text2, maxWidth: 340, mx: "auto" }}>
            Your request is in review. Our team processes payouts{" "}
            <Box component='strong' sx={{ color: tokens.text }}>manually within 3 business days</Box> to your selected destination.
          </Typography>

          <Box sx={{ border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius.tile}px`, p: 2, mt: 2.75, textAlign: "left" }}>
            <Row label='Destination' value={DESTINATIONS.find(d => d.id === dest)!.name} />
            <Box sx={{ height: 10 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Cap>Status</Cap>
              <StatusChip status='pending'>Pending review</StatusChip>
            </Box>
          </Box>

          <Button fullWidth onClick={finish} sx={{ mt: 3, height: 52, borderRadius: "999px", bgcolor: "#000", color: "#fff", textTransform: "none", fontSize: 16, fontWeight: 500, "&:hover": { bgcolor: "rgba(0,0,0,0.8)" } }}>
            Back to wallet
          </Button>
        </Box>
      ) : (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: "20px 24px", borderBottom: `1px solid ${tokens.border}` }}>
            <Box>
              <Annot>Freelancer withdrawal · manual payout</Annot>
              <Typography sx={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.015em" }}>Withdraw earnings</Typography>
            </Box>
            <IconButton onClick={onClose} disabled={submitting} sx={{ color: tokens.text2 }}>
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>

          <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: "14px 16px", bgcolor: tokens.canvas, borderRadius: `${tokens.radius.cardSm}px`, mb: 2.75 }}>
              <Typography sx={{ fontSize: 13.5, color: tokens.text2 }}>Available to withdraw</Typography>
              <Typography sx={{ fontFamily: tokens.mono, fontSize: 20, fontWeight: 600 }}>{fmtUsd(available)}</Typography>
            </Box>

            <FieldLabel>Amount (USD)</FieldLabel>
            <Box sx={{ position: "relative", mb: amt > available ? 0.75 : 2.5 }}>
              <Box component='span' sx={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: tokens.text3, fontSize: 16 }}>$</Box>
              <Box
                component='input'
                type='number'
                placeholder='0.00'
                value={amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setAmount(e.target.value);
                  setError(null);
                }}
                sx={{
                  width: "100%",
                  boxSizing: "border-box",
                  height: 44,
                  pl: "28px",
                  pr: "14px",
                  border: `1px solid ${tokens.borderStrong}`,
                  borderRadius: `${tokens.radius.input}px`,
                  bgcolor: tokens.surface,
                  font: "inherit",
                  fontSize: 16,
                  fontWeight: 600,
                  outline: "none",
                  "&:focus": { borderColor: tokens.accent, boxShadow: `0 0 0 3px ${tokens.accentFill}` },
                }}
              />
            </Box>
            {amt > available && <Typography sx={{ fontSize: 12, color: tokens.errorText, mb: 2 }}>Amount exceeds your available balance.</Typography>}

            <FieldLabel>Payout destination</FieldLabel>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, mb: 2.5 }}>
              {DESTINATIONS.map(d => (
                <PaymentOption key={d.id} selected={dest === d.id} onClick={() => setDest(d.id)}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <BankIcon sx={{ fontSize: 20, color: tokens.text2 }} />
                    <Box>
                      <Typography sx={{ fontSize: 14.5, fontWeight: 600 }}>{d.name}</Typography>
                      <Typography sx={{ fontSize: 12, color: tokens.text2 }}>{d.sub}</Typography>
                    </Box>
                  </Box>
                </PaymentOption>
              ))}
            </Box>

            <FieldLabel>Note for our payout team (optional)</FieldLabel>
            <Box
              component='textarea'
              rows={3}
              placeholder='e.g. preferred transfer time, alternate account number…'
              value={note}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
              sx={{
                width: "100%",
                boxSizing: "border-box",
                p: "12px 14px",
                border: `1px solid ${tokens.borderStrong}`,
                borderRadius: `${tokens.radius.input}px`,
                bgcolor: tokens.surface,
                font: "inherit",
                fontSize: 15,
                lineHeight: 1.5,
                resize: "vertical",
                outline: "none",
                "&:focus": { borderColor: tokens.accent, boxShadow: `0 0 0 3px ${tokens.accentFill}` },
              }}
            />

            <Box sx={{ display: "flex", gap: 1.25, mt: 2.25, p: "12px 14px", bgcolor: tokens.pendingTint, borderRadius: `${tokens.radius.tile}px` }}>
              <ClockIcon sx={{ fontSize: 16, color: tokens.pendingText, flex: "none" }} />
              <Typography sx={{ fontSize: 12.5, color: tokens.pendingText, lineHeight: 1.45 }}>
                Payouts are reviewed and sent manually by our team within 3 business days. You&apos;ll get a notification when it&apos;s on the way.
              </Typography>
            </Box>

            {error && <Typography sx={{ fontSize: 12.5, color: tokens.errorText, mt: 1.5 }}>{error}</Typography>}

            <Button
              fullWidth
              disabled={!valid || submitting}
              onClick={submit}
              startIcon={submitting ? undefined : <ArrowUpIcon sx={{ fontSize: 16 }} />}
              sx={{
                mt: 2.25,
                height: 52,
                borderRadius: "999px",
                bgcolor: "#000",
                color: "#fff",
                textTransform: "none",
                fontSize: 16,
                fontWeight: 500,
                "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
                "&.Mui-disabled": { bgcolor: "rgba(0,0,0,0.18)", color: "#fff" },
              }}>
              {submitting ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : `Request withdrawal of ${fmtUsd(amt)}`}
            </Button>
          </Box>
        </>
      )}
    </Dialog>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <Typography component='label' sx={{ display: "block", fontSize: 13, fontWeight: 500, color: tokens.text2, mb: "7px" }}>{children}</Typography>;
}
function Cap({ children }: { children: React.ReactNode }) {
  return <Typography sx={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.02em", color: tokens.text2 }}>{children}</Typography>;
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Cap>{label}</Cap>
      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{value}</Typography>
    </Box>
  );
}
