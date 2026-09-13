"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Clock,
  FileText,
  Flag,
  Lock,
  MessageCircle,
  Paperclip,
  RotateCcw,
  Shield,
  X,
} from "lucide-react";
import { css, cva, cx } from "styled-system/css";
import { Alert, Dialog, Spinner } from "@/components/ds";
import { BareModal } from "@/components/ds/BareModal";
import { api } from "@/lib/api";
import { CustomOrder, CustomOrderMilestone, MilestoneDeliverable } from "@/types/customOrder";
import {
  AttachChip, CoTextArea, EscrowSummary, MS_STATUS, Money, MsChip,
  coAvatar, coBtn, coBtnStart, coIconBtn, coLabel, coLabelAccent, initials,
} from "./kit";
import { useCoInvalidate } from "./hooks";
import FundMilestoneDialog from "./FundMilestoneDialog";

type Role = "client" | "freelancer";

const ESCROW = ["funded", "in_progress", "submitted"];
const DONE = ["approved", "released"];
const money = (n: number) => "$" + Number(n).toLocaleString();

/* ── page chrome ── */
const page = css({ minHeight: "100vh", bg: "canvas" });
const container = css({
  w: "100%",
  maxW: "980px",
  mx: "auto",
  boxSizing: "border-box",
  px: { base: "16px", sm: "32px" },
  py: { base: "24px", sm: "36px" },
});
const backBtn = css({ mb: "16px" });
const header = css({ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", mb: "16px" });

const pageTitle = css({ fontSize: "28px", fontWeight: 600, lineHeight: 1.5, letterSpacing: "-0.02em", color: "ink" });
const pageSub = css({ fontSize: "14px", lineHeight: 1.5, color: "ink2" });
const headActions = css({ display: "flex", gap: "10px", alignItems: "flex-start" });
const parties = css({ display: "flex", gap: "16px", flexWrap: "wrap", mb: "18px" });

const turnBanner = cva({
  base: { display: "flex", gap: "10px", alignItems: "center", p: "12px 16px", borderRadius: "12px", mb: "16px" },
  variants: {
    who: {
      you: { bg: "pendingTint" },
      done: { bg: "successTint" },
      them: { bg: "surface", borderWidth: "1px", borderStyle: "solid", borderColor: "hairline" },
    },
  },
});
const turnText = cva({
  base: { fontSize: "13.5px", lineHeight: 1.5, fontWeight: 500 },
  variants: { who: { you: { color: "pendingText" }, done: { color: "successText" }, them: { color: "ink2" } } },
});
const alertGap = css({ mb: "16px" });
const escrowGap = css({ mb: "22px" });

/* ── tracker ── */
const msRow = css({ display: "flex", gap: "18px" });
const rail = css({ position: "relative", width: "34px", flex: "none", display: "flex", flexDirection: "column", alignItems: "center" });
const railTop = cva({
  base: { position: "absolute", top: "-14px", height: "18px", width: "2px" },
  variants: { done: { true: { bg: "success" }, false: { bg: "hairline" } } },
});
const railLine = cva({
  base: { flex: 1, width: "2px", mt: "4px" },
  variants: { done: { true: { bg: "success" }, false: { bg: "hairline" } } },
});
const railNode = cva({
  base: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    zIndex: 1,
    fontFamily: "mono",
    fontSize: "12px",
    fontWeight: 600,
    borderWidth: "1.5px",
    borderStyle: "solid",
  },
  variants: {
    tone: {
      success: { bg: "success", color: "#fff", borderColor: "success" },
      pending: { bg: "surface", color: "pendingText", borderColor: "pending" },
      neutral: { bg: "surface", color: "ink3", borderColor: "hairlineStrong" },
    },
    active: { true: { boxShadow: "0 0 0 4px var(--colors-pending-tint)" } },
  },
});

// The card style is inlined (not `cx(coCard, …)`) so the `done`/`active`
// variants override bg/border cleanly inside one recipe.
const msCard = cva({
  base: {
    flex: 1,
    minWidth: 0,
    p: "16px 18px",
    mb: "14px",
    bg: "surface",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "hairline",
    borderRadius: "cardSm",
  },
  variants: {
    done: { true: { bg: "surface2" } },
    active: { true: { borderColor: "hairlineStrong", boxShadow: "0 6px 22px rgba(0,0,0,0.06)" } },
  },
});
const msHead = css({ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" });
const msTitleWrap = css({ minWidth: 0, flex: 1 });
const msTitleRow = css({ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" });
const msTitle = css({ fontWeight: 600, fontSize: "15px", lineHeight: 1.5, color: "ink" });
const msDesc = css({ fontSize: "13px", lineHeight: 1.5, color: "ink2" });
const msAmount = css({ textAlign: "right", flex: "none" });
const msStamp = css({ fontSize: "11px", lineHeight: 1.5, color: "ink3" });

const noteBox = css({ mt: "12px", p: "10px", bg: "surface2", borderWidth: "1px", borderStyle: "solid", borderColor: "hairline", borderRadius: "8px" });
const noteLabel = css({ fontSize: "11px", fontWeight: 600, lineHeight: 1.5, color: "ink3" });
const noteText = css({ fontSize: "13px", color: "ink2", lineHeight: 1.5, whiteSpace: "pre-wrap" });
const filesRow = css({ display: "flex", gap: "8px", flexWrap: "wrap", mt: "12px" });
const fileLink = css({ textDecoration: "none" });
const revBox = css({ mt: "12px", p: "10px", bg: "pendingTint", borderRadius: "8px" });
const revText = css({ fontSize: "12px", lineHeight: 1.5, color: "pendingText" });
const actionBar = css({ mt: "14px", pt: "14px", borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "hairline" });
const actionRow = css({ display: "flex", gap: "10px", flexWrap: "wrap" });

const partyRow = css({ display: "flex", alignItems: "center", gap: "8px" });
const partyName = css({ fontSize: "12.5px", lineHeight: 1.5, color: "ink2" });
const partyRole = css({ color: "ink3" });

const waitingRow = cva({
  base: { display: "flex", alignItems: "center", gap: "7px", fontSize: "12.5px" },
  variants: { muted: { true: { color: "ink3" }, false: { color: "pendingText" } } },
});

/* ── dialog chrome (shared by the note / submit / end dialogs) ── */
const panel = css({ borderWidth: "1px", borderStyle: "solid", borderColor: "hairline" });
const dlgHeader = css({ display: "flex", justifyContent: "space-between", alignItems: "flex-start", p: "22px 24px 0" });

const dlgTitle = css({ fontSize: "20px", fontWeight: 600, lineHeight: 1.5, letterSpacing: "-0.02em", color: "ink" });
const dlgContent = css({ p: "16px 24px 8px" });
const dlgLabel = css({ fontSize: "12px", fontWeight: 600, lineHeight: 1.5, color: "ink" });
const dlgFooter = css({ display: "flex", justifyContent: "flex-end", gap: "10px", p: "8px 24px 22px" });

const dropZone = css({
  borderWidth: "1.5px",
  borderStyle: "dashed",
  borderColor: "hairlineStrong",
  borderRadius: "10px",
  p: "16px",
  textAlign: "center",
  cursor: "pointer",
  _hover: { borderColor: "ink3" },
});
const dropIcon = css({ color: "ink3", display: "block", mx: "auto", mb: "4px" });
const dropText = css({ fontSize: "12.5px", lineHeight: 1.5, color: "ink2" });
const fileList = css({ display: "flex", flexDirection: "column", gap: "6px", mt: "10px" });
const fileRow = css({ display: "flex", alignItems: "center", gap: "8px", px: "10px", py: "6px", bg: "surface2", borderRadius: "8px" });
const fileName = css({ flex: 1, fontSize: "12.5px", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "ink" });

const endBody = css({ display: "flex", flexDirection: "column", gap: "12px", p: "16px 24px 24px" });
const endIntro = css({ fontSize: "13.5px", color: "ink2", lineHeight: 1.5 });
const endActions = css({ display: "flex", gap: "10px", mt: "4px" });
const groupBox = css({ p: "16px", borderWidth: "1px", borderStyle: "solid", borderRadius: "12px" });
const groupHead = css({ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "12px" });
const groupHeadLeft = css({ display: "flex", alignItems: "center", gap: "9px" });
const groupIcon = css({ width: "28px", height: "28px", borderRadius: "8px", display: "grid", placeItems: "center", flex: "none" });
const groupTitle = css({ fontWeight: 600, fontSize: "14px", lineHeight: 1.5, color: "ink" });
const groupItems = css({ display: "flex", flexDirection: "column", gap: "7px" });
const groupItem = css({ display: "flex", justifyContent: "space-between" });
const groupItemLabel = css({ fontSize: "13px", lineHeight: 1.5, color: "ink2" });
const groupNote = css({ fontSize: "11.5px", color: "ink3", lineHeight: 1.45 });

export default function Workspace({ order, role }: { order: CustomOrder; role: Role }) {
  const router = useRouter();
  const invalidate = useCoInvalidate();
  const isClient = role === "client";
  const ms = order.milestones;
  const otherName = (isClient ? order.freelancer.name : order.client.name) ?? "the other party";

  const complete = ms.every((m) => DONE.includes(m.status));
  const firstUpcomingIdx = ms.findIndex((m) => m.status === "upcoming");
  const liveM = ms.find((m) => ESCROW.includes(m.status));
  const activeSeq = liveM ? liveM.seq : firstUpcomingIdx >= 0 ? ms[firstUpcomingIdx].seq : null;

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fundTarget, setFundTarget] = useState<CustomOrderMilestone | null>(null);
  const [submitTarget, setSubmitTarget] = useState<CustomOrderMilestone | null>(null);
  const [revisionTarget, setRevisionTarget] = useState<CustomOrderMilestone | null>(null);
  const [endOpen, setEndOpen] = useState(false);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true); setError(null);
    try { await fn(); await invalidate(); return true; }
    catch (e) { setError(e instanceof Error ? e.message : "Action failed."); return false; }
    finally { setBusy(false); }
  };

  // Open the order's conversation in the messages inbox (deep-linked by id). The
  // order-detail page has no chat and 404s for custom orders, so route here instead.
  const openChat = () => {
    const base = isClient ? "/dashboard/client/messages" : "/dashboard/freelancer/messages";
    const convId = order.order?.conversation_id;
    router.push(convId ? `${base}?id=${convId}` : base);
  };

  // ── turn hint ──
  const turn = (() => {
    if (complete) return { who: "done" as const, text: "Project complete — payment released." };
    const sub = ms.find((m) => m.status === "submitted");
    if (sub) return isClient
      ? { who: "you" as const, text: `Review “${sub.title}” — approve to release ${money(sub.amount)} from escrow.` }
      : { who: "them" as const, text: `Waiting for ${otherName.split(" ")[0]} to approve “${sub.title}”.` };
    const work = ms.find((m) => m.status === "funded" || m.status === "in_progress");
    if (work) return isClient
      ? { who: "them" as const, text: `${otherName.split(" ")[0]} is working on “${work.title}”.` }
      : { who: "you" as const, text: `Deliver “${work.title}” — submit when it’s ready for review.` };
    const up = firstUpcomingIdx >= 0 ? ms[firstUpcomingIdx] : null;
    if (up) return isClient
      ? { who: "you" as const, text: ms.length > 1 ? `Fund “${up.title}” to start the next phase.` : "Fund the project to get started." }
      : { who: "them" as const, text: ms.length > 1 ? `Waiting for ${otherName.split(" ")[0]} to fund “${up.title}”.` : `Waiting for ${otherName.split(" ")[0]} to fund the project.` };
    return { who: "done" as const, text: "" };
  })();

  return (
    <div className={page}>
      <div className={container}>
        {/* back to dashboard */}
        <button
          type="button"
          onClick={() => router.push(isClient ? "/dashboard/client?tab=orders" : "/dashboard/freelancer?tab=orders")}
          className={cx(coBtn({ tone: "link" }), backBtn)}>
          <ChevronLeft size={16} className={coBtnStart} />
          Back to orders
        </button>

        {/* header */}
        <div className={header}>
          <div>
            <p className={coLabelAccent}>Project workspace</p>
            <p className={pageTitle}>{order.service.title ?? "Custom order"}</p>
            <p className={pageSub}>{ms.length > 1 ? "Custom order · paid by milestone" : "Custom order · one-time payment"}</p>
          </div>
          <div className={headActions}>
            {order.order && (
              <button type="button" onClick={openChat} className={coBtn({ tone: "grey", size: "px14", font: "13.5", strong: true })}>
                <MessageCircle size={16} className={coBtnStart} />
                Message {(isClient ? order.freelancer.name : order.client.name)?.split(" ")[0] ?? "chat"}
              </button>
            )}
            {order.order?.status === "active" && (
              <button type="button" onClick={() => setEndOpen(true)} className={coBtn({ tone: "quiet", font: "13.5", strong: true })}>End order</button>
            )}
          </div>
        </div>

        {/* parties */}
        <div className={parties}>
          <Party name={order.client.name} role="client" />
          <Party name={order.freelancer.name} role="freelancer" />
        </div>

        {/* turn banner */}
        {turn.text && (
          <div className={turnBanner({ who: turn.who })}>
            {turn.who === "done"
              ? <Check size={18} className={css({ color: "success", flexShrink: 0 })} />
              : turn.who === "you"
                ? <ArrowRight size={18} className={css({ color: "pendingText", flexShrink: 0 })} />
                : <Clock size={18} className={css({ color: "ink3", flexShrink: 0 })} />}
            <p className={turnText({ who: turn.who })}>
              {turn.who === "you" && <strong>Your turn — </strong>}{turn.text}
            </p>
          </div>
        )}

        {error && <Alert tone="error" className={alertGap} onClose={() => setError(null)}>{error}</Alert>}

        {/* escrow summary */}
        <div className={escrowGap}><EscrowSummary escrow={order.escrow} /></div>

        {/* tracker */}
        <p className={coLabel}>{ms.length > 1 ? "Milestones" : "Payment & delivery"}</p>
        <div>
          {ms.map((m, i) => {
            const prevDone = i > 0 && DONE.includes(ms[i - 1].status);
            const done = DONE.includes(m.status);
            const tone = MS_STATUS[m.status].tone;
            const isActive = m.seq === activeSeq && !complete;
            const isFirstUpcoming = i === firstUpcomingIdx;
            return (
              <div key={m.id} className={msRow}>
                {/* rail */}
                <div className={rail}>
                  {i > 0 && <div className={railTop({ done: prevDone })} />}
                  <div className={railNode({ tone, active: isActive })}>
                    {done ? <Check size={16} /> : m.seq}
                  </div>
                  {i < ms.length - 1 && <div className={railLine({ done })} />}
                </div>

                {/* card */}
                <MilestoneCard
                  m={m} isClient={isClient} isActive={isActive} isFirstUpcoming={isFirstUpcoming} otherName={otherName} busy={busy}
                  onFund={() => setFundTarget(m)}
                  onSubmit={() => setSubmitTarget(m)}
                  onApprove={() => run(() => api.approveMilestone(m.id))}
                  onRevision={() => setRevisionTarget(m)}
                  onChat={openChat}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* fund dialog */}
      {fundTarget && (
        <FundMilestoneDialog
          open onClose={() => setFundTarget(null)}
          milestoneTitle={fundTarget.title} amount={fundTarget.amount} submitting={busy} error={error}
          title={ms.length > 1 ? `Fund milestone ${fundTarget.seq}` : "Fund the project"}
          ctaLabel={`Confirm & fund $${fundTarget.amount.toLocaleString()}`}
          onConfirm={async () => { const ok = await run(() => api.fundMilestone(fundTarget.id)); if (ok) setFundTarget(null); }}
        />
      )}

      {/* submit dialog (note + deliverable files) */}
      <SubmitMilestoneDialog
        open={!!submitTarget} busy={busy}
        onClose={() => setSubmitTarget(null)}
        onConfirm={async (note, deliverables) => {
          if (!submitTarget) return;
          const ok = await run(() => api.submitMilestone(submitTarget.id, {
            submission_note: note || undefined,
            deliverables: deliverables.length ? deliverables : undefined,
          }));
          if (ok) setSubmitTarget(null);
        }}
      />

      {/* revision dialog */}
      <NoteDialog
        open={!!revisionTarget} title="Request a revision" annotation="Send back for changes"
        label="What needs to change?" placeholder="Describe the revisions you'd like…"
        cta="Request revision" busy={busy} required
        onClose={() => setRevisionTarget(null)}
        onConfirm={async (note) => { if (!revisionTarget || !note) return; const ok = await run(() => api.requestMilestoneRevision(revisionTarget.id, note)); if (ok) setRevisionTarget(null); }}
      />

      {/* end / cancel breakdown */}
      {endOpen && <EndDialog order={order} busy={busy} onClose={() => setEndOpen(false)} onConfirm={async () => { const ok = await run(() => api.endCustomOrder(order.id)); if (ok) setEndOpen(false); }} />}
    </div>
  );
}

/* ── milestone card with role-aware action ── */
function MilestoneCard({
  m, isClient, isActive, isFirstUpcoming, otherName, busy, onFund, onSubmit, onApprove, onRevision, onChat,
}: {
  m: CustomOrderMilestone; isClient: boolean; isActive: boolean; isFirstUpcoming: boolean; otherName: string; busy: boolean;
  onFund: () => void; onSubmit: () => void; onApprove: () => void; onRevision: () => void; onChat: () => void;
}) {
  const done = DONE.includes(m.status);
  const stamp = m.released_at ? `Released ${fmtDate(m.released_at)}` : m.submitted_at ? `Submitted ${fmtDate(m.submitted_at)}` : m.funded_at ? `Funded ${fmtDate(m.funded_at)}` : `~${m.due_days ?? "—"} days`;

  let action: React.ReactNode = null;
  if (m.status === "submitted") {
    action = isClient ? (
      <div className={actionRow}>
        <ActBtn primary onClick={onApprove} disabled={busy} icon={<Check size={16} className={coBtnStart} />}>Approve &amp; Release {money(m.amount)}</ActBtn>
        <ActBtn onClick={onRevision} disabled={busy} icon={<RotateCcw size={15} className={coBtnStart} />}>Request revision</ActBtn>
      </div>
    ) : <Waiting text={`Awaiting ${otherName.split(" ")[0]}’s approval`} />;
  } else if (m.status === "funded" || m.status === "in_progress") {
    action = isClient ? <Waiting text={`${otherName.split(" ")[0]} is working on this`} /> : (
      <div className={actionRow}>
        <ActBtn primary onClick={onSubmit} disabled={busy} icon={<ArrowRight size={16} className={coBtnStart} />}>Submit work</ActBtn>
        <ActBtn onClick={onChat}>Message client</ActBtn>
      </div>
    );
  } else if (m.status === "upcoming" && isFirstUpcoming) {
    action = isClient
      ? <ActBtn primary onClick={onFund} disabled={busy} icon={<Lock size={15} className={coBtnStart} />}>Fund · {money(m.amount)}</ActBtn>
      : <Waiting text={`Waiting for ${otherName.split(" ")[0]} to fund`} muted />;
  }

  return (
    <div className={msCard({ done, active: isActive })}>
      <div className={msHead}>
        <div className={msTitleWrap}>
          <div className={msTitleRow}>
            <p className={msTitle}>{m.title}</p>
            <MsChip status={m.status} />
          </div>
          {m.description && <p className={msDesc}>{m.description}</p>}
        </div>
        <div className={msAmount}>
          <Money value={m.amount} size={16} weight={600} color={done ? "var(--colors-success-text)" : m.status === "upcoming" ? "var(--colors-ink3)" : "var(--colors-ink)"} />
          <p className={msStamp}>{stamp}</p>
        </div>
      </div>

      {(m.status === "submitted" || done) && m.submission_note && (
        <div className={noteBox}>
          <p className={noteLabel}>Freelancer&apos;s note</p>
          <p className={noteText}>{m.submission_note}</p>
        </div>
      )}
      {(m.status === "submitted" || done) && m.deliverables.length > 0 && (
        <div className={filesRow}>
          {m.deliverables.map((d, i) => (
            <a key={i} href={d.url} target="_blank" rel="noopener noreferrer" className={fileLink}>
              <AttachChip name={d.file_name} icon={<Check size={12} className={css({ color: "success", flexShrink: 0 })} />} />
            </a>
          ))}
        </div>
      )}
      {m.status === "in_progress" && m.revision_note && (
        <div className={revBox}>
          <p className={revText}><b>Revision requested:</b> {m.revision_note}</p>
        </div>
      )}

      {action && <div className={actionBar}>{action}</div>}
    </div>
  );
}

/* ── small pieces ── */
function Party({ name, role }: { name: string | null; role: string }) {
  return (
    <div className={partyRow}>
      <span className={coAvatar({ size: "xs" })}>{initials(name)}</span>
      <p className={partyName}>{name ?? "—"} <span className={partyRole}>· {role}</span></p>
    </div>
  );
}

function Waiting({ text, muted }: { text: string; muted?: boolean }) {
  return (
    <div className={waitingRow({ muted: !!muted })}>
      {muted ? <Lock size={14} className={css({ flexShrink: 0 })} /> : <Clock size={14} className={css({ flexShrink: 0 })} />}{text}
    </div>
  );
}

function ActBtn({ children, primary, onClick, disabled, icon }: { children: React.ReactNode; primary?: boolean; onClick: () => void; disabled?: boolean; icon?: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={coBtn({ tone: primary ? "black" : "grey", size: "xs", strong: true })}>
      {icon}
      {children}
    </button>
  );
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ── note dialog (submit / revision) ── */
function NoteDialog({ open, title, annotation, label, placeholder, cta, busy, required, onClose, onConfirm }: {
  open: boolean; title: string; annotation: string; label: string; placeholder: string; cta: string; busy: boolean; required: boolean;
  onClose: () => void; onConfirm: (note: string) => void;
}) {
  const [note, setNote] = useState("");
  return (
    <BareModal open={open} onOpenChange={(o) => { if (!o && !busy) onClose(); }} maxW="444px" className={panel} closeOnInteractOutside={!busy} closeOnEscape={!busy}>
      <div className={dlgHeader}>
        <div>
          <p className={coLabelAccent}>{annotation}</p>
          <Dialog.Title className={dlgTitle}>{title}</Dialog.Title>
        </div>
        <button type="button" aria-label="Close" onClick={onClose} disabled={busy} className={coIconBtn()}><X size={20} /></button>
      </div>
      <div className={dlgContent}>
        <p className={dlgLabel}>{label}</p>
        <CoTextArea font="13.5" hover="strong" focus="thick" minRows={3} value={note} onChange={setNote} placeholder={placeholder} />
      </div>
      <div className={dlgFooter}>
        <button type="button" onClick={onClose} disabled={busy} className={coBtn({ tone: "quiet", strong: true })}>Cancel</button>
        <button type="button" onClick={() => onConfirm(note.trim())} disabled={busy || (required && !note.trim())} className={coBtn({ tone: "black", size: "sm", strong: true })}>
          {busy ? <Spinner size={16} className={css({ color: "#fff" })} /> : cta}
        </button>
      </div>
    </BareModal>
  );
}

/* ── submit milestone (note + deliverable files) ── */
function SubmitMilestoneDialog({ open, busy, onClose, onConfirm }: {
  open: boolean; busy: boolean; onClose: () => void; onConfirm: (note: string, deliverables: MilestoneDeliverable[]) => void;
}) {
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<MilestoneDeliverable[]>([]);
  const [uploading, setUploading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = () => {
    if (busy || uploading) return;
    setNote(""); setFiles([]); setToken(null);
    onClose();
  };

  const upload = async (list: FileList) => {
    setUploading(true);
    try {
      let t = token;
      if (!t) { t = await api.getUploadToken(); setToken(t); }
      for (const file of Array.from(list)) {
        if (files.length >= 10) break;
        const res = await api.uploadFormData("/api/temporary-uploads", file, { upload_token: t });
        setFiles((prev) => [...prev, { url: res.data.file_url, file_name: res.data.file_name, file_type: res.data.file_type }]);
      }
    } catch { /* upload failure leaves the list unchanged */ }
    finally { setUploading(false); }
  };

  return (
    <BareModal open={open} onOpenChange={(o) => { if (!o) close(); }} maxW="444px" className={panel} closeOnInteractOutside={!busy && !uploading} closeOnEscape={!busy && !uploading}>
      <div className={dlgHeader}>
        <div>
          <p className={coLabelAccent}>Deliver your work</p>
          <Dialog.Title className={dlgTitle}>Submit work</Dialog.Title>
        </div>
        <button type="button" aria-label="Close" onClick={close} disabled={busy || uploading} className={coIconBtn()}><X size={20} /></button>
      </div>
      <div className={dlgContent}>
        <p className={dlgLabel}>Note to client · optional</p>
        <CoTextArea font="13.5" hover="strong" focus="thick" minRows={3} value={note} onChange={setNote} placeholder="Summarise what you delivered…" />

        <p className={dlgLabel}>Deliverable files · optional</p>
        <input ref={inputRef} type="file" multiple hidden onChange={(e) => e.target.files && upload(e.target.files)} />
        <div onClick={() => !uploading && inputRef.current?.click()} className={dropZone}>
          <Paperclip size={20} className={dropIcon} />
          <p className={dropText}>{uploading ? "Uploading…" : "Click to upload files"}</p>
        </div>
        {files.length > 0 && (
          <div className={fileList}>
            {files.map((f, i) => (
              <div key={i} className={fileRow}>
                <FileText size={15} className={css({ color: "ink3", flexShrink: 0 })} />
                <p className={fileName}>{f.file_name}</p>
                <button type="button" aria-label={`Remove ${f.file_name}`} onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))} className={coIconBtn({ size: "xs" })}>
                  <X size={14} className={css({ color: "ink3" })} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className={dlgFooter}>
        <button type="button" onClick={close} disabled={busy || uploading} className={coBtn({ tone: "quiet", strong: true })}>Cancel</button>
        <button type="button" onClick={() => onConfirm(note.trim(), files)} disabled={busy || uploading} className={coBtn({ tone: "black", size: "sm", strong: true })}>
          {busy ? <Spinner size={16} className={css({ color: "#fff" })} /> : "Submit for review"}
        </button>
      </div>
    </BareModal>
  );
}

/* ── end / cancel fair-split breakdown ── */
function Group({ icon, title, note, items, color, bg }: { icon: React.ReactNode; title: string; note: string; items: CustomOrderMilestone[]; color: string; bg: string }) {
  if (items.length === 0) return null;
  const total = items.reduce((s, m) => s + m.amount, 0);
  return (
    <div className={groupBox} style={{ borderColor: bg }}>
      <div className={groupHead}>
        <div className={groupHeadLeft}>
          <div className={groupIcon} style={{ background: bg, color }}>{icon}</div>
          <p className={groupTitle}>{title}</p>
        </div>
        <Money value={total} size={15} weight={600} color={color} />
      </div>
      <div className={groupItems}>
        {items.map((m) => (
          <div key={m.id} className={groupItem}>
            <p className={groupItemLabel}>{m.seq}. {m.title}</p>
            <Money value={m.amount} size={13} weight={500} color="var(--colors-ink2)" />
          </div>
        ))}
      </div>
      <p className={groupNote}>{note}</p>
    </div>
  );
}

function EndDialog({ order, busy, onClose, onConfirm }: { order: CustomOrder; busy: boolean; onClose: () => void; onConfirm: () => void }) {
  const ms = order.milestones;
  const released = ms.filter((m) => DONE.includes(m.status));
  const inEscrow = ms.filter((m) => ESCROW.includes(m.status));
  const unfunded = ms.filter((m) => m.status === "upcoming");

  return (
    <BareModal open onOpenChange={(o) => { if (!o && !busy) onClose(); }} maxW="600px" className={panel} closeOnInteractOutside={!busy} closeOnEscape={!busy}>
      <div className={dlgHeader}>
        <div>
          <p className={coLabelAccent}>End / cancel order</p>
          <Dialog.Title className={dlgTitle}>If you end this order now</Dialog.Title>
        </div>
        <button type="button" aria-label="Close" onClick={onClose} disabled={busy} className={coIconBtn()}><X size={20} /></button>
      </div>
      <div className={endBody}>
        <p className={endIntro}>
          Milestone escrow keeps the split fair — you only ever settle for the work that actually changed hands.
        </p>
        <Group icon={<Check size={15} />} title="Released payments stay paid" color="var(--colors-success-text)" bg="var(--colors-success-tint)" items={released}
          note="Approved work has already been released to the freelancer. Nothing here is refundable." />
        <Group icon={<Shield size={15} />} title="Held in escrow" color="var(--colors-pending-text)" bg="var(--colors-pending-tint)" items={inEscrow}
          note="Held funds are refunded to you when the order ends." />
        <Group icon={<X size={15} />} title="Unfunded work cancelled" color="var(--colors-ink3)" bg="rgba(0,0,0,0.05)" items={unfunded}
          note="Never funded, so they’re simply cancelled. You pay nothing for these." />

        <div className={endActions}>
          <button type="button" onClick={onClose} disabled={busy} className={coBtn({ tone: "quiet", size: "h44", strong: true, full: true })}>Keep working</button>
          <button type="button" onClick={onConfirm} disabled={busy} className={coBtn({ tone: "danger", size: "h44", strong: true, full: true })}>
            {busy ? <Spinner size={18} className={css({ color: "#fff" })} /> : (
              <>
                <Flag size={16} className={coBtnStart} />
                End order
              </>
            )}
          </button>
        </div>
      </div>
    </BareModal>
  );
}
