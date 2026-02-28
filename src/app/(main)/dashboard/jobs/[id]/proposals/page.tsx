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
  Card,
  CardContent,
  Avatar,
  Pagination,
} from "@mui/material";
import { ChevronLeftOutlined, NewReleasesOutlined, CheckCircleOutlineOutlined, CancelOutlined } from "@mui/icons-material";
import { api } from "@/lib/api";
import { JobPost, Proposal, ProposalStatus } from "@/types/job";

type Filter = "all" | ProposalStatus;

function statusColor(status: ProposalStatus) {
  switch (status) {
    case "pending":
      return { bgcolor: "rgba(234,88,12,0.1)", color: "#b45309" };
    case "accepted":
      return { bgcolor: "rgba(22,163,74,0.1)", color: "#15803d" };
    case "rejected":
      return { bgcolor: "rgba(239,68,68,0.1)", color: "#b91c1c" };
    case "withdrawn":
      return { bgcolor: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.5)" };
    default:
      return { bgcolor: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.5)" };
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatCurrency(value: string) {
  const num = parseFloat(value);
  return isNaN(num) ? value : num.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

export default function ProposalsInboxPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = Number(params.id);

  const [job, setJob] = useState<JobPost | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
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
        setError(err instanceof Error ? err.message : "Failed to load proposals.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [jobId, page]);

  const handleApprove = async (proposal: Proposal) => {
    setActionLoading(proposal.id);
    setActionError(null);
    try {
      await api.approveProposal(proposal.id);
      // Refresh list
      const resp = await api.getJobProposals(jobId, page);
      setProposals(resp.data);
      const jobData = await api.getJobPost(jobId);
      setJob(jobData);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to approve proposal.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (proposal: Proposal) => {
    setActionLoading(proposal.id);
    setActionError(null);
    try {
      const updated = await api.rejectProposal(proposal.id);
      setProposals(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to reject proposal.");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = activeFilter === "all" ? proposals : proposals.filter(p => p.status === activeFilter);

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
        {/* Header */}
        <Box mb={3}>
          {loading ? (
            <CircularProgress size={20} />
          ) : (
            job && (
              <>
                <Stack direction='row' spacing={2} alignItems='center' mb={0.5}>
                  <Typography sx={{ fontSize: 24, fontWeight: 700 }}>{job.title}</Typography>
                  <Chip
                    label={job.status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                    size='small'
                    sx={{ fontSize: 12, height: 24 }}
                  />
                </Stack>
                <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                  {job.proposal_count} proposal{job.proposal_count !== 1 ? "s" : ""} received
                </Typography>
              </>
            )
          )}
        </Box>

        {/* Filters */}
        <Stack direction='row' spacing={1} mb={3} flexWrap='wrap'>
          {FILTERS.map(f => (
            <Button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              sx={{
                fontSize: 12,
                textTransform: "none",
                borderRadius: 10,
                px: 2,
                height: 32,
                ...(activeFilter === f.value
                  ? { bgcolor: "black", color: "white", "&:hover": { bgcolor: "black" } }
                  : { bgcolor: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.6)", "&:hover": { bgcolor: "rgba(0,0,0,0.1)" } }),
              }}>
              {f.label}
            </Button>
          ))}
        </Stack>

        {actionError && (
          <Alert severity='error' sx={{ mb: 2, borderRadius: 2 }} onClose={() => setActionError(null)}>
            {actionError}
          </Alert>
        )}

        {error && (
          <Alert severity='error' sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display='flex' justifyContent='center' py={8}>
            <CircularProgress />
          </Box>
        ) : filtered.length === 0 ? (
          <Box textAlign='center' py={8}>
            <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
              No {activeFilter === "all" ? "" : activeFilter} proposals yet
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {filtered.map(proposal => (
              <Card
                elevation={0}
                key={proposal.id}
                sx={{
                  borderRadius: 3,
                  border: "1px solid rgba(0,0,0,0.08)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  "&:hover": { borderColor: "rgba(0,0,0,0.2)" },
                }}
                onClick={() => router.push(`/proposals/${proposal.id}`)}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction='row' justifyContent='space-between' alignItems='center'>
                    {/* Freelancer info */}
                    <Stack direction='row' spacing={2} alignItems='center' flex={1}>
                      <Avatar
                        src={proposal.freelancer_profile?.user?.avatar_url ?? undefined}
                        alt={proposal.freelancer_profile?.user?.name}
                        sx={{ width: 44, height: 44 }}
                      />
                      <Box flex={1} minWidth={0}>
                        <Stack direction='row' spacing={1} alignItems='center'>
                          <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                            {proposal.freelancer_profile?.user?.name ?? "Freelancer"}
                          </Typography>
                          <Chip
                            label={proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                            size='small'
                            sx={{ fontSize: 11, height: 22, ...statusColor(proposal.status) }}
                          />
                          {proposal.is_updated && (
                            <Chip
                              icon={<NewReleasesOutlined sx={{ fontSize: 12 }} />}
                              label='Updated'
                              size='small'
                              sx={{ fontSize: 10, height: 20, bgcolor: "rgba(37,99,235,0.1)", color: "#1e40af" }}
                            />
                          )}
                        </Stack>
                        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                          Submitted {formatDate(proposal.created_at)} · {proposal.timeline_days} days delivery
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Price/}

                   

                    {/* Actions */}
                    {proposal.status === "pending" && (
                      <Stack direction='row' spacing={1} onClick={e => e.stopPropagation()}>
                        <Button
                          size='small'
                          disabled={actionLoading === proposal.id}
                          onClick={() => handleApprove(proposal)}
                          startIcon={<CheckCircleOutlineOutlined sx={{ fontSize: 15 }} />}
                          sx={{
                            fontSize: 12,
                            textTransform: "none",
                            borderRadius: 8,
                            bgcolor: "rgba(22,163,74,0.1)",
                            color: "#15803d",
                            "&:hover": { bgcolor: "rgba(22,163,74,0.2)" },
                          }}>
                          {actionLoading === proposal.id ? <CircularProgress size={12} /> : "Accept"}
                        </Button>
                        <Button
                          size='small'
                          disabled={actionLoading === proposal.id}
                          onClick={() => handleReject(proposal)}
                          startIcon={<CancelOutlined sx={{ fontSize: 15 }} />}
                          sx={{
                            fontSize: 12,
                            textTransform: "none",
                            borderRadius: 8,
                            bgcolor: "rgba(239,68,68,0.08)",
                            color: "#b91c1c",
                            "&:hover": { bgcolor: "rgba(239,68,68,0.15)" },
                          }}>
                          Reject
                        </Button>
                      </Stack>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}

        {lastPage > 1 && !loading && (
          <Box display='flex' justifyContent='center' mt={4}>
            <Pagination
              count={lastPage}
              page={page}
              onChange={(_, p) => {
                setPage(p);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              size='small'
              shape='rounded'
            />
          </Box>
        )}
      </Container>
    </Box>
  );
}
