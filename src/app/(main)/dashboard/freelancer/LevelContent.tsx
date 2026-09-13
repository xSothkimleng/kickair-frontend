"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { css } from "styled-system/css";
import { Progress, Skeleton } from "@/components/ds";
import { api } from "@/lib/api";
import { LevelStats } from "@/types/dashboard";

interface LevelDef {
  name: string;
  color: string;
  minPoints: number;
}

const LEVELS: LevelDef[] = [
  { name: "Bronze",   color: "linear-gradient(135deg, #B87333 0%, #CD7F32 100%)", minPoints: 0 },
  { name: "Silver",   color: "linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)", minPoints: 100 },
  { name: "Gold",     color: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)", minPoints: 500 },
  { name: "Platinum", color: "linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)", minPoints: 1500 },
  { name: "Diamond",  color: "linear-gradient(135deg, #A78BFA 0%, #EC4899 100%)", minPoints: 3000 },
];

const LEVEL_BENEFITS = [
  {
    level: "Bronze",
    benefits: ["Basic profile visibility", "Standard support", "Up to 5 active services"],
  },
  {
    level: "Silver",
    benefits: ["Enhanced profile visibility", "Priority support", "Up to 10 active services", "Custom service packages", "+5% algorithm boost"],
  },
  {
    level: "Gold",
    benefits: ["Premium profile placement", "VIP support 24/7", "Unlimited services", "Featured in category", "+15% algorithm boost", "Reduced fees (2% off)"],
  },
  {
    level: "Platinum",
    benefits: ["Top search placement", "Dedicated account manager", "Exclusive client matching", "+25% algorithm boost", "Reduced fees (5% off)", "Early access to features"],
  },
  {
    level: "Diamond",
    benefits: ["Maximum visibility", "White-glove service", "Personal brand consultation", "+40% algorithm boost", "Reduced fees (10% off)", "VIP events access", "Featured on homepage"],
  },
];

// ─── Styles ──────────────────────────────────────────────────────────────────

const pageStack = css({ display: "flex", flexDirection: "column", gap: "24px" });
const panel = css({
  bg: "surface", color: "rgba(0,0,0,0.87)", borderRadius: "16px",
  borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(0, 0, 0, 0.08)", p: "32px",
});
const centerBlock = css({ display: "flex", justifyContent: "center", alignItems: "center", minH: "200px" });
const errorText = css({ color: "rgba(0,0,0,0.5)", fontSize: "14px", lineHeight: 1.5 });

const headRow = css({ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: "32px" });
const headTitle = css({ fontSize: "28px", fontWeight: 600, lineHeight: 1.5, color: "black" });
const headSub = css({ fontSize: "13px", lineHeight: 1.5, color: "rgba(0, 0, 0, 0.6)" });
const levelChipBox = css({ px: "24px", py: "12px", borderRadius: "12px" });
const levelChipLabel = css({ fontSize: "11px", lineHeight: 1.5, color: "rgba(255, 255, 255, 0.8)" });
const levelChipValue = css({ fontSize: "24px", fontWeight: 600, lineHeight: 1.5, color: "white" });

const progressBlock = css({ mb: "32px" });
const progressHead = css({ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "12px" });
const xpLine = css({ fontSize: "13px", lineHeight: 1.5, color: "rgba(0, 0, 0, 0.8)", fontWeight: 500 });
const xpSub = css({ fontSize: "11px", lineHeight: 1.5, color: "rgba(0, 0, 0, 0.6)" });
const xpPercent = css({ fontSize: "17px", fontWeight: 600, lineHeight: 1.5, color: "black" });
const xpBar = css({
  h: "12px", borderRadius: "pill", bg: "rgba(0, 0, 0, 0.05)",
  "& > div": { background: "linear-gradient(90deg, #0071e3 0%, #0077ED 100%)", borderRadius: "999px" },
});

const levelGrid = css({
  display: "grid", gap: "12px",
  gridTemplateColumns: { base: "repeat(1, minmax(0, 1fr))", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(5, minmax(0, 1fr))" },
});
const levelTile = css({
  position: "relative", p: "16px", borderRadius: "12px",
  borderWidth: "2px", borderStyle: "solid", borderColor: "rgba(0, 0, 0, 0.1)", bg: "white",
  transition: "all 0.3s",
  "&[data-passed]": { borderColor: "rgba(34, 197, 94, 0.3)", bg: "rgba(34, 197, 94, 0.05)" },
  "&[data-current]": { borderColor: "black", bg: "rgba(0, 0, 0, 0.05)" },
});
const levelDot = css({ w: "32px", h: "32px", borderRadius: "50%", mb: "8px" });
const levelName = css({ fontSize: "12px", fontWeight: 600, lineHeight: 1.5, color: "black" });
const levelPts = css({ fontSize: "10px", lineHeight: 1.5, color: "rgba(0, 0, 0, 0.6)" });
const passedMark = css({ position: "absolute", top: "8px", right: "8px", color: "#16a34a", display: "flex" });
const currentChip = css({
  position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  h: "20px", px: "12px", borderRadius: "pill", bg: "black", color: "white",
  fontSize: "9px", fontWeight: 500, whiteSpace: "nowrap",
});

const statsGrid = css({
  display: "grid", gap: "16px",
  gridTemplateColumns: { base: "repeat(2, minmax(0, 1fr))", sm: "repeat(4, minmax(0, 1fr))" },
});
const statCard = css({
  bg: "surface", color: "rgba(0,0,0,0.87)", p: "20px", borderRadius: "12px",
  borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(0,0,0,0.08)", textAlign: "center",
});
const statValue = css({ fontSize: "22px", fontWeight: 700, lineHeight: 1.5, color: "black" });
const statLabel = css({ fontSize: "12px", fontWeight: 600, lineHeight: 1.5, color: "rgba(0,0,0,0.7)" });
const statSub = css({ fontSize: "11px", lineHeight: 1.5, color: "rgba(0,0,0,0.4)" });

const sectionTitle = css({ fontSize: "17px", fontWeight: 600, lineHeight: 1.5, color: "black" });
const sectionSub = css({ fontSize: "12px", lineHeight: 1.5, color: "rgba(0, 0, 0, 0.6)" });
const benefitsGrid = css({
  display: "grid", gap: "16px",
  gridTemplateColumns: { base: "repeat(1, minmax(0, 1fr))", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(5, minmax(0, 1fr))" },
});
const benefitCard = css({
  bg: "white", color: "rgba(0,0,0,0.87)", p: "20px", borderRadius: "12px", h: "100%",
  borderWidth: "2px", borderStyle: "solid", borderColor: "rgba(0, 0, 0, 0.1)",
  "&[data-passed]": { borderColor: "rgba(34, 197, 94, 0.2)", bg: "rgba(34, 197, 94, 0.05)" },
  "&[data-current]": { borderColor: "black", bg: "rgba(0, 0, 0, 0.05)" },
});
const benefitHead = css({ display: "flex", alignItems: "center", gap: "8px", mb: "16px" });
const benefitDot = css({ w: "24px", h: "24px", borderRadius: "50%" });
const benefitLevel = css({ fontSize: "13px", fontWeight: 600, lineHeight: 1.5, color: "black" });
const benefitList = css({ m: 0, p: 0, pl: "16px", display: "flex", flexDirection: "column", gap: "8px" });
const benefitItem = css({
  fontSize: "11px", lineHeight: 1.5, color: "rgba(0,0,0,0.4)",
  "&[data-on]": { color: "rgba(0,0,0,0.7)" },
});
const currentFoot = css({ mt: "16px", pt: "16px", borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "rgba(0,0,0,0.1)" });
const currentWide = css({
  display: "flex", alignItems: "center", justifyContent: "center",
  w: "100%", h: "24px", px: "12px", borderRadius: "pill", boxSizing: "border-box",
  bg: "black", color: "white", fontSize: "9px", fontWeight: 500,
});

const earnPanel = css({
  background: "linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)",
  color: "rgba(0,0,0,0.87)",
  borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(37, 99, 235, 0.2)",
  borderRadius: "16px", p: "32px",
});
const earnGrid = css({
  display: "grid", gap: "16px",
  gridTemplateColumns: { base: "repeat(1, minmax(0, 1fr))", sm: "repeat(3, minmax(0, 1fr))" },
});
const earnCard = css({ p: "20px", borderRadius: "12px", bg: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)", color: "rgba(0,0,0,0.87)" });
const earnIcon = css({ fontSize: "24px", lineHeight: 1.5, mb: "8px" });
const earnTitle = css({ fontSize: "13px", fontWeight: 600, lineHeight: 1.5, color: "black" });
const earnDesc = css({ fontSize: "11px", lineHeight: 1.5, color: "rgba(0,0,0,0.7)" });
const earnPts = css({ fontSize: "13px", fontWeight: 600, lineHeight: 1.5, color: "#3b82f6" });
const tipCard = css({ mt: "24px", p: "16px", borderRadius: "12px", bg: "rgba(255,255,255,0.8)", color: "rgba(0,0,0,0.87)" });
const tipText = css({ fontSize: "12px", lineHeight: 1.5, color: "rgba(0,0,0,0.8)" });

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className={statCard}>
      <p className={statValue}>{value}</p>
      <p className={statLabel}>{label}</p>
      {sub && <p className={statSub}>{sub}</p>}
    </div>
  );
}

export default function LevelContent() {
  const [stats, setStats] = useState<LevelStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getLevelStats()
      .then(setStats)
      .catch(() => setError("Failed to load level data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={pageStack}>
        <Skeleton variant="rect" height={280} style={{ borderRadius: 16 }} />
        <Skeleton variant="rect" height={120} style={{ borderRadius: 16 }} />
        <Skeleton variant="rect" height={320} style={{ borderRadius: 16 }} />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className={centerBlock}>
        <p className={errorText}>{error ?? "No data available"}</p>
      </div>
    );
  }

  const currentLevelIndex = LEVELS.findIndex(l => l.name === stats.level);
  const currentLevelData = LEVELS[currentLevelIndex];
  const nextLevelName = currentLevelIndex < LEVELS.length - 1 ? LEVELS[currentLevelIndex + 1].name : null;
  const isDiamond = stats.next_level_threshold === null;

  return (
    <div className={pageStack}>

      {/* Current Level Overview */}
      <div className={panel}>
        <div className={headRow}>
          <div>
            <p className={headTitle}>Freelancer Level</p>
            <p className={headSub}>
              Build your reputation and unlock exclusive benefits
            </p>
          </div>
          <div className={levelChipBox} style={{ background: currentLevelData.color }}>
            <p className={levelChipLabel}>Current Level</p>
            <p className={levelChipValue}>{stats.level}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className={progressBlock}>
          <div className={progressHead}>
            <div>
              <p className={xpLine}>
                {stats.xp_points.toLocaleString()} XP
                {!isDiamond && ` / ${stats.next_level_threshold!.toLocaleString()} XP`}
              </p>
              <p className={xpSub}>
                {isDiamond
                  ? "You've reached the top level!"
                  : `${stats.points_to_next_level.toLocaleString()} points to ${nextLevelName}`}
              </p>
            </div>
            <p className={xpPercent}>
              {stats.level_progress_percent}%
            </p>
          </div>
          <Progress value={stats.level_progress_percent} className={xpBar} />
        </div>

        {/* Level Progression chips */}
        <div className={levelGrid}>
          {LEVELS.map((level, idx) => {
            const isPassed = idx < currentLevelIndex;
            const isCurrent = idx === currentLevelIndex;
            return (
              <div key={level.name} className={levelTile} data-passed={isPassed ? "" : undefined} data-current={isCurrent ? "" : undefined}>
                <div className={levelDot} style={{ background: level.color }} />
                <p className={levelName}>{level.name}</p>
                <p className={levelPts}>{level.minPoints.toLocaleString()} pts</p>
                {isPassed && (
                  <div className={passedMark}>
                    <CheckCircle2 size={20} />
                  </div>
                )}
                {isCurrent && <span className={currentChip}>Current</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick stats row */}
      <div className={statsGrid}>
        <StatCard
          label="Completed Orders"
          value={stats.completed_orders_count}
        />
        <StatCard
          label="Success Rate"
          value={`${stats.success_rate}%`}
          sub={`${stats.cancellation_count} cancelled`}
        />
        <StatCard
          label="Avg Rating"
          value={stats.rating_count > 0 ? parseFloat(stats.rating_average ?? "0").toFixed(1) : "—"}
          sub={stats.rating_count > 0 ? `${stats.rating_count} review${stats.rating_count !== 1 ? "s" : ""}` : "No reviews yet"}
        />
        <StatCard
          label="Total Earnings"
          value={`$${parseFloat(stats.total_earnings).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
        />
      </div>

      {/* Performance Metrics — TODO: wire to real API data */}
      {/* Achievements & Badges — TODO: wire to real API data */}

      {/* Level Benefits */}
      <div className={panel}>
        <p className={sectionTitle}>Level Benefits</p>
        <p className={sectionSub}>
          See what you unlock as you progress through levels
        </p>
        <div className={benefitsGrid}>
          {LEVEL_BENEFITS.map(levelBenefit => {
            const thisLevelIndex = LEVELS.findIndex(l => l.name === levelBenefit.level);
            const isPassed = thisLevelIndex < currentLevelIndex;
            const isCurrent = thisLevelIndex === currentLevelIndex;
            const levelData = LEVELS[thisLevelIndex];
            return (
              <div key={levelBenefit.level} className={benefitCard} data-passed={isPassed ? "" : undefined} data-current={isCurrent ? "" : undefined}>
                <div className={benefitHead}>
                  <div className={benefitDot} style={{ background: levelData.color }} />
                  <p className={benefitLevel}>{levelBenefit.level}</p>
                </div>
                <ul className={benefitList}>
                  {levelBenefit.benefits.map((benefit, idx) => (
                    <li key={idx} className={benefitItem} data-on={isPassed || isCurrent ? "" : undefined}>
                      {benefit}
                    </li>
                  ))}
                </ul>
                {isCurrent && (
                  <div className={currentFoot}>
                    <span className={currentWide}>Your Current Level</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* How to Earn Points */}
      <div className={earnPanel}>
        {/* `mb` on a <p> never rendered under MUI either (globals.css resets p margins) — dropped. */}
        <p className={sectionTitle}>How to Earn Points &amp; Level Up</p>
        <div className={earnGrid}>
          {[
            { icon: "📋", title: "Complete Your Profile", desc: "Every profile step pays one-time XP — a finished profile reaches Silver on its own", pts: "+135 XP total" },
            { icon: "✅", title: "Complete Projects", desc: "Successfully complete projects — XP scales with order value", pts: "+51–100 XP per project" },
            { icon: "⭐", title: "Get High Ratings", desc: "Every review earns XP; higher ratings earn significantly more", pts: "+30–70 XP per review" },
          ].map(item => (
            <div className={earnCard} key={item.title}>
              <p className={earnIcon}>{item.icon}</p>
              <p className={earnTitle}>{item.title}</p>
              <p className={earnDesc}>{item.desc}</p>
              <p className={earnPts}>{item.pts}</p>
            </div>
          ))}
        </div>
        <div className={tipCard}>
          <p className={tipText}>
            <strong>💡 Pro Tip:</strong> Focus on delivering high-quality work and getting great reviews — a 5-star review gives up to 70 XP, more than completing a small order!
          </p>
        </div>
      </div>
    </div>
  );
}
