"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import {
  AccountBalanceWallet as WalletIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  VerifiedUser as ShieldIcon,
  AccessTime as ClockIcon,
} from "@mui/icons-material";
import { qk } from "@/lib/queryKeys";
import { api } from "@/lib/api";
import { Wallet, Transaction } from "@/types/wallet";
import { tokens } from "@/theme";
import { StatusChip, WithdrawDialog, fmtUsd } from "@/components/payment";

type Filter = "all" | "completed" | "pending" | "failed";
const FILTERS: [Filter, string][] = [
  ["all", "All"],
  ["completed", "Completed"],
  ["pending", "Pending"],
  ["failed", "Failed"],
];

export default function FinanceContent() {
  const [filter, setFilter] = useState<Filter>("all");
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
  const refresh = async () => {
    await refetch();
    queryClient.invalidateQueries({ queryKey: qk.dashboard.freelancer() });
  };

  const availableBalance = wallet ? parseFloat(wallet.available_balance_raw) : 0;
  const inEscrow = wallet ? parseFloat(wallet.pending_balance_raw) : 0;
  const totalBalance = wallet ? Number(wallet.total_balance_raw) : 0;
  const pendingWithdrawals = transactions.filter(t => t.type === "withdrawal" && t.status === "pending");
  const pendingWithdrawalsTotal = pendingWithdrawals.reduce((s, t) => s + parseFloat(t.amount_raw), 0);

  const filtered = transactions.filter(t => (filter === "all" ? true : t.status === filter));
  const formatDate = (s: string) => new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const isCredit = (t: Transaction) => t.type === "earning" || t.type === "deposit" || t.type === "refund";

  const txnTitle = (t: Transaction) =>
    t.metadata?.service_title || t.order?.service?.title || t.description || "Transaction";
  const txnParty = (t: Transaction) => {
    const m: Record<Transaction["type"], string> = {
      earning: t.status === "completed" ? "Earning released" : "Earning in escrow",
      withdrawal: "Withdrawal request",
      payment: "Payment",
      escrow: "In escrow",
      deposit: "Deposit",
      refund: "Refund",
    };
    return m[t.type] ?? "Transaction";
  };

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
        <Button onClick={() => refetch()} sx={{ fontSize: 12, textTransform: "none" }}>Try again</Button>
      </Box>
    );
  }

  const stats: { label: string; value: number; dot: string; Icon: typeof WalletIcon; sub: string }[] = [
    { label: "In escrow", value: inEscrow, dot: tokens.pending, Icon: ShieldIcon, sub: "Released when an order completes" },
    { label: "Pending withdrawal", value: pendingWithdrawalsTotal, dot: "#f59e0b", Icon: ClockIcon, sub: pendingWithdrawals.length > 0 ? `${pendingWithdrawals.length} awaiting approval` : "No pending requests" },
    { label: "Total balance", value: totalBalance, dot: tokens.success, Icon: WalletIcon, sub: "Available + escrow" },
  ];

  return (
    <Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 3 }}>
        <Typography sx={{ fontSize: { xs: 22, md: 24 }, fontWeight: 600, letterSpacing: "-0.02em" }}>Wallet</Typography>
        <Typography sx={{ fontSize: 13, color: tokens.text2 }}>Your earnings, escrow, and withdrawals</Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Hero */}
        <Box sx={{ position: "relative", overflow: "hidden", borderRadius: `${tokens.radius.card}px`, p: { xs: 3, md: 3.75 }, color: "#fff", background: "linear-gradient(135deg, #000, rgba(0,0,0,0.82))" }}>
          <Box sx={{ position: "absolute", top: -40, right: -30, width: 180, height: 180, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.05)" }} />
          <Box sx={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>Available balance</Typography>
            <WalletIcon sx={{ fontSize: 20, color: "rgba(255,255,255,0.6)" }} />
          </Box>
          <Box sx={{ position: "relative", display: "flex", alignItems: "baseline", gap: 0.5 }}>
            <Typography sx={{ fontSize: 26, fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>$</Typography>
            <Typography sx={{ fontFamily: tokens.mono, fontSize: { xs: 46, md: 54 }, fontWeight: 600, letterSpacing: "-0.03em" }}>{availableBalance.toFixed(2)}</Typography>
            <Typography sx={{ fontSize: 15, color: "rgba(255,255,255,0.5)", ml: 0.75 }}>USD</Typography>
          </Box>
          <Box sx={{ position: "relative", mt: 3 }}>
            <Button
              onClick={() => setShowWithdraw(true)}
              startIcon={<ArrowUpIcon sx={{ fontSize: 16 }} />}
              sx={{ height: 44, px: 2.75, borderRadius: "999px", bgcolor: "#fff", color: "#000", textTransform: "none", fontSize: 15, fontWeight: 500, "&:hover": { bgcolor: "rgba(255,255,255,0.9)" } }}>
              Withdraw
            </Button>
          </Box>
        </Box>

        {/* Stat cards */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3,1fr)" }, gap: 1.5 }}>
          {stats.map(s => (
            <Box key={s.label} sx={{ bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius.card}px`, p: 2.25 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.75 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.875 }}>
                  <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: s.dot }} />
                  <Typography sx={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.02em", color: tokens.text2 }}>{s.label}</Typography>
                </Box>
                <s.Icon sx={{ fontSize: 15, color: tokens.text3 }} />
              </Box>
              <Typography sx={{ fontFamily: tokens.mono, fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em" }}>{fmtUsd(s.value)}</Typography>
              <Typography sx={{ fontSize: 11, color: tokens.text3, mt: 0.5 }}>{s.sub}</Typography>
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
                <Box key={k} component="button" type="button" onClick={() => setFilter(k)}
                  sx={{ height: 34, px: 2, borderRadius: "999px", cursor: "pointer", font: "inherit", fontSize: 13, fontWeight: 500, border: "none", bgcolor: active ? "#000" : "rgba(0,0,0,0.05)", color: active ? "#fff" : tokens.text2, "&:hover": { bgcolor: active ? "#000" : "rgba(0,0,0,0.09)" } }}>
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

      <WithdrawDialog open={showWithdraw} onClose={() => setShowWithdraw(false)} available={availableBalance} onSuccess={refresh} />
    </Box>
  );
}
