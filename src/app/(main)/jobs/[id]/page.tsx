"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Container, Typography, Button, CircularProgress, Alert, Avatar, Skeleton } from "@mui/material";
import {
  ChevronLeftOutlined,
  BookmarkBorderOutlined,
  Bookmark as BookmarkFilled,
  IosShareOutlined,
  InsertDriveFileOutlined,
  LocationOnOutlined,
  BusinessOutlined,
  VerifiedOutlined,
  RadioButtonUncheckedOutlined,
  LockOutlined,
  EditOutlined,
  BoltOutlined,
  MoveToInboxOutlined,
} from "@mui/icons-material";
import { api } from "@/lib/api";
import { useAuth } from "@/components/context/AuthContext";
import { JobPost, Proposal, ProposalStatus } from "@/types/job";
import { tokens } from "@/theme";
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
const TONE: Record<Tone, { bg: string; color: string }> = {
  success: { bg: tokens.successTint, color: tokens.successText },
  pending: { bg: tokens.pendingTint, color: tokens.pendingText },
  error: { bg: tokens.errorTint, color: tokens.errorText },
  info: { bg: "rgba(37,99,235,0.10)", color: "#1d4ed8" },
  neutral: { bg: "rgba(0,0,0,0.05)", color: tokens.text2 },
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
function Chip({ tone, label, size }: { tone: Tone; label: string; size?: "lg" }) {
  const c = TONE[tone];
  return (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, height: size === "lg" ? 34 : 26, px: size === "lg" ? 1.75 : 1.25, borderRadius: "999px", fontSize: size === "lg" ? 13 : 12, fontWeight: 600, bgcolor: c.bg, color: c.color }}>
      <Box component="span" sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "currentColor" }} />{label}
    </Box>
  );
}
function Label({ children, sx }: { children: React.ReactNode; sx?: object }) {
  return <Typography sx={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: tokens.text3, ...sx }}>{children}</Typography>;
}
function Card({ children, sx }: { children: React.ReactNode; sx?: object }) {
  return <Box sx={{ bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius.card}px`, p: 2.75, ...sx }}>{children}</Box>;
}

function BudgetFigure({ job }: { job: JobPost }) {
  return (
    <Box>
      <Label sx={{ mb: 0.5 }}>Project budget · USD</Label>
      <Typography sx={{ fontFamily: tokens.mono, fontSize: 30, fontWeight: 600, letterSpacing: "-0.025em", lineHeight: 1, color: tokens.successText, whiteSpace: "nowrap" }}>
        {money(job.budget_min)}<Box component="span" sx={{ color: tokens.text3, fontWeight: 500 }}> – </Box>{money(job.budget_max)}
      </Typography>
      <Typography sx={{ fontSize: 11.5, fontWeight: 500, color: tokens.text2, mt: 0.5 }}>Fixed-price · paid via escrow</Typography>
    </Box>
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
      <Box sx={{ minHeight: "100vh", bgcolor: tokens.canvas }}>
        <Container sx={{ py: 4, maxWidth: "1180px !important" }}>
          <Skeleton variant="text" width={140} height={24} sx={{ mb: 2 }} />
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0,1fr) 340px" }, gap: 3 }}>
            <Skeleton variant="rounded" height={520} sx={{ borderRadius: `${tokens.radius.card}px` }} />
            <Skeleton variant="rounded" height={320} sx={{ borderRadius: `${tokens.radius.card}px` }} />
          </Box>
        </Container>
      </Box>
    );
  }
  if (error || !job) {
    return (
      <Container sx={{ py: 6 }}>
        <Alert severity="error">{error ?? "Job not found."}</Alert>
        <Button onClick={() => router.push("/jobs")} sx={{ mt: 2, textTransform: "none" }}>Back to Job Board</Button>
      </Container>
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
    <Card sx={{ p: { xs: 2.75, md: 4 } }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, minWidth: 0 }}>
          <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap" }}>
            <Chip tone={jobCfg.tone} label={jobCfg.label} size="lg" />
            <Box component="span" sx={{ display: "inline-flex", alignItems: "center", height: 34, px: 1.75, borderRadius: "999px", fontSize: 13, fontWeight: 600, bgcolor: "rgba(0,0,0,0.05)", color: tokens.text2 }}>{job.category?.category_name ?? "Uncategorized"}</Box>
          </Box>
          <Typography sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.15 }}>{job.title}</Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: tokens.text2 }}>Posted {fmtDate(job.created_at)} · {timeAgo(job.created_at)}</Typography>
        </Box>
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1, flex: "none" }}>
          <Button onClick={() => setSaved(s => !s)} startIcon={saved ? <BookmarkFilled sx={{ fontSize: 17 }} /> : <BookmarkBorderOutlined sx={{ fontSize: 17 }} />}
            sx={{ height: 40, px: 2, borderRadius: "999px", border: `1px solid ${tokens.borderStrong}`, bgcolor: tokens.surface, color: saved ? tokens.accent : tokens.text2, textTransform: "none", fontSize: 13.5, fontWeight: 500, "&:hover": { borderColor: tokens.text3, bgcolor: tokens.surface2 } }}>{saved ? "Saved" : "Save"}</Button>
          <Button aria-label="Share" sx={{ minWidth: 40, width: 40, height: 40, borderRadius: "999px", border: `1px solid ${tokens.borderStrong}`, bgcolor: tokens.surface, color: tokens.text2, "&:hover": { borderColor: tokens.text3, bgcolor: tokens.surface2 } }}><IosShareOutlined sx={{ fontSize: 17 }} /></Button>
        </Box>
      </Box>

      {/* mobile budget band */}
      <Box sx={{ display: { xs: "block", md: "none" }, mt: 2.5, py: 2, borderTop: `1px solid ${tokens.border}`, borderBottom: `1px solid ${tokens.border}` }}>
        <BudgetFigure job={job} />
      </Box>

      <Box sx={{ height: "1px", bgcolor: tokens.border, my: { xs: 2.5, md: 3 } }} />

      <Label sx={{ mb: 1.25 }}>Description</Label>
      <RichTextDisplay value={job.description} />

      {job.skills?.length > 0 && (
        <Box sx={{ mt: 3.25 }}>
          <Label sx={{ mb: 1.5 }}>Skills &amp; expertise</Label>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {job.skills.map(s => <Box key={s.id} component="span" sx={{ display: "inline-flex", alignItems: "center", height: 30, px: 1.625, borderRadius: "999px", fontSize: 12.5, fontWeight: 500, bgcolor: "rgba(0,0,0,0.05)", color: tokens.text2 }}>{s.expertise_name}</Box>)}
          </Box>
        </Box>
      )}

      {(job.media?.length ?? 0) > 0 && (
        <Box sx={{ mt: 3.25 }}>
          <Label sx={{ mb: 1.5 }}>Attachments · {job.media.length}</Label>
          {images.length > 0 && (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2,1fr)", sm: "repeat(4,1fr)" }, gap: 1.25, mb: pdfs.length ? 1.5 : 0 }}>
              {images.map(m => (
                <Box key={m.id} component="a" href={m.file_url} target="_blank" rel="noopener noreferrer" sx={{ aspectRatio: "4/3", borderRadius: `${tokens.radius.tile}px`, border: `1px solid ${tokens.border}`, overflow: "hidden", display: "block", "&:hover": { borderColor: tokens.borderStrong } }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.file_url} alt={m.file_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </Box>
              ))}
            </Box>
          )}
          {pdfs.length > 0 && (
            <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap" }}>
              {pdfs.map(m => (
                <Box key={m.id} component="a" href={m.file_url} target="_blank" rel="noopener noreferrer" sx={{ display: "flex", alignItems: "center", gap: 1.375, p: "10px 14px 10px 11px", borderRadius: `${tokens.radius.tile}px`, border: `1px solid ${tokens.border}`, textDecoration: "none", maxWidth: 260, "&:hover": { bgcolor: tokens.surface2, borderColor: tokens.borderStrong } }}>
                  <Box sx={{ width: 38, height: 38, borderRadius: "9px", bgcolor: tokens.errorTint, color: tokens.errorText, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><InsertDriveFileOutlined sx={{ fontSize: 19 }} /></Box>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: tokens.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.file_name}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Card>
  );

  /* ── apply card ── */
  const applyCard = (
    <Card>
      <BudgetFigure job={job} />
      <Box sx={{ height: "1px", bgcolor: tokens.border, my: 2.25 }} />
      {applyState === "applied" && myProposal ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
          <Box sx={{ p: 2, bgcolor: tokens.surface2, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius.cardSm}px` }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Label>Your proposal</Label>
              <Chip tone={PROP_TONE[myProposal.status].tone} label={PROP_TONE[myProposal.status].label} />
            </Box>
            <Box sx={{ display: "flex" }}>
              <Box sx={{ flex: 1 }}><Label sx={{ fontSize: 10 }}>Your price</Label><Typography sx={{ fontFamily: tokens.mono, fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>{money(myProposal.price)}</Typography></Box>
              <Box sx={{ width: "1px", bgcolor: tokens.border, mx: 2 }} />
              <Box sx={{ flex: 1 }}><Label sx={{ fontSize: 10 }}>Delivery</Label><Typography sx={{ fontSize: 16, fontWeight: 600 }}>{myProposal.timeline_days} days</Typography></Box>
            </Box>
          </Box>
          {myProposal.status === "pending" && (
            <>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button fullWidth onClick={() => setModal({ open: true, edit: true })} startIcon={<EditOutlined sx={{ fontSize: 16 }} />} sx={{ height: 44, borderRadius: "999px", bgcolor: "rgba(0,0,0,0.05)", color: "#000", textTransform: "none", fontSize: 14, "&:hover": { bgcolor: "rgba(0,0,0,0.1)" } }}>Edit</Button>
                <Button fullWidth onClick={handleWithdraw} disabled={withdrawing} sx={{ height: 44, borderRadius: "999px", color: tokens.errorText, textTransform: "none", fontSize: 14, "&:hover": { bgcolor: tokens.errorTint } }}>{withdrawing ? <CircularProgress size={16} /> : "Withdraw"}</Button>
              </Box>
              <Typography sx={{ fontSize: 12, lineHeight: 1.45, textAlign: "center", color: tokens.text2 }}>The client is reviewing proposals. You can edit or withdraw while it&rsquo;s still pending.</Typography>
            </>
          )}
        </Box>
      ) : applyState === "closed" ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 1.5 }}>
          <Box sx={{ width: 46, height: 46, borderRadius: "50%", bgcolor: "rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}><LockOutlined sx={{ fontSize: 22, color: tokens.text3 }} /></Box>
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 600 }}>No longer accepting proposals</Typography>
            <Typography sx={{ fontSize: 12.5, lineHeight: 1.5, color: tokens.text2, mt: 0.5 }}>This job has reached its proposal limit or is no longer open. Browse similar open jobs.</Typography>
          </Box>
          <Button fullWidth onClick={() => router.push("/jobs")} startIcon={<ChevronLeftOutlined sx={{ fontSize: 16 }} />} sx={{ mt: 0.5, height: 44, borderRadius: "999px", bgcolor: "rgba(0,0,0,0.05)", color: "#000", textTransform: "none", fontSize: 14, "&:hover": { bgcolor: "rgba(0,0,0,0.1)" } }}>Back to Job Board</Button>
        </Box>
      ) : applyState === "logged_out" ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {!user ? (
            <>
              <Button fullWidth onClick={() => router.push("/auth/sign-in")} sx={{ height: 52, borderRadius: "999px", bgcolor: "#000", color: "#fff", textTransform: "none", fontSize: 16, fontWeight: 500, "&:hover": { bgcolor: "rgba(0,0,0,0.8)" } }}>Log in to apply</Button>
              <Button fullWidth onClick={() => router.push("/auth/sign-up")} sx={{ height: 44, borderRadius: "999px", bgcolor: "rgba(0,0,0,0.05)", color: "#000", textTransform: "none", fontSize: 14, "&:hover": { bgcolor: "rgba(0,0,0,0.1)" } }}>Create an account</Button>
            </>
          ) : (
            <Button fullWidth onClick={() => router.push("/dashboard")} sx={{ height: 52, borderRadius: "999px", bgcolor: "#000", color: "#fff", textTransform: "none", fontSize: 16, fontWeight: 500, "&:hover": { bgcolor: "rgba(0,0,0,0.8)" } }}>Become a freelancer to apply</Button>
          )}
          <Typography sx={{ fontSize: 12, lineHeight: 1.45, textAlign: "center", color: tokens.text2 }}>Joining KickAir is free. Set up a freelancer profile to submit proposals.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Button fullWidth onClick={() => setModal({ open: true, edit: false })} sx={{ height: 52, borderRadius: "999px", bgcolor: "#000", color: "#fff", textTransform: "none", fontSize: 16, fontWeight: 500, "&:hover": { bgcolor: "rgba(0,0,0,0.8)" } }}>Submit a proposal</Button>
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1, color: tokens.text3 }}>
            <BoltOutlined sx={{ fontSize: 14 }} /><Typography sx={{ fontSize: 12, color: tokens.text2 }}>Free to apply · you set your own price</Typography>
          </Box>
        </Box>
      )}
    </Card>
  );

  /* ── activity card ── */
  const used = job.proposal_count, totalSlots = job.max_proposals;
  const pct = Math.min(100, Math.round((used / Math.max(1, totalSlots)) * 100));
  const proposalRange = used === 0 ? "No proposals yet" : used < 5 ? "Less than 5" : used < 10 ? "5 to 10" : used < 20 ? "10 to 20" : "20+";
  const activityCard = (
    <Card>
      <Typography sx={{ fontSize: 15, fontWeight: 600, mb: 2 }}>Activity on this job</Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.625 }}>
        <Row label="Proposals">{proposalRange}</Row>
        <Box sx={{ height: "1px", bgcolor: tokens.border }} />
        <Row label="Date posted">{fmtDate(job.created_at)}</Row>
        {job.deadline && <><Box sx={{ height: "1px", bgcolor: tokens.border }} /><Row label="Deadline" urgent={dl !== null && dl <= 3}>{fmtDate(job.deadline)}{dl !== null ? ` · ${dl}d` : ""}</Row></>}
      </Box>
      <Box sx={{ mt: 2.25 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Label sx={{ fontSize: 10 }}>Proposal slots</Label>
          <Typography sx={{ fontFamily: tokens.mono, fontSize: 12, fontWeight: 600, color: tokens.text2 }}>{used} / {totalSlots} used</Typography>
        </Box>
        <Box sx={{ height: 6, borderRadius: "999px", bgcolor: "rgba(0,0,0,0.07)", overflow: "hidden" }}><Box sx={{ width: `${pct}%`, height: "100%", bgcolor: tokens.text }} /></Box>
      </Box>
    </Card>
  );

  /* ── client card ── */
  const c = job.client_profile;
  const clientCard = c ? (
    <Card>
      <Typography sx={{ fontSize: 15, fontWeight: 600, mb: 2 }}>About the client</Typography>
      <Box sx={{ display: "flex", gap: 1.625, mb: 2 }}>
        <Avatar src={c.user?.avatar_url ?? undefined} alt={c.user?.name} sx={{ width: 52, height: 52 }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 15.5, fontWeight: 600, letterSpacing: "-0.01em" }}>{c.user?.name ?? "Client"}</Typography>
          {c.company_name && <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, fontSize: 13, color: tokens.text2 }}><BusinessOutlined sx={{ fontSize: 14, color: tokens.text3 }} />{c.company_name}</Box>}
        </Box>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.375, mb: 2 }}>
        {c.location && <Box sx={{ display: "flex", alignItems: "center", gap: 1.125, fontSize: 13.5, color: tokens.text2 }}><LocationOnOutlined sx={{ fontSize: 16, color: tokens.text3 }} />{c.location}</Box>}
        {c.user?.created_at && <Box sx={{ display: "flex", alignItems: "center", gap: 1.125, fontSize: 13.5, color: tokens.text2 }}><MoveToInboxOutlined sx={{ fontSize: 16, color: tokens.text3 }} />Member since {new Date(c.user.created_at).getFullYear()}</Box>}
      </Box>
      <Box sx={{ height: "1px", bgcolor: tokens.border, mb: 1.75 }} />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.375 }}>
        <TrustRow ok={!!c.user?.is_verified_phone}>Phone verified</TrustRow>
        <TrustRow ok={!!c.user?.is_verified_id}>ID verified</TrustRow>
      </Box>
    </Card>
  ) : null;

  const sidebar = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, md: 2.5 } }}>
      <Box sx={{ display: { xs: "none", md: "block" } }}>{applyCard}</Box>
      {activityCard}
      {clientCard}
      {/* mobile: show the applied summary inline (the new/closed CTA lives in the sticky bar) */}
      {applyState === "applied" && <Box sx={{ display: { xs: "block", md: "none" } }}>{applyCard}</Box>}
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: tokens.canvas }}>
      <Container sx={{ py: { xs: 2.5, md: 4 }, pb: { xs: 12, md: 4 }, maxWidth: "1180px !important" }}>
        <Button onClick={() => router.push("/jobs")} startIcon={<ChevronLeftOutlined sx={{ fontSize: 17 }} />}
          sx={{ p: "2px 4px", mb: 2.25, color: tokens.text2, textTransform: "none", fontSize: 14, fontWeight: 500, "&:hover": { color: "#000", bgcolor: "transparent" } }}>Back to Job Board</Button>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0,1fr) 340px" }, gap: 3, alignItems: "start" }}>
          {main}
          <Box sx={{ position: { md: "sticky" }, top: { md: 24 } }}>{sidebar}</Box>
        </Box>
      </Container>

      {/* mobile sticky apply bar (hidden when already applied — summary shows inline) */}
      {applyState !== "applied" && (
        <Box sx={{ display: { xs: "flex", md: "none" }, position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 1100, justifyContent: "space-between", alignItems: "center", gap: 1.75, p: "12px 16px", bgcolor: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)", borderTop: `1px solid ${tokens.border}` }}>
          <Box>
            <Typography sx={{ fontFamily: tokens.mono, fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em", color: tokens.successText, whiteSpace: "nowrap" }}>{money(job.budget_min)} – {money(job.budget_max)}</Typography>
            <Label sx={{ fontSize: 9.5 }}>Budget · USD</Label>
          </Box>
          {applyState === "new" ? (
            <Button onClick={() => setModal({ open: true, edit: false })} sx={{ height: 46, px: 2.75, borderRadius: "999px", bgcolor: "#000", color: "#fff", textTransform: "none", fontSize: 15, fontWeight: 500, "&:hover": { bgcolor: "rgba(0,0,0,0.8)" } }}>Submit a proposal</Button>
          ) : applyState === "logged_out" ? (
            <Button onClick={() => router.push(user ? "/dashboard" : "/auth/sign-in")} sx={{ height: 46, px: 2.75, borderRadius: "999px", bgcolor: "#000", color: "#fff", textTransform: "none", fontSize: 15, fontWeight: 500, "&:hover": { bgcolor: "rgba(0,0,0,0.8)" } }}>{user ? "Become a freelancer" : "Log in to apply"}</Button>
          ) : (
            <Button disabled sx={{ height: 46, px: 2.75, borderRadius: "999px", bgcolor: "rgba(0,0,0,0.05)", color: tokens.text2, textTransform: "none", fontSize: 15 }}>Closed</Button>
          )}
        </Box>
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
    </Box>
  );
}

function Row({ label, children, urgent }: { label: string; children: React.ReactNode; urgent?: boolean }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5 }}>
      <Typography sx={{ fontSize: 13, fontWeight: 500, color: tokens.text2, whiteSpace: "nowrap" }}>{label}</Typography>
      <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: urgent ? tokens.errorText : tokens.text, whiteSpace: "nowrap" }}>{children}</Typography>
    </Box>
  );
}
function TrustRow({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.125 }}>
      {ok ? <VerifiedOutlined sx={{ fontSize: 18, color: tokens.success }} /> : <RadioButtonUncheckedOutlined sx={{ fontSize: 18, color: tokens.borderStrong }} />}
      <Typography sx={{ fontSize: 13.5, fontWeight: 500, color: ok ? tokens.text : tokens.text3 }}>{children}</Typography>
    </Box>
  );
}
