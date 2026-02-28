"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Stack,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Avatar,
  Grid,
  Divider,
} from "@mui/material";
import {
  ChevronLeftOutlined,
  AttachMoneyOutlined,
  AccessTimeOutlined,
  CheckCircleOutlineOutlined,
  CancelOutlined,
  EditOutlined,
  ExitToAppOutlined,
  OpenInNewOutlined,
} from "@mui/icons-material";
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

function statusColor(status: string) {
  switch (status) {
    case "pending": return { bgcolor: "rgba(234,88,12,0.1)", color: "#b45309" };
    case "accepted": return { bgcolor: "rgba(22,163,74,0.1)", color: "#15803d" };
    case "rejected": return { bgcolor: "rgba(239,68,68,0.1)", color: "#b91c1c" };
    case "withdrawn": return { bgcolor: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.5)" };
    default: return { bgcolor: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.5)" };
  }
}

export default function ProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
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

  if (!user) {
    if (typeof window !== "undefined") router.replace("/login");
    return null;
  }

  const isClient = !!user.is_client;
  const isFreelancer = !!user.is_freelancer;

  // Determine who owns what
  const isProposalOwner = isFreelancer && proposal?.freelancer_profile_id === user.freelancer_profile?.id;
  const isJobOwner = isClient && proposal?.job_post?.client_profile?.id === user.client_profile?.id;

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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !proposal) {
    return (
      <Container sx={{ py: 6 }}>
        <Alert severity="error">{error ?? "Proposal not found."}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F5F5F7" }}>
      {/* Back bar */}
      <Box sx={{ bgcolor: "white", borderBottom: "1px solid rgba(0,0,0,0.08)", py: 1.5 }}>
        <Container>
          <Button
            startIcon={<ChevronLeftOutlined />}
            onClick={() => router.back()}
            sx={{ fontSize: 13, textTransform: "none", color: "rgba(0,0,0,0.6)" }}>
            Back
          </Button>
        </Container>
      </Box>

      <Container sx={{ py: 4 }}>
        <Grid container spacing={4} alignItems="start">
          {/* Main */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack spacing={3}>
              <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)", p: 4 }}>
                {/* Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
                  <Box>
                    <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 0.5 }}>Proposal for</Typography>
                    <Link href={`/jobs/${proposal.job_post_id}`} passHref style={{ textDecoration: "none" }}>
                      <Typography
                        sx={{
                          fontSize: 20,
                          fontWeight: 700,
                          color: "black",
                          "&:hover": { color: "#0071e3" },
                          transition: "color 0.15s",
                        }}>
                        {proposal.job_post?.title ?? "Job Post"}
                        <OpenInNewOutlined sx={{ fontSize: 15, ml: 0.75, verticalAlign: "middle", opacity: 0.5 }} />
                      </Typography>
                    </Link>
                  </Box>
                  <Chip
                    label={proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                    sx={{ fontSize: 13, height: 28, ...statusColor(proposal.status) }}
                  />
                </Stack>

                {/* Stats */}
                <Grid container spacing={3} mb={3}>
                  <Grid size={{ xs: 6 }}>
                    <Stack spacing={0.5}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <AttachMoneyOutlined sx={{ fontSize: 15, color: "text.secondary" }} />
                        <Typography sx={{ fontSize: 11, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5 }}>
                          Proposed Price
                        </Typography>
                      </Stack>
                      <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#15803d" }}>
                        {formatCurrency(proposal.price)}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Stack spacing={0.5}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <AccessTimeOutlined sx={{ fontSize: 15, color: "text.secondary" }} />
                        <Typography sx={{ fontSize: 11, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5 }}>
                          Delivery Time
                        </Typography>
                      </Stack>
                      <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
                        {proposal.timeline_days} day{proposal.timeline_days !== 1 ? "s" : ""}
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>

                <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 3 }}>
                  Submitted {formatDate(proposal.created_at)}
                  {proposal.is_updated && (
                    <Chip
                      label="Updated"
                      size="small"
                      sx={{ ml: 1, fontSize: 10, height: 20, bgcolor: "rgba(37,99,235,0.1)", color: "#1e40af" }}
                    />
                  )}
                </Typography>

                <Divider sx={{ mb: 3 }} />

                {/* Cover Letter */}
                <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1.5, color: "rgba(0,0,0,0.6)" }}>
                  COVER LETTER
                </Typography>
                <RichTextDisplay value={proposal.cover_letter} />
              </Paper>

              {/* Order success banner */}
              {createdOrder && (
                <Alert
                  severity="success"
                  sx={{ borderRadius: 2 }}
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => router.push(`/dashboard/client`)}
                      sx={{ textTransform: "none", fontSize: 12 }}>
                      View Orders
                    </Button>
                  }>
                  Proposal approved! Order #{createdOrder.id} has been created and the escrow is set up.
                </Alert>
              )}

              {actionError && (
                <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setActionError(null)}>
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
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    disabled={actionLoading}
                    startIcon={<CheckCircleOutlineOutlined />}
                    onClick={handleApprove}
                    sx={{
                      flex: 1,
                      fontSize: 14,
                      textTransform: "none",
                      borderRadius: 10,
                      bgcolor: "#15803d",
                      "&:hover": { bgcolor: "#166534" },
                    }}>
                    {actionLoading ? <CircularProgress size={18} sx={{ color: "white" }} /> : "Approve Proposal"}
                  </Button>
                  <Button
                    variant="outlined"
                    disabled={actionLoading}
                    startIcon={<CancelOutlined />}
                    onClick={handleReject}
                    sx={{
                      flex: 1,
                      fontSize: 14,
                      textTransform: "none",
                      borderRadius: 10,
                      borderColor: "rgba(239,68,68,0.3)",
                      color: "#b91c1c",
                      "&:hover": { bgcolor: "rgba(239,68,68,0.04)" },
                    }}>
                    Reject
                  </Button>
                </Stack>
              )}

              {/* Freelancer actions */}
              {isProposalOwner && proposal.status === "pending" && !editOpen && (
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<EditOutlined />}
                    onClick={() => setEditOpen(true)}
                    sx={{
                      flex: 1,
                      fontSize: 14,
                      textTransform: "none",
                      borderRadius: 10,
                      borderColor: "rgba(0,0,0,0.2)",
                      color: "black",
                    }}>
                    Edit Proposal
                  </Button>
                  <Button
                    variant="outlined"
                    disabled={actionLoading}
                    startIcon={<ExitToAppOutlined />}
                    onClick={handleWithdraw}
                    sx={{
                      flex: 1,
                      fontSize: 14,
                      textTransform: "none",
                      borderRadius: 10,
                      borderColor: "rgba(239,68,68,0.3)",
                      color: "#b91c1c",
                      "&:hover": { bgcolor: "rgba(239,68,68,0.04)" },
                    }}>
                    {actionLoading ? <CircularProgress size={18} /> : "Withdraw"}
                  </Button>
                </Stack>
              )}
            </Stack>
          </Grid>

          {/* Sidebar */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={2} sx={{ position: { lg: "sticky" }, top: { lg: 24 } }}>
              {/* Freelancer card */}
              {isJobOwner && proposal.freelancer_profile && (
                <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)", p: 3 }}>
                  <Typography sx={{ fontSize: 12, color: "text.secondary", fontWeight: 500, mb: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Freelancer
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      src={proposal.freelancer_profile.user.avatar_url ?? undefined}
                      alt={proposal.freelancer_profile.user.name}
                      sx={{ width: 48, height: 48 }}
                    />
                    <Typography sx={{ fontSize: 15, fontWeight: 600 }}>
                      {proposal.freelancer_profile.user.name}
                    </Typography>
                  </Stack>
                </Paper>
              )}

              {/* Job summary card */}
              {proposal.job_post && (
                <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)", p: 3 }}>
                  <Typography sx={{ fontSize: 12, color: "text.secondary", fontWeight: 500, mb: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Job Budget
                  </Typography>
                  <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#15803d" }}>
                    {formatCurrency(proposal.job_post.budget_min)} – {formatCurrency(proposal.job_post.budget_max)}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.5 }}>
                    Deadline: {formatDate(proposal.job_post.deadline)}
                  </Typography>
                </Paper>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
