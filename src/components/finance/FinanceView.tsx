"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Wallet as WalletIcon, Plus as AddIcon, ArrowUp as ArrowUpIcon, ArrowDown as ArrowDownIcon, ShieldCheck as ShieldIcon, Clock as PendingIcon } from "lucide-react";
import { css } from "styled-system/css";
import { tapTarget } from "@/components/ds/tap";
import { Spinner } from "@/components/ds";
import { api } from "@/lib/api";
import { qk } from "@/lib/queryKeys";
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

// ─── Styles ──────────────────────────────────────────────────────────────────

const loadingBlock = css({ display: "flex", justifyContent: "center", alignItems: "center", minH: "400px", color: "ink3" });
const errorBlock = css({ textAlign: "center", py: "48px" });
const errorText = css({ textStyle: "ui", color: "errorText" });
const retryBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  minW: "64px", px: "8px", py: "6px", border: "none", borderRadius: "4px",
  bg: "transparent", color: "inherit", textStyle: "meta", fontWeight: 500,
  cursor: "pointer",
  _hover: { bg: "rgba(0,0,0,0.04)" },
});

const head = css({ display: "flex", flexDirection: "column", gap: "8px", mb: "24px" });
const headTitle = css({ textStyle: "stat", fontWeight: 600 });

const layout = css({
  display: "grid", gap: "24px", alignItems: "start",
  gridTemplateColumns: { base: "1fr", lg: "1fr 320px" },
});
const leftCol = css({ display: "flex", flexDirection: "column", gap: "16px", minW: 0 });
const balanceGrid = css({
  display: "grid", gap: "12px",
  gridTemplateColumns: { base: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
});

const balanceCard = css({
  position: "relative", overflow: "hidden", display: "flex", flexDirection: "column",
  borderRadius: "card", p: "18px", color: "#fff",
  background: "linear-gradient(135deg, #000, rgba(0,0,0,0.82))",
});
const cardHead = css({ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "12px" });
const cardHeadLeft = css({ display: "flex", alignItems: "center", gap: "7px", minW: 0 });
const dot = css({ w: "7px", h: "7px", borderRadius: "50%", flexShrink: 0 });
const balanceLabel = css({ textStyle: "meta", fontWeight: 500, color: "rgba(255,255,255,0.72)" });
const balanceAmountRow = css({ display: "flex", alignItems: "baseline", gap: "3.2px" });
const balanceCurrency = css({ textStyle: "lead", fontWeight: 500, color: "rgba(255,255,255,0.6)" });
const balanceValue = css({ fontVariantNumeric: "tabular-nums", textStyle: "stat", fontWeight: 600 });
const balanceNote = css({ textStyle: "micro", color: "rgba(255,255,255,0.5)" });
const balanceActions = css({ display: "flex", gap: "8px", mt: "auto", pt: "14px" });
const topUpBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px",
  flex: 1, minW: 0, h: "36px", px: "16px", borderRadius: "999px", border: "none",
  bg: "#fff", color: "#000", textStyle: "ui", fontWeight: 600,
  cursor: "pointer",
  _hover: { bg: "rgba(255,255,255,0.88)" },
  "& svg": { display: "block" },
});
const withdrawBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px",
  flex: 1, minW: 0, h: "36px", px: "16px", borderRadius: "999px", boxSizing: "border-box",
  borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(255,255,255,0.28)",
  bg: "transparent", color: "#fff", textStyle: "ui", fontWeight: 600,
  cursor: "pointer",
  _hover: { bg: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.4)" },
  "& svg": { display: "block" },
});

const escrowCard = css({
  display: "flex", flexDirection: "column", bg: "surface",
  borderWidth: "1px", borderStyle: "solid", borderColor: "hairline",
  borderRadius: "card", p: "18px",
});
const escrowLabel = css({ textStyle: "meta", fontWeight: 500, color: "ink2" });
const escrowValue = css({ fontVariantNumeric: "tabular-nums", textStyle: "heading", fontWeight: 600 });
const escrowValueGreen = css({ fontVariantNumeric: "tabular-nums", textStyle: "heading", fontWeight: 600, color: "successText" });
// `mt: auto` never applied to these <p>s (globals.css resets p margins) — only the 4px padding did.
const escrowNote = css({ textStyle: "micro", color: "ink3", pt: "4px" });

const lifetimeRow = css({ display: "flex", gap: "24px", px: "4px", flexWrap: "wrap" });
const lifetimeText = css({ textStyle: "meta", color: "ink3" });
const lifetimeValue = css({ fontVariantNumeric: "tabular-nums", fontWeight: 600, color: "ink2" });

const panel = css({
  bg: "surface", borderWidth: "1px", borderStyle: "solid", borderColor: "hairline",
  borderRadius: "card", p: { base: "18px", md: "24px" }, minW: 0,
});
const panelTitle = css({ textStyle: "title", fontWeight: 600 });
const panelSub = css({ textStyle: "meta", color: "ink3" });

const filterRow = css({ display: "flex", gap: "8px", flexWrap: "wrap", mb: "8px" });
const roleBtn = css(tapTarget, {
  h: "34px", px: "16px", borderRadius: "999px", cursor: "pointer", border: "none",
  textStyle: "ui", fontWeight: 500,
  bg: "rgba(0,0,0,0.05)", color: "ink2",
  _hover: { bg: "rgba(0,0,0,0.09)" },
  "&[data-active]": { bg: "#000", color: "#fff", _hover: { bg: "#000" } },
});
const statusBtn = css(tapTarget, {
  h: "28px", px: "12px", borderRadius: "999px", cursor: "pointer",
  textStyle: "meta", fontWeight: 500,
  borderWidth: "1px", borderStyle: "solid", borderColor: "hairline",
  bg: "transparent", color: "ink2",
  _hover: { borderColor: "hairlineStrong" },
  "&[data-active]": { borderColor: "#000", bg: "rgba(0,0,0,0.04)", color: "ink", _hover: { borderColor: "#000" } },
});

const emptyText = css({ textAlign: "center", py: "32px", textStyle: "body", color: "ink2" });
const txnRow = css({
  display: "flex", alignItems: "center", gap: "14px", py: "14px",
  borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "hairline",
  "&:last-of-type": { borderBottomStyle: "none" },
});
const txnIcon = css({
  w: "40px", h: "40px", borderRadius: "10px", bg: "canvas",
  display: "flex", alignItems: "center", justifyContent: "center", flex: "none",
});
const txnMain = css({ flex: 1, minW: 0 });
const txnTitleRow = css({ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" });
const txnTitleCss = css({ textStyle: "body", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxW: "100%" });
const txnTag = css({
  display: "inline-block", px: "7.2px", py: "1.6px", borderRadius: "999px",
  textStyle: "micro", fontWeight: 700, whiteSpace: "nowrap",
});
const txnMeta = css({ textStyle: "meta", fontWeight: 500, color: "ink2" });
const txnRef = css({ fontVariantNumeric: "tabular-nums" });
const txnNote = css({ textStyle: "meta", color: "ink3", fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });
const txnRight = css({ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "5px" });
const txnAmount = css({ fontVariantNumeric: "tabular-nums", textStyle: "body", fontWeight: 600 });

const methodTitle = css({ textStyle: "lead", fontWeight: 600 });
const methodList = css({ display: "flex", flexDirection: "column", gap: "10px" });
const methodRow = css({
  display: "flex", alignItems: "center", gap: "12px", p: "12px",
  borderWidth: "1px", borderStyle: "solid", borderColor: "hairline", borderRadius: "cardSm",
});
const methodName = css({ textStyle: "body", fontWeight: 600 });
const methodSub = css({ textStyle: "micro", fontWeight: 500, color: "ink2" });
// The old height:1 in the old style prop meant 100% (its sizing shorthand), which resolved to a
// 0px box inside the auto-height column, so this "divider" always rendered as plain
// whitespace with no line. Ported as rendered: an 18px spacer.
const hairlineRule = css({ h: "18px" });
const acceptedLabel = css({ textStyle: "eyebrow", fontWeight: 600, color: "ink3" });
const logoRow = css({ display: "flex", gap: "8px", flexWrap: "wrap" });
const footerWrap = css({ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "hairline", mt: "24px", pt: "24px" });

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
      <div className={loadingBlock}>
        <Spinner size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={errorBlock}>
        <p className={errorText}>
          {error instanceof Error ? error.message : "Failed to fetch finance data"}
        </p>
        <button type="button" onClick={() => refetch()} className={retryBtn}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className={head}>
        <Annot>Finance overview · one shared wallet, both roles</Annot>
        <p className={headTitle}>Wallet</p>
      </div>

      <div className={layout}>
        {/* Left column */}
        <div className={leftCol}>
          {/* Balance + role-split escrow */}
          <div className={balanceGrid}>
            {/* Available balance — identical in both modes */}
            <div className={balanceCard}>
              <div className={cardHead}>
                <div className={cardHeadLeft}>
                  <span className={dot} style={{ background: "var(--colors-success)" }} />
                  <span className={balanceLabel}>Available balance</span>
                </div>
                <WalletIcon size={15} color="rgba(255,255,255,0.5)" />
              </div>
              <div className={balanceAmountRow}>
                <span className={balanceCurrency}>$</span>
                <span className={balanceValue}>{balance.toFixed(2)}</span>
              </div>
              <p className={balanceNote}>One shared wallet · free to spend or withdraw</p>
              <div className={balanceActions}>
                <button type="button" onClick={() => setTopUpOpen(true)} className={topUpBtn}>
                  <AddIcon size={15} />
                  Top up
                </button>
                <button type="button" onClick={() => setShowWithdraw(true)} className={withdrawBtn}>
                  <ArrowUpIcon size={15} />
                  Withdraw
                </button>
              </div>
            </div>

            {/* Committed to orders — buyer escrow (amber, money out) */}
            <div className={escrowCard}>
              <div className={cardHead}>
                <div className={cardHeadLeft}>
                  <span className={dot} style={{ background: "#EA580C" }} />
                  <span className={escrowLabel}>Committed to orders</span>
                </div>
                <ShieldIcon size={15} className={css({ color: "ink3" })} />
              </div>
              <p className={escrowValue}>{fmtUsd(committed)}</p>
              <p className={escrowNote}>Held in escrow for gigs you&apos;re buying</p>
            </div>

            {/* Pending earnings — seller escrow (green, money in) */}
            <div className={escrowCard}>
              <div className={cardHead}>
                <div className={cardHeadLeft}>
                  <span className={dot} style={{ background: "var(--colors-success)" }} />
                  <span className={escrowLabel}>Pending earnings</span>
                </div>
                <PendingIcon size={15} className={css({ color: "ink3" })} />
              </div>
              <p className={escrowValueGreen}>{fmtUsd(pendingEarnings)}</p>
              <p className={escrowNote}>Coming to you when your gigs complete</p>
            </div>
          </div>

          {/* Lifetime totals — deliberately demoted, never confused with live balances */}
          <div className={lifetimeRow}>
            <p className={lifetimeText}>
              Lifetime spent as client: <span className={lifetimeValue}>{fmtUsd(totalSpent)}</span>
            </p>
            <p className={lifetimeText}>
              Lifetime earned as freelancer: <span className={lifetimeValue}>{fmtUsd(totalEarned)}</span>
            </p>
          </div>

          {/* Transaction history */}
          <div className={panel}>
            <p className={panelTitle}>Transaction history</p>
            <p className={panelSub}>Your complete financial picture — buying and selling together, every row tagged.</p>

            <div className={filterRow}>
              {ROLE_FILTERS.map(([k, label]) => (
                <button key={k} type="button" onClick={() => setRoleFilter(k)} className={roleBtn} data-active={roleFilter === k ? "" : undefined}>
                  {label}
                </button>
              ))}
            </div>
            <div className={filterRow}>
              {STATUS_FILTERS.map(([k, label]) => (
                <button key={k} type="button" onClick={() => setStatusFilter(k)} className={statusBtn} data-active={statusFilter === k ? "" : undefined}>
                  {label}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <p className={emptyText}>No matching transactions.</p>
            ) : (
              <div>
                {filtered.map(t => {
                  const display = typeDisplay(t);
                  const roleTag = ROLE_TAG[t.role ?? "account"];
                  return (
                    <div key={t.id} className={txnRow}>
                      <div className={txnIcon}>
                        {display.flow === "in"
                          ? <ArrowDownIcon size={18} className={css({ color: "success" })} />
                          : display.flow === "out"
                            ? <ArrowUpIcon size={18} className={css({ color: "ink2" })} />
                            : <ShieldIcon size={16} className={css({ color: "ink3" })} />}
                      </div>
                      <div className={txnMain}>
                        <div className={txnTitleRow}>
                          <p className={txnTitleCss}>{txnTitle(t)}</p>
                          <span className={txnTag} style={{ color: roleTag.color, background: roleTag.bg }}>
                            {roleTag.label}
                          </span>
                        </div>
                        <p className={txnMeta}>
                          {display.label} · {formatDate(t.created_at)}
                          {t.order_reference ? <span className={txnRef}> · {t.order_reference}</span> : null}
                        </p>
                        {t.metadata?.note && (
                          <p className={txnNote}>
                            “{t.metadata.note}”
                          </p>
                        )}
                      </div>
                      <div className={txnRight}>
                        <p className={txnAmount} style={{ color: display.flow === "in" ? "var(--colors-successText)" : display.flow === "out" ? "var(--colors-ink)" : "var(--colors-ink3)" }}>
                          {display.flow === "in" ? "+" : display.flow === "out" ? "–" : ""}{fmtUsd(Math.abs(parseFloat(t.amount_raw)))}
                        </p>
                        <StatusChip status={t.status === "cancelled" ? "failed" : t.status}>{t.status.charAt(0).toUpperCase() + t.status.slice(1)}</StatusChip>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column — payment methods */}
        <div className={panel}>
          <p className={methodTitle}>Payment methods</p>
          <div className={methodList}>
            {[
              { id: "khqr" as PayLogoId, name: "ABA KHQR", sub: "Default · scan to pay", primary: true },
              { id: "visa" as PayLogoId, name: "Visa ···· 4242", sub: "Expires 09/27", primary: false },
            ].map(m => (
              <div key={m.id} className={methodRow}>
                <PayLogo id={m.id} />
                <div className={css({ flex: 1, minW: 0 })}>
                  <p className={methodName}>{m.name}</p>
                  <p className={methodSub}>{m.sub}</p>
                </div>
                {m.primary && <StatusChip status='neutral' dot={false}>Default</StatusChip>}
              </div>
            ))}
          </div>
          <div className={hairlineRule} />
          <p className={acceptedLabel}>Accepted via ABA PayWay</p>
          <div className={logoRow}>
            {(["visa", "mc", "unionpay", "jcb", "alipay", "wechat"] as PayLogoId[]).map(id => (
              <PayLogo key={id} id={id} size='sm' />
            ))}
          </div>
        </div>
      </div>

      <div className={footerWrap}>
        <PaymentFooterLogos variant='light' />
      </div>

      <TopUpDialog open={topUpOpen} onClose={() => setTopUpOpen(false)} currentBalance={balance} suggestedAmount={25} />
      <WithdrawDialog open={showWithdraw} onClose={() => setShowWithdraw(false)} available={balance} onSuccess={refresh} />
    </div>
  );
}
