"use client";

import { useRef, useState } from "react";
import { Box, Button, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import {
  ArrowBackIosNew,
  LockOutlined,
  CameraAltOutlined,
  CloudUploadOutlined,
  ReplayOutlined,
  Check,
  ChevronRight,
  ShieldOutlined,
  AccessTimeOutlined,
  BadgeOutlined,
  MenuBookOutlined,
  CreditCardOutlined,
  CenterFocusStrongOutlined,
  WbSunnyOutlined,
  CalendarTodayOutlined,
  HelpOutline,
  VideocamOffOutlined,
} from "@mui/icons-material";
import { api } from "@/lib/api";
import { KycDocumentType } from "@/types/user";
import { C, useObjectUrl } from "./tokens";
import CameraCapture from "./CameraCapture";

type DocType = { id: KycDocumentType; label: string; short: string; desc: string; kind: "card" | "passport"; icon: React.ReactNode };

const DOC_TYPES: DocType[] = [
  { id: "national_id", label: "National ID", short: "ID", desc: "Government-issued ID card", kind: "card", icon: <BadgeOutlined /> },
  { id: "passport", label: "Passport", short: "passport", desc: "Just the photo page", kind: "passport", icon: <MenuBookOutlined /> },
  { id: "drivers_license", label: "Driver's License", short: "license", desc: "Front and back", kind: "card", icon: <CreditCardOutlined /> },
];

type Step = "intro" | "doctype" | "capture" | "selfie" | "review";

// ─── Frame + shared bits ────────────────────────────────────────────────────────

function WizardFrame({ stepNum, onBack, children, footer }: { stepNum?: number; onBack?: () => void; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <Paper elevation={0} sx={{ maxWidth: 480, mx: "auto", borderRadius: 4, border: `1px solid ${C.border}`, overflow: "hidden", bgcolor: "#fff" }}>
      {stepNum != null && (
        <Box sx={{ px: 2.25, pt: 1.5, pb: 1.75, borderBottom: `1px solid ${C.border}` }}>
          <Stack direction="row" alignItems="center" sx={{ height: 32 }}>
            {onBack ? (
              <Button onClick={onBack} aria-label="Back" sx={{ minWidth: 0, width: 34, height: 34, ml: -1, borderRadius: 2, color: C.body }}>
                <ArrowBackIosNew sx={{ fontSize: 16 }} />
              </Button>
            ) : (
              <Box sx={{ width: 26 }} />
            )}
            <Typography sx={{ flex: 1, textAlign: "center", fontSize: 13, fontWeight: 600, color: C.muted }}>Step {stepNum} of 4</Typography>
            <Box sx={{ width: 26 }} />
          </Stack>
          <Stack direction="row" gap={0.65} sx={{ mt: 1.4 }}>
            {[1, 2, 3, 4].map((i) => (
              <Box key={i} sx={{ flex: 1, height: 4, borderRadius: 999, bgcolor: i <= stepNum ? C.accent : C.border, transition: "background .35s ease" }} />
            ))}
          </Stack>
        </Box>
      )}
      <Box sx={{ p: "22px 22px 18px" }}>{children}</Box>
      {footer && <Box sx={{ p: "14px 22px 18px", borderTop: `1px solid ${C.border}` }}>{footer}</Box>}
    </Paper>
  );
}

function Title({ title, sub, center }: { title: string; sub?: string; center?: boolean }) {
  return (
    <Box sx={{ mb: 2.5, textAlign: center ? "center" : "left" }}>
      <Typography component="h1" sx={{ m: 0, mb: 0.9, fontSize: 22, fontWeight: 700, color: C.heading, letterSpacing: "-.02em", lineHeight: 1.2 }}>{title}</Typography>
      {sub && <Typography sx={{ m: 0, fontSize: 14.5, color: C.muted, lineHeight: 1.5 }}>{sub}</Typography>}
    </Box>
  );
}

function Reassure() {
  return (
    <Stack direction="row" alignItems="center" justifyContent="center" gap={0.9} sx={{ mb: 1.4, color: C.muted }}>
      <LockOutlined sx={{ fontSize: 15, color: C.accent }} />
      <Typography sx={{ fontSize: 12, lineHeight: 1.4, textAlign: "center" }}>Your documents are encrypted and used only to verify your identity.</Typography>
    </Stack>
  );
}

const primarySx = { width: "100%", height: 50, borderRadius: 2.75, fontSize: 16, fontWeight: 600, textTransform: "none", bgcolor: C.accent, color: "#fff", boxShadow: "none", "&:hover": { bgcolor: C.accentH, boxShadow: "none" }, "&.Mui-disabled": { bgcolor: C.fill, color: C.ph } } as const;
const secondarySx = { width: "100%", height: 48, borderRadius: 2.75, fontSize: 15, fontWeight: 600, textTransform: "none", bgcolor: "#fff", color: C.body, border: `1px solid ${C.borderH}`, "&:hover": { bgcolor: "#F8FAFC" } } as const;

// ─── Intro ──────────────────────────────────────────────────────────────────────

function IntroStep({ rejection, onStart }: { rejection?: string | null; onStart: () => void }) {
  return (
    <WizardFrame footer={<><Reassure /><Button onClick={onStart} endIcon={<ChevronRight />} sx={primarySx}>{rejection ? "Start over" : "Get started"}</Button></>}>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2.5, mt: 0.5 }}>
        <Box sx={{ width: 72, height: 72, borderRadius: 5, background: `linear-gradient(135deg, ${C.accent} 0%, #339bff 100%)`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 22px rgba(0,113,227,.30)" }}>
          <ShieldOutlined sx={{ fontSize: 36 }} />
        </Box>
      </Box>
      <Title center title="Verify your identity" sub="A quick check keeps KickAir safe for everyone. It usually takes about 2 minutes." />

      {rejection && (
        <Box sx={{ mb: 2, p: "12px 14px", borderRadius: 2.75, bgcolor: C.redBg, border: `1px solid ${C.redBd}`, display: "flex", gap: 1.1 }}>
          <Box sx={{ color: C.red, mt: "1px" }}>•</Box>
          <Box>
            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#B91C1C", mb: 0.3 }}>Your last submission was rejected</Typography>
            <Typography sx={{ fontSize: 13, color: "#7F1D1D", lineHeight: 1.5 }}>{rejection}</Typography>
          </Box>
        </Box>
      )}

      <Box sx={{ border: `1px solid ${C.border}`, borderRadius: 3.5, px: 2 }}>
        {[
          { icon: <BadgeOutlined />, title: "A government-issued ID", sub: "National ID, passport or driver's license" },
          { icon: <CameraAltOutlined />, title: "A quick live selfie", sub: "So we know it's really you" },
          { icon: <AccessTimeOutlined />, title: "About 2 minutes", sub: "We'll review it within 1–2 business days" },
        ].map((it, i) => (
          <Stack key={it.title} direction="row" alignItems="center" gap={1.6} sx={{ py: 1.5, borderTop: i ? `1px solid ${C.border}` : "none" }}>
            <Box sx={{ flexShrink: 0, width: 42, height: 42, borderRadius: 3, bgcolor: C.fill, color: C.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>{it.icon}</Box>
            <Box>
              <Typography sx={{ fontSize: 14.5, fontWeight: 600, color: C.heading }}>{it.title}</Typography>
              <Typography sx={{ fontSize: 13, color: C.muted }}>{it.sub}</Typography>
            </Box>
          </Stack>
        ))}
      </Box>
    </WizardFrame>
  );
}

// ─── Step 1: document type ───────────────────────────────────────────────────────

function DocTypeStep({ value, onChange, onBack, onContinue }: { value: KycDocumentType | null; onChange: (id: KycDocumentType) => void; onBack: () => void; onContinue: () => void }) {
  return (
    <WizardFrame stepNum={1} onBack={onBack} footer={<><Reassure /><Button disabled={!value} onClick={onContinue} endIcon={<ChevronRight />} sx={primarySx}>Continue</Button></>}>
      <Title title="Choose your document" sub="Pick the ID you'd like to verify with. Make sure it's current and not expired." />
      <Stack gap={1.4}>
        {DOC_TYPES.map((t) => {
          const selected = value === t.id;
          return (
            <Box
              key={t.id}
              component="button"
              onClick={() => onChange(t.id)}
              aria-pressed={selected}
              sx={{ display: "flex", alignItems: "center", gap: 1.9, width: "100%", textAlign: "left", p: "16px", borderRadius: 3.25, cursor: "pointer", fontFamily: "inherit", bgcolor: selected ? C.accentBg : "#fff", border: `1.5px solid ${selected ? C.accent : C.border}`, transition: "border-color .15s, background .15s", "&:hover": { borderColor: selected ? C.accent : C.borderH } }}
            >
              <Box sx={{ flexShrink: 0, width: 52, height: 52, borderRadius: 3.25, bgcolor: selected ? "#fff" : C.fill, color: selected ? C.accent : C.body, display: "flex", alignItems: "center", justifyContent: "center" }}>{t.icon}</Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 15.5, fontWeight: 600, color: C.heading }}>{t.label}</Typography>
                <Typography sx={{ fontSize: 13, color: C.muted }}>{t.desc}</Typography>
              </Box>
              <Box sx={{ flexShrink: 0, width: 23, height: 23, borderRadius: "50%", border: `2px solid ${selected ? C.accent : C.borderH}`, bgcolor: selected ? C.accent : "#fff", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {selected && <Check sx={{ fontSize: 15 }} />}
              </Box>
            </Box>
          );
        })}
      </Stack>
    </WizardFrame>
  );
}

// ─── Step 2: document capture ────────────────────────────────────────────────────

function UploadTile({ label, file, onFile, onClear }: { label: string; file: File | null; onFile: (f: File) => void; onClear: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const url = useObjectUrl(file);
  return (
    <Box>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: C.body, mb: 1 }}>{label}</Typography>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
      {file && url ? (
        <Box>
          <Box sx={{ position: "relative", borderRadius: 2.75, overflow: "hidden", border: `1.5px solid ${C.greenBd}` }}>
            <Box component="img" src={url} alt={label} sx={{ width: "100%", aspectRatio: "1.55 / 1", objectFit: "cover", display: "block" }} />
            <Box sx={{ position: "absolute", top: 7, right: 7, width: 24, height: 24, borderRadius: "50%", bgcolor: C.green, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><Check sx={{ fontSize: 15 }} /></Box>
          </Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
            <Stack direction="row" alignItems="center" gap={0.6} sx={{ color: C.green }}>
              <Check sx={{ fontSize: 15 }} />
              <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>Looks good</Typography>
            </Stack>
            <Button onClick={onClear} startIcon={<ReplayOutlined sx={{ fontSize: 15 }} />} sx={{ textTransform: "none", fontSize: 13.5, fontWeight: 600, color: C.accent, minWidth: 0 }}>Retake</Button>
          </Stack>
        </Box>
      ) : (
        <Box
          component="button"
          onClick={() => inputRef.current?.click()}
          sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", aspectRatio: "1.55 / 1", borderRadius: 2.75, cursor: "pointer", fontFamily: "inherit", bgcolor: C.fill, border: `2px dashed ${C.borderH}`, transition: "all .15s", "&:hover": { bgcolor: C.accentBg, borderColor: C.accent } }}
        >
          <CameraAltOutlined sx={{ fontSize: 24, color: C.muted, mb: 1 }} />
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: C.heading }}>Add a photo</Typography>
          <Typography sx={{ fontSize: 11.5, color: C.muted, mt: 0.5 }}>Show all 4 corners</Typography>
        </Box>
      )}
    </Box>
  );
}

function CaptureStep({ docType, front, back, setFront, setBack, onBack, onContinue }: { docType: DocType; front: File | null; back: File | null; setFront: (f: File | null) => void; setBack: (f: File | null) => void; onBack: () => void; onContinue: () => void }) {
  const isCard = docType.kind === "card";
  const done = front != null && (!isCard || back != null);
  return (
    <WizardFrame stepNum={2} onBack={onBack} footer={<><Reassure /><Button disabled={!done} onClick={onContinue} endIcon={<ChevronRight />} sx={primarySx}>Continue</Button></>}>
      <Title title={`Photograph your ${docType.short}`} sub={isCard ? "Capture both sides on a flat surface with good lighting." : "Capture the photo page — the one with your picture and details."} />
      <Box sx={{ display: "grid", gridTemplateColumns: isCard ? "1fr 1fr" : "1fr", gap: 1.5, maxWidth: isCard ? "none" : 320 }}>
        <UploadTile label={isCard ? "Front" : "Photo page"} file={front} onFile={setFront} onClear={() => setFront(null)} />
        {isCard && <UploadTile label="Back" file={back} onFile={setBack} onClear={() => setBack(null)} />}
      </Box>
      <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 2 }}>
        {[["In focus", <CenterFocusStrongOutlined key="a" sx={{ fontSize: 15 }} />], ["No glare", <WbSunnyOutlined key="b" sx={{ fontSize: 15 }} />], ["Not expired", <CalendarTodayOutlined key="c" sx={{ fontSize: 14 }} />]].map(([t, ic]) => (
          <Stack key={t as string} direction="row" alignItems="center" gap={0.75} sx={{ height: 30, px: 1.4, borderRadius: 2, bgcolor: C.fill, color: C.body, fontSize: 12.5, fontWeight: 500 }}>
            <Box sx={{ display: "flex", color: C.green }}>{ic as React.ReactNode}</Box>{t as string}
          </Stack>
        ))}
      </Stack>
      <Stack direction="row" gap={1.1} sx={{ mt: 2, p: "12px 13px", borderRadius: 2.75, bgcolor: C.fill }}>
        <HelpOutline sx={{ fontSize: 18, color: C.muted, flexShrink: 0, mt: "1px" }} />
        <Typography sx={{ fontSize: 12.5, color: C.body, lineHeight: 1.5 }}>Place your ID on a dark, flat surface and avoid covering any corner with your fingers.</Typography>
      </Stack>
    </WizardFrame>
  );
}

// ─── Step 3: live selfie ─────────────────────────────────────────────────────────

type Cam = "prompt" | "camera" | "preview" | "denied";

function SelfieStep({ selfie, setSelfie, onBack, onContinue }: { selfie: File | null; setSelfie: (f: File | null) => void; onBack: () => void; onContinue: () => void }) {
  const [cam, setCam] = useState<Cam>(selfie ? "preview" : "prompt");
  const previewUrl = useObjectUrl(selfie);
  const uploadRef = useRef<HTMLInputElement>(null);

  if (cam === "camera") {
    return (
      <WizardFrame stepNum={3} onBack={() => setCam("prompt")}>
        <Title title="Take a live selfie" sub="Center your face in the oval and capture." />
        <CameraCapture onCapture={(f) => { setSelfie(f); setCam("preview"); }} onUnavailable={() => setCam("denied")} />
      </WizardFrame>
    );
  }

  if (cam === "denied") {
    return (
      <WizardFrame
        stepNum={3}
        onBack={onBack}
        footer={
          <>
            <Button onClick={() => setCam("camera")} startIcon={<ReplayOutlined />} sx={primarySx}>Try the camera again</Button>
            <Box sx={{ mt: 1.1 }}>
              <input ref={uploadRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) { setSelfie(f); setCam("preview"); } e.target.value = ""; }} />
              <Button onClick={() => uploadRef.current?.click()} startIcon={<CloudUploadOutlined />} sx={secondarySx}>Upload a photo instead</Button>
            </Box>
          </>
        }
      >
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2.5, mt: 0.5 }}>
          <Box sx={{ width: 72, height: 72, borderRadius: 5, bgcolor: C.amberBg, color: C.amber, display: "flex", alignItems: "center", justifyContent: "center" }}><VideocamOffOutlined sx={{ fontSize: 34 }} /></Box>
        </Box>
        <Title center title="We can't reach your camera" sub="It may be blocked or in use by another app. Re-enable it, or upload a clear photo of yourself this once." />
        <Box sx={{ p: "14px 16px", borderRadius: 3, bgcolor: C.amberBg, border: `1px solid ${C.amberBd}` }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: C.amber, mb: 0.9 }}>To turn the camera on</Typography>
          <Box component="ol" sx={{ m: 0, pl: 2.25, fontSize: 13, color: C.body, lineHeight: 1.7 }}>
            <li>Open your browser&apos;s site settings.</li>
            <li>Allow camera access for KickAir.</li>
            <li>Return here and tap &quot;Try the camera again&quot;.</li>
          </Box>
        </Box>
      </WizardFrame>
    );
  }

  if (cam === "preview" && selfie && previewUrl) {
    return (
      <WizardFrame
        stepNum={3}
        onBack={onBack}
        footer={
          <>
            <Button onClick={onContinue} startIcon={<Check />} sx={primarySx}>Use photo</Button>
            <Box sx={{ mt: 1.1 }}><Button onClick={() => { setSelfie(null); setCam("camera"); }} startIcon={<ReplayOutlined />} sx={secondarySx}>Retake</Button></Box>
          </>
        }
      >
        <Title center title="How does this look?" sub="Make sure your face is clear, evenly lit and fully inside the frame." />
        <Box sx={{ display: "flex", justifyContent: "center", my: 1 }}>
          <Box component="img" src={previewUrl} alt="Selfie preview" sx={{ width: 210, height: 210, borderRadius: "50%", objectFit: "cover", border: "3px solid #fff", boxShadow: "0 6px 20px rgba(15,23,42,.22)" }} />
        </Box>
      </WizardFrame>
    );
  }

  // prompt
  return (
    <WizardFrame
      stepNum={3}
      onBack={onBack}
      footer={
        <>
          <Reassure />
          <Button onClick={() => setCam("camera")} startIcon={<CameraAltOutlined />} sx={primarySx}>Allow camera access</Button>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 0.5 }}>
            <Button onClick={() => setCam("denied")} sx={{ textTransform: "none", fontSize: 13.5, fontWeight: 600, color: C.muted }}>Camera not working?</Button>
          </Box>
        </>
      }
    >
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2.5, mt: 0.5 }}>
        <Box sx={{ width: 72, height: 72, borderRadius: 5, bgcolor: C.accentBg, color: C.accent, display: "flex", alignItems: "center", justifyContent: "center" }}><CameraAltOutlined sx={{ fontSize: 34 }} /></Box>
      </Box>
      <Title center title="Take a live selfie" sub="We'll match your face to your document. This must be a live photo — gallery uploads aren't accepted unless your camera is unavailable." />
      <Stack direction="row" gap={1.1} sx={{ p: "14px 16px", borderRadius: 3, bgcolor: "#fff", border: `1px solid ${C.border}` }}>
        <LockOutlined sx={{ fontSize: 16, color: C.accent, flexShrink: 0, mt: "1px" }} />
        <Typography sx={{ fontSize: 13, color: C.body, lineHeight: 1.55 }}>KickAir needs camera access for this step only. Your selfie is never shown on your public profile.</Typography>
      </Stack>
    </WizardFrame>
  );
}

// ─── Step 4: review & submit ─────────────────────────────────────────────────────

function Thumb({ label, file }: { label: string; file: File }) {
  const url = useObjectUrl(file);
  return (
    <Box sx={{ flex: "1 1 110px", minWidth: 100, maxWidth: 150 }}>
      <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: C.muted, mb: 0.75 }}>{label}</Typography>
      <Box sx={{ position: "relative", borderRadius: 2.5, overflow: "hidden", border: `1px solid ${C.border}` }}>
        {url && <Box component="img" src={url} alt={label} sx={{ width: "100%", aspectRatio: "1.55 / 1", objectFit: "cover", display: "block" }} />}
        <Box sx={{ position: "absolute", top: 5, right: 5, width: 20, height: 20, borderRadius: "50%", bgcolor: C.green, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><Check sx={{ fontSize: 13 }} /></Box>
      </Box>
    </Box>
  );
}

function ReviewStep({ docType, front, back, selfie, consent, setConsent, submitting, error, onBack, onEditDoc, onEditSelfie, onSubmit }: { docType: DocType; front: File; back: File | null; selfie: File; consent: boolean; setConsent: (v: boolean) => void; submitting: boolean; error: string | null; onBack: () => void; onEditDoc: () => void; onEditSelfie: () => void; onSubmit: () => void }) {
  const selfieUrl = useObjectUrl(selfie);
  return (
    <WizardFrame stepNum={4} onBack={onBack} footer={<><Reassure /><Button disabled={!consent || submitting} onClick={onSubmit} sx={primarySx}>{submitting ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Submit for verification"}</Button></>}>
      <Title title="Review and submit" sub="Check everything looks right before sending it to our team." />

      {error && <Box sx={{ mb: 1.75, p: "11px 14px", borderRadius: 2.5, bgcolor: C.redBg, border: `1px solid ${C.redBd}`, color: "#B91C1C", fontSize: 13 }}>{error}</Box>}

      <Stack direction="row" alignItems="center" gap={1.6} sx={{ p: "14px 15px", borderRadius: 3.25, border: `1px solid ${C.border}`, mb: 1.5 }}>
        <Box sx={{ flexShrink: 0, width: 46, height: 46, borderRadius: 3, bgcolor: C.fill, color: C.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>{docType.icon}</Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 11.5, fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase", color: C.muted }}>Document</Typography>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: C.heading }}>{docType.label}</Typography>
        </Box>
        <Button onClick={onEditDoc} sx={{ textTransform: "none", fontSize: 14, fontWeight: 600, color: C.accent, minWidth: 0 }}>Edit</Button>
      </Stack>

      <Box sx={{ p: "16px 15px", borderRadius: 3.25, border: `1px solid ${C.border}`, mb: 1.75 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.6 }}>
          <Typography sx={{ fontSize: 11.5, fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase", color: C.muted }}>Your photos</Typography>
          <Button onClick={onEditSelfie} startIcon={<ReplayOutlined sx={{ fontSize: 15 }} />} sx={{ textTransform: "none", fontSize: 13.5, fontWeight: 600, color: C.accent, minWidth: 0 }}>Retake selfie</Button>
        </Stack>
        <Stack direction="row" gap={1.5} flexWrap="wrap" alignItems="flex-end">
          <Thumb label={docType.kind === "passport" ? "Photo page" : "Front"} file={front} />
          {back && <Thumb label="Back" file={back} />}
          <Box sx={{ flexShrink: 0 }}>
            <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: C.muted, mb: 0.75 }}>Selfie</Typography>
            <Box sx={{ position: "relative" }}>
              {selfieUrl && <Box component="img" src={selfieUrl} alt="Selfie" sx={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover" }} />}
              <Box sx={{ position: "absolute", top: 2, right: 2, width: 20, height: 20, borderRadius: "50%", bgcolor: C.green, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(15,23,42,.25)" }}><Check sx={{ fontSize: 13 }} /></Box>
            </Box>
          </Box>
        </Stack>
      </Box>

      <Box component="button" onClick={() => setConsent(!consent)} aria-pressed={consent} sx={{ display: "flex", alignItems: "flex-start", gap: 1.4, width: "100%", textAlign: "left", p: "14px", borderRadius: 3, cursor: "pointer", fontFamily: "inherit", bgcolor: consent ? C.accentBg : "#fff", border: `1.5px solid ${consent ? C.accent : C.border}`, transition: "all .15s" }}>
        <Box sx={{ flexShrink: 0, mt: "1px", width: 22, height: 22, borderRadius: 2, border: `2px solid ${consent ? C.accent : C.borderH}`, bgcolor: consent ? C.accent : "#fff", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>{consent && <Check sx={{ fontSize: 15 }} />}</Box>
        <Typography sx={{ fontSize: 13.5, color: C.body, lineHeight: 1.5 }}>I confirm this is my own valid ID and that the information is accurate.</Typography>
      </Box>
    </WizardFrame>
  );
}

// ─── Orchestrator ────────────────────────────────────────────────────────────────

export default function KycWizard({ rejection, onSubmitted }: { rejection?: string | null; onSubmitted: () => void }) {
  const [step, setStep] = useState<Step>("intro");
  const [docTypeId, setDocTypeId] = useState<KycDocumentType | null>(null);
  const [front, setFront] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const docType = DOC_TYPES.find((d) => d.id === docTypeId) ?? null;

  const handleSubmit = async () => {
    if (!docType || !front || !selfie) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.submitKyc(docType.id, front, docType.kind === "card" ? back : null, selfie);
      onSubmitted();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  switch (step) {
    case "intro":
      return <IntroStep rejection={rejection} onStart={() => setStep("doctype")} />;
    case "doctype":
      return <DocTypeStep value={docTypeId} onChange={setDocTypeId} onBack={() => setStep("intro")} onContinue={() => setStep("capture")} />;
    case "capture":
      return <CaptureStep docType={docType!} front={front} back={back} setFront={setFront} setBack={setBack} onBack={() => setStep("doctype")} onContinue={() => setStep("selfie")} />;
    case "selfie":
      return <SelfieStep selfie={selfie} setSelfie={setSelfie} onBack={() => setStep("capture")} onContinue={() => setStep("review")} />;
    case "review":
      return <ReviewStep docType={docType!} front={front!} back={back} selfie={selfie!} consent={consent} setConsent={setConsent} submitting={submitting} error={error} onBack={() => setStep("selfie")} onEditDoc={() => setStep("doctype")} onEditSelfie={() => setStep("selfie")} onSubmit={handleSubmit} />;
  }
}
