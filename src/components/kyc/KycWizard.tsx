"use client";

import { useRef, useState } from "react";
import {
  BookOpen,
  Calendar,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  CloudUpload,
  CreditCard,
  Focus,
  HelpCircle,
  IdCard,
  Lock,
  RotateCcw,
  Shield,
  Sun,
  VideoOff,
} from "lucide-react";
import { css, cva } from "styled-system/css";
import { Spinner } from "@/components/ds";
import { api } from "@/lib/api";
import { KycDocumentType } from "@/types/user";
import { useObjectUrl } from "./tokens";
import CameraCapture from "./CameraCapture";

type DocType = { id: KycDocumentType; label: string; short: string; desc: string; kind: "card" | "passport"; icon: React.ReactNode };

const DOC_TYPES: DocType[] = [
  { id: "national_id", label: "National ID", short: "ID", desc: "Government-issued ID card", kind: "card", icon: <IdCard size={24} /> },
  { id: "passport", label: "Passport", short: "passport", desc: "Just the photo page", kind: "passport", icon: <BookOpen size={24} /> },
  { id: "drivers_license", label: "Driver's License", short: "license", desc: "Front and back", kind: "card", icon: <CreditCard size={24} /> },
];

type Step = "intro" | "doctype" | "capture" | "selfie" | "review";

// ─── Buttons ────────────────────────────────────────────────────────────────────

/**
 * The MUI `Button` base the old `sx` overrides sat on: 6px 8px padding, 64px
 * min-width, 4px radius, 500 weight, 1.75 line-height, no uppercase (the theme
 * set `textTransform: none` globally) and `color: inherit` on the text variant.
 */
const wizButton = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    m: 0,
    p: "6px 8px",
    minW: "64px",
    // Long-hand so the `secondary` tone's own border wins regardless of the
    // order Panda emits the atomic rules in.
    borderWidth: "0",
    borderStyle: "none",
    borderRadius: "4px",
    bg: "transparent",
    fontFamily: "inherit",
    fontSize: "14px",
    fontWeight: 500,
    lineHeight: 1.75,
    textDecoration: "none",
    verticalAlign: "middle",
    userSelect: "none",
    appearance: "none",
    cursor: "pointer",
    transition: "background-color .25s cubic-bezier(.4,0,.2,1), box-shadow .25s cubic-bezier(.4,0,.2,1), border-color .25s cubic-bezier(.4,0,.2,1)",
    _disabled: { pointerEvents: "none", cursor: "default" },
    "& svg": { flexShrink: 0 },
  },
  variants: {
    tone: {
      primary: {
        w: "100%",
        h: "50px",
        borderRadius: "11px",
        fontSize: "16px",
        fontWeight: 600,
        bg: "accent",
        color: "#fff",
        boxShadow: "none",
        _hover: { bg: "accentHover", boxShadow: "none" },
        _disabled: { bg: "fill", color: "placeholder" },
      },
      secondary: {
        w: "100%",
        h: "48px",
        borderRadius: "11px",
        fontSize: "15px",
        fontWeight: 600,
        bg: "#fff",
        color: "body",
        borderWidth: "1px", borderStyle: "solid", borderColor: "borderStrong",
        _hover: { bg: "#F8FAFC" },
      },
      text: { color: "inherit", _hover: { bg: "rgba(25,118,210,0.04)" } },
    },
  },
});

// MUI's start/end icon slots: 20px glyph, 8px from the label, -4px into the padding.
const startIconCss = css({ ml: "-4px", mr: "8px" });
const endIconCss = css({ ml: "8px", mr: "-4px" });

const primaryBtn = wizButton({ tone: "primary" });
const secondaryBtn = wizButton({ tone: "secondary" });
const backBtn = css(wizButton.raw({ tone: "text" }), { minW: 0, w: "34px", h: "34px", ml: "-8px", borderRadius: "8px", color: "body" });
const linkBtnSm = css(wizButton.raw({ tone: "text" }), { fontSize: "13.5px", fontWeight: 600, color: "accent", minW: 0 });
const linkBtnMd = css(wizButton.raw({ tone: "text" }), { fontSize: "14px", fontWeight: 600, color: "accent", minW: 0 });
const mutedBtn = css(wizButton.raw({ tone: "text" }), { fontSize: "13.5px", fontWeight: 600, color: "muted" });
const submitSpinner = css({ color: "#fff", borderColor: "rgba(255,255,255,0.4)", borderTopColor: "#fff" });

// ─── Frame + shared bits ────────────────────────────────────────────────────────

const frameCss = css({ maxW: "480px", mx: "auto", borderRadius: "16px", borderWidth: "1px", borderStyle: "solid", borderColor: "border", overflow: "hidden", bg: "#fff", color: "rgba(0, 0, 0, 0.87)" });
const frameHeadCss = css({ px: "18px", pt: "12px", pb: "14px", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "border" });
const frameHeadRowCss = css({ display: "flex", alignItems: "center", h: "32px" });
const spacer26Css = css({ w: "26px" });
const stepLabelCss = css({ flex: 1, textAlign: "center", fontSize: "13px", fontWeight: 600, lineHeight: 1.5, color: "muted" });
const barsRowCss = css({ display: "flex", gap: "5.2px", mt: "11.2px" });
const barCss = cva({
  base: { flex: 1, h: "4px", borderRadius: "999px", transition: "background .35s ease" },
  variants: { on: { true: { bg: "accent" }, false: { bg: "border" } } },
});
const frameBodyCss = css({ p: "22px 22px 18px" });
const frameFooterCss = css({ p: "14px 22px 18px", borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "border" });

function WizardFrame({ stepNum, onBack, children, footer }: { stepNum?: number; onBack?: () => void; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className={frameCss}>
      {stepNum != null && (
        <div className={frameHeadCss}>
          <div className={frameHeadRowCss}>
            {onBack ? (
              <button type="button" onClick={onBack} aria-label="Back" className={backBtn}>
                <ChevronLeft size={16} />
              </button>
            ) : (
              <div className={spacer26Css} />
            )}
            <p className={stepLabelCss}>Step {stepNum} of 4</p>
            <div className={spacer26Css} />
          </div>
          <div className={barsRowCss}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={barCss({ on: i <= stepNum })} />
            ))}
          </div>
        </div>
      )}
      <div className={frameBodyCss}>{children}</div>
      {footer && <div className={frameFooterCss}>{footer}</div>}
    </div>
  );
}

const titleWrapCss = cva({ base: { mb: "20px" }, variants: { center: { true: { textAlign: "center" }, false: { textAlign: "left" } } } });
// `mb` on the h1 and `m` on the p are dropped: globals.css's unlayered
// `h1-h6, p { margin: 0 }` already beat the old `sx`, so they never applied.
const titleCss = css({ fontSize: "22px", fontWeight: 700, color: "heading", letterSpacing: "-.02em", lineHeight: 1.2 });
const subCss = css({ fontSize: "14.5px", color: "muted", lineHeight: 1.5 });

function Title({ title, sub, center }: { title: string; sub?: string; center?: boolean }) {
  return (
    <div className={titleWrapCss({ center: !!center })}>
      <h1 className={titleCss}>{title}</h1>
      {sub && <p className={subCss}>{sub}</p>}
    </div>
  );
}

const reassureCss = css({ display: "flex", alignItems: "center", justifyContent: "center", gap: "7.2px", mb: "11.2px", color: "muted" });
const reassureIconCss = css({ color: "accent" });
const reassureTextCss = css({ fontSize: "12px", lineHeight: 1.4, textAlign: "center" });

function Reassure() {
  return (
    <div className={reassureCss}>
      <Lock size={15} className={reassureIconCss} />
      <p className={reassureTextCss}>Your documents are encrypted and used only to verify your identity.</p>
    </div>
  );
}

// ─── Intro ──────────────────────────────────────────────────────────────────────

const heroWrapCss = css({ display: "flex", justifyContent: "center", mb: "20px", mt: "4px" });
const heroShieldCss = css({
  w: "72px",
  h: "72px",
  borderRadius: "20px",
  background: "linear-gradient(135deg, #0071e3 0%, #339bff 100%)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 8px 22px rgba(0,113,227,.30)",
});
const rejectBoxCss = css({ mb: "16px", p: "12px 14px", borderRadius: "11px", bg: "#FEF2F2", borderWidth: "1px", borderStyle: "solid", borderColor: "#FBD2D2", display: "flex", gap: "8.8px" });
const rejectBulletCss = css({ color: "#DC2626", mt: "1px" });
const rejectTitleCss = css({ fontSize: "12.5px", fontWeight: 700, lineHeight: 1.5, color: "#B91C1C" });
const rejectBodyCss = css({ fontSize: "13px", color: "#7F1D1D", lineHeight: 1.5 });
const introListCss = css({ borderWidth: "1px", borderStyle: "solid", borderColor: "border", borderRadius: "14px", px: "16px" });
const introRowCss = cva({
  base: { display: "flex", alignItems: "center", gap: "12.8px", py: "12px" },
  variants: { divided: { true: { borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "border" }, false: {} } },
});
const introIconCss = css({ flexShrink: 0, w: "42px", h: "42px", borderRadius: "12px", bg: "fill", color: "accent", display: "flex", alignItems: "center", justifyContent: "center" });
const introRowTitleCss = css({ fontSize: "14.5px", fontWeight: 600, lineHeight: 1.5, color: "heading" });
const introRowSubCss = css({ fontSize: "13px", lineHeight: 1.5, color: "muted" });

const INTRO_ITEMS = [
  { icon: <IdCard size={24} />, title: "A government-issued ID", sub: "National ID, passport or driver's license" },
  { icon: <Camera size={24} />, title: "A quick live selfie", sub: "So we know it's really you" },
  { icon: <Clock size={24} />, title: "About 2 minutes", sub: "We'll review it within 1–2 business days" },
];

function IntroStep({ rejection, onStart }: { rejection?: string | null; onStart: () => void }) {
  return (
    <WizardFrame
      footer={
        <>
          <Reassure />
          <button type="button" onClick={onStart} className={primaryBtn}>
            {rejection ? "Start over" : "Get started"}
            <ChevronRight size={20} className={endIconCss} />
          </button>
        </>
      }
    >
      <div className={heroWrapCss}>
        <div className={heroShieldCss}>
          <Shield size={36} />
        </div>
      </div>
      <Title center title="Verify your identity" sub="A quick check keeps KickAir safe for everyone. It usually takes about 2 minutes." />

      {rejection && (
        <div className={rejectBoxCss}>
          <div className={rejectBulletCss}>•</div>
          <div>
            <p className={rejectTitleCss}>Your last submission was rejected</p>
            <p className={rejectBodyCss}>{rejection}</p>
          </div>
        </div>
      )}

      <div className={introListCss}>
        {INTRO_ITEMS.map((it, i) => (
          <div key={it.title} className={introRowCss({ divided: !!i })}>
            <div className={introIconCss}>{it.icon}</div>
            <div>
              <p className={introRowTitleCss}>{it.title}</p>
              <p className={introRowSubCss}>{it.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </WizardFrame>
  );
}

// ─── Step 1: document type ───────────────────────────────────────────────────────

const docListCss = css({ display: "flex", flexDirection: "column", gap: "11.2px" });
const docTileCss = cva({
  base: {
    display: "flex",
    alignItems: "center",
    gap: "15.2px",
    w: "100%",
    boxSizing: "border-box",
    textAlign: "left",
    p: "16px",
    borderRadius: "13px",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "border-color .15s, background .15s",
  },
  variants: {
    selected: {
      true: { bg: "#EFF6FF", borderWidth: "1.5px", borderStyle: "solid", borderColor: "accent", _hover: { borderColor: "accent" } },
      false: { bg: "#fff", borderWidth: "1.5px", borderStyle: "solid", borderColor: "border", _hover: { borderColor: "borderStrong" } },
    },
  },
});
const docTileIconCss = cva({
  base: { flexShrink: 0, w: "52px", h: "52px", borderRadius: "13px", display: "flex", alignItems: "center", justifyContent: "center" },
  variants: { selected: { true: { bg: "#fff", color: "accent" }, false: { bg: "fill", color: "body" } } },
});
const docTileTextCss = css({ flex: 1, minW: 0 });
const docTileLabelCss = css({ fontSize: "15.5px", fontWeight: 600, lineHeight: 1.5, color: "heading" });
const docTileDescCss = css({ fontSize: "13px", lineHeight: 1.5, color: "muted" });
const docRadioCss = cva({
  base: { flexShrink: 0, w: "23px", h: "23px", borderRadius: "50%", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" },
  variants: { selected: { true: { borderWidth: "2px", borderStyle: "solid", borderColor: "accent", bg: "accent" }, false: { borderWidth: "2px", borderStyle: "solid", borderColor: "borderStrong", bg: "#fff" } } },
});

function DocTypeStep({ value, onChange, onBack, onContinue }: { value: KycDocumentType | null; onChange: (id: KycDocumentType) => void; onBack: () => void; onContinue: () => void }) {
  return (
    <WizardFrame
      stepNum={1}
      onBack={onBack}
      footer={
        <>
          <Reassure />
          <button type="button" disabled={!value} onClick={onContinue} className={primaryBtn}>
            Continue
            <ChevronRight size={20} className={endIconCss} />
          </button>
        </>
      }
    >
      <Title title="Choose your document" sub="Pick the ID you'd like to verify with. Make sure it's current and not expired." />
      <div className={docListCss}>
        {DOC_TYPES.map((t) => {
          const selected = value === t.id;
          return (
            <button key={t.id} onClick={() => onChange(t.id)} aria-pressed={selected} className={docTileCss({ selected })}>
              <div className={docTileIconCss({ selected })}>{t.icon}</div>
              <div className={docTileTextCss}>
                <p className={docTileLabelCss}>{t.label}</p>
                <p className={docTileDescCss}>{t.desc}</p>
              </div>
              <div className={docRadioCss({ selected })}>{selected && <Check size={15} />}</div>
            </button>
          );
        })}
      </div>
    </WizardFrame>
  );
}

// ─── Step 2: document capture ────────────────────────────────────────────────────

const tileLabelCss = css({ fontSize: "13px", fontWeight: 600, lineHeight: 1.5, color: "body" });
const previewFrameCss = css({ position: "relative", borderRadius: "11px", overflow: "hidden", borderWidth: "1.5px", borderStyle: "solid", borderColor: "#A7F3D0" });
const previewImgCss = css({ w: "100%", aspectRatio: "1.55 / 1", objectFit: "cover", display: "block" });
const previewCheckCss = css({ position: "absolute", top: "7px", right: "7px", w: "24px", h: "24px", borderRadius: "50%", bg: "#047857", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" });
const previewRowCss = css({ display: "flex", alignItems: "center", justifyContent: "space-between", mt: "8px" });
const previewOkCss = css({ display: "flex", alignItems: "center", gap: "4.8px", color: "#047857" });
const previewOkTextCss = css({ fontSize: "12.5px", fontWeight: 600, lineHeight: 1.5 });
const dropzoneCss = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  w: "100%",
  boxSizing: "border-box",
  aspectRatio: "1.55 / 1",
  borderRadius: "11px",
  cursor: "pointer",
  fontFamily: "inherit",
  bg: "fill",
  borderWidth: "2px", borderStyle: "dashed", borderColor: "borderStrong",
  transition: "all .15s",
  _hover: { bg: "#EFF6FF", borderColor: "accent" },
});
const dropzoneIconCss = css({ color: "muted", mb: "8px" });
const dropzoneTitleCss = css({ fontSize: "13px", fontWeight: 600, lineHeight: 1.5, color: "heading" });
const dropzoneSubCss = css({ fontSize: "11.5px", lineHeight: 1.5, color: "muted" });

function UploadTile({ label, file, onFile, onClear }: { label: string; file: File | null; onFile: (f: File) => void; onClear: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const url = useObjectUrl(file);
  return (
    <div>
      <p className={tileLabelCss}>{label}</p>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
      {file && url ? (
        <div>
          <div className={previewFrameCss}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={label} className={previewImgCss} />
            <div className={previewCheckCss}><Check size={15} /></div>
          </div>
          <div className={previewRowCss}>
            <div className={previewOkCss}>
              <Check size={15} />
              <p className={previewOkTextCss}>Looks good</p>
            </div>
            <button type="button" onClick={onClear} className={linkBtnSm}>
              <RotateCcw size={20} className={startIconCss} />
              Retake
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => inputRef.current?.click()} className={dropzoneCss}>
          <Camera size={24} className={dropzoneIconCss} />
          <p className={dropzoneTitleCss}>Add a photo</p>
          <p className={dropzoneSubCss}>Show all 4 corners</p>
        </button>
      )}
    </div>
  );
}

const captureGridCss = cva({
  base: { display: "grid", gap: "12px" },
  variants: { card: { true: { gridTemplateColumns: "1fr 1fr", maxW: "none" }, false: { gridTemplateColumns: "1fr", maxW: "320px" } } },
});
const hintsRowCss = css({ display: "flex", gap: "8px", flexWrap: "wrap", mt: "16px" });
const hintChipCss = css({ display: "flex", alignItems: "center", gap: "6px", h: "30px", px: "11.2px", borderRadius: "8px", bg: "fill", color: "body", fontSize: "12.5px", fontWeight: 500 });
const hintIconCss = css({ display: "flex", color: "#047857" });
const helpBoxCss = css({ display: "flex", gap: "8.8px", mt: "16px", p: "12px 13px", borderRadius: "11px", bg: "fill" });
const helpIconCss = css({ color: "muted", flexShrink: 0, mt: "1px" });
const helpTextCss = css({ fontSize: "12.5px", color: "body", lineHeight: 1.5 });

const CAPTURE_HINTS: [string, React.ReactNode][] = [
  ["In focus", <Focus key="a" size={15} />],
  ["No glare", <Sun key="b" size={15} />],
  ["Not expired", <Calendar key="c" size={14} />],
];

function CaptureStep({ docType, front, back, setFront, setBack, onBack, onContinue }: { docType: DocType; front: File | null; back: File | null; setFront: (f: File | null) => void; setBack: (f: File | null) => void; onBack: () => void; onContinue: () => void }) {
  const isCard = docType.kind === "card";
  const done = front != null && (!isCard || back != null);
  return (
    <WizardFrame
      stepNum={2}
      onBack={onBack}
      footer={
        <>
          <Reassure />
          <button type="button" disabled={!done} onClick={onContinue} className={primaryBtn}>
            Continue
            <ChevronRight size={20} className={endIconCss} />
          </button>
        </>
      }
    >
      <Title title={`Photograph your ${docType.short}`} sub={isCard ? "Capture both sides on a flat surface with good lighting." : "Capture the photo page — the one with your picture and details."} />
      <div className={captureGridCss({ card: isCard })}>
        <UploadTile label={isCard ? "Front" : "Photo page"} file={front} onFile={setFront} onClear={() => setFront(null)} />
        {isCard && <UploadTile label="Back" file={back} onFile={setBack} onClear={() => setBack(null)} />}
      </div>
      <div className={hintsRowCss}>
        {CAPTURE_HINTS.map(([t, ic]) => (
          <div key={t} className={hintChipCss}>
            <div className={hintIconCss}>{ic}</div>{t}
          </div>
        ))}
      </div>
      <div className={helpBoxCss}>
        <HelpCircle size={18} className={helpIconCss} />
        <p className={helpTextCss}>Place your ID on a dark, flat surface and avoid covering any corner with your fingers.</p>
      </div>
    </WizardFrame>
  );
}

// ─── Step 3: live selfie ─────────────────────────────────────────────────────────

type Cam = "prompt" | "camera" | "preview" | "denied";

const stackBelowCss = css({ mt: "8.8px" });
const deniedTileCss = css({ w: "72px", h: "72px", borderRadius: "20px", bg: "#FFFBEB", color: "#B45309", display: "flex", alignItems: "center", justifyContent: "center" });
const deniedBoxCss = css({ p: "14px 16px", borderRadius: "12px", bg: "#FFFBEB", borderWidth: "1px", borderStyle: "solid", borderColor: "#FCD9A6" });
const deniedBoxTitleCss = css({ fontSize: "13px", fontWeight: 600, lineHeight: 1.5, color: "#B45309" });
const deniedListCss = css({ m: 0, pl: "18px", fontSize: "13px", color: "body", lineHeight: 1.7 });
const selfiePreviewWrapCss = css({ display: "flex", justifyContent: "center", my: "8px" });
const selfiePreviewImgCss = css({ w: "210px", h: "210px", borderRadius: "50%", objectFit: "cover", border: "3px solid #fff", boxShadow: "0 6px 20px rgba(15,23,42,.22)" });
const promptTileCss = css({ w: "72px", h: "72px", borderRadius: "20px", bg: "#EFF6FF", color: "accent", display: "flex", alignItems: "center", justifyContent: "center" });
const promptNoteCss = css({ display: "flex", gap: "8.8px", p: "14px 16px", borderRadius: "12px", bg: "#fff", borderWidth: "1px", borderStyle: "solid", borderColor: "border" });
const promptNoteIconCss = css({ color: "accent", flexShrink: 0, mt: "1px" });
const promptNoteTextCss = css({ fontSize: "13px", color: "body", lineHeight: 1.55 });
const centerRowCss = css({ display: "flex", justifyContent: "center", mt: "4px" });

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
            <button type="button" onClick={() => setCam("camera")} className={primaryBtn}>
              <RotateCcw size={20} className={startIconCss} />
              Try the camera again
            </button>
            <div className={stackBelowCss}>
              <input ref={uploadRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) { setSelfie(f); setCam("preview"); } e.target.value = ""; }} />
              <button type="button" onClick={() => uploadRef.current?.click()} className={secondaryBtn}>
                <CloudUpload size={20} className={startIconCss} />
                Upload a photo instead
              </button>
            </div>
          </>
        }
      >
        <div className={heroWrapCss}>
          <div className={deniedTileCss}><VideoOff size={34} /></div>
        </div>
        <Title center title="We can't reach your camera" sub="It may be blocked or in use by another app. Re-enable it, or upload a clear photo of yourself this once." />
        <div className={deniedBoxCss}>
          <p className={deniedBoxTitleCss}>To turn the camera on</p>
          <ol className={deniedListCss}>
            <li>Open your browser&apos;s site settings.</li>
            <li>Allow camera access for KickAir.</li>
            <li>Return here and tap &quot;Try the camera again&quot;.</li>
          </ol>
        </div>
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
            <button type="button" onClick={onContinue} className={primaryBtn}>
              <Check size={20} className={startIconCss} />
              Use photo
            </button>
            <div className={stackBelowCss}>
              <button type="button" onClick={() => { setSelfie(null); setCam("camera"); }} className={secondaryBtn}>
                <RotateCcw size={20} className={startIconCss} />
                Retake
              </button>
            </div>
          </>
        }
      >
        <Title center title="How does this look?" sub="Make sure your face is clear, evenly lit and fully inside the frame." />
        <div className={selfiePreviewWrapCss}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Selfie preview" className={selfiePreviewImgCss} />
        </div>
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
          <button type="button" onClick={() => setCam("camera")} className={primaryBtn}>
            <Camera size={20} className={startIconCss} />
            Allow camera access
          </button>
          <div className={centerRowCss}>
            <button type="button" onClick={() => setCam("denied")} className={mutedBtn}>Camera not working?</button>
          </div>
        </>
      }
    >
      <div className={heroWrapCss}>
        <div className={promptTileCss}><Camera size={34} /></div>
      </div>
      <Title center title="Take a live selfie" sub="We'll match your face to your document. This must be a live photo — gallery uploads aren't accepted unless your camera is unavailable." />
      <div className={promptNoteCss}>
        <Lock size={16} className={promptNoteIconCss} />
        <p className={promptNoteTextCss}>KickAir needs camera access for this step only. Your selfie is never shown on your public profile.</p>
      </div>
    </WizardFrame>
  );
}

// ─── Step 4: review & submit ─────────────────────────────────────────────────────

const thumbCss = css({ flex: "1 1 110px", minW: "100px", maxW: "150px" });
const thumbLabelCss = css({ fontSize: "11.5px", fontWeight: 600, lineHeight: 1.5, color: "muted" });
const thumbFrameCss = css({ position: "relative", borderRadius: "10px", overflow: "hidden", borderWidth: "1px", borderStyle: "solid", borderColor: "border" });
const thumbImgCss = css({ w: "100%", aspectRatio: "1.55 / 1", objectFit: "cover", display: "block" });
const thumbCheckCss = css({ position: "absolute", top: "5px", right: "5px", w: "20px", h: "20px", borderRadius: "50%", bg: "#047857", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" });

function Thumb({ label, file }: { label: string; file: File }) {
  const url = useObjectUrl(file);
  return (
    <div className={thumbCss}>
      <p className={thumbLabelCss}>{label}</p>
      <div className={thumbFrameCss}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {url && <img src={url} alt={label} className={thumbImgCss} />}
        <div className={thumbCheckCss}><Check size={13} /></div>
      </div>
    </div>
  );
}

const reviewErrorCss = css({ mb: "14px", p: "11px 14px", borderRadius: "10px", bg: "#FEF2F2", borderWidth: "1px", borderStyle: "solid", borderColor: "#FBD2D2", color: "#B91C1C", fontSize: "13px" });
const docSummaryCss = css({ display: "flex", alignItems: "center", gap: "12.8px", p: "14px 15px", borderRadius: "13px", borderWidth: "1px", borderStyle: "solid", borderColor: "border", mb: "12px" });
const docSummaryIconCss = css({ flexShrink: 0, w: "46px", h: "46px", borderRadius: "12px", bg: "fill", color: "accent", display: "flex", alignItems: "center", justifyContent: "center" });
const docSummaryTextCss = css({ flex: 1, minW: 0 });
const overlineCss = css({ fontSize: "11.5px", fontWeight: 600, lineHeight: 1.5, letterSpacing: ".04em", textTransform: "uppercase", color: "muted" });
const docSummaryLabelCss = css({ fontSize: "15px", fontWeight: 600, lineHeight: 1.5, color: "heading" });
const photosBoxCss = css({ p: "16px 15px", borderRadius: "13px", borderWidth: "1px", borderStyle: "solid", borderColor: "border", mb: "14px" });
const photosHeadCss = css({ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "12.8px" });
const photosRowCss = css({ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end" });
const selfieBlockCss = css({ flexShrink: 0 });
const selfieThumbWrapCss = css({ position: "relative" });
const selfieThumbImgCss = css({ w: "72px", h: "72px", borderRadius: "50%", objectFit: "cover" });
const selfieThumbCheckCss = css({ position: "absolute", top: "2px", right: "2px", w: "20px", h: "20px", borderRadius: "50%", bg: "#047857", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(15,23,42,.25)" });
const consentCss = cva({
  base: {
    display: "flex",
    alignItems: "flex-start",
    gap: "11.2px",
    w: "100%",
    boxSizing: "border-box",
    textAlign: "left",
    p: "14px",
    borderRadius: "12px",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all .15s",
  },
  variants: { on: { true: { bg: "#EFF6FF", borderWidth: "1.5px", borderStyle: "solid", borderColor: "accent" }, false: { bg: "#fff", borderWidth: "1.5px", borderStyle: "solid", borderColor: "border" } } },
});
const consentBoxCss = cva({
  base: { flexShrink: 0, mt: "1px", w: "22px", h: "22px", borderRadius: "8px", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" },
  variants: { on: { true: { borderWidth: "2px", borderStyle: "solid", borderColor: "accent", bg: "accent" }, false: { borderWidth: "2px", borderStyle: "solid", borderColor: "borderStrong", bg: "#fff" } } },
});
const consentTextCss = css({ fontSize: "13.5px", color: "body", lineHeight: 1.5 });

function ReviewStep({ docType, front, back, selfie, consent, setConsent, submitting, error, onBack, onEditDoc, onEditSelfie, onSubmit }: { docType: DocType; front: File; back: File | null; selfie: File; consent: boolean; setConsent: (v: boolean) => void; submitting: boolean; error: string | null; onBack: () => void; onEditDoc: () => void; onEditSelfie: () => void; onSubmit: () => void }) {
  const selfieUrl = useObjectUrl(selfie);
  return (
    <WizardFrame
      stepNum={4}
      onBack={onBack}
      footer={
        <>
          <Reassure />
          <button type="button" disabled={!consent || submitting} onClick={onSubmit} className={primaryBtn}>
            {submitting ? <Spinner size={20} className={submitSpinner} /> : "Submit for verification"}
          </button>
        </>
      }
    >
      <Title title="Review and submit" sub="Check everything looks right before sending it to our team." />

      {error && <div className={reviewErrorCss}>{error}</div>}

      <div className={docSummaryCss}>
        <div className={docSummaryIconCss}>{docType.icon}</div>
        <div className={docSummaryTextCss}>
          <p className={overlineCss}>Document</p>
          <p className={docSummaryLabelCss}>{docType.label}</p>
        </div>
        <button type="button" onClick={onEditDoc} className={linkBtnMd}>Edit</button>
      </div>

      <div className={photosBoxCss}>
        <div className={photosHeadCss}>
          <p className={overlineCss}>Your photos</p>
          <button type="button" onClick={onEditSelfie} className={linkBtnSm}>
            <RotateCcw size={20} className={startIconCss} />
            Retake selfie
          </button>
        </div>
        <div className={photosRowCss}>
          <Thumb label={docType.kind === "passport" ? "Photo page" : "Front"} file={front} />
          {back && <Thumb label="Back" file={back} />}
          <div className={selfieBlockCss}>
            <p className={thumbLabelCss}>Selfie</p>
            <div className={selfieThumbWrapCss}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {selfieUrl && <img src={selfieUrl} alt="Selfie" className={selfieThumbImgCss} />}
              <div className={selfieThumbCheckCss}><Check size={13} /></div>
            </div>
          </div>
        </div>
      </div>

      <button onClick={() => setConsent(!consent)} aria-pressed={consent} className={consentCss({ on: consent })}>
        <div className={consentBoxCss({ on: consent })}>{consent && <Check size={15} />}</div>
        <p className={consentTextCss}>I confirm this is my own valid ID and that the information is accurate.</p>
      </button>
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
