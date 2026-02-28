"use client";

import { Box, Card, CardContent, Chip, Divider, IconButton, Stack, Typography } from "@mui/material";
import {
  AccessTimeOutlined,
  BookmarkBorderOutlined,
  LocationOnOutlined,
  PeopleOutlineOutlined,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { JobPost } from "@/types/job";

interface JobCardProps {
  job: JobPost;
}

function formatCurrency(value: string) {
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return num.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months !== 1 ? "s" : ""} ago`;
}

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: "Expired", urgent: true };
  if (days === 0) return { label: "Due today", urgent: true };
  if (days <= 3) return { label: `${days}d left`, urgent: true };
  return { label: `${days}d left`, urgent: false };
}

const Dot = () => (
  <Box
    component="span"
    sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "text.disabled", display: "inline-block", flexShrink: 0 }}
  />
);

export default function JobCard({ job }: JobCardProps) {
  const router = useRouter();
  const visibleSkills = job.skills.slice(0, 5);
  const extraSkills = job.skills.length - 5;
  const deadline = daysUntil(job.deadline);
  const clientName = job.client_profile?.user?.name;
  const clientLocation = job.client_profile?.location;
  const description = job.description ? stripHtml(job.description) : "";

  const handleNavigate = () => router.push(`/jobs/${job.id}`);

  return (
    <Card
      elevation={0}
      onClick={handleNavigate}
      sx={{
        cursor: "pointer",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        transition: "border-color 0.15s, box-shadow 0.15s",
        "&:hover": {
          borderColor: "rgba(0,0,0,0.25)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          "& .job-title": { color: "#0071e3" },
        },
      }}
    >
      <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>

        {/* Top bar: posted time + bookmark */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.25}>
          <Typography sx={{ fontSize: 12, color: "text.disabled" }}>
            Posted {timeAgo(job.created_at)}
          </Typography>
          <IconButton
            size="small"
            onClick={(e) => e.stopPropagation()}
            sx={{ color: "text.disabled", "&:hover": { color: "text.secondary" }, mr: -0.75 }}
          >
            <BookmarkBorderOutlined sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>

        {/* Title */}
        <Typography
          className="job-title"
          sx={{
            fontSize: 16,
            fontWeight: 600,
            lineHeight: 1.4,
            mb: 1,
            color: "text.primary",
            transition: "color 0.15s",
          }}
        >
          {job.title}
        </Typography>

        {/* Metadata: budget · category · client */}
        <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1} mb={1.5}>
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            {formatCurrency(job.budget_min)} – {formatCurrency(job.budget_max)}
          </Typography>
          <Dot />
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            {job.category?.category_name ?? "Uncategorized"}
          </Typography>
          {clientName && (
            <>
              <Dot />
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                {clientName}
              </Typography>
            </>
          )}
        </Stack>

        {/* Description */}
        {description && (
          <Typography
            sx={{
              fontSize: 14,
              color: "text.secondary",
              lineHeight: 1.7,
              mb: 2,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {description}
          </Typography>
        )}

        {/* Skills */}
        {job.skills.length > 0 && (
          <Stack direction="row" flexWrap="wrap" gap={0.75} mb={2}>
            {visibleSkills.map(s => (
              <Chip
                key={s.id}
                label={s.expertise_name}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: 12,
                  height: 24,
                  borderRadius: "12px",
                  borderColor: "rgba(0,0,0,0.15)",
                  color: "text.secondary",
                  bgcolor: "transparent",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
                }}
              />
            ))}
            {extraSkills > 0 && (
              <Chip
                label={`+${extraSkills} more`}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: 12,
                  height: 24,
                  borderRadius: "12px",
                  borderColor: "rgba(0,0,0,0.1)",
                  color: "text.disabled",
                }}
              />
            )}
          </Stack>
        )}

        <Divider sx={{ mb: 1.5 }} />

        {/* Footer */}
        <Stack direction="row" flexWrap="wrap" gap={2} alignItems="center">
          <Stack direction="row" spacing={0.5} alignItems="center">
            <PeopleOutlineOutlined sx={{ fontSize: 14, color: "text.disabled" }} />
            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
              {job.proposal_count === 0
                ? "Be the first to propose"
                : `${job.proposal_count} proposal${job.proposal_count !== 1 ? "s" : ""}`}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={0.5} alignItems="center">
            <AccessTimeOutlined
              sx={{ fontSize: 14, color: deadline.urgent ? "#dc2626" : "text.disabled" }}
            />
            <Typography
              sx={{
                fontSize: 12,
                color: deadline.urgent ? "#dc2626" : "text.secondary",
                fontWeight: deadline.urgent ? 600 : 400,
              }}
            >
              {deadline.label}
            </Typography>
          </Stack>

          {clientLocation && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <LocationOnOutlined sx={{ fontSize: 14, color: "text.disabled" }} />
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                {clientLocation}
              </Typography>
            </Stack>
          )}
        </Stack>

      </CardContent>
    </Card>
  );
}
