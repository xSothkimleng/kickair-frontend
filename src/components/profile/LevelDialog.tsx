"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Button,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import { Close, CheckRounded, ChevronRight } from "@mui/icons-material";
import { tokens } from "@/theme";
import { api } from "@/lib/api";
import { LevelStats } from "@/types/dashboard";
import { LevelBadge } from "@/components/profile/profileKit";

/** Where each profile step gets completed. */
const STEP_ROUTES: Record<string, string> = {
  avatar: "/dashboard/freelancer?tab=profile",
  tagline: "/dashboard/freelancer?tab=profile",
  about: "/dashboard/freelancer?tab=profile",
  location: "/dashboard/freelancer?tab=profile",
  skills: "/dashboard/freelancer?tab=profile",
  language: "/dashboard/freelancer?tab=profile",
  education: "/dashboard/freelancer?tab=profile",
  certificate: "/dashboard/freelancer?tab=profile",
  portfolio: "/dashboard/freelancer?tab=profile",
  phone: "/settings",
  kyc: "/dashboard/kyc",
  service: "/dashboard/freelancer?tab=services",
};

/**
 * "Your level" popup: current level + XP progress, plus the complete
 * profile-step checklist — every step pays one-time XP, so finishing the
 * profile alone reaches Silver; orders and reviews carry you beyond.
 */
export default function LevelDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [stats, setStats] = useState<LevelStats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    api.getLevelStats()
      .then(s => { if (active) { setStats(s); setError(false); } })
      .catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [open]);

  const go = (route: string) => {
    onClose();
    router.push(route);
  };

  const doneSteps = stats?.steps.filter(s => s.done) ?? [];
  const openSteps = stats?.steps.filter(s => !s.done) ?? [];
  const stepXpTotal = stats?.steps.reduce((sum, s) => sum + s.xp, 0) ?? 0;
  const stepXpDone = doneSteps.reduce((sum, s) => sum + s.xp, 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: "16px", border: `1px solid ${tokens.border}` } }}>
      <DialogContent sx={{ p: "22px 24px 24px" }}>
        {/* header (title lives in the body — no DialogTitle bar) */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Typography sx={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em" }}>Your level</Typography>
          <IconButton onClick={onClose} size="small"><Close sx={{ fontSize: 20 }} /></IconButton>
        </Box>

        {error ? (
          <Typography sx={{ fontSize: 13.5, color: tokens.text2, py: 4, textAlign: "center" }}>
            Couldn&apos;t load your level right now. Please try again.
          </Typography>
        ) : !stats ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress size={24} /></Box>
        ) : (
          <>
            {/* level + progress */}
            <Box sx={{ p: 2, borderRadius: "12px", border: `1px solid ${tokens.border}`, bgcolor: tokens.surface2, mb: 2.25 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.25 }}>
                <LevelBadge level={stats.level} />
                <Typography sx={{ fontSize: 13.5, fontWeight: 600, fontFamily: tokens.mono }}>
                  {stats.xp_points.toLocaleString()} XP
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={stats.level_progress_percent}
                sx={{ height: 8, borderRadius: "999px", bgcolor: "rgba(0,0,0,0.07)", "& .MuiLinearProgress-bar": { borderRadius: "999px", bgcolor: tokens.accent } }}
              />
              <Typography sx={{ fontSize: 11.5, color: tokens.text3, mt: 0.75 }}>
                {stats.next_level_threshold != null
                  ? `${stats.points_to_next_level.toLocaleString()} XP to the next level`
                  : "Top level reached — legend."}
              </Typography>
            </Box>

            {/* steps checklist */}
            <Typography sx={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: tokens.text3, mb: 0.75 }}>
              Complete your profile · {stepXpDone}/{stepXpTotal} XP earned
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
              {[...openSteps, ...doneSteps].map(step => (
                <Box
                  key={step.key}
                  onClick={step.done ? undefined : () => go(STEP_ROUTES[step.key] ?? "/dashboard/freelancer?tab=profile")}
                  sx={{
                    display: "flex", alignItems: "center", gap: 1.25, py: 1, px: 1,
                    mx: -1, borderRadius: "8px",
                    cursor: step.done ? "default" : "pointer",
                    "&:hover": step.done ? undefined : { bgcolor: tokens.surface2 },
                  }}>
                  {step.done ? (
                    <Box sx={{ width: 18, height: 18, borderRadius: "50%", bgcolor: tokens.success, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                      <CheckRounded sx={{ fontSize: 13, color: "#fff" }} />
                    </Box>
                  ) : (
                    <Box sx={{ width: 18, height: 18, borderRadius: "50%", border: `1.5px solid ${tokens.borderStrong}`, flex: "none" }} />
                  )}
                  <Typography sx={{ fontSize: 13.5, flex: 1, color: step.done ? tokens.text3 : tokens.text, textDecoration: step.done ? "line-through" : "none" }}>
                    {step.label}
                  </Typography>
                  <Typography sx={{ fontSize: 11.5, fontWeight: 600, fontFamily: tokens.mono, color: step.done ? tokens.text3 : tokens.successText }}>
                    +{step.xp} XP
                  </Typography>
                  {!step.done && <ChevronRight sx={{ fontSize: 16, color: tokens.text3 }} />}
                </Box>
              ))}
            </Box>

            {/* beyond the profile */}
            <Box sx={{ p: 1.5, borderRadius: "10px", bgcolor: tokens.surface2, border: `1px solid ${tokens.border}` }}>
              <Typography sx={{ fontSize: 12, color: tokens.text2, lineHeight: 1.55 }}>
                Beyond your profile: completing orders and earning reviews keeps the XP coming — bigger orders and better ratings pay more.
              </Typography>
            </Box>

            <Button
              fullWidth
              onClick={() => go("/dashboard/freelancer?tab=level")}
              sx={{ mt: 2, textTransform: "none", fontWeight: 600, fontSize: 13.5, borderRadius: "999px", color: tokens.text, bgcolor: "rgba(0,0,0,0.05)", height: 40, "&:hover": { bgcolor: "rgba(0,0,0,0.09)" } }}>
              Open the full Level page
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
