"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Chip,
  Stack,
  Avatar,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Paper,
  Grid,
  IconButton,
} from "@mui/material";
import {
  ArrowBackOutlined,
  AccessTimeOutlined,
  AttachMoneyOutlined,
  PeopleOutlineOutlined,
  CalendarTodayOutlined,
  InsertDriveFileOutlined,
  EditOutlined,
  ExitToAppOutlined,
  BookmarkBorderOutlined,
  LocationOnOutlined,
  VerifiedOutlined,
} from "@mui/icons-material";
import { api } from "@/lib/api";
import { useAuth } from "@/components/context/AuthContext";
import { JobPost, Proposal } from "@/types/job";
import RichTextDisplay from "@/components/ui/RichTextDisplay";
import ProposalForm from "@/components/jobs/ProposalForm";

function formatCurrency(value: string) {
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return num.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;
  return `${Math.floor(days / 30)} month${Math.floor(days / 30) !== 1 ? "s" : ""} ago`;
}

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: "Expired", urgent: true };
  if (days === 0) return { label: "Due today", urgent: true };
  if (days <= 3) return { label: `${days}d left`, urgent: true };
  return { label: formatDate(dateStr), urgent: false };
}

function proposalRange(count: number) {
  if (count === 0) return "Be the first to apply";
  if (count < 5) return "Less than 5";
  if (count < 10) return "5 to 10";
  if (count < 20) return "10 to 20";
  return "20+";
}

function statusColor(status: string) {
  switch (status) {
    case "open":
      return { bgcolor: "rgba(22,163,74,0.1)", color: "#15803d" };
    case "in_progress":
      return { bgcolor: "rgba(37,99,235,0.1)", color: "#1e40af" };
    case "completed":
      return { bgcolor: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.55)" };
    case "cancelled":
      return { bgcolor: "rgba(239,68,68,0.1)", color: "#b91c1c" };
    default:
      return { bgcolor: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.55)" };
  }
}

const SidebarCard = ({ children, sx = {} }: { children: React.ReactNode; sx?: object }) => (
  <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider", p: 3, ...sx }}>
    {children}
  </Paper>
);

const SidebarLabel = ({ children }: { children: React.ReactNode }) => (
  <Typography
    sx={{ fontSize: 11, fontWeight: 600, color: "text.disabled", textTransform: "uppercase", letterSpacing: 0.8, mb: 1.5 }}>
    {children}
  </Typography>
);

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const jobId = Number(params.id);

  const [job, setJob] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const isFreelancer = !!user?.is_freelancer;
  const hasApplied = !!job?.my_proposal;
  const myProposal = job?.my_proposal ?? null;
  const proposalsClosed = job ? job.proposal_count >= job.max_proposals : false;

  useEffect(() => {
    if (!jobId) return;
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.getJobPost(jobId);
        setJob(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load job.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [jobId]);

  const handleProposalSaved = (proposal: Proposal) => {
    setJob(prev =>
      prev ? { ...prev, my_proposal: proposal, proposal_count: prev.proposal_count + (hasApplied ? 0 : 1) } : prev,
    );
    setApplyOpen(false);
    setEditOpen(false);
  };

  const handleWithdraw = async () => {
    if (!myProposal) return;
    if (!confirm("Withdraw your proposal? This cannot be undone.")) return;
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

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='60vh'>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !job) {
    return (
      <Container sx={{ py: 6 }}>
        <Alert severity='error'>{error ?? "Job not found."}</Alert>
        <Button onClick={() => router.push("/jobs")} sx={{ mt: 2, textTransform: "none" }}>
          Back to Job Board
        </Button>
      </Container>
    );
  }

  const deadline = daysUntil(job.deadline);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f7f7f7" }}>
      {/* Breadcrumb bar */}
      <Box sx={{ bgcolor: "white", borderBottom: "1px solid", borderColor: "divider" }}>
        <Container sx={{ py: 1.25 }}>
          <Button
            startIcon={<ArrowBackOutlined sx={{ fontSize: 16 }} />}
            onClick={() => router.push("/jobs")}
            sx={{
              fontSize: 13,
              textTransform: "none",
              color: "text.secondary",
              minWidth: 0,
              px: 0,
              "&:hover": { bgcolor: "transparent", color: "text.primary" },
            }}>
            Job Board
          </Button>
        </Container>
      </Box>

      <Container sx={{ py: 4 }}>
        <Grid container spacing={3} alignItems='flex-start'>
          {/* ── Main column ── */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
              {/* Header */}
              <Box sx={{ p: 4, pb: 3 }}>
                <Stack direction='row' justifyContent='space-between' alignItems='flex-start' mb={1.5}>
                  <Box flex={1} pr={2}>
                    <Typography sx={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3, mb: 1.25 }}>{job.title}</Typography>
                    <Stack direction='row' alignItems='center' flexWrap='wrap' gap={1}>
                      <Chip
                        label={job.status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                        size='small'
                        sx={{ fontSize: 11, height: 22, fontWeight: 600, ...statusColor(job.status) }}
                      />
                      <Typography sx={{ fontSize: 13, color: "text.disabled" }}>·</Typography>
                      <Typography sx={{ fontSize: 13, color: "text.secondary" }}>{job.category?.category_name}</Typography>
                      <Typography sx={{ fontSize: 13, color: "text.disabled" }}>·</Typography>
                      <Typography sx={{ fontSize: 13, color: "text.secondary" }}>Posted {timeAgo(job.created_at)}</Typography>
                    </Stack>
                  </Box>
                  <IconButton sx={{ color: "text.disabled", mt: -0.5 }}>
                    <BookmarkBorderOutlined sx={{ fontSize: 20 }} />
                  </IconButton>
                </Stack>
              </Box>

              <Divider />

              {/* Description */}
              <Box sx={{ p: 4 }}>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "text.disabled",
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    mb: 2,
                  }}>
                  Job Description
                </Typography>
                <RichTextDisplay value={job.description} />
              </Box>

              {/* Skills */}
              {job.skills.length > 0 && (
                <>
                  <Divider />
                  <Box sx={{ p: 4 }}>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "text.disabled",
                        textTransform: "uppercase",
                        letterSpacing: 0.8,
                        mb: 2,
                      }}>
                      Skills and Expertise
                    </Typography>
                    <Stack direction='row' flexWrap='wrap' gap={1}>
                      {job.skills.map(s => (
                        <Chip
                          key={s.id}
                          label={s.expertise_name}
                          size='small'
                          variant='outlined'
                          sx={{
                            fontSize: 13,
                            height: 28,
                            borderRadius: "14px",
                            borderColor: "rgba(0,0,0,0.18)",
                            color: "text.secondary",
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                </>
              )}

              {/* Attachments */}
              {job.media.length > 0 && (
                <>
                  <Divider />
                  <Box sx={{ p: 4 }}>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "text.disabled",
                        textTransform: "uppercase",
                        letterSpacing: 0.8,
                        mb: 2,
                      }}>
                      Attachments
                    </Typography>
                    <Stack direction='row' flexWrap='wrap' gap={1.5}>
                      {job.media.map(m =>
                        m.file_type === "image" ? (
                          <Box
                            key={m.id}
                            component='a'
                            href={m.file_url}
                            target='_blank'
                            rel='noopener noreferrer'
                            sx={{
                              display: "block",
                              borderRadius: 1.5,
                              overflow: "hidden",
                              border: "1px solid",
                              borderColor: "divider",
                              "&:hover": { opacity: 0.85 },
                            }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={m.file_url}
                              alt={m.file_name}
                              style={{ width: 120, height: 80, objectFit: "cover", display: "block" }}
                            />
                          </Box>
                        ) : (
                          <Box
                            key={m.id}
                            component='a'
                            href={m.file_url}
                            target='_blank'
                            rel='noopener noreferrer'
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              px: 2,
                              py: 1.5,
                              borderRadius: 1.5,
                              border: "1px solid",
                              borderColor: "divider",
                              textDecoration: "none",
                              color: "inherit",
                              "&:hover": { bgcolor: "rgba(0,0,0,0.03)" },
                            }}>
                            <InsertDriveFileOutlined sx={{ fontSize: 20, color: "#e3710a" }} />
                            <Typography sx={{ fontSize: 13 }}>{m.file_name}</Typography>
                          </Box>
                        ),
                      )}
                    </Stack>
                  </Box>
                </>
              )}
            </Paper>
          </Grid>

          {/* ── Sidebar ── */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={2} sx={{ position: { lg: "sticky" }, top: { lg: 24 } }}>
              {/* Apply / Proposal card */}
              {isFreelancer && job.status === "open" && (
                <SidebarCard>
                  {!hasApplied ? (
                    <>
                      {/* Budget */}
                      <Box mb={2.5}>
                        <SidebarLabel>Budget</SidebarLabel>
                        <Stack direction='row' alignItems='center' spacing={0.75}>
                          <AttachMoneyOutlined sx={{ fontSize: 20, color: "#15803d" }} />
                          <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#15803d" }}>
                            {formatCurrency(job.budget_min)} – {formatCurrency(job.budget_max)}
                          </Typography>
                        </Stack>
                        <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.5 }}>Fixed-price budget</Typography>
                      </Box>

                      {proposalsClosed ? (
                        <Alert severity='info' sx={{ borderRadius: 1.5, fontSize: 13 }}>
                          This job is no longer accepting proposals.
                        </Alert>
                      ) : applyOpen ? (
                        <ProposalForm jobPostId={job.id} onSaved={handleProposalSaved} onCancel={() => setApplyOpen(false)} />
                      ) : (
                        <Button
                          variant='contained'
                          fullWidth
                          onClick={() => setApplyOpen(true)}
                          sx={{
                            textTransform: "none",
                            color: "#fff",
                            fontWeight: 600,
                            fontSize: 14,
                            py: 1.25,
                            borderRadius: 1.5,
                          }}>
                          Submit a Proposal
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <Stack direction='row' justifyContent='space-between' alignItems='center' mb={2}>
                        <SidebarLabel>Your Proposal</SidebarLabel>
                        <Chip
                          label={myProposal!.status.charAt(0).toUpperCase() + myProposal!.status.slice(1)}
                          size='small'
                          sx={{ fontSize: 11, height: 22 }}
                        />
                      </Stack>
                      <Stack direction='row' spacing={3} mb={2.5}>
                        <Box>
                          <Typography sx={{ fontSize: 11, color: "text.secondary", mb: 0.5 }}>Your Price</Typography>
                          <Typography sx={{ fontSize: 18, fontWeight: 700 }}>{formatCurrency(myProposal!.price)}</Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: 11, color: "text.secondary", mb: 0.5 }}>Timeline</Typography>
                          <Typography sx={{ fontSize: 18, fontWeight: 700 }}>{myProposal!.timeline_days} days</Typography>
                        </Box>
                      </Stack>

                      {myProposal!.status === "pending" &&
                        (editOpen ? (
                          <ProposalForm
                            jobPostId={job.id}
                            existing={myProposal!}
                            onSaved={handleProposalSaved}
                            onCancel={() => setEditOpen(false)}
                          />
                        ) : (
                          <Stack spacing={1}>
                            <Button
                              variant='outlined'
                              fullWidth
                              startIcon={<EditOutlined sx={{ fontSize: 15 }} />}
                              onClick={() => setEditOpen(true)}
                              sx={{
                                textTransform: "none",
                                fontSize: 13,
                                borderRadius: 1.5,
                                borderColor: "divider",
                                color: "text.primary",
                              }}>
                              Edit Proposal
                            </Button>
                            <Button
                              variant='text'
                              fullWidth
                              startIcon={<ExitToAppOutlined sx={{ fontSize: 15 }} />}
                              disabled={withdrawing}
                              onClick={handleWithdraw}
                              sx={{
                                textTransform: "none",
                                fontSize: 13,
                                borderRadius: 1.5,
                                color: "#b91c1c",
                                "&:hover": { bgcolor: "rgba(239,68,68,0.05)" },
                              }}>
                              {withdrawing ? <CircularProgress size={14} /> : "Withdraw Proposal"}
                            </Button>
                          </Stack>
                        ))}
                    </>
                  )}
                </SidebarCard>
              )}

              {/* Budget card — shown for non-freelancers or closed jobs */}
              {(!isFreelancer || job.status !== "open") && (
                <SidebarCard>
                  <SidebarLabel>Budget</SidebarLabel>
                  <Stack direction='row' alignItems='center' spacing={0.75}>
                    <AttachMoneyOutlined sx={{ fontSize: 20, color: "#15803d" }} />
                    <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#15803d" }}>
                      {formatCurrency(job.budget_min)} – {formatCurrency(job.budget_max)}
                    </Typography>
                  </Stack>
                  <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.5 }}>Fixed-price budget</Typography>
                </SidebarCard>
              )}

              {/* Activity card */}
              <SidebarCard>
                <SidebarLabel>Activity on this job</SidebarLabel>
                <Stack spacing={2}>
                  <Stack direction='row' alignItems='center' spacing={1.25}>
                    <PeopleOutlineOutlined sx={{ fontSize: 18, color: "text.disabled" }} />
                    <Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{proposalRange(job.proposal_count)}</Typography>
                      <Typography sx={{ fontSize: 11, color: "text.secondary" }}>proposals submitted</Typography>
                    </Box>
                  </Stack>
                  <Stack direction='row' alignItems='center' spacing={1.25}>
                    <CalendarTodayOutlined sx={{ fontSize: 18, color: "text.disabled" }} />
                    <Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{formatDate(job.created_at)}</Typography>
                      <Typography sx={{ fontSize: 11, color: "text.secondary" }}>date posted</Typography>
                    </Box>
                  </Stack>
                  <Stack direction='row' alignItems='center' spacing={1.25}>
                    <AccessTimeOutlined sx={{ fontSize: 18, color: deadline.urgent ? "#dc2626" : "text.disabled" }} />
                    <Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 500, color: deadline.urgent ? "#dc2626" : "text.primary" }}>
                        {deadline.label}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: "text.secondary" }}>deadline</Typography>
                    </Box>
                  </Stack>
                  <Stack direction='row' alignItems='center' spacing={1.25}>
                    <PeopleOutlineOutlined sx={{ fontSize: 18, color: "text.disabled" }} />
                    <Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                        {job.proposal_count} / {job.max_proposals}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: "text.secondary" }}>proposal slots used</Typography>
                    </Box>
                  </Stack>
                </Stack>
              </SidebarCard>

              {/* Client card */}
              {job.client_profile && (
                <SidebarCard>
                  <SidebarLabel>About the Client</SidebarLabel>
                  <Stack direction='row' spacing={1.5} alignItems='center' mb={1.5}>
                    <Avatar
                      src={job.client_profile.user?.avatar_url ?? undefined}
                      alt={job.client_profile.user?.name}
                      sx={{ width: 44, height: 44 }}
                    />
                    <Box>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>
                        {job.client_profile.user?.name ?? "Client"}
                      </Typography>
                      {job.client_profile.company_name && (
                        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{job.client_profile.company_name}</Typography>
                      )}
                    </Box>
                  </Stack>
                  <Stack spacing={1}>
                    {job.client_profile.location && (
                      <Stack direction='row' spacing={0.75} alignItems='center'>
                        <LocationOnOutlined sx={{ fontSize: 15, color: "text.disabled" }} />
                        <Typography sx={{ fontSize: 13, color: "text.secondary" }}>{job.client_profile.location}</Typography>
                      </Stack>
                    )}
                    {job.client_profile.user?.is_verified_phone && (
                      <Stack direction='row' spacing={0.75} alignItems='center'>
                        <VerifiedOutlined sx={{ fontSize: 15, color: "#0071e3" }} />
                        <Typography sx={{ fontSize: 13, color: "text.secondary" }}>Phone verified</Typography>
                      </Stack>
                    )}
                  </Stack>
                </SidebarCard>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
