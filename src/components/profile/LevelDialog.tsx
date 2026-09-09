"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Check, ChevronRight } from "lucide-react";
import { css, cva } from "styled-system/css";
import { Modal, Dialog, IconButton, Progress, Spinner, button } from "@/components/ds";
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

// Modal body pads 24px/16px; this brings it to the original 22px top / 24px bottom.
const bodyPad = css({ pt: "6px", pb: "8px" });
const header = css({ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: "16px" });
const title = css({ m: 0, fontSize: "20px", fontWeight: 600, letterSpacing: "-0.02em", color: "ink" });
const errorText = css({ fontSize: "13.5px", color: "ink2", py: "32px", textAlign: "center" });
const spinnerWrap = css({ display: "flex", justifyContent: "center", py: "48px" });
const levelCard = css({ p: "16px", borderRadius: "12px", borderWidth: "1px", borderStyle: "solid", borderColor: "hairline", bg: "surface2", mb: "18px" });
const levelRow = css({ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "10px" });
const xpText = css({ fontSize: "13.5px", fontWeight: 600, fontFamily: "mono" });
// Nested selector (higher specificity) so the 8px/track colour win over the ds Progress defaults deterministically.
const progressWrap = css({ "& [role=progressbar]": { h: "8px", bg: "rgba(0,0,0,0.07)" } });
const nextText = css({ fontSize: "11.5px", color: "ink3", mt: "6px" });
const stepsHeading = css({ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "ink3", mb: "6px" });
const stepsList = css({ display: "flex", flexDirection: "column", mb: "16px" });
const stepRow = cva({
  base: { display: "flex", alignItems: "center", gap: "10px", py: "8px", px: "8px", mx: "-8px", borderRadius: "8px" },
  variants: { done: { true: { cursor: "default" }, false: { cursor: "pointer", _hover: { bg: "surface2" } } } },
});
const doneMark = css({ w: "18px", h: "18px", borderRadius: "50%", bg: "success", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" });
const openMark = css({ w: "18px", h: "18px", borderRadius: "50%", borderWidth: "1.5px", borderStyle: "solid", borderColor: "hairlineStrong", flex: "none" });
const stepLabel = cva({
  base: { fontSize: "13.5px", flex: 1 },
  variants: { done: { true: { color: "ink3", textDecoration: "line-through" }, false: { color: "ink", textDecoration: "none" } } },
});
const stepXp = cva({
  base: { fontSize: "11.5px", fontWeight: 600, fontFamily: "mono" },
  variants: { done: { true: { color: "ink3" }, false: { color: "successText" } } },
});
const chevron = css({ color: "ink3" });
const beyondBox = css({ p: "12px", borderRadius: "10px", bg: "surface2", borderWidth: "1px", borderStyle: "solid", borderColor: "hairline" });
const beyondText = css({ fontSize: "12px", color: "ink2", lineHeight: 1.55 });
const fullPageBtn = css(button.raw({ variant: "solid", size: "sm", full: true }), { mt: "16px", h: "40px", fontSize: "13.5px", borderRadius: "pill", color: "ink", bg: "rgba(0,0,0,0.05)", _hover: { bg: "rgba(0,0,0,0.09)" } });

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
    <Modal open={open} onOpenChange={o => { if (!o) onClose(); }} size="sm" showClose={false}>
      <div className={bodyPad}>
        {/* header (title lives in the body — no header bar) */}
        <div className={header}>
          <Dialog.Title className={title}>Your level</Dialog.Title>
          <Dialog.CloseTrigger asChild>
            <IconButton size="sm" aria-label="Close"><X size={20} /></IconButton>
          </Dialog.CloseTrigger>
        </div>

        {error ? (
          <p className={errorText}>
            Couldn&apos;t load your level right now. Please try again.
          </p>
        ) : !stats ? (
          <div className={spinnerWrap}><Spinner size={24} /></div>
        ) : (
          <>
            {/* level + progress */}
            <div className={levelCard}>
              <div className={levelRow}>
                <LevelBadge level={stats.level} />
                <p className={xpText}>
                  {stats.xp_points.toLocaleString()} XP
                </p>
              </div>
              <div className={progressWrap}>
                <Progress value={stats.level_progress_percent} />
              </div>
              <p className={nextText}>
                {stats.next_level_threshold != null
                  ? `${stats.points_to_next_level.toLocaleString()} XP to the next level`
                  : "Top level reached — legend."}
              </p>
            </div>

            {/* steps checklist */}
            <p className={stepsHeading}>
              Complete your profile · {stepXpDone}/{stepXpTotal} XP earned
            </p>
            <div className={stepsList}>
              {[...openSteps, ...doneSteps].map(step => (
                <div
                  key={step.key}
                  onClick={step.done ? undefined : () => go(STEP_ROUTES[step.key] ?? "/dashboard/freelancer?tab=profile")}
                  className={stepRow({ done: step.done })}>
                  {step.done ? (
                    <div className={doneMark}><Check size={13} /></div>
                  ) : (
                    <div className={openMark} />
                  )}
                  <p className={stepLabel({ done: step.done })}>{step.label}</p>
                  <p className={stepXp({ done: step.done })}>+{step.xp} XP</p>
                  {!step.done && <ChevronRight size={16} className={chevron} />}
                </div>
              ))}
            </div>

            {/* beyond the profile */}
            <div className={beyondBox}>
              <p className={beyondText}>
                Beyond your profile: completing orders and earning reviews keeps the XP coming — bigger orders and better ratings pay more.
              </p>
            </div>

            <button type="button" onClick={() => go("/dashboard/freelancer?tab=level")} className={fullPageBtn}>
              Open the full Level page
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
