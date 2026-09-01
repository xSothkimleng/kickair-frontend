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
  Schedule as PendingIcon,
} from "@mui/icons-material";
import { api } from "@/lib/api";
import { qk } from "@/lib/queryKeys";
import { tokens } from "@/theme";
import { Wallet, Transaction, TransactionRole } from "@/types/wallet";
import { Annot, PayLogo, PaymentFooterLogos, StatusChip, TopUpDialog, WithdrawDialog, fmtUsd, type PayLogoId } from "@/components/payment";

type StatusFilter = "all" | "completed" | "pending" | "cancelled";
const STATUS_FILTERS: [StatusFilter, string][] = [
  ["all", "All"],
  ["pending", "Pending"],
  ["completed", "Completed"],
  ["cancelled", "Cancelled"],
];

type RoleFilter = "all" | "buyer" | "seller" | "account";
const ROLE_FILTERS: [RoleFilter, string][] = [
  ["all", "All activity"],
  ["buyer", "As client"],
  ["seller", "As freelancer"],
  ["account", "Top-ups & withdrawals"],
];

/** Per-type display: label + how the amount reads. "in" = green +, "out" = –, "info" = unsigned. */
const TYPE_DISPLAY: Record<string, { label: string; flow: "in" | "out" | "info" }> = {
  deposit: { label: "Wallet top-up", flow: "in" },
  withdrawal: { label: "Withdrawal", flow: "out" },
  payment: { label: "Committed to order", flow: "out" },
  release: { label: "Order completed — escrow settled", flow: "info" },
  refund: { label: "Refund received", flow: "in" },
  earning: { label: "Earning (in escrow)", flow: "info" },
  clearance: { label: "Earning paid to wallet", flow: "in" },
};

function typeDisplay(t: Transaction): { label: string; flow: "in" | "out" | "info" } {
  if (t.type === "dispute_release") {
    return t.role === "buyer"
      ? { label: "Dispute settled — paid to freelancer", flow: "info" }
      : { label: "Dispute payout received", flow: "in" };
  }
  if (t.type === "dispute_refund") {
    return t.role === "buyer"
      ? { label: "Dispute refund received", flow: "in" }
      : { label: "Dispute — escrow returned to client", flow: "info" };
  }
  if (t.type === "earning" && t.status === "completed") {
    return { label: "Earning released", flow: "info" };
  }
  return TYPE_DISPLAY[t.type] ?? { label: "Transaction", flow: "info" };
}

const ROLE_TAG: Record<TransactionRole, { label: string; color: string; bg: string }> = {
  buyer: { label: "As client", color: "#92400E", bg: "rgba(234,88,12,0.08)" },
  seller: { label: "As freelancer", color: "#166534", bg: "rgba(22,163,74,0.08)" },
  account: { label: "Account", color: "#475569", bg: "rgba(0,0,0,0.05)" },
};

/**
 * The ONE wallet surface, identical in both spaces: same balance, same Top up
 * and Withdraw, same complete history (both roles, correctly labelled), with
 * the role-split escrow cards. Lifetime totals are demoted below the cards so
 * "money I have" is never confused with "money I've ever moved".
 */
export default function FinanceView({ mode }: { mode: "client" | "freelancer" }) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
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
  const balance = wallet ? parseFloat(String(wallet.available_balance_raw)) : 0;
  const committed = wallet?.committed_to_orders_raw ?? 0;
  const pendingEarnings = wallet?.pending_earnings_raw ?? 0;
  const totalSpent = wallet ? parseFloat(String(wallet.total_spent_raw)) : 0;
  const totalEarned = wallet ? parseFloat(String(wallet.total_earnings_raw)) : 0;

  const refresh = async () => {
    await refetch();
    queryClient.invalidateQueries({ queryKey: mode === "client" ? qk.dashboard.client() : qk.dashboard.freelancer() });
  };

  const filtered = transactions.filter(t =>
    (statusFilter === "all" || t.status === statusFilter) &&
    (roleFilter === "all" || (t.role ?? "account") === roleFilter)
  );

  const formatDate = (s: string) => new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const txnTitle = (t: Transaction) => t.metadata?.service_title || t.order?.service?.title || t.description || "Transaction";

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

  return (
    <Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 3 }}>
        <Annot>Finance overview · one shared wallet, both roles</Annot>
        <Typography sx={{ fontSize: { xs: 28, md: 34 }, fontWeight: 600, letterSpacing: "-0.03em" }}>Wallet</Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 320px" }, gap: 3, alignItems: "start" }}>
        {/* Left column */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Balance + role-split escrow */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3,1fr)" }, gap: 1.5 }}>
            {/* Available balance — identical in both modes */}
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
              <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.5)", mt: 0.5 }}>One shared wallet · free to spend or withdraw</Typography>
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

            {/* Committed to orders — buyer escrow (amber, money out) */}
            <Box sx={{ display: "flex", flexDirection: "column", bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius.card}px`, p: 2.25 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.875 }}>
                  <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#EA580C" }} />
                  <Typography sx={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.02em", color: tokens.text2 }}>Committed to orders</Typography>
                </Box>
                <ShieldIcon sx={{ fontSize: 15, color: tokens.text3 }} />
              </Box>
              <Typography sx={{ fontFamily: tokens.mono, fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em" }}>{fmtUsd(committed)}</Typography>
              <Typography sx={{ fontSize: 11, color: tokens.text3, mt: "auto", pt: 0.5 }}>Held in escrow for gigs you&apos;re buying</Typography>
            </Box>

            {/* Pending earnings — seller escrow (green, money in) */}
            <Box sx={{ display: "flex", flexDirection: "column", bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius.card}px`, p: 2.25 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.875 }}>
                  <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: tokens.success }} />
                  <Typography sx={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.02em", color: tokens.text2 }}>Pending earnings</Typography>
                </Box>
                <PendingIcon sx={{ fontSize: 15, color: tokens.text3 }} />
              </Box>
              <Typography sx={{ fontFamily: tokens.mono, fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", color: tokens.successText }}>{fmtUsd(pendingEarnings)}</Typography>
              <Typography sx={{ fontSize: 11, color: tokens.text3, mt: "auto", pt: 0.5 }}>Coming to you when your gigs complete</Typography>
            </Box>
          </Box>

          {/* Lifetime totals — deliberately demoted, never confused with live balances */}
          <Box sx={{ display: "flex", gap: 3, px: 0.5, flexWrap: "wrap" }}>
            <Typography sx={{ fontSize: 12.5, color: tokens.text3 }}>
              Lifetime spent as client: <Box component="span" sx={{ fontFamily: tokens.mono, fontWeight: 600, color: tokens.text2 }}>{fmtUsd(totalSpent)}</Box>
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: tokens.text3 }}>
              Lifetime earned as freelancer: <Box component="span" sx={{ fontFamily: tokens.mono, fontWeight: 600, color: tokens.text2 }}>{fmtUsd(totalEarned)}</Box>
            </Typography>
          </Box>

          {/* Transaction history */}
          <Box sx={{ bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius.card}px`, p: { xs: 2.25, md: 3 } }}>
            <Typography sx={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.015em", mb: 0.5 }}>Transaction history</Typography>
            <Typography sx={{ fontSize: 12.5, color: tokens.text3, mb: 2 }}>Your complete financial picture — buying and selling together, every row tagged.</Typography>

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
              {ROLE_FILTERS.map(([k, label]) => {
                const active = roleFilter === k;
                return (
                  <Box key={k} component='button' type='button' onClick={() => setRoleFilter(k)}
                    sx={{ height: 34, px: 2, borderRadius: "999px", cursor: "pointer", font: "inherit", fontSize: 13, fontWeight: 500, border: "none",
                      bgcolor: active ? "#000" : "rgba(0,0,0,0.05)", color: active ? "#fff" : tokens.text2,
                      "&:hover": { bgcolor: active ? "#000" : "rgba(0,0,0,0.09)" } }}>
                    {label}
                  </Box>
                );
              })}
            </Box>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
              {STATUS_FILTERS.map(([k, label]) => {
                const active = statusFilter === k;
                return (
                  <Box key={k} component='button' type='button' onClick={() => setStatusFilter(k)}
                    sx={{ height: 28, px: 1.5, borderRadius: "999px", cursor: "pointer", font: "inherit", fontSize: 12, fontWeight: 500,
                      border: `1px solid ${active ? "#000" : tokens.border}`, bgcolor: active ? "rgba(0,0,0,0.04)" : "transparent", color: active ? tokens.text : tokens.text2,
                      "&:hover": { borderColor: tokens.borderStrong } }}>
                    {label}
                  </Box>
                );
              })}
            </Box>

            {filtered.length === 0 ? (
              <Typography sx={{ textAlign: "center", py: 4, fontSize: 14, color: tokens.text2 }}>No matching transactions.</Typography>
            ) : (
              <Box>
                {filtered.map(t => {
                  const display = typeDisplay(t);
                  const roleTag = ROLE_TAG[t.role ?? "account"];
                  return (
                    <Box key={t.id} sx={{ display: "flex", alignItems: "center", gap: 1.75, py: 1.75, borderBottom: `1px solid ${tokens.border}`, "&:last-of-type": { borderBottom: "none" } }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: tokens.canvas, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                        {display.flow === "in"
                          ? <ArrowDownIcon sx={{ fontSize: 18, color: tokens.success }} />
                          : display.flow === "out"
                            ? <ArrowUpIcon sx={{ fontSize: 18, color: tokens.text2 }} />
                            : <ShieldIcon sx={{ fontSize: 16, color: tokens.text3 }} />}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                          <Typography sx={{ fontSize: 14.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{txnTitle(t)}</Typography>
                          <Box sx={{ px: 0.9, py: 0.2, borderRadius: "999px", fontSize: 10.5, fontWeight: 700, color: roleTag.color, bgcolor: roleTag.bg, whiteSpace: "nowrap" }}>
                            {roleTag.label}
                          </Box>
                        </Box>
                        <Typography sx={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.02em", color: tokens.text2 }}>
                          {display.label} · {formatDate(t.created_at)}
                          {t.order_reference ? <Box component="span" sx={{ fontFamily: tokens.mono }}> · {t.order_reference}</Box> : null}
                        </Typography>
                        {t.metadata?.note && (
                          <Typography sx={{ fontSize: 12, color: tokens.text3, fontStyle: "italic", mt: 0.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            “{t.metadata.note}”
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.625 }}>
                        <Typography sx={{ fontFamily: tokens.mono, fontSize: 15, fontWeight: 600, color: display.flow === "in" ? tokens.successText : display.flow === "out" ? tokens.text : tokens.text3 }}>
                          {display.flow === "in" ? "+" : display.flow === "out" ? "–" : ""}{fmtUsd(Math.abs(parseFloat(t.amount_raw)))}
                        </Typography>
                        <StatusChip status={t.status === "cancelled" ? "failed" : t.status}>{t.status.charAt(0).toUpperCase() + t.status.slice(1)}</StatusChip>
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
            {(["visa", "mc", "unionpay", "jcb", "alipay", "wechat"] as PayLogoId[]).map(id => (
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
