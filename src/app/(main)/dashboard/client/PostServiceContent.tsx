"use client";

import { useState, useEffect } from "react";
import { Plus, Briefcase, Pencil, RotateCcw, X, Info } from "lucide-react";
import { css, cx } from "styled-system/css";
import { Alert, Spinner } from "@/components/ds";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { JobPost, JobPostStatus } from "@/types/job";
import { StatusPill, KebabMenu, Facts, Banner, Chevron, mgCard, type CardTone, type Fact, type MenuAction } from "@/components/dashboard/ManagementCard";
import JobPostForm from "@/components/jobs/JobPostForm";
import JobDraftCard from "@/components/jobs/JobDraftCard";

type View = "list" | "create" | "edit";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(value: string) {
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return num.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

const JOB_TONE: Record<JobPostStatus, { tone: CardTone; label: string }> = {
  draft: { tone: "neutral", label: "Draft" },
  pending_review: { tone: "pending", label: "Pending review" },
  open: { tone: "success", label: "Open" },
  in_progress: { tone: "info", label: "In progress" },
  completed: { tone: "neutral", label: "Completed" },
  cancelled: { tone: "neutral", label: "Cancelled" },
  rejected: { tone: "error", label: "Rejected" },
};
function daysLeft(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
}

/* ── static styles ── */
const cardLayout = css({ display: "flex", alignItems: "center", gap: "16px", p: "20px 22px" });
const cardBody = css({ display: "flex", flexDirection: "column", gap: "13px", flex: 1, minW: 0 });
const cardTop = css({ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" });
const cardTitle = css({ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.015em", lineHeight: 1.25 });

const page = css({ display: "flex", flexDirection: "column", gap: "24px" });
const header = css({ display: "flex", alignItems: "center", justifyContent: "space-between" });
const pageTitle = css({ lineHeight: 1.5, fontSize: "28px", fontWeight: 600, color: "ink" });
const pageSub = css({ lineHeight: 1.5, fontSize: "13px", color: "ink2" });
const createBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px",
  boxSizing: "border-box", m: 0, px: "24px", h: "44px", minW: "64px",
  border: "none", borderRadius: "40px",
  bg: "ink", color: "white",
  fontFamily: "inherit", fontSize: "13px", fontWeight: 500, lineHeight: 1.75,
  cursor: "pointer", transition: "background-color .25s",
  _hover: { bg: "rgba(0, 0, 0, 0.8)" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
  "& svg": { flexShrink: 0 },
});
const alertBox = css({ borderRadius: "8px", fontSize: "13px" });
const sectionCard = css({
  bg: "surface", borderRadius: "card",
  borderWidth: "1px", borderStyle: "solid", borderColor: "hairline",
  p: "24px",
});
/* globals.css zeroes `p` margins outside any layer, so the old Typography `mb` never applied. */
const sectionTitle = css({ lineHeight: 1.5, fontSize: "17px", fontWeight: 600, color: "ink" });
const centreBlock = css({ textAlign: "center", py: "48px" });
const errorText = css({ lineHeight: 1.5, fontSize: "13px", color: "rgba(239,68,68,0.8)" });
const retryBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  boxSizing: "border-box", m: 0, p: "6px 8px", minW: "64px", border: "none", borderRadius: "4px",
  bg: "transparent", color: "ink", fontFamily: "inherit", fontSize: "12px", fontWeight: 500, lineHeight: 1.75,
  cursor: "pointer", transition: "background-color .25s",
  _hover: { bg: "rgba(0, 0, 0, 0.04)" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
});
const emptyIcon = css({ display: "inline-block", color: "rgba(0,0,0,0.2)", mb: "16px" });
const emptyText = css({ lineHeight: 1.5, fontSize: "13px", color: "ink2" });
const firstJobBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  boxSizing: "border-box", m: 0, p: "6px 16px", minW: "64px",
  border: "none", borderRadius: "40px",
  bg: "accent", color: "white",
  fontFamily: "inherit", fontSize: "13px", fontWeight: 500, lineHeight: 1.75,
  cursor: "pointer", transition: "background-color .25s",
  boxShadow: "0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)",
  _hover: { bg: "accentHover" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
});
const cardList = css({ display: "flex", flexDirection: "column", gap: "12px" });
const draftsHeader = css({ display: "flex", alignItems: "center", gap: "8px", mb: "4px" });
const draftsCount = css({
  px: "8px", py: "2px", bg: "rgba(0,0,0,0.05)", color: "ink2",
  fontSize: "11px", fontWeight: 600, borderRadius: "4px",
});
const draftsSub = css({ lineHeight: 1.5, fontSize: "12px", color: "rgba(0,0,0,0.5)" });

interface JobRowProps {
  job: JobPost;
  onEdit: () => void;
  onCancelled: (id: number) => void;
}

function JobRow({ job, onEdit, onCancelled }: JobRowProps) {
  const router = useRouter();
  const cfg = JOB_TONE[job.status] ?? JOB_TONE.open;
  const dl = job.deadline ? daysLeft(job.deadline) : null;

  const handleCancel = async () => {
    if (!confirm("Cancel this job post? This cannot be undone.")) return;
    try {
      await api.deleteJobPost(job.id);
      onCancelled(job.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to cancel job post.");
    }
  };

  const facts: Fact[] = [
    { label: "Budget · USD", mono: true, value: `${formatCurrency(job.budget_min)} – ${formatCurrency(job.budget_max)}` },
    { label: "Proposals", value: job.proposal_count ? `${job.proposal_count} proposal${job.proposal_count === 1 ? "" : "s"}` : "None yet", color: job.proposal_count ? undefined : "rgba(0, 0, 0, 0.4)" },
  ];
  if ((job.status === "open" || job.status === "in_progress") && job.deadline) {
    facts.push({
      label: "Deadline",
      value: dl !== null && dl <= 0 ? "Overdue" : dl !== null && dl <= 7 ? `In ${dl} day${dl === 1 ? "" : "s"}` : formatDate(job.deadline),
      color: dl !== null && dl <= 3 ? "#b91c1c" : undefined,
    });
  }

  const edit: MenuAction = { icon: <Pencil size={18} />, label: "Edit job", onClick: onEdit };
  const menu: MenuAction[] =
    job.status === "rejected"
      ? [edit, { icon: <RotateCcw size={18} />, label: "Resubmit for review", onClick: onEdit }]
      : job.status === "open" || job.status === "in_progress"
        ? [edit, { sep: true, label: "" }, { icon: <X size={18} />, label: "Cancel job", danger: true, onClick: handleCancel }]
        : job.status === "pending_review"
          ? [edit]
          : [];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/dashboard/jobs/${job.id}/proposals`)}
      className={cx(mgCard, cardLayout)}>
      <div className={cardBody}>
        <div className={cardTop}>
          <StatusPill tone={cfg.tone} label={cfg.label} />
          <KebabMenu items={menu} />
        </div>
        <p className={cardTitle}>{job.title}</p>
        <Facts items={facts} />
        {job.status === "rejected" && (
          <Banner tone="error" icon={<Info size={16} />} label="Rejected by admin" text={job.rejection_reason || "No reason provided. Use Resubmit to send it for review again."} />
        )}
      </div>
      <Chevron />
    </div>
  );
}

export default function PostServiceContent() {
  const [view, setView] = useState<View>("list");
  const [editingJob, setEditingJob] = useState<JobPost | null>(null);
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Draft actions (publish / delete) report their own success/failure separately from
  // the list-fetch error, and track which draft is mid-action for per-card spinners.
  const [actionMsg, setActionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [publishingId, setPublishingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getClientJobPosts();
      setJobs(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch job posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Deep-link: arriving with ?edit={id} (e.g. "Edit job" from the Job Overview page)
  // opens that job's editor, then strips the param so a refresh doesn't re-open it.
  useEffect(() => {
    if (view !== "list" || jobs.length === 0) return;
    const editId = new URLSearchParams(window.location.search).get("edit");
    if (!editId) return;
    const job = jobs.find(j => String(j.id) === editId);
    if (job) {
      setEditingJob(job);
      setView("edit");
      const url = new URL(window.location.href);
      url.searchParams.delete("edit");
      window.history.replaceState({}, "", url.toString());
    }
  }, [jobs, view]);

  const handleEdit = (job: JobPost) => {
    setEditingJob(job);
    setView("edit");
  };

  const handleBack = () => {
    setView("list");
    setEditingJob(null);
    fetchJobs();
  };

  // The backend decides the final status: a fully-verified user goes to review, an
  // unverified one is kept as a draft even if they hit "Post Job". Reflect that back.
  const handleSaved = (saved: JobPost) => {
    handleBack();
    setActionMsg(
      saved.status === "draft"
        ? { type: "success", text: "Saved as a draft. Verify your account, then publish it when you're ready." }
        : { type: "success", text: "Job submitted for review." },
    );
  };

  const handleCancelled = (id: number) => {
    setJobs(prev => prev.map(j => (j.id === id ? { ...j, status: "cancelled" as JobPostStatus } : j)));
  };

  // Publish a draft → sends it to admin review. The backend enforces the publish gate
  // (KYC / verified contacts) and returns a 403 with the reason if the user isn't eligible.
  const handlePublishDraft = async (job: JobPost) => {
    setPublishingId(job.id);
    setActionMsg(null);
    try {
      const updated = await api.publishJobPost(job.id);
      setJobs(prev => prev.map(j => (j.id === job.id ? { ...j, status: updated.status } : j)));
      setActionMsg({ type: "success", text: "Job submitted for review." });
    } catch (err) {
      setActionMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to publish job." });
    } finally {
      setPublishingId(null);
    }
  };

  const handleDeleteDraft = async (job: JobPost) => {
    if (!confirm("Delete this draft? This cannot be undone.")) return;
    setDeletingId(job.id);
    setActionMsg(null);
    try {
      await api.deleteJobPost(job.id);
      setJobs(prev => prev.filter(j => j.id !== job.id));
    } catch (err) {
      setActionMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to delete draft." });
    } finally {
      setDeletingId(null);
    }
  };

  if (view === "create" || view === "edit") {
    return <JobPostForm job={editingJob} onBack={handleBack} onSaved={handleSaved} />;
  }

  const drafts = jobs.filter(j => j.status === "draft");
  const liveJobs = jobs.filter(j => j.status !== "draft");

  return (
    <div className={page}>
      {/* Header */}
      <div className={header}>
        <div>
          <p className={pageTitle}>My Jobs</p>
          <p className={pageSub}>
            Post job opportunities and manage incoming proposals
          </p>
        </div>
        <button type="button" onClick={() => setView("create")} className={createBtn}>
          <Plus size={16} />
          Post a Job
        </button>
      </div>

      {/* Draft publish / delete feedback (incl. publish-gate messages) */}
      {actionMsg && (
        <Alert tone={actionMsg.type === "success" ? "success" : "error"} onClose={() => setActionMsg(null)} className={alertBox}>
          {actionMsg.text}
        </Alert>
      )}

      {/* Job List */}
      <div className={sectionCard}>
        <p className={sectionTitle}>All Jobs</p>

        {loading ? (
          <div className={centreBlock}>
            <Spinner size={32} className={css({ color: "rgba(0,0,0,0.4)" })} />
          </div>
        ) : error ? (
          <div className={centreBlock}>
            <p className={errorText}>{error}</p>
            <button type="button" onClick={fetchJobs} className={retryBtn}>
              Try again
            </button>
          </div>
        ) : liveJobs.length > 0 ? (
          <div className={cardList}>
            {liveJobs.map(job => (
              <JobRow key={job.id} job={job} onEdit={() => handleEdit(job)} onCancelled={handleCancelled} />
            ))}
          </div>
        ) : drafts.length > 0 ? (
          <div className={centreBlock}>
            <Briefcase size={48} className={emptyIcon} />
            <p className={emptyText}>
              No published jobs yet — publish a draft below to start receiving proposals.
            </p>
          </div>
        ) : (
          <div className={centreBlock}>
            <Briefcase size={48} className={emptyIcon} />
            <p className={emptyText}>No job posts yet</p>
            <button type="button" onClick={() => setView("create")} className={firstJobBtn}>
              Post your first job
            </button>
          </div>
        )}
      </div>

      {/* Drafts — private, never reviewed or public until published */}
      {drafts.length > 0 && (
        <div className={sectionCard}>
          <div className={draftsHeader}>
            <p className={sectionTitle}>Drafts</p>
            <div className={draftsCount}>
              {drafts.length}
            </div>
          </div>
          <p className={draftsSub}>
            Only you can see these. Continue editing and publish when you&apos;re ready for admin review.
          </p>
          <div className={cardList}>
            {drafts.map(draft => (
              <JobDraftCard
                key={draft.id}
                draft={draft}
                onContinueEditing={() => handleEdit(draft)}
                onPublish={() => handlePublishDraft(draft)}
                onDelete={() => handleDeleteDraft(draft)}
                publishing={publishingId === draft.id}
                deleting={deletingId === draft.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
