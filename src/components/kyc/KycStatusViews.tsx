"use client";

import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import {
  AccessTimeOutlined,
  VerifiedOutlined,
  ErrorOutline,
  LockOutlined,
  Check,
  ReplayOutlined,
  CenterFocusStrongOutlined,
  WbSunnyOutlined,
  CalendarTodayOutlined,
} from "@mui/icons-material";
import { C } from "./tokens";

const primarySx = { width: "100%", height: 50, borderRadius: 2.75, fontSize: 16, fontWeight: 600, textTransform: "none", bgcolor: C.accent, color: "#fff", boxShadow: "none", "&:hover": { bgcolor: C.accentH, boxShadow: "none" } } as const;

function ResultCard({ children, footer }: { children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <Paper elevation={0} sx={{ maxWidth: 480, mx: "auto", borderRadius: 4, border: `1px solid ${C.border}`, overflow: "hidden", bgcolor: "#fff" }}>
      <Box sx={{ p: "26px 22px 18px" }}>{children}</Box>
      {footer && <Box sx={{ p: "14px 22px 18px", borderTop: `1px solid ${C.border}` }}>{footer}</Box>}
    </Paper>
  );
}

function ResultIcon({ tone, children }: { tone: "amber" | "green" | "red"; children: React.ReactNode }) {
  const map = { amber: [C.amber, C.amberBg, C.amberBd], green: [C.green, C.greenBg, C.greenBd], red: [C.red, C.redBg, C.redBd] } as const;
  const [c, bg, bd] = map[tone];
  return (
    <Box sx={{ display: "flex", justifyContent: "center", mb: 2.5 }}>
      <Box sx={{ width: 88, height: 88, borderRadius: 6, bgcolor: bg, color: c, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `inset 0 0 0 1px ${bd}` }}>{children}</Box>
    </Box>
  );
}

function Heading({ title, sub }: { title: string; sub: string }) {
  return (
    <Box sx={{ textAlign: "center", mb: 2.5 }}>
      <Typography component="h1" sx={{ m: 0, mb: 0.9, fontSize: 22, fontWeight: 700, color: C.heading, letterSpacing: "-.02em" }}>{title}</Typography>
      <Typography sx={{ m: 0, fontSize: 14.5, color: C.muted, lineHeight: 1.5 }}>{sub}</Typography>
    </Box>
  );
}

export function KycPendingView({ docTypeLabel, submittedAt, onDone }: { docTypeLabel: string | null; submittedAt: string | null; onDone: () => void }) {
  const submitted = submittedAt ? new Date(submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;
  return (
    <ResultCard footer={<Button onClick={onDone} sx={primarySx}>Back to KickAir</Button>}>
      <ResultIcon tone="amber"><AccessTimeOutlined sx={{ fontSize: 40 }} /></ResultIcon>
      <Heading title="We're reviewing your documents" sub="Thanks — everything's been submitted. We'll notify you once it's reviewed, usually within 1–2 business days." />
      <Stack direction="row" alignItems="center" gap={1.25} sx={{ p: "13px 15px", borderRadius: 3, bgcolor: C.amberBg, border: `1px solid ${C.amberBd}` }}>
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.9, height: 26, px: 1.4, borderRadius: 999, bgcolor: "#fff", color: C.amber, fontSize: 12.5, fontWeight: 600, flexShrink: 0 }}>
          <Box component="span" sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#F59E0B" }} />Pending review
        </Box>
        {submitted && <Typography sx={{ fontSize: 12.5, color: C.amber }}>Submitted {submitted}</Typography>}
      </Stack>
      {docTypeLabel && (
        <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 1.75, color: C.muted }}>
          <LockOutlined sx={{ fontSize: 15 }} />
          <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>{docTypeLabel} · locked while we review</Typography>
        </Stack>
      )}
      <Typography sx={{ mt: 1.75, fontSize: 12.5, color: C.muted, lineHeight: 1.55, textAlign: "center" }}>
        You can keep using KickAir while you wait. Some actions stay limited until you&apos;re verified.
      </Typography>
    </ResultCard>
  );
}

export function KycApprovedView({ onDone }: { onDone: () => void }) {
  return (
    <ResultCard footer={<Button onClick={onDone} sx={primarySx}>Start using KickAir</Button>}>
      <ResultIcon tone="green"><VerifiedOutlined sx={{ fontSize: 44 }} /></ResultIcon>
      <Heading title="You're verified" sub="Your identity has been confirmed. You now have full access to everything on KickAir." />
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <Stack direction="row" alignItems="center" gap={0.9} sx={{ px: 1.75, height: 32, borderRadius: 999, bgcolor: C.greenBg, border: `1px solid ${C.greenBd}`, color: C.green, fontSize: 13, fontWeight: 600 }}>
          <Check sx={{ fontSize: 15 }} />Identity verified
        </Stack>
      </Box>
      <Box sx={{ border: `1px solid ${C.border}`, borderRadius: 3.25, px: 2 }}>
        <Typography sx={{ fontSize: 11.5, fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase", color: C.muted, mt: 1.25, mb: 0.25 }}>Now unlocked</Typography>
        {["Withdraw earnings and get paid", "Place and accept orders without limits", "A verified badge on your profile"].map((t, i) => (
          <Stack key={t} direction="row" alignItems="center" gap={1.4} sx={{ py: 1.25, borderTop: i ? `1px solid ${C.border}` : "none" }}>
            <Box sx={{ flexShrink: 0, width: 30, height: 30, borderRadius: 2.25, bgcolor: C.greenBg, color: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}><Check sx={{ fontSize: 16 }} /></Box>
            <Typography sx={{ fontSize: 14, color: C.body }}>{t}</Typography>
          </Stack>
        ))}
      </Box>
    </ResultCard>
  );
}

export function KycRejectedView({ reason, onResubmit }: { reason: string | null; onResubmit: () => void }) {
  return (
    <ResultCard
      footer={
        <>
          <Button onClick={onResubmit} startIcon={<ReplayOutlined />} sx={primarySx}>Resubmit documents</Button>
          <Typography sx={{ mt: 1.4, fontSize: 12, color: C.muted, lineHeight: 1.5, textAlign: "center" }}>
            Need help? <Box component="span" sx={{ color: C.accent, fontWeight: 600 }}>Contact support</Box>
          </Typography>
        </>
      }
    >
      <ResultIcon tone="red"><ErrorOutline sx={{ fontSize: 40 }} /></ResultIcon>
      <Heading title="We couldn't verify your identity" sub="Don't worry — this happens. Fix the issue below and submit again." />
      {reason && (
        <Stack direction="row" gap={1.4} sx={{ p: "14px 16px", borderRadius: 3.25, bgcolor: C.redBg, border: `1px solid ${C.redBd}` }}>
          <ErrorOutline sx={{ fontSize: 18, color: C.red, flexShrink: 0, mt: "1px" }} />
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#B91C1C", mb: 0.5 }}>Reason from our review team</Typography>
            <Typography sx={{ fontSize: 13.5, color: "#7F1D1D", lineHeight: 1.55 }}>{reason}</Typography>
          </Box>
        </Stack>
      )}
      <Box sx={{ mt: 2, border: `1px solid ${C.border}`, borderRadius: 3.25, px: 2 }}>
        <Typography sx={{ fontSize: 11.5, fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase", color: C.muted, mt: 1.5, mb: 0.25 }}>Before you resubmit</Typography>
        {[["Use a current, non-expired document", <CalendarTodayOutlined key="a" sx={{ fontSize: 16 }} />], ["Make sure every corner is visible", <CenterFocusStrongOutlined key="b" sx={{ fontSize: 16 }} />], ["Avoid glare and shadows", <WbSunnyOutlined key="c" sx={{ fontSize: 16 }} />]].map(([t, ic]) => (
          <Stack key={t as string} direction="row" alignItems="center" gap={1.4} sx={{ py: 1.25 }}>
            <Box sx={{ flexShrink: 0, width: 28, height: 28, borderRadius: 2, bgcolor: C.fill, color: C.body, display: "flex", alignItems: "center", justifyContent: "center" }}>{ic as React.ReactNode}</Box>
            <Typography sx={{ fontSize: 13.5, color: C.body }}>{t as string}</Typography>
          </Stack>
        ))}
      </Box>
    </ResultCard>
  );
}
