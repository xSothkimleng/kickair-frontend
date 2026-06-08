"use client";

import { useState } from "react";
import { Box, Typography } from "@mui/material";
import {
  BookmarkBorderOutlined,
  Bookmark as BookmarkFilled,
  BoltOutlined,
  PeopleOutlineOutlined,
  CalendarTodayOutlined,
  LocationOnOutlined,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { JobPost } from "@/types/job";
import { tokens } from "@/theme";

function money(value: string | number) {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return "$" + (Number.isFinite(n) ? n : 0).toLocaleString("en-US");
}
function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
function timeAgo(dateStr: string) {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;
  return `${Math.floor(days / 30)} month${Math.floor(days / 30) !== 1 ? "s" : ""} ago`;
}
function daysLeft(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
}
function urgencyColor(d: number) {
  return d <= 3 ? tokens.errorText : d <= 6 ? tokens.pendingText : tokens.text2;
}

function SkillRow({ skills, cap }: { skills: string[]; cap: number }) {
  const shown = skills.slice(0, cap);
  const extra = skills.length - shown.length;
  return (
    <Box sx={{ display: "flex", gap: 0.875, flexWrap: "wrap" }}>
      {shown.map(s => (
        <Box key={s} component="span" sx={{ display: "inline-flex", alignItems: "center", height: 28, px: 1.5, borderRadius: "999px", fontSize: 12.5, fontWeight: 500, bgcolor: "rgba(0,0,0,0.05)", color: tokens.text2 }}>{s}</Box>
      ))}
      {extra > 0 && <Box component="span" sx={{ display: "inline-flex", alignItems: "center", height: 28, px: 1.375, borderRadius: "999px", fontSize: 12.5, fontWeight: 600, color: tokens.text3 }}>+{extra}</Box>}
    </Box>
  );
}

function FooterSignal({ icon, color, children }: { icon: React.ReactNode; color?: string; children: React.ReactNode }) {
  return (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, color: color || tokens.text2, fontSize: 12.5, fontWeight: 500, whiteSpace: "nowrap" }}>
      {icon}{children}
    </Box>
  );
}

function BudgetBlock({ job, mobile }: { job: JobPost; mobile?: boolean }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25, alignItems: mobile ? "flex-start" : "flex-end", flex: "none" }}>
      <Typography sx={{ fontFamily: tokens.mono, fontSize: mobile ? 19 : 20, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.05, color: tokens.successText, whiteSpace: "nowrap" }}>
        {money(job.budget_min)}<Box component="span" sx={{ color: tokens.text3, fontWeight: 500 }}> – </Box>{money(job.budget_max)}
      </Typography>
      <Typography sx={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: tokens.text3, whiteSpace: "nowrap" }}>Budget · USD</Typography>
    </Box>
  );
}

export default function JobCard({ job }: { job: JobPost }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  const dl = job.deadline ? daysLeft(job.deadline) : null;
  const urgent = dl !== null && dl <= 3;
  const skills = (job.skills ?? []).map(s => s.expertise_name);
  const location = job.client_profile?.location;
  const isFirst = job.proposal_count === 0;
  const proposalText = isFirst ? "Be the first to apply" : job.proposal_count >= 20 ? "20+ proposals" : `${job.proposal_count} proposal${job.proposal_count !== 1 ? "s" : ""}`;

  const bookmark = (
    <Box
      component="button"
      aria-label={saved ? "Saved" : "Save job"}
      onClick={e => { e.stopPropagation(); setSaved(s => !s); }}
      sx={{ width: 38, height: 38, borderRadius: "10px", border: "1px solid transparent", bgcolor: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flex: "none", color: saved ? tokens.accent : tokens.text3, "&:hover": { bgcolor: "rgba(0,0,0,0.05)" } }}>
      {saved ? <BookmarkFilled sx={{ fontSize: 19 }} /> : <BookmarkBorderOutlined sx={{ fontSize: 19 }} />}
    </Box>
  );

  const metaLine = (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
      <Box component="span" sx={{ display: "inline-flex", alignItems: "center", height: 24, px: 1.25, borderRadius: "999px", fontSize: 11.5, fontWeight: 600, bgcolor: "rgba(0,0,0,0.05)", color: tokens.text2, whiteSpace: "nowrap" }}>{job.category?.category_name ?? "Uncategorized"}</Box>
      <Typography sx={{ fontSize: 12, fontWeight: 500, color: tokens.text2, whiteSpace: "nowrap" }}>{timeAgo(job.created_at)}</Typography>
    </Box>
  );

  const preview = job.description ? (
    <Typography sx={{ fontSize: 13.5, lineHeight: 1.55, color: tokens.text2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{stripHtml(job.description)}</Typography>
  ) : null;

  const divider = <Box sx={{ height: "1px", bgcolor: tokens.border, my: "3px" }} />;

  const footer = (
    <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", rowGap: 1 }}>
      <FooterSignal color={isFirst ? tokens.accent : undefined} icon={isFirst ? <BoltOutlined sx={{ fontSize: 15 }} /> : <PeopleOutlineOutlined sx={{ fontSize: 15 }} />}>{proposalText}</FooterSignal>
      {dl !== null && (
        <>
          <Box sx={{ width: "1px", height: 12, bgcolor: tokens.borderStrong, mx: 1.75 }} />
          <FooterSignal color={urgent ? tokens.errorText : undefined} icon={<CalendarTodayOutlined sx={{ fontSize: 14 }} />}>
            {dl <= 0 ? "Overdue" : `${dl} day${dl !== 1 ? "s" : ""} left`}
          </FooterSignal>
        </>
      )}
      {location && (
        <>
          <Box sx={{ width: "1px", height: 12, bgcolor: tokens.borderStrong, mx: 1.75 }} />
          <FooterSignal icon={<LocationOnOutlined sx={{ fontSize: 15 }} />}>{location}</FooterSignal>
        </>
      )}
    </Box>
  );

  const cardSx = {
    bgcolor: tokens.surface,
    border: `1px solid ${tokens.border}`,
    borderRadius: `${tokens.radius.card}px`,
    cursor: "pointer",
    transition: "border-color .15s, box-shadow .15s, transform .08s",
    "&:hover": { borderColor: tokens.borderStrong, boxShadow: "0 6px 24px rgba(0,0,0,0.06)", transform: "translateY(-1px)" },
  } as const;

  return (
    <Box component="article" role="button" tabIndex={0} onClick={() => router.push(`/jobs/${job.id}`)} sx={cardSx}>
      {/* mobile */}
      <Box sx={{ display: { xs: "flex", md: "none" }, flexDirection: "column", gap: 1.625, p: 2.25 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1.25 }}>{metaLine}{bookmark}</Box>
        <Typography sx={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.015em", lineHeight: 1.25 }}>{job.title}</Typography>
        <BudgetBlock job={job} mobile />
        {preview}
        {skills.length > 0 && <SkillRow skills={skills} cap={3} />}
        {divider}
        {footer}
      </Box>
      {/* desktop */}
      <Box sx={{ display: { xs: "none", md: "flex" }, flexDirection: "column", gap: 1.75, p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, minWidth: 0, flex: 1 }}>
            {metaLine}
            <Typography sx={{ fontSize: 19, fontWeight: 600, letterSpacing: "-0.018em", lineHeight: 1.2 }}>{job.title}</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", flex: "none" }}>
            <BudgetBlock job={job} />
            {bookmark}
          </Box>
        </Box>
        {preview}
        {skills.length > 0 && <SkillRow skills={skills} cap={4} />}
        {divider}
        {footer}
      </Box>
    </Box>
  );
}
