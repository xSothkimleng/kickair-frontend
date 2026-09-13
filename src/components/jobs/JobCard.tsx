"use client";

import { useState } from "react";
import { Bookmark, Zap, Users, Calendar, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { css, cva } from "styled-system/css";
import { JobPost } from "@/types/job";

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

/* ── static styles ── */
const skillRow = css({ display: "flex", gap: "7px", flexWrap: "wrap" });
const skillPill = css({ display: "inline-flex", alignItems: "center", h: "28px", px: "12px", borderRadius: "pill", textStyle: "meta", fontWeight: 500, bg: "rgba(0,0,0,0.05)", color: "ink2" });
const skillMore = css({ display: "inline-flex", alignItems: "center", h: "28px", px: "11px", borderRadius: "pill", textStyle: "meta", fontWeight: 600, color: "ink3" });

const signal = cva({
  base: { display: "inline-flex", alignItems: "center", gap: "6px", textStyle: "meta", fontWeight: 500, whiteSpace: "nowrap", "& svg": { flexShrink: 0 } },
  variants: { tone: { plain: { color: "ink2" }, accent: { color: "accent" }, error: { color: "errorText" } } },
  defaultVariants: { tone: "plain" },
});

const budgetBlock = cva({
  base: { display: "flex", flexDirection: "column", gap: "2px", flex: "none" },
  variants: { mobile: { true: { alignItems: "flex-start" }, false: { alignItems: "flex-end" } } },
});
const budgetFigure = cva({
  base: { fontVariantNumeric: "tabular-nums", fontWeight: 600, color: "successText", whiteSpace: "nowrap" },
  variants: { mobile: { true: { textStyle: "title" }, false: { textStyle: "title" } } },
});
const budgetDash = css({ color: "ink3", fontWeight: 500 });
const budgetLabel = css({ textStyle: "eyebrow", fontWeight: 600, color: "ink3", whiteSpace: "nowrap" });

const bookmarkBtn = cva({
  base: {
    w: "38px", h: "38px", p: 0, m: 0, borderRadius: "10px",
    borderWidth: "1px", borderStyle: "solid", borderColor: "transparent",
    bg: "transparent", display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", flex: "none",
    _hover: { bg: "rgba(0,0,0,0.05)" },
    _focusVisible: { outline: "none", boxShadow: "focusRing" },
    "& svg": { display: "block" },
  },
  variants: { saved: { true: { color: "accent" }, false: { color: "ink3" } } },
});

const metaRow = css({ display: "flex", alignItems: "center", gap: "8px", minW: 0 });
const categoryPill = css({ display: "inline-flex", alignItems: "center", h: "24px", px: "10px", borderRadius: "pill", textStyle: "micro", fontWeight: 600, bg: "rgba(0,0,0,0.05)", color: "ink2", whiteSpace: "nowrap" });
const postedText = css({ textStyle: "meta", fontWeight: 500, color: "ink2", whiteSpace: "nowrap" });
const previewText = css({ textStyle: "ui", color: "ink2", lineClamp: 2 });
const hairlineRow = css({ h: "1px", bg: "hairline", my: "3px" });
const footerRow = css({ display: "flex", alignItems: "center", flexWrap: "wrap", rowGap: "8px" });
const footerSep = css({ w: "1px", h: "12px", bg: "hairlineStrong", mx: "14px" });

const jobCard = css({
  bg: "surface",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hairline",
  borderRadius: "card",
  cursor: "pointer",
  transition: "border-color .15s, box-shadow .15s, transform .08s",
  _hover: { borderColor: "hairlineStrong", boxShadow: "0 6px 24px rgba(0,0,0,0.06)", transform: "translateY(-1px)" },
});
const mobileBody = css({ display: { base: "flex", md: "none" }, flexDirection: "column", gap: "13px", p: "18px" });
const mobileTop = css({ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" });
const mobileTitle = css({ textStyle: "lead", fontWeight: 600 });
const desktopBody = css({ display: { base: "none", md: "flex" }, flexDirection: "column", gap: "14px", p: "24px" });
const desktopTop = css({ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" });
const desktopHead = css({ display: "flex", flexDirection: "column", gap: "12px", minW: 0, flex: 1 });
const desktopTitle = css({ textStyle: "title", fontWeight: 600 });
const desktopAside = css({ display: "flex", gap: "12px", alignItems: "flex-start", flex: "none" });

function SkillRow({ skills, cap }: { skills: string[]; cap: number }) {
  const shown = skills.slice(0, cap);
  const extra = skills.length - shown.length;
  return (
    <div className={skillRow}>
      {shown.map(s => (
        <span key={s} className={skillPill}>{s}</span>
      ))}
      {extra > 0 && <span className={skillMore}>+{extra}</span>}
    </div>
  );
}

function FooterSignal({ icon, tone, children }: { icon: React.ReactNode; tone?: "accent" | "error"; children: React.ReactNode }) {
  return (
    <span className={signal({ tone: tone ?? "plain" })}>
      {icon}{children}
    </span>
  );
}

function BudgetBlock({ job, mobile }: { job: JobPost; mobile?: boolean }) {
  const isMobile = !!mobile;
  return (
    <div className={budgetBlock({ mobile: isMobile })}>
      <p className={budgetFigure({ mobile: isMobile })}>
        {money(job.budget_min)}<span className={budgetDash}> – </span>{money(job.budget_max)}
      </p>
      <p className={budgetLabel}>Budget · USD</p>
    </div>
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
    <button
      type="button"
      aria-label={saved ? "Saved" : "Save job"}
      onClick={e => { e.stopPropagation(); setSaved(s => !s); }}
      className={bookmarkBtn({ saved })}>
      <Bookmark size={19} fill={saved ? "currentColor" : "none"} />
    </button>
  );

  const metaLine = (
    <div className={metaRow}>
      <span className={categoryPill}>{job.category?.category_name ?? "Uncategorized"}</span>
      <p className={postedText}>{timeAgo(job.created_at)}</p>
    </div>
  );

  const preview = job.description ? (
    <p className={previewText}>{stripHtml(job.description)}</p>
  ) : null;

  const divider = <div className={hairlineRow} />;

  const footer = (
    <div className={footerRow}>
      <FooterSignal tone={isFirst ? "accent" : undefined} icon={isFirst ? <Zap size={15} /> : <Users size={15} />}>{proposalText}</FooterSignal>
      {dl !== null && (
        <>
          <div className={footerSep} />
          <FooterSignal tone={urgent ? "error" : undefined} icon={<Calendar size={14} />}>
            {dl <= 0 ? "Overdue" : `${dl} day${dl !== 1 ? "s" : ""} left`}
          </FooterSignal>
        </>
      )}
      {location && (
        <>
          <div className={footerSep} />
          <FooterSignal icon={<MapPin size={15} />}>{location}</FooterSignal>
        </>
      )}
    </div>
  );

  return (
    <article role="button" tabIndex={0} onClick={() => router.push(`/jobs/${job.id}`)} className={jobCard}>
      {/* mobile */}
      <div className={mobileBody}>
        <div className={mobileTop}>{metaLine}{bookmark}</div>
        <p className={mobileTitle}>{job.title}</p>
        <BudgetBlock job={job} mobile />
        {preview}
        {skills.length > 0 && <SkillRow skills={skills} cap={3} />}
        {divider}
        {footer}
      </div>
      {/* desktop */}
      <div className={desktopBody}>
        <div className={desktopTop}>
          <div className={desktopHead}>
            {metaLine}
            <p className={desktopTitle}>{job.title}</p>
          </div>
          <div className={desktopAside}>
            <BudgetBlock job={job} />
            {bookmark}
          </div>
        </div>
        {preview}
        {skills.length > 0 && <SkillRow skills={skills} cap={4} />}
        {divider}
        {footer}
      </div>
    </article>
  );
}
