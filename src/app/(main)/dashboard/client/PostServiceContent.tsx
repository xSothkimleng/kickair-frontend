"use client";

import { useState, useEffect } from "react";
import { Box, Paper, Typography, Button, Chip, Stack, CircularProgress, Avatar, IconButton, Tooltip } from "@mui/material";
import {
  AddOutlined,
  WorkOutlined,
  EditOutlined,
  PeopleOutlineOutlined,
  AccessTimeOutlined,
  OpenInNewOutlined,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { JobPost, JobPostStatus } from "@/types/job";
import JobPostForm from "@/components/jobs/JobPostForm";

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

function statusColor(status: JobPostStatus) {
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

function statusLabel(status: JobPostStatus) {
  return status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
}

interface JobRowProps {
  job: JobPost;
  onEdit: () => void;
  onCancelled: (id: number) => void;
}

function JobRow({ job, onEdit, onCancelled }: JobRowProps) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!confirm("Cancel this job post? This cannot be undone.")) return;
    setCancelling(true);
    try {
      await api.deleteJobPost(job.id);
      onCancelled(job.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to cancel job post.");
    } finally {
      setCancelling(false);
    }
  };

  const canCancel = job.status === "open" || job.status === "in_progress";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2.5,
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.07)",
        bgcolor: "white",
        transition: "all 0.15s",
        "&:hover": { borderColor: "rgba(0,0,0,0.15)" },
      }}>
      {/* Icon */}
      <Avatar sx={{ width: 44, height: 44, bgcolor: "rgba(0,113,227,0.1)" }}>
        <WorkOutlined sx={{ fontSize: 20, color: "#0071e3" }} />
      </Avatar>

      {/* Info */}
      <Box flex={1} minWidth={0}>
        <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 0.25 }} noWrap>
          {job.title}
        </Typography>
        <Stack direction='row' spacing={2} alignItems='center'>
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            {formatCurrency(job.budget_min)} – {formatCurrency(job.budget_max)}
          </Typography>
          <Stack direction='row' spacing={0.5} alignItems='center'>
            <PeopleOutlineOutlined sx={{ fontSize: 13, color: "text.secondary" }} />
            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
              {job.proposal_count} proposal{job.proposal_count !== 1 ? "s" : ""}
            </Typography>
          </Stack>
          <Stack direction='row' spacing={0.5} alignItems='center'>
            <AccessTimeOutlined sx={{ fontSize: 13, color: "text.secondary" }} />
            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>Due {formatDate(job.deadline)}</Typography>
          </Stack>
        </Stack>
      </Box>

      {/* Status */}
      <Chip label={statusLabel(job.status)} size='small' sx={{ fontSize: 11, height: 24, ...statusColor(job.status) }} />

      {/* Actions */}
      <Stack direction='row' spacing={0.5}>
        <Button
          size='small'
          variant='outlined'
          onClick={() => router.push(`/dashboard/jobs/${job.id}/proposals`)}
          endIcon={<OpenInNewOutlined sx={{ fontSize: 13 }} />}
          sx={{
            fontSize: 12,
            textTransform: "none",
            borderRadius: 8,
            borderColor: "rgba(0,0,0,0.15)",
            color: "black",
            "&:hover": { borderColor: "rgba(0,0,0,0.3)" },
          }}>
          Proposals
        </Button>

        <Tooltip title='Edit'>
          <IconButton size='small' onClick={onEdit} sx={{ color: "rgba(0,0,0,0.5)" }}>
            <EditOutlined sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>

        {canCancel && (
          <Button
            size='small'
            disabled={cancelling}
            onClick={handleCancel}
            sx={{
              fontSize: 11,
              textTransform: "none",
              borderRadius: 8,
              color: "#b91c1c",
              "&:hover": { bgcolor: "rgba(239,68,68,0.05)" },
            }}>
            {cancelling ? <CircularProgress size={12} /> : "Cancel"}
          </Button>
        )}
      </Stack>
    </Box>
  );
}

export default function PostServiceContent() {
  const [view, setView] = useState<View>("list");
  const [editingJob, setEditingJob] = useState<JobPost | null>(null);
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleEdit = (job: JobPost) => {
    setEditingJob(job);
    setView("edit");
  };

  const handleBack = () => {
    setView("list");
    setEditingJob(null);
    fetchJobs();
  };

  const handleSaved = () => {
    handleBack();
  };

  const handleCancelled = (id: number) => {
    setJobs(prev => prev.map(j => (j.id === id ? { ...j, status: "cancelled" as JobPostStatus } : j)));
  };

  if (view === "create" || view === "edit") {
    return <JobPostForm job={editingJob} onBack={handleBack} onSaved={handleSaved} />;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography sx={{ fontSize: 28, fontWeight: 600, color: "black", mb: 0.5 }}>My Jobs</Typography>
          <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.6)" }}>
            Post job opportunities and manage incoming proposals
          </Typography>
        </Box>
        <Button
          onClick={() => setView("create")}
          startIcon={<AddOutlined sx={{ fontSize: 16 }} />}
          sx={{
            px: 3,
            height: 44,
            fontSize: 13,
            color: "white",
            bgcolor: "black",
            borderRadius: 10,
            textTransform: "none",
            "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
          }}>
          Post a Job
        </Button>
      </Box>

      {/* Job List */}
      <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0,0,0,0.08)", p: 3 }}>
        <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black", mb: 2 }}>All Jobs</Typography>

        {loading ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <CircularProgress size={32} sx={{ color: "rgba(0,0,0,0.4)" }} />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography sx={{ fontSize: 13, color: "rgba(239,68,68,0.8)", mb: 2 }}>{error}</Typography>
            <Button onClick={fetchJobs} sx={{ fontSize: 12, textTransform: "none" }}>
              Try again
            </Button>
          </Box>
        ) : jobs.length > 0 ? (
          <Stack spacing={1.5}>
            {jobs.map(job => (
              <JobRow key={job.id} job={job} onEdit={() => handleEdit(job)} onCancelled={handleCancelled} />
            ))}
          </Stack>
        ) : (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <WorkOutlined sx={{ fontSize: 48, color: "rgba(0,0,0,0.2)", mb: 2 }} />
            <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.6)", mb: 2 }}>No job posts yet</Typography>
            <Button
              onClick={() => setView("create")}
              variant='contained'
              sx={{
                fontSize: 13,
                textTransform: "none",
                borderRadius: 10,
                bgcolor: "#0071e3",
                color: "white",
                "&:hover": { bgcolor: "#0077ED" },
              }}>
              Post your first job
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
