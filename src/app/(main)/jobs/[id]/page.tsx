"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Bookmark,
  Share,
  FileText,
  MapPin,
  Building2,
  BadgeCheck,
  Circle,
  Lock,
  Pencil,
  Zap,
  Inbox,
} from "lucide-react";
import { css, cva, cx } from "styled-system/css";
import { Alert, Avatar, Skeleton, Spinner } from "@/components/ds";
import { api } from "@/lib/api";
import { useAuth } from "@/components/context/AuthContext";
import { JobPost, Proposal, ProposalStatus } from "@/types/job";
import RichTextDisplay from "@/components/ui/RichTextDisplay";
import ProposalModal from "@/components/jobs/ProposalModal";

const money = (v: string | number) => "$" + Number(v).toLocaleString("en-US");
const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const daysLeft = (s: string) => Math.ceil((new Date(s).getTime() - Date.now()) / 86_400_000);
const timeAgo = (s: string) => {
  const h = Math.floor((Date.now() - new Date(s).getTime()) / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h} hour${h !== 1 ? "s" : ""} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d !== 1 ? "s" : ""} ago`;
};

type Tone = "success" | "pending" | "error" | "info" | "neutral";
const TONE_CLASS: Record<Tone, string> = {
  success: css({ bg: "successTint", color: "successText" }),
  pending: css({ bg: "pendingTint", color: "pendingText" }),
  error: css({ bg: "errorTint", color: "errorText" }),
  info: css({ bg: "rgba(37,99,235,0.10)", color: "#1d4ed8" }),
  neutral: css({ bg: "rgba(0,0,0,0.05)", color: "ink2" }),
};
const JOB_TONE: Record<string, { tone: Tone; label: string }> = {
  open: { tone: "success", label: "Open" },
  in_progress: { tone: "info", label: "In progress" },
  completed: { tone: "neutral", label: "Completed" },
  cancelled: { tone: "neutral", label: "Cancelled" },
};
const PROP_TONE: Record<ProposalStatus, { tone: Tone; label: string }> = {
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
const labelBase = css({ lineHeight: 1.5, fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "ink3" });
const label10 = css({ fontSize: "10px" });
const label95 = css({ fontSize: "9.5px" });
const cardBase = css({
  bg: "surface", borderWidth: "1px", borderStyle: "solid", borderColor: "hairline", borderRadius: "card", p: "22px",
});
const mainCardPad = css({ p: { base: "22px", md: "32px" } });

const pageRoot = css({ minH: "100vh", bg: "canvas" });
const container = css({
  w: "100%", boxSizing: "border-box", maxW: "1180px", mx: "auto",
  px: { base: "16px", sm: "24px" },
  py: { base: "20px", md: "32px" },
  pb: { base: "96px", md: "32px" },
});
const plainContainer = css({
  w: "100%", boxSizing: "border-box", maxW: "1200px", mx: "auto",
  px: { base: "16px", sm: "24px" }, py: "48px",
});
const loadingContainer = css({
  w: "100%", boxSizing: "border-box", maxW: "1180px", mx: "auto",
  px: { base: "16px", sm: "24px" }, py: "32px",
});
const loadingGrid = css({ display: "grid", gridTemplateColumns: { base: "1fr", md: "minmax(0,1fr) 340px" }, gap: "24px" });
const skelCard = css({ borderRadius: "card" });
const skelBack = css({ mb: "16px" });

const backBtn = css({
  display: "inline-flex", alignItems: "center", gap: "8px",
  m: 0, mb: "18px", p: "2px 4px", border: "none", bg: "transparent",
  color: "ink2", fontFamily: "inherit", fontSize: "14px", fontWeight: 500, lineHeight: 1.75,
  cursor: "pointer", transition: "color .25s",
  _hover: { color: "#000", bg: "transparent" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
  "& svg": { flexShrink: 0 },
});
const detailGrid = css({
  display: "grid", gridTemplateColumns: { base: "1fr", md: "minmax(0,1fr) 340px" }, gap: "24px", alignItems: "start",
});
const stickyCol = css({ position: { md: "sticky" }, top: { md: "24px" } });

const headRow = css({ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" });
const headMain = css({ display: "flex", flexDirection: "column", gap: "12px", minW: 0 });
const chipRow = css({ display: "flex", gap: "10px", flexWrap: "wrap" });
const categoryChip = css({ display: "inline-flex", alignItems: "center", h: "34px", px: "14px", borderRadius: "pill", fontSize: "13px", fontWeight: 600, bg: "rgba(0,0,0,0.05)", color: "ink2" });
const jobTitle = css({ fontSize: { base: "22px", md: "28px" }, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.15 });
const postedLine = css({ lineHeight: 1.5, fontSize: "13px", fontWeight: 500, color: "ink2" });
const headActions = css({ display: { base: "none", md: "flex" }, gap: "8px", flex: "none" });
const outlineBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px",
  boxSizing: "border-box", m: 0, h: "40px", minW: "64px", borderRadius: "pill",
  borderWidth: "1px", borderStyle: "solid", borderColor: "hairlineStrong",
  bg: "surface", fontFamily: "inherit", fontSize: "13.5px", fontWeight: 500, lineHeight: 1.75,
  cursor: "pointer", transition: "background-color .25s, border-color .25s, color .25s",
  _hover: { borderColor: "ink3", bg: "surface2" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
  "& svg": { flexShrink: 0 },
});
const savedTone = cva({ base: {}, variants: { saved: { true: { color: "accent" }, false: { color: "ink2" } } } });
const outlineBtnPad = css({ px: "16px" });
const iconOnlyBtn = css({ w: "40px", minW: "40px", px: 0, color: "ink2" });

const mobileBudgetBand = css({
  display: { base: "block", md: "none" }, mt: "20px", py: "16px",
  borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "hairline",
  borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "hairline",
});
const rule = css({ h: "1px", bg: "hairline", my: { base: "20px", md: "24px" } });
const ruleTight = css({ h: "1px", bg: "hairline", my: "18px" });
const ruleFlat = css({ h: "1px", bg: "hairline" });

const budgetFigure = css({ fontFamily: "mono", fontSize: "30px", fontWeight: 600, letterSpacing: "-0.025em", lineHeight: 1, color: "successText", whiteSpace: "nowrap" });
const budgetDash = css({ color: "ink3", fontWeight: 500 });
const budgetNote = css({ lineHeight: 1.5, fontSize: "11.5px", fontWeight: 500, color: "ink2" });

const sectionBlock = css({ mt: "26px" });
const skillChip = css({ display: "inline-flex", alignItems: "center", h: "30px", px: "13px", borderRadius: "pill", fontSize: "12.5px", fontWeight: 500, bg: "rgba(0,0,0,0.05)", color: "ink2" });
const skillWrap = css({ display: "flex", gap: "8px", flexWrap: "wrap" });
const imageGrid = cva({
  base: { display: "grid", gridTemplateColumns: { base: "repeat(2,1fr)", sm: "repeat(4,1fr)" }, gap: "10px" },
  variants: { spaced: { true: { mb: "12px" }, false: {} } },
});
const imageTile = css({
  aspectRatio: "4/3", borderRadius: "tile",
  borderWidth: "1px", borderStyle: "solid", borderColor: "hairline",
  overflow: "hidden", display: "block",
  _hover: { borderColor: "hairlineStrong" },
});
const pdfRow = css({ display: "flex", gap: "10px", flexWrap: "wrap" });
const pdfTile = css({
  display: "flex", alignItems: "center", gap: "11px", p: "10px 14px 10px 11px", borderRadius: "tile",
  borderWidth: "1px", borderStyle: "solid", borderColor: "hairline",
  textDecoration: "none", maxW: "260px",
  _hover: { bg: "surface2", borderColor: "hairlineStrong" },
});
const pdfIcon = css({ w: "38px", h: "38px", borderRadius: "9px", bg: "errorTint", color: "errorText", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" });
const pdfName = css({ lineHeight: 1.5, fontSize: "13.5px", fontWeight: 600, color: "ink", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" });

const stackSm = css({ display: "flex", flexDirection: "column", gap: "14px" });
const proposalBox = css({ p: "16px", bg: "surface2", borderWidth: "1px", borderStyle: "solid", borderColor: "hairline", borderRadius: "cardSm" });
const proposalHead = css({ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "12px" });
const proposalFacts = css({ display: "flex" });
const factCol = css({ flex: 1 });
const factSep = css({ w: "1px", bg: "hairline", mx: "16px" });
const factPrice = css({ lineHeight: 1.5, fontFamily: "mono", fontSize: "22px", fontWeight: 600, letterSpacing: "-0.02em" });
const factDays = css({ lineHeight: 1.5, fontSize: "16px", fontWeight: 600 });
const btnRow = css({ display: "flex", gap: "8px" });
const centredNote = css({ fontSize: "12px", lineHeight: 1.45, textAlign: "center", color: "ink2" });

const pillBtnBase = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px",
  boxSizing: "border-box", m: 0, minW: "64px", border: "none", borderRadius: "pill",
  fontFamily: "inherit", fontWeight: 500, lineHeight: 1.75, cursor: "pointer",
  transition: "background-color .25s, color .25s",
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
  _disabled: { pointerEvents: "none", color: "rgba(0, 0, 0, 0.26)" },
  "& svg": { flexShrink: 0 },
});
const softBtn = css({ bg: "rgba(0,0,0,0.05)", color: "#000", _hover: { bg: "rgba(0,0,0,0.1)" } });
const darkBtn = css({ bg: "#000", color: "#fff", _hover: { bg: "rgba(0,0,0,0.8)" } });
const dangerGhostBtn = css({ bg: "transparent", color: "errorText", _hover: { bg: "errorTint" } });
const h44 = css({ h: "44px", px: "16px", fontSize: "14px" });
const h52 = css({ h: "52px", px: "16px", fontSize: "16px" });
const h46 = css({ h: "46px", px: "22px", fontSize: "15px" });
const fullW = css({ w: "100%" });

const closedBlock = css({ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "12px" });
const closedIcon = css({ w: "46px", h: "46px", borderRadius: "50%", bg: "rgba(0,0,0,0.05)", color: "ink3", display: "flex", alignItems: "center", justifyContent: "center" });
const closedTitle = css({ lineHeight: 1.5, fontSize: "15px", fontWeight: 600 });
const closedBody = css({ fontSize: "12.5px", lineHeight: 1.5, color: "ink2" });
const closedBtnSpacing = css({ mt: "4px" });
const applyNote = css({ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", color: "ink3" });
const applyNoteText = css({ lineHeight: 1.5, fontSize: "12px", color: "ink2" });

const cardTitle = css({ lineHeight: 1.5, fontSize: "15px", fontWeight: 600 });
const rowList = css({ display: "flex", flexDirection: "column", gap: "13px" });
const rowWrap = css({ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" });
const rowLabel = css({ lineHeight: 1.5, fontSize: "13px", fontWeight: 500, color: "ink2", whiteSpace: "nowrap" });
const rowValue = cva({
  base: { lineHeight: 1.5, fontSize: "13.5px", fontWeight: 600, whiteSpace: "nowrap" },
  variants: { urgent: { true: { color: "errorText" }, false: { color: "ink" } } },
});
const slotsBlock = css({ mt: "18px" });
const slotsHead = css({ display: "flex", justifyContent: "space-between", mb: "8px" });
const slotsCount = css({ lineHeight: 1.5, fontFamily: "mono", fontSize: "12px", fontWeight: 600, color: "ink2" });
const slotsTrack = css({ h: "6px", borderRadius: "pill", bg: "rgba(0,0,0,0.07)", overflow: "hidden" });
const slotsFill = css({ h: "100%", bg: "ink" });

const clientHead = css({ display: "flex", gap: "13px", mb: "16px" });
const clientName = css({ lineHeight: 1.5, fontSize: "15.5px", fontWeight: 600, letterSpacing: "-0.01em" });
const clientMetaRow = css({ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "ink2" });
const clientFacts = css({ display: "flex", flexDirection: "column", gap: "11px", mb: "16px" });
const clientFact = css({ display: "flex", alignItems: "center", gap: "9px", fontSize: "13.5px", color: "ink2" });
const trustList = css({ display: "flex", flexDirection: "column", gap: "11px" });
const trustRow = css({ display: "flex", alignItems: "center", gap: "9px" });
const trustText = cva({
  base: { lineHeight: 1.5, fontSize: "13.5px", fontWeight: 500 },
  variants: { ok: { true: { color: "ink" }, false: { color: "ink3" } } },
});
const iconMuted = css({ color: "ink3", flexShrink: 0 });
const iconSuccess = css({ color: "success", flexShrink: 0 });
const iconStrong = css({ color: "hairlineStrong", flexShrink: 0 });

const sidebarStack = css({ display: "flex", flexDirection: "column", gap: { base: "16px", md: "20px" } });
const desktopOnly = css({ display: { base: "none", md: "block" } });
const mobileOnly = css({ display: { base: "block", md: "none" } });

const stickyBar = css({
  display: { base: "flex", md: "none" }, position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 1100,
  justifyContent: "space-between", alignItems: "center", gap: "14px", p: "12px 16px",
  bg: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)",
  borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "hairline",
  boxSizing: "border-box",
});
const stickyPrice = css({ lineHeight: 1.5, fontFamily: "mono", fontSize: "17px", fontWeight: 600, letterSpacing: "-0.02em", color: "successText", whiteSpace: "nowrap" });
const closedPill = css({ bg: "rgba(0,0,0,0.05)", color: "ink2" });
const errorRetryBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  boxSizing: "border-box", mt: "16px", p: "6px 8px", minW: "64px", border: "none", borderRadius: "4px",
  bg: "transparent", color: "ink", fontFamily: "inherit", fontSize: "14px", fontWeight: 500, lineHeight: 1.75,
  cursor: "pointer", transition: "background-color .25s",
  _hover: { bg: "rgba(0,0,0,0.04)" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
});

function Chip({ tone, label, size }: { tone: Tone; label: string; size?: "lg" }) {
  return (
    <span className={cx(chipBase({ size: size === "lg" ? "lg" : "md" }), TONE_CLASS[tone])}>
      <span className={chipDot} />{label}
    </span>
  );
}
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cx(labelBase, className)}>{children}</p>;
}
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cx(cardBase, className)}>{children}</div>;
}

function BudgetFigure({ job }: { job: JobPost }) {
  return (
    <div>
      <Label>Project budget · USD</Label>
      <p className={budgetFigure}>
        {money(job.budget_min)}<span className={budgetDash}> – </span>{money(job.budget_max)}
      </p>
      <p className={budgetNote}>Fixed-price · paid via escrow</p>
    </div>
  );
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const jobId = Number(params.id);

  const [job, setJob] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [modal, setModal] = useState<{ open: boolean; edit: boolean }>({ open: false, edit: false });

  useEffect(() => {
    if (!jobId) return;
    (async () => {
      try {
        setLoading(true);
        setJob(await api.getJobPost(jobId));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load job.");
      } finally {
        setLoading(false);
      }
    })();
  }, [jobId]);

  if (loading) {
    return (
      <div className={pageRoot}>
        <div className={loadingContainer}>
          <Skeleton variant="text" width={140} height={24} className={skelBack} />
          <div className={loadingGrid}>
            <Skeleton variant="rect" height={520} className={skelCard} />
            <Skeleton variant="rect" height={320} className={skelCard} />
          </div>
        </div>
      </div>
    );
  }
  if (error || !job) {
    return (
      <div className={plainContainer}>
        <Alert tone="error">{error ?? "Job not found."}</Alert>
        <button type="button" onClick={() => router.push("/jobs")} className={errorRetryBtn}>Back to Job Board</button>
      </div>
    );
  }

  const isFreelancer = !!user?.is_freelancer;
  const myProposal = job.my_proposal ?? null;
  const hasApplied = !!myProposal;
  const proposalsClosed = job.proposal_count >= job.max_proposals;
  const jobOpen = job.status === "open";

  const applyState: "new" | "applied" | "closed" | "logged_out" =
    !user || !isFreelancer ? "logged_out" : hasApplied ? "applied" : !jobOpen || proposalsClosed ? "closed" : "new";

  const onSaved = (proposal: Proposal) => {
    setJob(prev => (prev ? { ...prev, my_proposal: proposal, proposal_count: prev.proposal_count + (hasApplied ? 0 : 1) } : prev));
    setModal({ open: false, edit: false });
  };
  const handleWithdraw = async () => {
    if (!myProposal || !confirm("Withdraw your proposal? This cannot be undone.")) return;
    setWithdrawing(true);
    try {
      const updated = await api.withdrawProposal(myProposal.id);
      setJob(prev => (prev ? { ...prev, my_proposal: updated } : prev));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to withdraw proposal.");
    } finally {
      setWithdrawing(false);
    }
  };

  const jobCfg = JOB_TONE[job.status] ?? JOB_TONE.open;
  const dl = job.deadline ? daysLeft(job.deadline) : null;
  const images = (job.media ?? []).filter(m => m.file_type === "image");
  const pdfs = (job.media ?? []).filter(m => m.file_type !== "image");

  /* ── main column ── */
  const main = (
    <Card className={mainCardPad}>
      <div className={headRow}>
        <div className={headMain}>
          <div className={chipRow}>
            <Chip tone={jobCfg.tone} label={jobCfg.label} size="lg" />
            <span className={categoryChip}>{job.category?.category_name ?? "Uncategorized"}</span>
          </div>
          <p className={jobTitle}>{job.title}</p>
          <p className={postedLine}>Posted {fmtDate(job.created_at)} · {timeAgo(job.created_at)}</p>
        </div>
        <div className={headActions}>
          <button type="button" onClick={() => setSaved(s => !s)} className={cx(outlineBtn, outlineBtnPad, savedTone({ saved }))}>
            <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
            {saved ? "Saved" : "Save"}
          </button>
          <button type="button" aria-label="Share" className={cx(outlineBtn, iconOnlyBtn)}><Share size={17} /></button>
        </div>
      </div>

      {/* mobile budget band */}
      <div className={mobileBudgetBand}>
        <BudgetFigure job={job} />
      </div>

      <div className={rule} />

      <Label>Description</Label>
      <RichTextDisplay value={job.description} />

      {job.skills?.length > 0 && (
        <div className={sectionBlock}>
          <Label>Skills &amp; expertise</Label>
          <div className={skillWrap}>
            {job.skills.map(s => <span key={s.id} className={skillChip}>{s.expertise_name}</span>)}
          </div>
        </div>
      )}

      {(job.media?.length ?? 0) > 0 && (
        <div className={sectionBlock}>
          <Label>Attachments · {job.media.length}</Label>
          {images.length > 0 && (
            <div className={imageGrid({ spaced: pdfs.length > 0 })}>
              {images.map(m => (
                <a key={m.id} href={m.file_url} target="_blank" rel="noopener noreferrer" className={imageTile}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.file_url} alt={m.file_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </a>
              ))}
            </div>
          )}
          {pdfs.length > 0 && (
            <div className={pdfRow}>
              {pdfs.map(m => (
                <a key={m.id} href={m.file_url} target="_blank" rel="noopener noreferrer" className={pdfTile}>
                  <span className={pdfIcon}><FileText size={19} /></span>
                  <p className={pdfName}>{m.file_name}</p>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );

  /* ── apply card ── */
  const applyCard = (
    <Card>
      <BudgetFigure job={job} />
      <div className={ruleTight} />
      {applyState === "applied" && myProposal ? (
        <div className={stackSm}>
          <div className={proposalBox}>
            <div className={proposalHead}>
              <Label>Your proposal</Label>
              <Chip tone={PROP_TONE[myProposal.status].tone} label={PROP_TONE[myProposal.status].label} />
            </div>
            <div className={proposalFacts}>
              <div className={factCol}><Label className={label10}>Your price</Label><p className={factPrice}>{money(myProposal.price)}</p></div>
              <div className={factSep} />
              <div className={factCol}><Label className={label10}>Delivery</Label><p className={factDays}>{myProposal.timeline_days} days</p></div>
            </div>
          </div>
          {myProposal.status === "pending" && (
            <>
              <div className={btnRow}>
                <button type="button" onClick={() => setModal({ open: true, edit: true })} className={cx(pillBtnBase, softBtn, h44, fullW)}>
                  <Pencil size={16} />Edit
                </button>
                <button type="button" onClick={handleWithdraw} disabled={withdrawing} className={cx(pillBtnBase, dangerGhostBtn, h44, fullW)}>
                  {withdrawing ? <Spinner size={16} /> : "Withdraw"}
                </button>
              </div>
              <p className={centredNote}>The client is reviewing proposals. You can edit or withdraw while it&rsquo;s still pending.</p>
            </>
          )}
        </div>
      ) : applyState === "closed" ? (
        <div className={closedBlock}>
          <div className={closedIcon}><Lock size={22} /></div>
          <div>
            <p className={closedTitle}>No longer accepting proposals</p>
            <p className={closedBody}>This job has reached its proposal limit or is no longer open. Browse similar open jobs.</p>
          </div>
          <button type="button" onClick={() => router.push("/jobs")} className={cx(pillBtnBase, softBtn, h44, fullW, closedBtnSpacing)}>
            <ChevronLeft size={16} />Back to Job Board
          </button>
        </div>
      ) : applyState === "logged_out" ? (
        <div className={stackSm}>
          {!user ? (
            <>
              <button type="button" onClick={() => router.push("/auth/sign-in")} className={cx(pillBtnBase, darkBtn, h52, fullW)}>Log in to apply</button>
              <button type="button" onClick={() => router.push("/auth/sign-up")} className={cx(pillBtnBase, softBtn, h44, fullW)}>Create an account</button>
            </>
          ) : (
            <button type="button" onClick={() => router.push("/dashboard")} className={cx(pillBtnBase, darkBtn, h52, fullW)}>Become a freelancer to apply</button>
          )}
          <p className={centredNote}>Joining KickAir is free. Set up a freelancer profile to submit proposals.</p>
        </div>
      ) : (
        <div className={stackSm}>
          <button type="button" onClick={() => setModal({ open: true, edit: false })} className={cx(pillBtnBase, darkBtn, h52, fullW)}>Submit a proposal</button>
          <div className={applyNote}>
            <Zap size={14} /><p className={applyNoteText}>Free to apply · you set your own price</p>
          </div>
        </div>
      )}
    </Card>
  );

  /* ── activity card ── */
  const used = job.proposal_count, totalSlots = job.max_proposals;
  const pct = Math.min(100, Math.round((used / Math.max(1, totalSlots)) * 100));
  const proposalRange = used === 0 ? "No proposals yet" : used < 5 ? "Less than 5" : used < 10 ? "5 to 10" : used < 20 ? "10 to 20" : "20+";
  const activityCard = (
    <Card>
      <p className={cardTitle}>Activity on this job</p>
      <div className={rowList}>
        <Row label="Proposals">{proposalRange}</Row>
        <div className={ruleFlat} />
        <Row label="Date posted">{fmtDate(job.created_at)}</Row>
        {job.deadline && <><div className={ruleFlat} /><Row label="Deadline" urgent={dl !== null && dl <= 3}>{fmtDate(job.deadline)}{dl !== null ? ` · ${dl}d` : ""}</Row></>}
      </div>
      <div className={slotsBlock}>
        <div className={slotsHead}>
          <Label className={label10}>Proposal slots</Label>
          <p className={slotsCount}>{used} / {totalSlots} used</p>
        </div>
        <div className={slotsTrack}><div className={slotsFill} style={{ width: `${pct}%` }} /></div>
      </div>
    </Card>
  );

  /* ── client card ── */
  const c = job.client_profile;
  const clientCard = c ? (
    <Card>
      <p className={cardTitle}>About the client</p>
      <div className={clientHead}>
        <Avatar src={c.user?.avatar_url ?? undefined} name={c.user?.name} px={52} />
        <div className={css({ minW: 0 })}>
          <p className={clientName}>{c.user?.name ?? "Client"}</p>
          {c.company_name && <div className={clientMetaRow}><Building2 size={14} className={iconMuted} />{c.company_name}</div>}
        </div>
      </div>
      <div className={clientFacts}>
        {c.location && <div className={clientFact}><MapPin size={16} className={iconMuted} />{c.location}</div>}
        {c.user?.created_at && <div className={clientFact}><Inbox size={16} className={iconMuted} />Member since {new Date(c.user.created_at).getFullYear()}</div>}
      </div>
      <div className={cx(ruleFlat, css({ mb: "14px" }))} />
      <div className={trustList}>
        <TrustRow ok={!!c.user?.is_verified_phone}>Phone verified</TrustRow>
        <TrustRow ok={!!c.user?.is_verified_id}>ID verified</TrustRow>
      </div>
    </Card>
  ) : null;

  const sidebar = (
    <div className={sidebarStack}>
      <div className={desktopOnly}>{applyCard}</div>
      {activityCard}
      {clientCard}
      {/* mobile: show the applied summary inline (the new/closed CTA lives in the sticky bar) */}
      {applyState === "applied" && <div className={mobileOnly}>{applyCard}</div>}
    </div>
  );

  return (
    <div className={pageRoot}>
      <div className={container}>
        <button type="button" onClick={() => router.push("/jobs")} className={backBtn}>
          <ChevronLeft size={17} />Back to Job Board
        </button>
        <div className={detailGrid}>
          {main}
          <div className={stickyCol}>{sidebar}</div>
        </div>
      </div>

      {/* mobile sticky apply bar (hidden when already applied — summary shows inline) */}
      {applyState !== "applied" && (
        <div className={stickyBar}>
          <div>
            <p className={stickyPrice}>{money(job.budget_min)} – {money(job.budget_max)}</p>
            <Label className={label95}>Budget · USD</Label>
          </div>
          {applyState === "new" ? (
            <button type="button" onClick={() => setModal({ open: true, edit: false })} className={cx(pillBtnBase, darkBtn, h46)}>Submit a proposal</button>
          ) : applyState === "logged_out" ? (
            <button type="button" onClick={() => router.push(user ? "/dashboard" : "/auth/sign-in")} className={cx(pillBtnBase, darkBtn, h46)}>{user ? "Become a freelancer" : "Log in to apply"}</button>
          ) : (
            <button type="button" disabled className={cx(pillBtnBase, closedPill, h46)}>Closed</button>
          )}
        </div>
      )}

      <ProposalModal
        open={modal.open}
        jobPostId={job.id}
        jobTitle={job.title}
        budgetMin={job.budget_min}
        budgetMax={job.budget_max}
        existing={modal.edit ? myProposal : null}
        onSaved={onSaved}
        onClose={() => setModal({ open: false, edit: false })}
      />
    </div>
  );
}

function Row({ label, children, urgent }: { label: string; children: React.ReactNode; urgent?: boolean }) {
  return (
    <div className={rowWrap}>
      <p className={rowLabel}>{label}</p>
      <p className={rowValue({ urgent: !!urgent })}>{children}</p>
    </div>
  );
}
function TrustRow({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <div className={trustRow}>
      {ok ? <BadgeCheck size={18} className={iconSuccess} /> : <Circle size={18} className={iconStrong} />}
      <p className={trustText({ ok })}>{children}</p>
    </div>
  );
}
