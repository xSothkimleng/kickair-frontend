"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import {
  AccountBalanceWallet as WalletIcon,
  Add as AddIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  VerifiedUser as ShieldIcon,
} from "@mui/icons-material";
import { api } from "@/lib/api";
import { qk } from "@/lib/queryKeys";
import { tokens } from "@/theme";
import { Wallet, Transaction } from "@/types/wallet";
import { Annot, PayLogo, PaymentFooterLogos, StatusChip, TopUpDialog, WithdrawDialog, fmtUsd, type PayLogoId } from "@/components/payment";

type Filter = "all" | "completed" | "pending" | "failed";
const FILTERS: [Filter, string][] = [
  ["all", "All"],
  ["completed", "Completed"],
  ["pending", "Pending"],
  ["failed", "Failed"],
];

export default function FinanceContent() {
  const [filter, setFilter] = useState<Filter>("all");
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: qk.wallet(),
    queryFn: async () => {
      const [walletResponse, transactionsResponse] = await Promise.all([
        api.get("/api/wallet"),
        api.get("/api/wallet/transactions"),
      ]);
      return {
        wallet: walletResponse.data as Wallet,
        transactions: (Array.isArray(transactionsResponse.data)
          ? transactionsResponse.data
          : transactionsResponse.data?.data ?? []) as Transaction[],
      };
    },
  });

  const wallet = data?.wallet ?? null;
  const transactions = data?.transactions ?? [];
  const balance = wallet ? parseFloat(wallet.available_balance_raw) : 0;
  const refresh = async () => {
    await refetch();
    queryClient.invalidateQueries({ queryKey: qk.dashboard.client() });
  };

  const filtered = transactions.filter(t => (filter === "all" ? true : t.status === filter));

  const formatDate = (s: string) => new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const txnTitle = (t: Transaction) =>
    t.metadata?.service_title || t.order?.service?.title || t.description || "Transaction";
  const txnParty = (t: Transaction) => {
    const m: Record<Transaction["type"], string> = {
      deposit: "Wallet top-up",
      withdrawal: "Withdrawal",
      payment: "Order payment",
      escrow: "In escrow",
      earning: "Earning",
      refund: "Refund",
    };
    return m[t.type] ?? "Transaction";
  };
  const isCredit = (t: Transaction) => t.type === "deposit" || t.type === "refund" || t.type === "earning";

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress size={32} sx={{ color: tokens.text3 }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <Typography sx={{ fontSize: 13, color: tokens.errorText, mb: 2 }}>
          {error instanceof Error ? error.message : "Failed to fetch finance data"}
        </Typography>
        <Button onClick={() => refetch()} sx={{ fontSize: 12, textTransform: "none" }}>
          Try again
        </Button>
      </Box>
    );
  }

  const stats: { label: string; value: number; dot: string; Icon: typeof WalletIcon; sub: string }[] = [
    { label: "In escrow", value: wallet ? parseFloat(wallet.pending_balance_raw) : 0, dot: tokens.pending, Icon: ShieldIcon, sub: "Committed to active orders" },
    { label: "Total spent", value: wallet ? parseFloat(wallet.total_spent_raw) : 0, dot: tokens.text3, Icon: ArrowUpIcon, sub: "Lifetime on KickAir" },
  ];

  return (
    <Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 3 }}>
        <Annot>Finance overview · entry to STEP 1</Annot>
        <Typography sx={{ fontSize: { xs: 28, md: 34 }, fontWeight: 600, letterSpacing: "-0.03em" }}>Wallet</Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 320px" }, gap: 3, alignItems: "start" }}>
        {/* Left column */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Balance + stats */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3,1fr)" }, gap: 1.5 }}>
            {/* Available balance — primary */}
            <Box sx={{ position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", borderRadius: `${tokens.radius.card}px`, p: 2.25, color: "#fff", background: "linear-gradient(135deg, #000, rgba(0,0,0,0.82))" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.875 }}>
                  <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: tokens.success }} />
                  <Typography sx={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.02em", color: "rgba(255,255,255,0.72)" }}>Available balance</Typography>
                </Box>
                <WalletIcon sx={{ fontSize: 15, color: "rgba(255,255,255,0.5)" }} />
              </Box>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.4 }}>
                <Typography sx={{ fontSize: 16, fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>$</Typography>
                <Typography sx={{ fontFamily: tokens.mono, fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em" }}>{balance.toFixed(2)}</Typography>
              </Box>
              <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.5)", mt: 0.5 }}>Free to spend or withdraw</Typography>
              <Box sx={{ display: "flex", gap: 1, mt: "auto", pt: 1.75 }}>
                <Button
                  onClick={() => setTopUpOpen(true)}
                  startIcon={<AddIcon sx={{ fontSize: 15 }} />}
                  sx={{ flex: 1, minWidth: 0, height: 36, borderRadius: "999px", bgcolor: "#fff", color: "#000", textTransform: "none", fontSize: 13, fontWeight: 600, "&:hover": { bgcolor: "rgba(255,255,255,0.88)" } }}>
                  Top up
                </Button>
                <Button
                  onClick={() => setShowWithdraw(true)}
                  startIcon={<ArrowUpIcon sx={{ fontSize: 15 }} />}
                  sx={{ flex: 1, minWidth: 0, height: 36, borderRadius: "999px", border: "1px solid rgba(255,255,255,0.28)", color: "#fff", textTransform: "none", fontSize: 13, fontWeight: 600, "&:hover": { bgcolor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.4)" } }}>
                  Withdraw
                </Button>
              </Box>
            </Box>

            {/* Secondary stats */}
            {stats.map(s => (
              <Box key={s.label} sx={{ display: "flex", flexDirection: "column", bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius.card}px`, p: 2.25 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.875 }}>
                    <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: s.dot }} />
                    <Typography sx={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.02em", color: tokens.text2 }}>{s.label}</Typography>
                  </Box>
                  <s.Icon sx={{ fontSize: 15, color: tokens.text3 }} />
                </Box>
                <Typography sx={{ fontFamily: tokens.mono, fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em" }}>{fmtUsd(s.value)}</Typography>
                <Typography sx={{ fontSize: 11, color: tokens.text3, mt: "auto", pt: 0.5 }}>{s.sub}</Typography>
              </Box>
            ))}
          </Box>

          {/* Transaction history */}
          <Box sx={{ bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius.card}px`, p: { xs: 2.25, md: 3 } }}>
            <Typography sx={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.015em", mb: 2 }}>Transaction history</Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
              {FILTERS.map(([k, label]) => {
                const active = filter === k;
                return (
                  <Box
                    key={k}
                    component='button'
                    type='button'
                    onClick={() => setFilter(k)}
                    sx={{
                      height: 34,
                      px: 2,
                      borderRadius: "999px",
                      cursor: "pointer",
                      font: "inherit",
                      fontSize: 13,
                      fontWeight: 500,
                      border: "none",
                      bgcolor: active ? "#000" : "rgba(0,0,0,0.05)",
                      color: active ? "#fff" : tokens.text2,
                      "&:hover": { bgcolor: active ? "#000" : "rgba(0,0,0,0.09)" },
                    }}>
                    {label}
                  </Box>
                );
              })}
            </Box>

            {filtered.length === 0 ? (
              <Typography sx={{ textAlign: "center", py: 4, fontSize: 14, color: tokens.text2 }}>No {filter === "all" ? "" : filter} transactions.</Typography>
            ) : (
              <Box>
                {filtered.map(t => {
                  const credit = isCredit(t);
                  return (
                    <Box key={t.id} sx={{ display: "flex", alignItems: "center", gap: 1.75, py: 1.75, borderBottom: `1px solid ${tokens.border}`, "&:last-of-type": { borderBottom: "none" } }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: tokens.canvas, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                        {credit ? <ArrowDownIcon sx={{ fontSize: 18, color: tokens.success }} /> : <ArrowUpIcon sx={{ fontSize: 18, color: tokens.text2 }} />}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: 14.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{txnTitle(t)}</Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.02em", color: tokens.text2 }}>{txnParty(t)} · {formatDate(t.created_at)}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.625 }}>
                        <Typography sx={{ fontFamily: tokens.mono, fontSize: 15, fontWeight: 600, color: credit ? tokens.successText : tokens.text }}>
                          {credit ? "+" : "–"}{fmtUsd(Math.abs(parseFloat(t.amount_raw)))}
                        </Typography>
                        <StatusChip status={t.status}>{t.status.charAt(0).toUpperCase() + t.status.slice(1)}</StatusChip>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>

        {/* Right column — payment methods */}
        <Box sx={{ bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius.card}px`, p: { xs: 2.25, md: 3 } }}>
          <Typography sx={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em", mb: 2 }}>Payment methods</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {[
              { id: "khqr" as PayLogoId, name: "ABA KHQR", sub: "Default · scan to pay", primary: true },
              { id: "visa" as PayLogoId, name: "Visa ···· 4242", sub: "Expires 09/27", primary: false },
            ].map(m => (
              <Box key={m.id} sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius.cardSm}px` }}>
                <PayLogo id={m.id} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{m.name}</Typography>
                  <Typography sx={{ fontSize: 11.5, fontWeight: 500, letterSpacing: "0.02em", color: tokens.text2 }}>{m.sub}</Typography>
                </Box>
                {m.primary && <StatusChip status='neutral' dot={false}>Default</StatusChip>}
              </Box>
            ))}
          </Box>
          <Box sx={{ height: 1, bgcolor: tokens.border, my: 2.25 }} />
          <Typography sx={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: tokens.text3, mb: 1.5 }}>Accepted via ABA PayWay</Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {(["khqr", "visa", "mc", "unionpay", "jcb", "alipay", "wechat"] as PayLogoId[]).map(id => (
              <PayLogo key={id} id={id} size='sm' />
            ))}
          </Box>
        </Box>
      </Box>

      <Box sx={{ borderTop: `1px solid ${tokens.border}`, mt: 3, pt: 3 }}>
        <PaymentFooterLogos variant='light' />
      </Box>

      <TopUpDialog open={topUpOpen} onClose={() => setTopUpOpen(false)} currentBalance={balance} suggestedAmount={25} />
      <WithdrawDialog open={showWithdraw} onClose={() => setShowWithdraw(false)} available={balance} onSuccess={refresh} />
    </Box>
  );
}
