"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Check, X, Pencil, RotateCcw, Info, FileText, Inbox } from "lucide-react";
import { css, cva, cx } from "styled-system/css";
import { Alert, Avatar, Pager, Skeleton, Spinner } from "@/components/ds";
import { api } from "@/lib/api";
import { JobPost, Proposal, ProposalStatus, JobPostStatus } from "@/types/job";
import RichTextDisplay from "@/components/ui/RichTextDisplay";

type Filter = "all" | ProposalStatus;

/* ── helpers ── */
const money = (v: string | number) => "$" + Number(v).toLocaleString("en-US");
const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
function fileSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
function deadlineInfo(s: string) {
  const days = Math.ceil((new Date(s).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return { label: "Overdue", urgent: true };
  if (days === 0) return { label: "Due today", urgent: true };
  return { label: `${days}d left`, urgent: days <= 3 };
}

/* ── status chips ── */
type Tone = "success" | "pending" | "error" | "info" | "neutral";
const TONE_CLASS: Record<Tone, string> = {
  success: css({ bg: "successTint", color: "successText" }),
  pending: css({ bg: "pendingTint", color: "pendingText" }),
  error: css({ bg: "errorTint", color: "errorText" }),
  info: css({ bg: "rgba(37,99,235,0.10)", color: "#1d4ed8" }),
  neutral: css({ bg: "rgba(0,0,0,0.05)", color: "ink2" }),
};
const JOB_STATUS: Record<string, { tone: Tone; label: string }> = {
  open: { tone: "success", label: "Open" },
  in_progress: { tone: "info", label: "In progress" },
  completed: { tone: "neutral", label: "Completed" },
  cancelled: { tone: "neutral", label: "Cancelled" },
  rejected: { tone: "error", label: "Rejected" },
  pending_review: { tone: "pending", label: "Pending review" },
};
const PROP_STATUS: Record<ProposalStatus, { tone: Tone; label: string }> = {
  pending: { tone: "pending", label: "Pending" },
  accepted: { tone: "success", label: "Accepted" },
  rejected: { tone: "error", label: "Not selected" },
  withdrawn: { tone: "neutral", label: "Withdrawn" },
};

/* ── static styles ── */
const chipBase = cva({
  base: { display: "inline-flex", alignItems: "center", gap: "6px", borderRadius: "pill", fontWeight: 600 },
  variants: { size: { md: { h: "26px", px: "10px", fontSize: "12px" }, lg: { h: "34px", px: "14px", fontSize: "13px" } } },
  defaultVariants: { size: "md" },
});
const chipDot = css({ w: "6px", h: "6px", borderRadius: "50%", bg: "currentColor" });

const pageRoot = css({ minH: "100vh", bg: "canvas" });
const container = css({
  w: "100%", boxSizing: "border-box", maxW: "1080px", mx: "auto",
  px: { base: "16px", sm: "24px" }, py: { base: "24px", md: "40px" },
});
const column = css({ display: "flex", flexDirection: "column", gap: { base: "18px", md: "24px" } });
const backBtn = css({
  alignSelf: "flex-start",
  display: "inline-flex", alignItems: "center", gap: "8px",
  m: 0, p: "2px 4px", border: "none", bg: "transparent",
  color: "ink2", fontFamily: "inherit", fontSize: "14px", fontWeight: 500, lineHeight: 1.75,
  cursor: "pointer", transition: "color .25s",
  _hover: { color: "#000", bg: "transparent" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
  "& svg": { flexShrink: 0 },
});
const alertRounded = css({ borderRadius: "8px" });
const retryBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  boxSizing: "border-box", m: 0, p: "4px 5px", minW: "64px", border: "none", borderRadius: "4px",
  bg: "transparent", color: "inherit", fontFamily: "inherit", fontSize: "13px", fontWeight: 500, lineHeight: 1.75,
  cursor: "pointer", transition: "background-color .25s",
  _hover: { bg: "rgba(0,0,0,0.06)" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
});

const rejectBanner = css({
  borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(220,38,38,0.25)",
  bg: "errorTint", borderRadius: "cardSm", p: "20px",
  display: "flex", gap: "14px", alignItems: "flex-start",
});
const rejectIcon = css({
  w: "36px", h: "36px", borderRadius: "50%", bg: "rgba(220,38,38,0.14)", color: "error",
  display: "flex", alignItems: "center", justifyContent: "center", flex: "none",
});
const rejectTitle = css({ lineHeight: 1.5, fontSize: "15px", fontWeight: 600, color: "errorText" });
const rejectBody = css({ fontSize: "13.5px", lineHeight: 1.55, color: "ink2" });

const pillBtnBase = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px",
  boxSizing: "border-box", m: 0, h: "36px", minW: "64px", border: "none", borderRadius: "pill",
  fontFamily: "inherit", fontSize: "13px", fontWeight: 500, lineHeight: 1.75,
  cursor: "pointer", transition: "background-color .25s, color .25s",
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
  _disabled: { pointerEvents: "none", color: "rgba(0, 0, 0, 0.26)" },
  "& svg": { flexShrink: 0 },
});
const darkBtn = css({ bg: "#000", color: "#fff", _hover: { bg: "rgba(0,0,0,0.8)" } });
const softBtn = css({ bg: "rgba(0,0,0,0.05)", color: "#000", _hover: { bg: "rgba(0,0,0,0.1)" } });
const dangerGhostBtn = css({ bg: "transparent", color: "errorText", _hover: { bg: "errorTint" } });
/* `px` lives only on these leaves — two atomic classes for one property are resolved by
   stylesheet order, not by `cx` order. */
const px14 = css({ px: "14px" });
const px16 = css({ px: "16px" });
const resubmitBtn = css({ mt: "10px" });

const headerCard = css({
  bg: "surface", borderWidth: "1px", borderStyle: "solid", borderColor: "hairline", borderRadius: "card",
  p: { base: "22px", md: "28px" },
});
const headRow = css({ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexDirection: { base: "column", md: "row" } });
const headMain = css({ display: "flex", flexDirection: "column", gap: "12px", minW: 0 });
const jobTitle = css({ fontSize: { base: "22px", md: "28px" }, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.15 });
const hiredRow = css({ display: "flex", alignItems: "center", gap: "9px" });
const hiredIcon = css({ w: "22px", h: "22px", borderRadius: "50%", bg: "successTint", color: "success", display: "flex", alignItems: "center", justifyContent: "center" });
const hiredName = css({ lineHeight: 1.5, fontSize: "18px", fontWeight: 600 });
const dotSep = css({ color: "ink3" });
const hiredCount = css({ lineHeight: 1.5, fontSize: "15px", color: "ink2" });
const noProposalsYet = css({ lineHeight: 1.5, fontSize: "16px", fontWeight: 500, color: "ink2" });
const proposalTally = css({ display: "flex", alignItems: "baseline", gap: "9px" });
const tallyMain = css({ lineHeight: 1.5, fontSize: "19px", fontWeight: 600, letterSpacing: "-0.015em" });
const tallyFresh = css({ lineHeight: 1.5, fontSize: "15px", fontWeight: 600, color: "accent" });
const ownerActions = css({ display: "flex", gap: "8px", flexWrap: "wrap" });

const factsRow = css({ display: "flex", flexWrap: "wrap", rowGap: "18px", my: { base: "20px", md: "22px" } });
const factCell = css({ display: "flex", flex: { base: "0 0 50%", md: "none" } });
const factSep = css({ w: "1px", h: "30px", bg: "hairline", mx: "24px", display: { base: "none", md: "block" } });
const factWrap = css({ display: "flex", flexDirection: "column", gap: "3px", minW: 0 });
const factLabel = css({ lineHeight: 1.5, fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "ink3" });
const factValue = cva({
  base: { lineHeight: 1.5, fontSize: "15px", fontWeight: 600, letterSpacing: "-0.01em", whiteSpace: "nowrap" },
  variants: { urgent: { true: { color: "errorText" }, false: { color: "ink" } } },
});
const factSub = css({ fontWeight: 400, color: "ink3", ml: "6px", fontSize: "13px" });

const skillWrap = css({ display: "flex", gap: "8px", flexWrap: "wrap" });
const skillChip = css({ display: "inline-flex", alignItems: "center", h: "30px", px: "13px", borderRadius: "pill", fontSize: "12.5px", fontWeight: 500, bg: "rgba(0,0,0,0.05)", color: "ink2" });
const rule = css({ h: "1px", bg: "hairline", my: { base: "20px", md: "24px" } });
const capLabel = css({ lineHeight: 1.5, fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "ink3" });

const proposalsRegion = css({ display: "flex", flexDirection: "column", gap: "16px" });
const regionHead = css({ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" });
const regionTitle = css({ lineHeight: 1.5, fontSize: "22px", fontWeight: 600, letterSpacing: "-0.015em" });
const filterRow = css({ display: "flex", gap: "8px", flexWrap: "wrap" });
const filterPill = cva({
  base: {
    h: "34px", px: "16px", m: 0, borderRadius: "pill", border: "none",
    cursor: "pointer", fontFamily: "inherit", fontSize: "13px", fontWeight: 500,
    _focusVisible: { outline: "none", boxShadow: "focusRing" },
  },
  variants: {
    active: {
      true: { bg: "#000", color: "#fff", _hover: { bg: "#000" } },
      false: { bg: "rgba(0,0,0,0.05)", color: "ink2", _hover: { bg: "rgba(0,0,0,0.09)" } },
    },
  },
});
const filterCount = cva({
  base: { ml: "7px", fontVariantNumeric: "tabular-nums" },
  variants: { active: { true: { opacity: 0.7 }, false: { opacity: 0.55 } } },
});
const list = css({ display: "flex", flexDirection: "column", gap: "12px" });
const emptyFilter = css({
  bg: "surface", borderWidth: "1px", borderStyle: "solid", borderColor: "hairline", borderRadius: "card",
  p: "40px", textAlign: "center", color: "ink2", fontSize: "14px",
});
const pagerRow = css({ display: "flex", justifyContent: "center", pt: "8px" });

/* ── proposal card ── */
const propCard = cva({
  base: {
    borderWidth: "1px", borderStyle: "solid", borderRadius: "cardSm",
    cursor: "pointer", transition: "border-color .15s, background .15s",
    _hover: { borderColor: "hairlineStrong", bg: "surface2" },
  },
  variants: {
    unread: {
      true: { bg: "rgba(0,113,227,0.035)", borderColor: "rgba(0,113,227,0.28)" },
      false: { bg: "surface", borderColor: "hairline" },
    },
    dim: { true: { opacity: 0.66 }, false: { opacity: 1 } },
  },
});
const propBody = css({
  p: { base: "18px", sm: "20px" },
  display: "flex", gap: { base: "14px", sm: "18px" },
  flexDirection: { base: "column", sm: "row" }, alignItems: { sm: "stretch" },
});
const propMain = css({ display: "flex", gap: "12px", minW: 0, flex: 1 });
const propText = css({ display: "flex", flexDirection: "column", gap: "7px", minW: 0, justifyContent: "center" });
const propDivider = css({ w: "1px", bg: "hairline", flex: "none", display: { base: "none", sm: "block" } });
const propAside = css({
  display: "flex", flexDirection: { base: "row", sm: "column" }, justifyContent: "space-between",
  alignItems: "flex-end", gap: "12px", flex: "none", minW: { sm: "170px" },
});
const propChipDesktop = css({ display: { base: "none", sm: "flex" }, justifyContent: "flex-end" });
const propChipMobile = css({ display: { base: "flex", sm: "none" }, px: "18px", pb: "18px", mt: "-8px" });
const nameRowCss = css({ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" });
const nameText = css({ lineHeight: 1.5, fontSize: "15.5px", fontWeight: 600, letterSpacing: "-0.01em" });
const newFlag = css({ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: 600, color: "accent" });
const newDot = css({ w: "7px", h: "7px", borderRadius: "50%", bg: "accent" });
const updatedFlag = css({ display: "inline-flex", alignItems: "center", h: "22px", px: "9px", borderRadius: "pill", fontSize: "11px", fontWeight: 600, bg: "rgba(37,99,235,0.1)", color: "#1d4ed8" });
const submittedText = css({ lineHeight: 1.5, fontSize: "12px", fontWeight: 500, color: "ink2" });
const snippetText = css({ fontSize: "13.5px", lineHeight: 1.5, color: "ink2", lineClamp: 2 });
const priceWrap = css({ display: "flex", flexDirection: "column", gap: "2px", alignItems: { base: "flex-start", sm: "flex-end" } });
const priceLabel = css({ lineHeight: 1.5, fontSize: "10px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "ink3" });
const priceValue = cva({
  base: { fontFamily: "mono", fontSize: { base: "27px", sm: "30px" }, fontWeight: 600, letterSpacing: "-0.025em", lineHeight: 1 },
  variants: { dim: { true: { color: "ink2" }, false: { color: "ink" } } },
});
const priceDays = css({ lineHeight: 1.5, fontSize: "11.5px", fontWeight: 500, color: "ink2" });
const propActions = css({ display: "flex", gap: "8px", w: { base: "100%", sm: "auto" } });
const propActionBtn = css({ flex: { base: 1, sm: "none" } });

/* ── attachments ── */
const attachWrap = css({ display: "flex", flexDirection: "column", gap: "12px", mt: "24px" });
const imageGrid = css({ display: "grid", gridTemplateColumns: { base: "repeat(2,1fr)", sm: "repeat(4,1fr)" }, gap: "10px" });
const imageTile = css({
  position: "relative", aspectRatio: "4 / 3", borderRadius: "tile",
  borderWidth: "1px", borderStyle: "solid", borderColor: "hairline",
  overflow: "hidden", display: "block",
  _hover: { borderColor: "hairlineStrong" },
});
const pdfRow = css({ display: "flex", gap: "10px", flexWrap: "wrap" });
const pdfTile = css({
  display: "flex", alignItems: "center", gap: "11px", p: "10px 14px 10px 11px", borderRadius: "tile",
  borderWidth: "1px", borderStyle: "solid", borderColor: "hairline", bg: "surface",
  maxW: { base: "100%", sm: "260px" }, minW: 0, textDecoration: "none",
  _hover: { bg: "surface2", borderColor: "hairlineStrong" },
});
const pdfIcon = css({ w: "38px", h: "38px", borderRadius: "9px", bg: "errorTint", color: "errorText", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" });
const pdfName = css({ lineHeight: 1.5, fontSize: "13.5px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "ink" });
const pdfMeta = css({ lineHeight: 1.5, fontSize: "11px", fontWeight: 500, color: "ink2" });

/* ── empty state ── */
const emptyCard = css({
  bg: "surface", borderWidth: "1px", borderStyle: "solid", borderColor: "hairline", borderRadius: "card",
  p: { base: "44px", md: "64px" },
  display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "14px",
});
const emptyIcon = css({
  w: "72px", h: "72px", borderRadius: "50%", bg: "canvas",
  borderWidth: "1px", borderStyle: "solid", borderColor: "hairline",
  display: "flex", alignItems: "center", justifyContent: "center", color: "ink3",
});
const emptyTextWrap = css({ maxW: "420px" });
const emptyTitle = css({ lineHeight: 1.5, fontSize: "18px", fontWeight: 600, letterSpacing: "-0.01em" });
const emptyBody = css({ fontSize: "14px", lineHeight: 1.55, color: "ink2" });
const emptyActions = css({ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" });

/* ── loading skeleton ── */
const skelCard = css({ bg: "surface", borderWidth: "1px", borderStyle: "solid", borderColor: "hairline", borderRadius: "card", p: "28px" });
const skelPill = css({ borderRadius: "pill" });
const skelTitle = css({ mt: "16px" });
const skelFacts = css({ display: "flex", gap: "28px", my: "24px", flexWrap: "wrap" });
const skelRow = css({
  bg: "surface", borderWidth: "1px", borderStyle: "solid", borderColor: "hairline", borderRadius: "cardSm",
  p: "20px", display: "flex", gap: "18px", alignItems: "center",
});
const skelRowMain = css({ flex: 1 });
const skelRowAside = css({ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" });
const skelStack = css({ display: "flex", flexDirection: "column", gap: "24px" });

function Chip({ tone, label, size }: { tone: Tone; label: string; size?: "lg" }) {
  return (
    <span className={cx(chipBase({ size: size === "lg" ? "lg" : "md" }), TONE_CLASS[tone])}>
      <span className={chipDot} />
      {label}
    </span>
  );
}

/* ── meta fact cell ── */
function MetaFact({ label, value, sub, urgent }: { label: string; value: string; sub?: string; urgent?: boolean }) {
  return (
    <div className={factWrap}>
      <p className={factLabel}>{label}</p>
      <p className={factValue({ urgent: !!urgent })}>
        {value}
        {sub && <span className={factSub}>{sub}</span>}
      </p>
    </div>
  );
}

/* ── proposal card (price is the hero number) ── */
function ProposalCard({ p, locked, onAccept, onReject, busy, onOpen }: {
  p: Proposal; locked: boolean; busy: boolean;
  onAccept: () => void; onReject: () => void; onOpen: () => void;
}) {
  const unread = !p.client_read_at;
  const showActions = p.status === "pending" && !locked;
  const dim = locked && p.status !== "accepted";

  const priceBlock = (
    <div className={priceWrap}>
      <p className={priceLabel}>Quoted price</p>
      <p className={priceValue({ dim })}>{money(p.price)}</p>
      <p className={priceDays}>{p.timeline_days} days delivery</p>
    </div>
  );

  const actions = showActions ? (
    <div className={propActions} onClick={e => e.stopPropagation()}>
      <button type="button" onClick={onReject} disabled={busy} className={cx(pillBtnBase, softBtn, px16, propActionBtn)}>
        <X size={15} />Reject
      </button>
      <button type="button" onClick={onAccept} disabled={busy} className={cx(pillBtnBase, darkBtn, px16, propActionBtn)}>
        {busy ? <Spinner size={13} /> : <Check size={15} />}Accept
      </button>
    </div>
  ) : p.status === "accepted" ? <Chip tone="success" label="Hired" /> : null;

  const name = p.freelancer_profile?.user?.name ?? "Freelancer";
  const nameRow = (
    <div className={nameRowCss}>
      <p className={nameText}>{name}</p>
      {unread && (
        <span className={newFlag}>
          <span className={newDot} /> New
        </span>
      )}
      {p.is_updated && (
        <span className={updatedFlag}>Updated</span>
      )}
    </div>
  );
  const metaRow = <p className={submittedText}>Submitted {fmtDate(p.created_at)}</p>;
  const snippet = (
    <p className={snippetText}>{p.cover_letter}</p>
  );

  return (
    <div role="button" tabIndex={0} onClick={onOpen} className={propCard({ unread, dim })}>
      <div className={propBody}>
        <div className={propMain}>
          <Avatar src={p.freelancer_profile?.user?.avatar_url ?? undefined} name={name} px={52} className={css({ flex: "none" })} />
          <div className={propText}>
            {nameRow}{metaRow}{snippet}
          </div>
        </div>
        <div className={propDivider} />
        <div className={propAside}>
          <div className={propChipDesktop}><Chip tone={PROP_STATUS[p.status].tone} label={PROP_STATUS[p.status].label} /></div>
          {priceBlock}
          {actions}
        </div>
      </div>
      {/* mobile status chip row */}
      <div className={propChipMobile}>
        <Chip tone={PROP_STATUS[p.status].tone} label={PROP_STATUS[p.status].label} />
      </div>
    </div>
  );
}

export default function JobOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = Number(params.id);

  const [job, setJob] = useState<JobPost | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [actionId, setActionId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    const load = async () => {
      try {
        setLoading(true);
        const [jobData, proposalsData] = await Promise.all([api.getJobPost(jobId), api.getJobProposals(jobId, page)]);
        setJob(jobData);
        setProposals(proposalsData.data);
        setLastPage(proposalsData.meta?.last_page ?? 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load this job.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [jobId, page]);

  const refresh = async () => {
    const [jobData, proposalsData] = await Promise.all([api.getJobPost(jobId), api.getJobProposals(jobId, page)]);
    setJob(jobData);
    setProposals(proposalsData.data);
  };

  const handleAccept = async (p: Proposal) => {
    setActionId(p.id);
    setActionError(null);
    try {
      await api.approveProposal(p.id);
      await refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to accept proposal.");
    } finally {
      setActionId(null);
    }
  };
  const handleReject = async (p: Proposal) => {
    setActionId(p.id);
    setActionError(null);
    try {
      const updated = await api.rejectProposal(p.id);
      setProposals(prev => prev.map(x => (x.id === updated.id ? updated : x)));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to reject proposal.");
    } finally {
      setActionId(null);
    }
  };
  const handleClose = async () => {
    if (!job) return;
    if (!confirm(`${job.status === "in_progress" ? "Cancel" : "Close"} this job? This cannot be undone.`)) return;
    try {
      await api.deleteJobPost(jobId);
      router.back();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to close job.");
    }
  };

  const backToJobs = () => router.back();
  const editJob = () => router.push(`/dashboard/client?tab=service&edit=${jobId}`);
  const status = (job?.status ?? "open") as JobPostStatus;
  const jobCfg = JOB_STATUS[status] ?? JOB_STATUS.open;
  const locked = status === "in_progress" || status === "completed" || status === "cancelled";
  const live = status === "open";
  const fresh = proposals.filter(p => !p.client_read_at && p.status === "pending").length;
  const hired = proposals.find(p => p.status === "accepted");

  const FILTERS: [Filter, string][] = [["all", "All"], ["pending", "Pending"], ["accepted", "Accepted"], ["rejected", "Rejected"]];
  const counts: Record<string, number> = {
    all: proposals.length,
    pending: proposals.filter(p => p.status === "pending").length,
    accepted: proposals.filter(p => p.status === "accepted").length,
    rejected: proposals.filter(p => p.status === "rejected").length,
  };
  const listed = proposals.filter(p => filter === "all" || p.status === filter);

  return (
    <div className={pageRoot}>
      <div className={container}>
        <div className={column}>
          {/* Back */}
          <button type="button" onClick={backToJobs} className={backBtn}>
            <ChevronLeft size={18} />
            Back to My Jobs
          </button>

          {loading ? (
            <LoadingState />
          ) : error ? (
            <Alert tone="error" className={alertRounded} action={<button type="button" className={retryBtn} onClick={() => location.reload()}>Retry</button>}>{error}</Alert>
          ) : job ? (
            <>
              {/* Rejection banner */}
              {status === "rejected" && (
                <div className={rejectBanner}>
                  <div className={rejectIcon}>
                    <Info size={20} />
                  </div>
                  <div className={css({ flex: 1, minW: 0 })}>
                    <p className={rejectTitle}>This job was rejected by an admin</p>
                    <p className={rejectBody}>{job.rejection_reason || "No reason was provided. Edit the job and resubmit it for review."}</p>
                    <button type="button" onClick={editJob} className={cx(pillBtnBase, darkBtn, px16, resubmitBtn)}>
                      <RotateCcw size={15} />Edit &amp; resubmit
                    </button>
                  </div>
                </div>
              )}

              {/* Job header card */}
              <div className={headerCard}>
                <div className={headRow}>
                  <div className={headMain}>
                    <Chip tone={jobCfg.tone} label={jobCfg.label} size="lg" />
                    <p className={jobTitle}>{job.title}</p>
                    {/* hero metric */}
                    {status === "in_progress" && hired ? (
                      <div className={hiredRow}>
                        <div className={hiredIcon}><Check size={14} /></div>
                        <p className={hiredName}>Hired {hired.freelancer_profile?.user?.name ?? "a freelancer"}</p>
                        <span className={dotSep}>·</span>
                        <p className={hiredCount}>{proposals.length} proposals reviewed</p>
                      </div>
                    ) : proposals.length === 0 ? (
                      <p className={noProposalsYet}>No proposals yet</p>
                    ) : (
                      <div className={proposalTally}>
                        <p className={tallyMain}>{proposals.length} proposals</p>
                        {fresh > 0 && <><span className={dotSep}>·</span><p className={tallyFresh}>{fresh} new</p></>}
                      </div>
                    )}
                  </div>
                  {/* owner actions */}
                  <div className={ownerActions}>
                    <button type="button" onClick={editJob} className={cx(pillBtnBase, softBtn, px14)}>
                      <Pencil size={15} />Edit job
                    </button>
                    {(live || status === "in_progress") && (
                      <button type="button" onClick={handleClose} className={cx(pillBtnBase, dangerGhostBtn, px14)}>
                        <X size={15} />{status === "in_progress" ? "Cancel" : "Close"} job
                      </button>
                    )}
                  </div>
                </div>

                {/* meta facts */}
                <div className={factsRow}>
                  {([
                    { label: "Budget", value: `${money(job.budget_min)} – ${money(job.budget_max)}` },
                    ...(job.deadline ? [{ label: "Deadline", value: deadlineInfo(job.deadline).label, sub: fmtDate(job.deadline), urgent: deadlineInfo(job.deadline).urgent }] : []),
                    ...(job.category ? [{ label: "Category", value: job.category.category_name }] : []),
                    { label: "Posted", value: fmtDate(job.created_at) },
                  ] as { label: string; value: string; sub?: string; urgent?: boolean }[]).map((f, i, arr) => (
                    <div key={f.label} className={factCell}>
                      <MetaFact label={f.label} value={f.value} sub={f.sub} urgent={f.urgent} />
                      {i < arr.length - 1 && <div className={factSep} />}
                    </div>
                  ))}
                </div>

                {/* skills */}
                {job.skills?.length > 0 && (
                  <div className={skillWrap}>
                    {job.skills.map(s => (
                      <span key={s.id} className={skillChip}>{s.expertise_name}</span>
                    ))}
                  </div>
                )}

                <div className={rule} />

                {/* description */}
                <p className={capLabel}>Description</p>
                <RichTextDisplay value={job.description} />

                {/* attachments */}
                {job.media?.length > 0 && <Attachments media={job.media} />}
              </div>

              {/* Proposals region */}
              {status === "rejected" ? null : proposals.length === 0 ? (
                <EmptyProposals onEdit={editJob} />
              ) : (
                <div className={proposalsRegion}>
                  <div className={regionHead}>
                    <p className={regionTitle}>Proposals</p>
                    <div className={filterRow}>
                      {FILTERS.map(([k, l]) => {
                        const active = filter === k;
                        return (
                          <button key={k} type="button" onClick={() => setFilter(k)} className={filterPill({ active })}>
                            {l}<span className={filterCount({ active })}>{counts[k]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {actionError && <Alert tone="error" className={alertRounded} onClose={() => setActionError(null)}>{actionError}</Alert>}

                  <div className={list}>
                    {listed.length === 0 ? (
                      <div className={emptyFilter}>No {filter === "all" ? "" : filter} proposals.</div>
                    ) : listed.map(p => (
                      <ProposalCard key={p.id} p={p} locked={locked} busy={actionId === p.id}
                        onAccept={() => handleAccept(p)} onReject={() => handleReject(p)} onOpen={() => router.push(`/proposals/${p.id}`)} />
                    ))}
                  </div>

                  {lastPage > 1 && (
                    <div className={pagerRow}>
                      <Pager count={lastPage} page={page} onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
                    </div>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ── attachments ── */
function Attachments({ media }: { media: JobPost["media"] }) {
  const images = media.filter(m => m.file_type === "image");
  const pdfs = media.filter(m => m.file_type !== "image");
  return (
    <div className={attachWrap}>
      <p className={capLabel}>Attachments · {media.length}</p>
      {images.length > 0 && (
        <div className={imageGrid}>
          {images.map(m => (
            <a key={m.id} href={m.file_url} target="_blank" rel="noopener noreferrer" title={m.file_name} className={imageTile}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.file_url} alt={m.file_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </a>
          ))}
        </div>
      )}
      {pdfs.length > 0 && (
        <div className={pdfRow}>
          {pdfs.map(m => (
            <a key={m.id} href={m.file_url} target="_blank" rel="noopener noreferrer" title={m.file_name} className={pdfTile}>
              <span className={pdfIcon}><FileText size={19} /></span>
              <span className={css({ minW: 0 })}>
                <p className={pdfName}>{m.file_name}</p>
                <p className={pdfMeta}>PDF{m.file_size ? ` · ${fileSize(m.file_size)}` : ""}</p>
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── empty proposals ── */
function EmptyProposals({ onEdit }: { onEdit: () => void }) {
  return (
    <div className={emptyCard}>
      <div className={emptyIcon}>
        <Inbox size={30} />
      </div>
      <div className={emptyTextWrap}>
        <p className={emptyTitle}>No proposals yet</p>
        <p className={emptyBody}>Your job is live and visible to freelancers. We&rsquo;ll notify you the moment a proposal arrives.</p>
      </div>
      <div className={emptyActions}>
        <button type="button" onClick={onEdit} className={cx(pillBtnBase, softBtn, px14)}>
          <Pencil size={15} />Edit job
        </button>
      </div>
    </div>
  );
}

/* ── loading skeleton ── */
function LoadingState() {
  return (
    <div className={skelStack}>
      <div className={skelCard}>
        <Skeleton variant="rect" width={92} height={28} className={skelPill} />
        <Skeleton variant="text" width="65%" height={36} className={skelTitle} />
        <Skeleton variant="text" width={180} height={22} />
        <div className={skelFacts}>
          {[0, 1, 2, 3].map(i => <div key={i}><Skeleton variant="text" width={54} height={12} /><Skeleton variant="text" width={90} height={20} /></div>)}
        </div>
        <Skeleton variant="text" width="100%" /><Skeleton variant="text" width="90%" /><Skeleton variant="text" width="75%" />
      </div>
      {[0, 1, 2].map(i => (
        <div key={i} className={skelRow}>
          <Skeleton variant="circle" width={52} height={52} />
          <div className={skelRowMain}><Skeleton variant="text" width={160} /><Skeleton variant="text" width={220} /><Skeleton variant="text" width="80%" /></div>
          <div className={skelRowAside}><Skeleton variant="text" width={90} height={30} /><Skeleton variant="rect" width={120} height={36} className={skelPill} /></div>
        </div>
      ))}
    </div>
  );
}
