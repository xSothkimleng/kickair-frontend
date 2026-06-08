"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Container, Typography, Button, CircularProgress, Alert, Avatar, Skeleton, Pagination } from "@mui/material";
import {
  ChevronLeftOutlined,
  Check as CheckIcon,
  Close as CloseIcon,
  EditOutlined,
  RefreshOutlined,
  InfoOutlined,
  InsertDriveFileOutlined,
  ArrowForwardOutlined,
  MoveToInboxOutlined,
} from "@mui/icons-material";
import { api } from "@/lib/api";
import { JobPost, Proposal, ProposalStatus, JobPostStatus } from "@/types/job";
import { tokens } from "@/theme";
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
const TONE: Record<Tone, { bg: string; color: string }> = {
  success: { bg: tokens.successTint, color: tokens.successText },
  pending: { bg: tokens.pendingTint, color: tokens.pendingText },
  error: { bg: tokens.errorTint, color: tokens.errorText },
  info: { bg: "rgba(37,99,235,0.10)", color: "#1d4ed8" },
  neutral: { bg: "rgba(0,0,0,0.05)", color: tokens.text2 },
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
function Chip({ tone, label, size }: { tone: Tone; label: string; size?: "lg" }) {
  const c = TONE[tone];
  return (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, height: size === "lg" ? 34 : 26, px: size === "lg" ? 1.75 : 1.25, borderRadius: "999px", fontSize: size === "lg" ? 13 : 12, fontWeight: 600, bgcolor: c.bg, color: c.color }}>
      <Box component="span" sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "currentColor" }} />
      {label}
    </Box>
  );
}

/* ── meta fact cell ── */
function MetaFact({ label, value, sub, urgent }: { label: string; value: string; sub?: string; urgent?: boolean }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.4, minWidth: 0 }}>
      <Typography sx={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: tokens.text3 }}>{label}</Typography>
      <Typography sx={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", color: urgent ? tokens.errorText : tokens.text, whiteSpace: "nowrap" }}>
        {value}
        {sub && <Box component="span" sx={{ fontWeight: 400, color: tokens.text3, ml: 0.75, fontSize: 13 }}>{sub}</Box>}
      </Typography>
    </Box>
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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25, alignItems: { xs: "flex-start", sm: "flex-end" } }}>
      <Typography sx={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: tokens.text3 }}>Quoted price</Typography>
      <Typography sx={{ fontFamily: tokens.mono, fontSize: { xs: 27, sm: 30 }, fontWeight: 600, letterSpacing: "-0.025em", lineHeight: 1, color: dim ? tokens.text2 : tokens.text }}>{money(p.price)}</Typography>
      <Typography sx={{ fontSize: 11.5, fontWeight: 500, color: tokens.text2 }}>{p.timeline_days} days delivery</Typography>
    </Box>
  );

  const actions = showActions ? (
    <Box sx={{ display: "flex", gap: 1, width: { xs: "100%", sm: "auto" } }} onClick={e => e.stopPropagation()}>
      <Button onClick={onReject} disabled={busy} startIcon={<CloseIcon sx={{ fontSize: 15 }} />}
        sx={{ flex: { xs: 1, sm: "none" }, height: 36, borderRadius: "999px", bgcolor: "rgba(0,0,0,0.05)", color: "#000", textTransform: "none", fontSize: 13, "&:hover": { bgcolor: "rgba(0,0,0,0.1)" } }}>Reject</Button>
      <Button onClick={onAccept} disabled={busy} startIcon={busy ? <CircularProgress size={13} color="inherit" /> : <CheckIcon sx={{ fontSize: 15 }} />}
        sx={{ flex: { xs: 1, sm: "none" }, height: 36, borderRadius: "999px", bgcolor: "#000", color: "#fff", textTransform: "none", fontSize: 13, "&:hover": { bgcolor: "rgba(0,0,0,0.8)" } }}>Accept</Button>
    </Box>
  ) : p.status === "accepted" ? <Chip tone="success" label="Hired" /> : null;

  const name = p.freelancer_profile?.user?.name ?? "Freelancer";
  const nameRow = (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
      <Typography sx={{ fontSize: 15.5, fontWeight: 600, letterSpacing: "-0.01em" }}>{name}</Typography>
      {unread && (
        <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.625, fontSize: 11, fontWeight: 600, color: tokens.accent }}>
          <Box component="span" sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: tokens.accent }} /> New
        </Box>
      )}
      {p.is_updated && (
        <Box component="span" sx={{ display: "inline-flex", alignItems: "center", height: 22, px: 1.125, borderRadius: "999px", fontSize: 11, fontWeight: 600, bgcolor: "rgba(37,99,235,0.1)", color: "#1d4ed8" }}>Updated</Box>
      )}
    </Box>
  );
  const metaRow = <Typography sx={{ fontSize: 12, fontWeight: 500, color: tokens.text2 }}>Submitted {fmtDate(p.created_at)}</Typography>;
  const snippet = (
    <Typography sx={{ fontSize: 13.5, lineHeight: 1.5, color: tokens.text2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.cover_letter}</Typography>
  );

  const cardSx = {
    bgcolor: unread ? `rgba(${tokens.accentRgb},0.035)` : tokens.surface,
    border: "1px solid",
    borderColor: unread ? `rgba(${tokens.accentRgb},0.28)` : tokens.border,
    borderRadius: `${tokens.radius.cardSm}px`,
    opacity: dim ? 0.66 : 1,
    cursor: "pointer",
    transition: "border-color .15s, background .15s",
    "&:hover": { borderColor: tokens.borderStrong, bgcolor: tokens.surface2 },
  } as const;

  return (
    <Box role="button" tabIndex={0} onClick={onOpen} sx={cardSx}>
      <Box sx={{ p: { xs: 2.25, sm: 2.5 }, display: "flex", gap: { xs: 1.75, sm: 2.25 }, flexDirection: { xs: "column", sm: "row" }, alignItems: { sm: "stretch" } }}>
        <Box sx={{ display: "flex", gap: 1.5, minWidth: 0, flex: 1 }}>
          <Avatar src={p.freelancer_profile?.user?.avatar_url ?? undefined} alt={name} sx={{ width: 52, height: 52, flex: "none" }} />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.875, minWidth: 0, justifyContent: "center" }}>
            {nameRow}{metaRow}{snippet}
          </Box>
        </Box>
        <Box sx={{ width: "1px", bgcolor: tokens.border, flex: "none", display: { xs: "none", sm: "block" } }} />
        <Box sx={{ display: "flex", flexDirection: { xs: "row", sm: "column" }, justifyContent: "space-between", alignItems: { xs: "flex-end", sm: "flex-end" }, gap: 1.5, flex: "none", minWidth: { sm: 170 } }}>
          <Box sx={{ display: { xs: "none", sm: "flex" }, justifyContent: "flex-end" }}><Chip tone={PROP_STATUS[p.status].tone} label={PROP_STATUS[p.status].label} /></Box>
          {priceBlock}
          {actions}
        </Box>
      </Box>
      {/* mobile status chip row */}
      <Box sx={{ display: { xs: "flex", sm: "none" }, px: 2.25, pb: 2.25, mt: -1 }}>
        <Chip tone={PROP_STATUS[p.status].tone} label={PROP_STATUS[p.status].label} />
      </Box>
    </Box>
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
  const list = proposals.filter(p => filter === "all" || p.status === filter);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: tokens.canvas }}>
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 }, maxWidth: "1080px !important" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2.25, md: 3 } }}>
          {/* Back */}
          <Button onClick={backToJobs} startIcon={<ChevronLeftOutlined sx={{ fontSize: 18 }} />}
            sx={{ alignSelf: "flex-start", p: "2px 4px", color: tokens.text2, textTransform: "none", fontSize: 14, fontWeight: 500, "&:hover": { color: "#000", bgcolor: "transparent" } }}>
            Back to My Jobs
          </Button>

          {loading ? (
            <LoadingState />
          ) : error ? (
            <Alert severity="error" sx={{ borderRadius: 2 }} action={<Button color="inherit" size="small" onClick={() => location.reload()}>Retry</Button>}>{error}</Alert>
          ) : job ? (
            <>
              {/* Rejection banner */}
              {status === "rejected" && (
                <Box sx={{ border: `1px solid rgba(220,38,38,0.25)`, bgcolor: tokens.errorTint, borderRadius: `${tokens.radius.cardSm}px`, p: 2.5, display: "flex", gap: 1.75, alignItems: "flex-start" }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: "50%", bgcolor: "rgba(220,38,38,0.14)", color: tokens.error, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                    <InfoOutlined sx={{ fontSize: 20 }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 600, color: tokens.errorText, mb: 0.75 }}>This job was rejected by an admin</Typography>
                    <Typography sx={{ fontSize: 13.5, lineHeight: 1.55, color: tokens.text2 }}>{job.rejection_reason || "No reason was provided. Edit the job and resubmit it for review."}</Typography>
                    <Button onClick={editJob} startIcon={<RefreshOutlined sx={{ fontSize: 15 }} />}
                      sx={{ mt: 1.25, height: 36, borderRadius: "999px", bgcolor: "#000", color: "#fff", textTransform: "none", fontSize: 13, px: 2, "&:hover": { bgcolor: "rgba(0,0,0,0.8)" } }}>Edit &amp; resubmit</Button>
                  </Box>
                </Box>
              )}

              {/* Job header card */}
              <Box sx={{ bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius.card}px`, p: { xs: 2.75, md: 3.5 } }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexDirection: { xs: "column", md: "row" } }}>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, minWidth: 0 }}>
                    <Chip tone={jobCfg.tone} label={jobCfg.label} size="lg" />
                    <Typography sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.15 }}>{job.title}</Typography>
                    {/* hero metric */}
                    {status === "in_progress" && hired ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.125 }}>
                        <Box sx={{ width: 22, height: 22, borderRadius: "50%", bgcolor: tokens.successTint, color: tokens.success, display: "flex", alignItems: "center", justifyContent: "center" }}><CheckIcon sx={{ fontSize: 14 }} /></Box>
                        <Typography sx={{ fontSize: 18, fontWeight: 600 }}>Hired {hired.freelancer_profile?.user?.name ?? "a freelancer"}</Typography>
                        <Box component="span" sx={{ color: tokens.text3 }}>·</Box>
                        <Typography sx={{ fontSize: 15, color: tokens.text2 }}>{proposals.length} proposals reviewed</Typography>
                      </Box>
                    ) : proposals.length === 0 ? (
                      <Typography sx={{ fontSize: 16, fontWeight: 500, color: tokens.text2 }}>No proposals yet</Typography>
                    ) : (
                      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.125 }}>
                        <Typography sx={{ fontSize: 19, fontWeight: 600, letterSpacing: "-0.015em" }}>{proposals.length} proposals</Typography>
                        {fresh > 0 && <><Box component="span" sx={{ color: tokens.text3 }}>·</Box><Typography sx={{ fontSize: 15, fontWeight: 600, color: tokens.accent }}>{fresh} new</Typography></>}
                      </Box>
                    )}
                  </Box>
                  {/* owner actions */}
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Button onClick={editJob} startIcon={<EditOutlined sx={{ fontSize: 15 }} />}
                      sx={{ height: 36, borderRadius: "999px", bgcolor: "rgba(0,0,0,0.05)", color: "#000", textTransform: "none", fontSize: 13, px: 1.75, "&:hover": { bgcolor: "rgba(0,0,0,0.1)" } }}>Edit job</Button>
                    {(live || status === "in_progress") && (
                      <Button onClick={handleClose} startIcon={<CloseIcon sx={{ fontSize: 15 }} />}
                        sx={{ height: 36, borderRadius: "999px", color: tokens.errorText, textTransform: "none", fontSize: 13, px: 1.75, "&:hover": { bgcolor: tokens.errorTint } }}>{status === "in_progress" ? "Cancel" : "Close"} job</Button>
                    )}
                  </Box>
                </Box>

                {/* meta facts */}
                <Box sx={{ display: "flex", flexWrap: "wrap", rowGap: 2.25, my: { xs: 2.5, md: 2.75 } }}>
                  {([
                    { label: "Budget", value: `${money(job.budget_min)} – ${money(job.budget_max)}` },
                    ...(job.deadline ? [{ label: "Deadline", value: deadlineInfo(job.deadline).label, sub: fmtDate(job.deadline), urgent: deadlineInfo(job.deadline).urgent }] : []),
                    ...(job.category ? [{ label: "Category", value: job.category.category_name }] : []),
                    { label: "Posted", value: fmtDate(job.created_at) },
                  ] as { label: string; value: string; sub?: string; urgent?: boolean }[]).map((f, i, arr) => (
                    <Box key={f.label} sx={{ display: "flex", flex: { xs: "0 0 50%", md: "none" } }}>
                      <MetaFact label={f.label} value={f.value} sub={f.sub} urgent={f.urgent} />
                      {i < arr.length - 1 && <Box sx={{ width: "1px", height: 30, bgcolor: tokens.border, mx: 3, display: { xs: "none", md: "block" } }} />}
                    </Box>
                  ))}
                </Box>

                {/* skills */}
                {job.skills?.length > 0 && (
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {job.skills.map(s => (
                      <Box key={s.id} component="span" sx={{ display: "inline-flex", alignItems: "center", height: 30, px: 1.625, borderRadius: "999px", fontSize: 12.5, fontWeight: 500, bgcolor: "rgba(0,0,0,0.05)", color: tokens.text2 }}>{s.expertise_name}</Box>
                    ))}
                  </Box>
                )}

                <Box sx={{ height: "1px", bgcolor: tokens.border, my: { xs: 2.5, md: 3 } }} />

                {/* description */}
                <Typography sx={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: tokens.text3, mb: 1 }}>Description</Typography>
                <RichTextDisplay value={job.description} />

                {/* attachments */}
                {job.media?.length > 0 && <Attachments media={job.media} />}
              </Box>

              {/* Proposals region */}
              {status === "rejected" ? null : proposals.length === 0 ? (
                <EmptyProposals onEdit={editJob} />
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1.75 }}>
                    <Typography sx={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.015em" }}>Proposals</Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {FILTERS.map(([k, l]) => {
                        const active = filter === k;
                        return (
                          <Box key={k} component="button" onClick={() => setFilter(k)}
                            sx={{ height: 34, px: 2, borderRadius: "999px", cursor: "pointer", font: "inherit", fontSize: 13, fontWeight: 500, border: "none", bgcolor: active ? "#000" : "rgba(0,0,0,0.05)", color: active ? "#fff" : tokens.text2, "&:hover": { bgcolor: active ? "#000" : "rgba(0,0,0,0.09)" } }}>
                            {l}<Box component="span" sx={{ ml: 0.875, fontVariantNumeric: "tabular-nums", opacity: active ? 0.7 : 0.55 }}>{counts[k]}</Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>

                  {actionError && <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setActionError(null)}>{actionError}</Alert>}

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {list.length === 0 ? (
                      <Box sx={{ bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius.card}px`, p: 5, textAlign: "center", color: tokens.text2, fontSize: 14 }}>No {filter === "all" ? "" : filter} proposals.</Box>
                    ) : list.map(p => (
                      <ProposalCard key={p.id} p={p} locked={locked} busy={actionId === p.id}
                        onAccept={() => handleAccept(p)} onReject={() => handleReject(p)} onOpen={() => router.push(`/proposals/${p.id}`)} />
                    ))}
                  </Box>

                  {lastPage > 1 && (
                    <Box sx={{ display: "flex", justifyContent: "center", pt: 1 }}>
                      <Pagination count={lastPage} page={page} onChange={(_, p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} shape="rounded" />
                    </Box>
                  )}
                </Box>
              )}
            </>
          ) : null}
        </Box>
      </Container>
    </Box>
  );
}

/* ── attachments ── */
function Attachments({ media }: { media: JobPost["media"] }) {
  const images = media.filter(m => m.file_type === "image");
  const pdfs = media.filter(m => m.file_type !== "image");
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 3 }}>
      <Typography sx={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: tokens.text3 }}>Attachments · {media.length}</Typography>
      {images.length > 0 && (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2,1fr)", sm: "repeat(4,1fr)" }, gap: 1.25 }}>
          {images.map(m => (
            <Box key={m.id} component="a" href={m.file_url} target="_blank" rel="noopener noreferrer" title={m.file_name}
              sx={{ position: "relative", aspectRatio: "4 / 3", borderRadius: `${tokens.radius.tile}px`, border: `1px solid ${tokens.border}`, overflow: "hidden", display: "block", "&:hover": { borderColor: tokens.borderStrong } }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.file_url} alt={m.file_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </Box>
          ))}
        </Box>
      )}
      {pdfs.length > 0 && (
        <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap" }}>
          {pdfs.map(m => (
            <Box key={m.id} component="a" href={m.file_url} target="_blank" rel="noopener noreferrer" title={m.file_name}
              sx={{ display: "flex", alignItems: "center", gap: 1.375, p: "10px 14px 10px 11px", borderRadius: `${tokens.radius.tile}px`, border: `1px solid ${tokens.border}`, bgcolor: tokens.surface, maxWidth: { xs: "100%", sm: 260 }, minWidth: 0, textDecoration: "none", "&:hover": { bgcolor: tokens.surface2, borderColor: tokens.borderStrong } }}>
              <Box sx={{ width: 38, height: 38, borderRadius: "9px", bgcolor: tokens.errorTint, color: tokens.errorText, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><InsertDriveFileOutlined sx={{ fontSize: 19 }} /></Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: tokens.text }}>{m.file_name}</Typography>
                <Typography sx={{ fontSize: 11, fontWeight: 500, color: tokens.text2 }}>PDF{m.file_size ? ` · ${fileSize(m.file_size)}` : ""}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

/* ── empty proposals ── */
function EmptyProposals({ onEdit }: { onEdit: () => void }) {
  return (
    <Box sx={{ bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius.card}px`, p: { xs: 5.5, md: 8 }, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 1.75 }}>
      <Box sx={{ width: 72, height: 72, borderRadius: "50%", bgcolor: tokens.canvas, border: `1px solid ${tokens.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <MoveToInboxOutlined sx={{ fontSize: 30, color: tokens.text3 }} />
      </Box>
      <Box sx={{ maxWidth: 420 }}>
        <Typography sx={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em" }}>No proposals yet</Typography>
        <Typography sx={{ fontSize: 14, lineHeight: 1.55, color: tokens.text2, mt: 0.75 }}>Your job is live and visible to freelancers. We&rsquo;ll notify you the moment a proposal arrives.</Typography>
      </Box>
      <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap", justifyContent: "center" }}>
        <Button onClick={onEdit} startIcon={<EditOutlined sx={{ fontSize: 15 }} />}
          sx={{ height: 36, borderRadius: "999px", bgcolor: "rgba(0,0,0,0.05)", color: "#000", textTransform: "none", fontSize: 13, px: 1.75, "&:hover": { bgcolor: "rgba(0,0,0,0.1)" } }}>Edit job</Button>
      </Box>
    </Box>
  );
}

/* ── loading skeleton ── */
function LoadingState() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius.card}px`, p: 3.5 }}>
        <Skeleton variant="rounded" width={92} height={28} sx={{ borderRadius: "999px" }} />
        <Skeleton variant="text" width="65%" height={36} sx={{ mt: 2 }} />
        <Skeleton variant="text" width={180} height={22} />
        <Box sx={{ display: "flex", gap: 3.5, my: 3, flexWrap: "wrap" }}>
          {[0, 1, 2, 3].map(i => <Box key={i}><Skeleton variant="text" width={54} height={12} /><Skeleton variant="text" width={90} height={20} /></Box>)}
        </Box>
        <Skeleton variant="text" width="100%" /><Skeleton variant="text" width="90%" /><Skeleton variant="text" width="75%" />
      </Box>
      {[0, 1, 2].map(i => (
        <Box key={i} sx={{ bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius.cardSm}px`, p: 2.5, display: "flex", gap: 2.25, alignItems: "center" }}>
          <Skeleton variant="circular" width={52} height={52} />
          <Box sx={{ flex: 1 }}><Skeleton variant="text" width={160} /><Skeleton variant="text" width={220} /><Skeleton variant="text" width="80%" /></Box>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}><Skeleton variant="text" width={90} height={30} /><Skeleton variant="rounded" width={120} height={36} sx={{ borderRadius: "999px" }} /></Box>
        </Box>
      ))}
    </Box>
  );
}
