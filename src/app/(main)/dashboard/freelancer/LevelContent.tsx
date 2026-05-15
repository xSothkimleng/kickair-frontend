"use client";

import { useEffect, useState } from "react";
import { Box, Paper, Typography, LinearProgress, Grid, Chip, CircularProgress, Skeleton } from "@mui/material";
import { CheckCircleOutlined } from "@mui/icons-material";
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

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)", textAlign: "center" }}>
      <Typography sx={{ fontSize: 22, fontWeight: 700, color: "black", mb: 0.25 }}>{value}</Typography>
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: "rgba(0,0,0,0.7)", mb: sub ? 0.25 : 0 }}>{label}</Typography>
      {sub && <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.4)" }}>{sub}</Typography>}
    </Paper>
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
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Skeleton variant="rounded" height={280} sx={{ borderRadius: 4 }} />
        <Skeleton variant="rounded" height={120} sx={{ borderRadius: 4 }} />
        <Skeleton variant="rounded" height={320} sx={{ borderRadius: 4 }} />
      </Box>
    );
  }

  if (error || !stats) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
        <Typography sx={{ color: "rgba(0,0,0,0.5)", fontSize: 14 }}>{error ?? "No data available"}</Typography>
      </Box>
    );
  }

  const currentLevelIndex = LEVELS.findIndex(l => l.name === stats.level);
  const currentLevelData = LEVELS[currentLevelIndex];
  const nextLevelName = currentLevelIndex < LEVELS.length - 1 ? LEVELS[currentLevelIndex + 1].name : null;
  const isDiamond = stats.next_level_threshold === null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

      {/* Current Level Overview */}
      <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 4 }}>
        <Box sx={{ display: "flex", alignItems: "start", justifyContent: "space-between", mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: 28, fontWeight: 600, color: "black", mb: 1 }}>Freelancer Level</Typography>
            <Typography sx={{ fontSize: 13, color: "rgba(0, 0, 0, 0.6)" }}>
              Build your reputation and unlock exclusive benefits
            </Typography>
          </Box>
          <Box sx={{ px: 3, py: 1.5, background: currentLevelData.color, borderRadius: 3 }}>
            <Typography sx={{ fontSize: 11, color: "rgba(255, 255, 255, 0.8)", mb: 0.5 }}>Current Level</Typography>
            <Typography sx={{ fontSize: 24, fontWeight: 600, color: "white" }}>{stats.level}</Typography>
          </Box>
        </Box>

        {/* Progress bar */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
            <Box>
              <Typography sx={{ fontSize: 13, color: "rgba(0, 0, 0, 0.8)", fontWeight: 500, mb: 0.5 }}>
                {stats.xp_points.toLocaleString()} XP
                {!isDiamond && ` / ${stats.next_level_threshold!.toLocaleString()} XP`}
              </Typography>
              <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>
                {isDiamond
                  ? "You've reached the top level!"
                  : `${stats.points_to_next_level.toLocaleString()} points to ${nextLevelName}`}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black" }}>
              {stats.level_progress_percent}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={stats.level_progress_percent}
            sx={{
              height: 12,
              borderRadius: 10,
              bgcolor: "rgba(0, 0, 0, 0.05)",
              "& .MuiLinearProgress-bar": {
                background: "linear-gradient(90deg, #0071e3 0%, #0077ED 100%)",
                borderRadius: 10,
              },
            }}
          />
        </Box>

        {/* Level Progression chips */}
        <Grid container spacing={1.5}>
          {LEVELS.map((level, idx) => {
            const isPassed = idx < currentLevelIndex;
            const isCurrent = idx === currentLevelIndex;
            return (
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={level.name}>
                <Box
                  sx={{
                    position: "relative",
                    p: 2,
                    borderRadius: 3,
                    border: "2px solid",
                    borderColor: isCurrent ? "black" : isPassed ? "rgba(34, 197, 94, 0.3)" : "rgba(0, 0, 0, 0.1)",
                    bgcolor: isCurrent ? "rgba(0, 0, 0, 0.05)" : isPassed ? "rgba(34, 197, 94, 0.05)" : "white",
                    transition: "all 0.3s",
                  }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: "50%", background: level.color, mb: 1 }} />
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: "black", mb: 0.5 }}>{level.name}</Typography>
                  <Typography sx={{ fontSize: 10, color: "rgba(0, 0, 0, 0.6)" }}>{level.minPoints.toLocaleString()} pts</Typography>
                  {isPassed && (
                    <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                      <CheckCircleOutlined sx={{ fontSize: 20, color: "#16a34a" }} />
                    </Box>
                  )}
                  {isCurrent && (
                    <Chip
                      label="Current"
                      sx={{
                        position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                        height: 20, bgcolor: "black", color: "white", fontSize: 9, fontWeight: 500,
                      }}
                    />
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Quick stats row */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            label="Completed Orders"
            value={stats.completed_orders_count}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            label="Success Rate"
            value={`${stats.success_rate}%`}
            sub={`${stats.cancellation_count} cancelled`}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            label="Avg Rating"
            value={stats.rating_count > 0 ? parseFloat(stats.rating_average ?? "0").toFixed(1) : "—"}
            sub={stats.rating_count > 0 ? `${stats.rating_count} review${stats.rating_count !== 1 ? "s" : ""}` : "No reviews yet"}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            label="Total Earnings"
            value={`$${parseFloat(stats.total_earnings).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          />
        </Grid>
      </Grid>

      {/* Performance Metrics — TODO: wire to real API data */}
      {/* <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 4 }}>
        ...
      </Paper> */}

      {/* Achievements & Badges — TODO: wire to real API data */}
      {/* <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 4 }}>
        ...
      </Paper> */}

      {/* Level Benefits */}
      <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 4 }}>
        <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black", mb: 1 }}>Level Benefits</Typography>
        <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 3 }}>
          See what you unlock as you progress through levels
        </Typography>
        <Grid container spacing={2}>
          {LEVEL_BENEFITS.map(levelBenefit => {
            const thisLevelIndex = LEVELS.findIndex(l => l.name === levelBenefit.level);
            const isPassed = thisLevelIndex < currentLevelIndex;
            const isCurrent = thisLevelIndex === currentLevelIndex;
            const levelData = LEVELS[thisLevelIndex];
            return (
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={levelBenefit.level}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5, borderRadius: 3, border: "2px solid", height: "100%",
                    borderColor: isCurrent ? "black" : isPassed ? "rgba(34, 197, 94, 0.2)" : "rgba(0, 0, 0, 0.1)",
                    bgcolor: isCurrent ? "rgba(0, 0, 0, 0.05)" : isPassed ? "rgba(34, 197, 94, 0.05)" : "white",
                  }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <Box sx={{ width: 24, height: 24, borderRadius: "50%", background: levelData.color }} />
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: "black" }}>{levelBenefit.level}</Typography>
                  </Box>
                  <Box component="ul" sx={{ m: 0, p: 0, pl: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                    {levelBenefit.benefits.map((benefit, idx) => (
                      <Box
                        component="li" key={idx}
                        sx={{ fontSize: 11, color: isPassed || isCurrent ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.4)", lineHeight: 1.5 }}>
                        {benefit}
                      </Box>
                    ))}
                  </Box>
                  {isCurrent && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid rgba(0,0,0,0.1)" }}>
                      <Chip
                        label="Your Current Level"
                        sx={{ width: "100%", height: 24, bgcolor: "black", color: "white", fontSize: 9, fontWeight: 500 }}
                      />
                    </Box>
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* How to Earn Points */}
      <Paper
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)",
          border: "1px solid rgba(37, 99, 235, 0.2)",
          borderRadius: 4,
          p: 4,
        }}>
        <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black", mb: 3 }}>How to Earn Points & Level Up</Typography>
        <Grid container spacing={2}>
          {[
            { icon: "✅", title: "Complete Projects", desc: "Successfully complete projects — XP scales with order value", pts: "+10–50 XP per project" },
            { icon: "⭐", title: "Get High Ratings", desc: "Every review earns XP; higher ratings earn significantly more", pts: "+30–70 XP per review" },
            { icon: "💰", title: "Increase Earnings", desc: "Higher-value orders unlock bigger XP bonuses per project", pts: "Scales with order price" },
          ].map(item => (
            <Grid size={{ xs: 12, sm: 4 }} key={item.title}>
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, bgcolor: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
                <Typography sx={{ fontSize: 24, mb: 1 }}>{item.icon}</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "black", mb: 1 }}>{item.title}</Typography>
                <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.7)", mb: 1 }}>{item.desc}</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#3b82f6" }}>{item.pts}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Paper elevation={0} sx={{ mt: 3, p: 2, borderRadius: 3, bgcolor: "rgba(255,255,255,0.8)" }}>
          <Typography sx={{ fontSize: 12, color: "rgba(0,0,0,0.8)" }}>
            <strong>💡 Pro Tip:</strong> Focus on delivering high-quality work and getting great reviews — a 5-star review gives up to 70 XP, more than completing a small order!
          </Typography>
        </Paper>
      </Paper>
    </Box>
  );
}
