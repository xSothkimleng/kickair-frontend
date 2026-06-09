"use client";

import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/queryKeys";
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Close,
  LockOutlined,
  AccountBalanceWalletOutlined,
  ArrowForward,
  ShieldOutlined,
  AddRounded,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { tokens } from "@/theme";
import { api } from "@/lib/api";
import { Money, coLabel } from "./kit";

interface Props {
  open: boolean;
  onClose: () => void;
  milestoneTitle: string;
  amount: number;
  onConfirm: () => void;
  submitting: boolean;
  title?: string;
  annotation?: string;
  ctaLabel?: string;
  error?: string | null;
}

export default function FundMilestoneDialog({
  open,
  onClose,
  milestoneTitle,
  amount,
  onConfirm,
  submitting,
  title = "Fund milestone",
  annotation = "Fund into escrow",
  ctaLabel,
  error,
}: Props) {
  const router = useRouter();
  const { data: wallet } = useQuery({
    queryKey: qk.wallet(),
    queryFn: async () => (await api.get("/api/wallet")).data,
    enabled: open,
  });

  const available = Number(wallet?.available_balance ?? 0);
  const insufficient = wallet != null && available < amount;
  const short = amount - available;

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: "16px", border: `1px solid ${tokens.border}` } }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", p: "22px 24px 0" }}>
        <Box>
          <Typography sx={{ ...coLabel, color: tokens.accent, fontFamily: tokens.mono }}>{annotation}</Typography>
          <Typography sx={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", mt: 0.5 }}>{title}</Typography>
        </Box>
        <IconButton onClick={onClose} size="small" disabled={submitting}><Close sx={{ fontSize: 20 }} /></IconButton>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: "18px 24px 24px" }}>
        {/* amount → escrow visual */}
        <Box sx={{ p: 2.25, textAlign: "center", borderRadius: "12px", border: `1px solid ${tokens.border}`, bgcolor: tokens.surface2 }}>
          <Typography sx={coLabel}>Moving to escrow</Typography>
          <Box sx={{ mt: 0.75 }}>
            <Money value={amount} size={34} weight={600} color={tokens.pendingText} cents />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1, mt: 1, color: tokens.text3 }}>
            <AccountBalanceWalletOutlined sx={{ fontSize: 14 }} />
            <Typography sx={{ fontSize: 11.5 }}>Wallet</Typography>
            <ArrowForward sx={{ fontSize: 14 }} />
            <LockOutlined sx={{ fontSize: 13, color: tokens.pendingText }} />
            <Typography sx={{ fontSize: 11.5, color: tokens.pendingText, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {milestoneTitle}
            </Typography>
          </Box>
        </Box>

        {/* wallet rows */}
        <Box>
          <Row label="Available balance" valueEl={<Money value={available} size={14} weight={600} color={insufficient ? tokens.errorText : tokens.text} cents />} />
          <Row label="This milestone" valueEl={<Box component="span" sx={{ fontFamily: tokens.mono, fontSize: 14 }}>−{`$${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}</Box>} />
          <Row
            last
            label={insufficient ? "Short by" : "Balance after"}
            valueEl={<Money value={insufficient ? short : available - amount} size={16} weight={600} color={insufficient ? tokens.errorText : tokens.text} cents />}
          />
        </Box>

        {error && <Alert severity="error" sx={{ borderRadius: "10px" }}>{error}</Alert>}

        {insufficient ? (
          <>
            <Box sx={{ display: "flex", gap: 1, p: 1.5, bgcolor: tokens.errorTint, borderRadius: "10px" }}>
              <Typography sx={{ fontSize: 12.5, lineHeight: 1.45, color: tokens.errorText }}>
                Not enough in your wallet to fund this milestone. Top up{" "}
                <Box component="span" sx={{ fontFamily: tokens.mono }}>${short.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Box>{" "}
                or more, then fund.
              </Typography>
            </Box>
            <Button fullWidth startIcon={<AddRounded />} onClick={() => router.push("/dashboard/client?tab=finance")}
              sx={{ textTransform: "none", fontWeight: 600, fontSize: 14, borderRadius: "999px", bgcolor: tokens.text, color: "#fff", height: 44, "&:hover": { bgcolor: "rgba(0,0,0,0.82)" } }}>
              Top up wallet
            </Button>
          </>
        ) : (
          <>
            <Button fullWidth startIcon={<LockOutlined />} onClick={onConfirm} disabled={submitting || wallet == null}
              sx={{ textTransform: "none", fontWeight: 600, fontSize: 14, borderRadius: "999px", bgcolor: tokens.text, color: "#fff", height: 46, boxShadow: "none", "&:hover": { bgcolor: "rgba(0,0,0,0.82)", boxShadow: "none" } }}>
              {submitting ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : (ctaLabel ?? `Confirm & fund ${`$${amount.toLocaleString()}`}`)}
            </Button>
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 0.75, color: tokens.text3, fontSize: 11.5 }}>
              <ShieldOutlined sx={{ fontSize: 13 }} /> Released to the freelancer only when you approve the delivery
            </Box>
          </>
        )}
      </Box>
    </Dialog>
  );
}

function Row({ label, valueEl, last }: { label: string; valueEl: React.ReactNode; last?: boolean }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.25, borderBottom: last ? "none" : `1px solid ${tokens.border}` }}>
      <Typography sx={{ fontSize: 13.5, color: tokens.text2, fontWeight: last ? 600 : 400, ...(last && { color: tokens.text }) }}>{label}</Typography>
      {valueEl}
    </Box>
  );
}
