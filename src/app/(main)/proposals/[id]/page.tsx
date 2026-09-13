"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Pencil,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { css, cx } from "styled-system/css";
import { Alert, Avatar, Spinner } from "@/components/ds";
import Link from "next/link";
import { useAuth } from "@/components/context/AuthContext";
import { api } from "@/lib/api";
import { Proposal } from "@/types/job";
import { Order } from "@/types/order";
import RichTextDisplay from "@/components/ui/RichTextDisplay";
import ProposalForm from "@/components/jobs/ProposalForm";

function formatCurrency(value: string) {
  const num = parseFloat(value);
  return isNaN(num) ? value : num.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

const STATUS_CLASS: Record<string, string> = {
  pending: css({ bg: "rgba(234,88,12,0.1)", color: "pendingText" }),
  accepted: css({ bg: "rgba(22,163,74,0.1)", color: "successText" }),
  rejected: css({ bg: "rgba(239,68,68,0.1)", color: "errorText" }),
  withdrawn: css({ bg: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.5)" }),
};
const statusClass = (status: string) => STATUS_CLASS[status] ?? STATUS_CLASS.withdrawn;

/* ── static styles ── */
const pageRoot = css({ minH: "100vh", bg: "canvas" });
const backBar = css({ bg: "surface", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "hairline", py: "12px" });
const container = css({
  w: "100%", boxSizing: "border-box", maxW: "1200px", mx: "auto",
  px: { base: "16px", sm: "24px" },
});
const containerPad = css({ py: "32px" });
const containerPadLg = css({ py: "48px" });
const centreLoading = css({ display: "flex", justifyContent: "center", alignItems: "center", minH: "60vh" });
const backBtn = css({
  display: "inline-flex", alignItems: "center", gap: "8px",
  m: 0, p: "6px 8px", border: "none", bg: "transparent",
  color: "ink2", fontFamily: "inherit", fontSize: "13px", fontWeight: 500, lineHeight: 1.75,
  cursor: "pointer", transition: "color .25s, background-color .25s",
  _hover: { bg: "rgba(0,0,0,0.04)" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
  "& svg": { flexShrink: 0 },
});
const layout = css({ display: "grid", gridTemplateColumns: { base: "1fr", xl: "8fr 4fr" }, gap: "32px", alignItems: "start" });
const stack24 = css({ display: "flex", flexDirection: "column", gap: "24px" });
const stack16 = css({ display: "flex", flexDirection: "column", gap: "16px" });
const sidebarSticky = css({ position: { xl: "sticky" }, top: { xl: "24px" } });
const paper = css({
  bg: "surface", borderRadius: "cardSm",
  borderWidth: "1px", borderStyle: "solid", borderColor: "hairline",
  p: "32px",
});
const paperSm = css({
  bg: "surface", borderRadius: "cardSm",
  borderWidth: "1px", borderStyle: "solid", borderColor: "hairline",
  p: "24px",
});
const headRow = css({ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", mb: "24px" });
const eyebrow = css({ lineHeight: 1.5, fontSize: "13px", color: "ink2" });
const jobLink = css({ textDecoration: "none", display: "inline-block" });
const jobTitle = css({ lineHeight: 1.5,
  fontSize: "20px", fontWeight: 700, color: "ink", transition: "color 0.15s",
  _hover: { color: "accent" },
});
const linkIcon = css({ ml: "6px", verticalAlign: "middle", opacity: 0.5, display: "inline" });
const statusChip = css({ display: "inline-flex", alignItems: "center", flexShrink: 0, h: "28px", px: "12px", borderRadius: "pill", fontSize: "13px" });
const statsGrid = css({ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", mb: "24px" });
const statHead = css({ display: "flex", alignItems: "center", gap: "4px", color: "ink2", mb: "4px" });
const statLabel = css({ lineHeight: 1.5, fontSize: "11px", color: "ink2", textTransform: "uppercase", letterSpacing: "0.5px" });
const statValue = css({ lineHeight: 1.5, fontSize: "22px", fontWeight: 700 });
const statValueGreen = css({ color: "successText" });
const submittedRow = css({ lineHeight: 1.5, fontSize: "12px", color: "ink2" });
const updatedChip = css({ display: "inline-flex", alignItems: "center", h: "20px", px: "8px", ml: "8px", borderRadius: "pill", fontSize: "10px", bg: "rgba(37,99,235,0.1)", color: "#1e40af" });
const divider = css({ h: "1px", bg: "rgba(0,0,0,0.12)", mb: "24px" });
const coverLabel = css({ lineHeight: 1.5, fontSize: "13px", fontWeight: 600, color: "ink2" });
const alertRounded = css({ borderRadius: "8px" });
const alertActionBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  boxSizing: "border-box", m: 0, p: "4px 5px", minW: "64px", border: "none", borderRadius: "4px",
  bg: "transparent", color: "inherit", fontFamily: "inherit", fontSize: "12px", fontWeight: 500, lineHeight: 1.75,
  cursor: "pointer", whiteSpace: "nowrap", transition: "background-color .25s",
  _hover: { bg: "rgba(0,0,0,0.06)" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
});
const actionRow = css({ display: "flex", gap: "16px" });
const actionBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px",
  boxSizing: "border-box", m: 0, flex: 1, minW: "64px", borderRadius: "40px",
  fontFamily: "inherit", fontSize: "14px", fontWeight: 500, lineHeight: 1.75,
  cursor: "pointer", transition: "background-color .25s, border-color .25s, color .25s",
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
  _disabled: { pointerEvents: "none" },
  "& svg": { flexShrink: 0 },
});
const approveBtn = css({
  p: "6px 16px", border: "none", bg: "successText", color: "white",
  boxShadow: "0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)",
  _hover: { bg: "#166534" },
  _disabled: { bg: "rgba(0, 0, 0, 0.12)", color: "rgba(0, 0, 0, 0.26)", boxShadow: "none" },
});
const outlineBtn = css({
  p: "5px 15px", borderWidth: "1px", borderStyle: "solid", bg: "transparent",
  _disabled: { color: "rgba(0, 0, 0, 0.26)", borderColor: "rgba(0, 0, 0, 0.12)" },
});
const dangerOutline = css({ borderColor: "rgba(239,68,68,0.3)", color: "errorText", _hover: { bg: "rgba(239,68,68,0.04)" } });
const neutralOutline = css({ borderColor: "rgba(0,0,0,0.2)", color: "ink", _hover: { borderColor: "rgba(0,0,0,0.4)" } });
const sideLabel = css({ lineHeight: 1.5, fontSize: "12px", color: "ink2", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" });
const sideRow = css({ display: "flex", gap: "16px", alignItems: "center" });
const sideName = css({ lineHeight: 1.5, fontSize: "15px", fontWeight: 600 });
const budgetValue = css({ lineHeight: 1.5, fontSize: "16px", fontWeight: 600, color: "successText" });
const budgetMeta = css({ lineHeight: 1.5, fontSize: "12px", color: "ink2" });

export default function ProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const proposalId = Number(params.id);

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!proposalId) return;
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.getProposal(proposalId);
        setProposal(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load proposal.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [proposalId]);

  // Guests go to sign-in — but only once auth has resolved (`user` is null while it loads).
  useEffect(() => {
    if (!authLoading && !user) router.replace("/auth/sign-in");
  }, [authLoading, user, router]);

  const isClient = !!user?.is_client;
  const isFreelancer = !!user?.is_freelancer;

  // Determine who owns what
  const isProposalOwner = isFreelancer && proposal?.freelancer_profile_id === user?.freelancer_profile?.id;
  const isJobOwner = isClient && proposal?.job_post?.client_profile?.id === user?.client_profile?.id;

  const handleApprove = async () => {
    if (!proposal) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const order = await api.approveProposal(proposal.id);
      setCreatedOrder(order);
      setProposal(prev => prev ? { ...prev, status: "accepted" } : prev);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to approve proposal.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!proposal) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const updated = await api.rejectProposal(proposal.id);
      setProposal(updated);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to reject proposal.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!proposal) return;
    if (!confirm("Withdraw your proposal? This cannot be undone.")) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const updated = await api.withdrawProposal(proposal.id);
      setProposal(updated);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to withdraw proposal.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleProposalSaved = (updated: Proposal) => {
    setProposal(updated);
    setEditOpen(false);
  };

  if (authLoading || loading) {
    return (
      <div className={centreLoading}>
        <Spinner size={40} className={css({ color: "#1976d2" })} />
      </div>
    );
  }

  if (!user) return null;

  if (error || !proposal) {
    return (
      <div className={cx(container, containerPadLg)}>
        <Alert tone="error">{error ?? "Proposal not found."}</Alert>
      </div>
    );
  }

  return (
    <div className={pageRoot}>
      {/* Back bar */}
      <div className={backBar}>
        <div className={container}>
          <button type="button" onClick={() => router.back()} className={backBtn}>
            <ChevronLeft size={20} />
            Back
          </button>
        </div>
      </div>

      <div className={cx(container, containerPad)}>
        <div className={layout}>
          {/* Main */}
          <div className={stack24}>
            <div className={paper}>
              {/* Header */}
              <div className={headRow}>
                <div>
                  <p className={eyebrow}>Proposal for</p>
                  <Link href={`/jobs/${proposal.job_post_id}`} className={jobLink}>
                    <p className={jobTitle}>
                      {proposal.job_post?.title ?? "Job Post"}
                      <ExternalLink size={15} className={linkIcon} />
                    </p>
                  </Link>
                </div>
                <span className={cx(statusChip, statusClass(proposal.status))}>
                  {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                </span>
              </div>

              {/* Stats */}
              <div className={statsGrid}>
                <div>
                  <div className={statHead}>
                    <DollarSign size={15} />
                    <span className={statLabel}>Proposed Price</span>
                  </div>
                  <p className={cx(statValue, statValueGreen)}>
                    {formatCurrency(proposal.price)}
                  </p>
                </div>
                <div>
                  <div className={statHead}>
                    <Clock size={15} />
                    <span className={statLabel}>Delivery Time</span>
                  </div>
                  <p className={statValue}>
                    {proposal.timeline_days} day{proposal.timeline_days !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <p className={submittedRow}>
                Submitted {formatDate(proposal.created_at)}
                {proposal.is_updated && (
                  <span className={updatedChip}>Updated</span>
                )}
              </p>

              <div className={divider} />

              {/* Cover Letter */}
              <p className={coverLabel}>
                COVER LETTER
              </p>
              <RichTextDisplay value={proposal.cover_letter} />
            </div>

            {/* Order success banner */}
            {createdOrder && (
              <Alert
                tone="success"
                className={alertRounded}
                action={
                  <button type="button" onClick={() => router.push(`/dashboard/client`)} className={alertActionBtn}>
                    View Orders
                  </button>
                }>
                Proposal approved! Order #{createdOrder.id} has been created and the escrow is set up.
              </Alert>
            )}

            {actionError && (
              <Alert tone="error" className={alertRounded} onClose={() => setActionError(null)}>
                {actionError}
              </Alert>
            )}

            {/* Edit form (freelancer) */}
            {isProposalOwner && proposal.status === "pending" && editOpen && (
              <ProposalForm
                jobPostId={proposal.job_post_id}
                existing={proposal}
                onSaved={handleProposalSaved}
                onCancel={() => setEditOpen(false)}
              />
            )}

            {/* Client actions */}
            {isJobOwner && proposal.status === "pending" && !createdOrder && (
              <div className={actionRow}>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleApprove}
                  className={cx(actionBtn, approveBtn)}>
                  {actionLoading ? <Spinner size={18} className={css({ color: "white" })} /> : (<><CheckCircle2 size={20} />Approve Proposal</>)}
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleReject}
                  className={cx(actionBtn, outlineBtn, dangerOutline)}>
                  <XCircle size={20} />
                  Reject
                </button>
              </div>
            )}

            {/* Freelancer actions */}
            {isProposalOwner && proposal.status === "pending" && !editOpen && (
              <div className={actionRow}>
                <button
                  type="button"
                  onClick={() => setEditOpen(true)}
                  className={cx(actionBtn, outlineBtn, neutralOutline)}>
                  <Pencil size={20} />
                  Edit Proposal
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleWithdraw}
                  className={cx(actionBtn, outlineBtn, dangerOutline)}>
                  {actionLoading ? <Spinner size={18} /> : (<><LogOut size={20} />Withdraw</>)}
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className={cx(stack16, sidebarSticky)}>
            {/* Freelancer card */}
            {isJobOwner && proposal.freelancer_profile && (
              <div className={paperSm}>
                <p className={sideLabel}>
                  Freelancer
                </p>
                <div className={sideRow}>
                  <Avatar
                    src={proposal.freelancer_profile.user.avatar_url ?? undefined}
                    name={proposal.freelancer_profile.user.name}
                    px={48}
                  />
                  <p className={sideName}>
                    {proposal.freelancer_profile.user.name}
                  </p>
                </div>
              </div>
            )}

            {/* Job summary card */}
            {proposal.job_post && (
              <div className={paperSm}>
                <p className={sideLabel}>
                  Job Budget
                </p>
                <p className={budgetValue}>
                  {formatCurrency(proposal.job_post.budget_min)} – {formatCurrency(proposal.job_post.budget_max)}
                </p>
                <p className={budgetMeta}>
                  Deadline: {formatDate(proposal.job_post.deadline)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
