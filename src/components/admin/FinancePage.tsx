"use client";

import { useState } from "react";
import Link from "next/link";
import { css, cx } from "styled-system/css";
import { Check, Wallet } from "lucide-react";
import { api, type AdminTransaction } from "@/lib/api";
import { useCommissionRate } from "@/hooks/useCommissionRate";
import { useAdminAction, useFinanceStats, useTransactions, useWithdrawals } from "./queries";
import { useToast } from "./toast";
import { Avatar, Btn, EmptyState, ErrorState, Field, Loading, Modal, Pager, Panel, Pill, Segmented, Select, Tabs, Textarea, page, PageHeader, row, table, text, stack } from "./ui";
import { ago, dateTime, errorMessage, money, waiting } from "./format";
import { payoutLabel, txnLabel, txnMeta } from "./labels";

type PayoutFilter = "pending" | "completed" | "cancelled";

const kpiStrip = css({ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", "& > div": { p: "16px 20px", borderRightWidth: "1px", borderRightStyle: "solid", borderRightColor: "var(--td-line)" }, "& > div:last-child": { borderRight: "none" } });
const kpiNum = css({ fontSize: "22px", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.1, fontVariantNumeric: "tabular-nums", mt: "6px" });
const amt = css({ fontVariantNumeric: "tabular-nums", fontFamily: "var(--td-mono)", fontWeight: 600 });

function personCell(t: AdminTransaction) {
  const name = t.user?.name ?? "Unknown";
  const inner = (
    <div className={row({ gap: 3 })}>
      <Avatar name={name} size="sm" seed={t.user?.id ?? t.id} />
      <div>
        <p className={text({ weight: 600 })}>{name}</p>
        <p className={text({ size: "sm", tone: 3 })}>{t.user?.email ?? ""}</p>
      </div>
    </div>
  );
  return t.user?.id ? <Link href={`/admin/people/${t.user.id}`} className={css({ display: "inline-block", _hover: { textDecoration: "underline" } })}>{inner}</Link> : inner;
}

export default function FinancePage() {
  const toast = useToast();
  const [tab, setTab] = useState<"payouts" | "transactions">("payouts");
  const [pf, setPf] = useState<PayoutFilter>("pending");
  const [payoutPage, setPayoutPage] = useState(1);
  const [type, setType] = useState("");
  const [txnPage, setTxnPage] = useState(1);
  const [reject, setReject] = useState<{ id: number; note: string } | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const stats = useFinanceStats();
  const rate = useCommissionRate();
  const payouts = useWithdrawals(pf, payoutPage, tab === "payouts");
  const txns = useTransactions(type, txnPage, tab === "transactions");
  const approve = useAdminAction((id: number) => api.approveWithdrawal(id));
  const rejectPayout = useAdminAction(({ id, note }: { id: number; note: string }) => api.rejectWithdrawal(id, note));

  const prow = [...(payouts.data?.data.data ?? [])].sort((a, b) => (pf === "pending" ? +new Date(a.created_at) - +new Date(b.created_at) : 0));
  const trow = txns.data?.data.data ?? [];
  const s = stats.data;

  const doApprove = async (p: AdminTransaction) => {
    setBusyId(p.id);
    try { await approve.mutateAsync(p.id); toast(`${money(p.amount)} payout to ${p.user?.name ?? "the freelancer"} approved.`); }
    catch (err) { toast(errorMessage(err), "error"); }
    finally { setBusyId(null); }
  };
  const confirmReject = async () => {
    if (!reject) return;
    setBusyId(reject.id);
    try { await rejectPayout.mutateAsync({ id: reject.id, note: reject.note.trim() }); toast("Payout rejected. The balance stays in the freelancer's wallet."); setReject(null); }
    catch (err) { toast(errorMessage(err), "error"); }
    finally { setBusyId(null); }
  };

  return (
    <div className={page}>
      <PageHeader title="Finance" description="Payouts move money out of the platform and need a manual approval. The ledger below is every wallet movement." />
      <Panel className={css({ mb: "24px" })}>
        {stats.isLoading ? <Loading /> : stats.isError || !s ? <ErrorState onRetry={() => stats.refetch()} /> : (
          <div className={kpiStrip}>
            <div><p className={text({ size: "sm", tone: 2 })}>Gross volume today</p><p className={kpiNum}>{money(s.gmv_today)}</p><p className={cx(text({ size: "sm", tone: 3 }), css({ mt: "4px" }))}>{money(s.total_gmv)} all time</p></div>
            <div><p className={text({ size: "sm", tone: 2 })}>Payouts awaiting approval</p><p className={kpiNum}>{money(s.pending_payouts_amount)}</p><p className={cx(text({ size: "sm", tone: 3 }), css({ mt: "4px" }))}>{s.pending_payouts_count} {s.pending_payouts_count === 1 ? "request" : "requests"}</p></div>
            <div><p className={text({ size: "sm", tone: 2 })}>Refunds today</p><p className={kpiNum}>{money(s.refunds_today_amount)}</p><p className={cx(text({ size: "sm", tone: 3 }), css({ mt: "4px" }))}>{s.refunds_today_count} {s.refunds_today_count === 1 ? "refund" : "refunds"}</p></div>
            <div><p className={text({ size: "sm", tone: 2 })}>Platform commission</p><p className={kpiNum}>{rate != null ? `${Math.round(rate * 100)}%` : "—"}</p><p className={cx(text({ size: "sm", tone: 3 }), css({ mt: "4px" }))}>Charged to sellers on completion</p></div>
          </div>
        )}
      </Panel>

      <div className={css({ mb: "16px" })}>
        <Tabs value={tab} onChange={setTab} items={[{ value: "payouts", label: s ? `Payouts (${s.pending_payouts_count} to approve)` : "Payouts" }, { value: "transactions", label: "Transactions" }]} />
      </div>

      {tab === "payouts" ? (
        <>
          <div className={cx(row({ between: true }), css({ mb: "14px" }))}>
            <Segmented value={pf} onChange={(v) => { setPf(v); setPayoutPage(1); }} items={[{ value: "pending", label: "To approve", count: s?.pending_payouts_count }, { value: "completed", label: "Paid" }, { value: "cancelled", label: "Rejected" }]} />
            {pf === "pending" && prow.length ? <span className={text({ size: "sm", tone: 3 })}>Oldest first</span> : null}
          </div>
          <Panel>
            {payouts.isLoading ? <Loading /> : payouts.isError ? <ErrorState onRetry={() => payouts.refetch()} /> : prow.length === 0 ? <EmptyState icon={<Wallet size={20} />} title={pf === "pending" ? "No payouts waiting" : `No ${payoutLabel[pf].label.toLowerCase()} payouts`} /> : (
              <table className={table}>
                <thead><tr><th>Freelancer</th><th className="num">Amount</th><th>Destination</th><th>{pf === "pending" ? "Waiting" : "Requested"}</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {prow.map((p) => (
                    <tr key={p.id}>
                      <td>{personCell(p)}</td>
                      <td className="num"><span className={amt}>{money(p.amount)}</span></td>
                      <td><p>{p.metadata?.destination ?? "—"}</p>{p.metadata?.note ? <p className={cx(text({ size: "xs", tone: 3 }), css({ maxW: "260px" }))}>{p.metadata.note}</p> : null}</td>
                      <td>{pf === "pending" ? <><p className={text({ weight: 500 })}>{waiting(p.created_at)}</p><p className={text({ size: "sm", tone: 3 })}>{dateTime(p.created_at)}</p></> : <p className={text({ tone: 2 })}>{ago(p.created_at)}</p>}</td>
                      <td><div className={cx(stack({ gap: 1 }), css({ alignItems: "flex-start" }))}><Pill tone={payoutLabel[p.status].tone} dot={p.status === "pending"}>{payoutLabel[p.status].label}</Pill>{p.admin_note && p.status !== "pending" ? <span className={cx(text({ size: "xs", tone: 3 }), css({ maxW: "260px" }))}>{p.admin_note}</span> : null}</div></td>
                      <td className="actions">{p.status === "pending" ? <span className={row({ gap: 2 })}><Btn size="sm" variant="dangerSoft" disabled={busyId === p.id} onClick={() => setReject({ id: p.id, note: "" })}>Reject</Btn><Btn size="sm" variant="success" disabled={busyId === p.id} onClick={() => doApprove(p)}><Check size={14} /> {busyId === p.id ? "Working…" : "Approve"}</Btn></span> : null}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <Pager meta={payouts.data?.data.meta} onPage={setPayoutPage} noun="payouts" />
          </Panel>
        </>
      ) : (
        <>
          <div className={cx(row({ between: true }), css({ mb: "14px" }))}>
            <div className={row({ gap: 2 })}>
              <span className={text({ size: "sm", tone: 2 })}>Type</span>
              <Select value={type} onChange={(e) => { setType(e.target.value); setTxnPage(1); }} className={css({ w: "180px" })}>
                <option value="">All types</option>
                {Object.keys(txnLabel).map((t) => <option key={t} value={t}>{txnLabel[t]!.label}</option>)}
              </Select>
            </div>
            {txns.data ? <span className={text({ size: "sm", tone: 3 })}>{txns.data.data.meta.total.toLocaleString("en-US")} transactions</span> : null}
          </div>
          <Panel>
            {txns.isLoading ? <Loading /> : txns.isError ? <ErrorState onRetry={() => txns.refetch()} /> : trow.length === 0 ? <EmptyState icon={<Wallet size={20} />} title="No transactions" body="Wallet movements appear here as orders are paid and completed." /> : (
              <table className={table}>
                <thead><tr><th>When</th><th>Person</th><th>Description</th><th>Type</th><th className="num">Amount</th><th>Status</th></tr></thead>
                <tbody>
                  {trow.map((t) => (
                    <tr key={t.id}>
                      <td><p className={text({ weight: 500 })}>{dateTime(t.created_at)}</p><p className={text({ size: "xs", tone: 3, mono: true })}>#{t.id}{t.order_id ? ` · order #${t.order_id}` : ""}</p></td>
                      <td>{t.user?.id ? <Link href={`/admin/people/${t.user.id}`} className={cx(row({ gap: 2 }), css({ _hover: { textDecoration: "underline" } }))}><Avatar name={t.user.name} size="xs" seed={t.user.id} /> {t.user.name}</Link> : <span className={text({ tone: 3 })}>—</span>}</td>
                      <td><span className={text({ tone: 2 })}>{t.description}</span></td>
                      <td><Pill tone={txnMeta(t.type).tone}>{txnMeta(t.type).label}</Pill></td>
                      <td className="num"><span className={amt}>{money(t.amount)}</span></td>
                      <td><Pill tone={t.status === "completed" ? "green" : t.status === "pending" ? "amber" : "neutral"}>{t.status === "completed" ? "Completed" : t.status === "pending" ? "Pending" : "Cancelled"}</Pill></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <Pager meta={txns.data?.data.meta} onPage={setTxnPage} noun="transactions" />
          </Panel>
        </>
      )}

      <Modal open={!!reject} onClose={() => setReject(null)} title="Reject this payout" description="Nothing is paid out. The amount returns to the freelancer's wallet and they see your note." size="sm"
        footer={<><Btn variant="ghost" onClick={() => setReject(null)}>Cancel</Btn><Btn variant="danger" disabled={!reject?.note.trim() || busyId != null} onClick={confirmReject}>{busyId != null ? "Rejecting…" : "Reject payout"}</Btn></>}>
        <Field label="Note to the freelancer"><Textarea autoFocus value={reject?.note ?? ""} onChange={(e) => setReject(reject && { ...reject, note: e.target.value })} placeholder="e.g. Please complete identity verification before requesting a payout." /></Field>
      </Modal>
    </div>
  );
}
