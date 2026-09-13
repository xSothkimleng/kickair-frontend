"use client";

import { AlertCircle, BadgeCheck, Calendar, Check, Clock, Focus, Lock, RotateCcw, Sun } from "lucide-react";
import { css, cva } from "styled-system/css";

/**
 * The button base the old overrides sat on (6px 8px padding, 64px min-width,
 * no uppercase) with the KYC primary tone on top.
 */
const primaryBtn = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  m: 0,
  p: "6px 8px",
  minW: "64px",
  border: "none",
  textDecoration: "none",
  verticalAlign: "middle",
  userSelect: "none",
  appearance: "none",
  cursor: "pointer",
  transition: "background-color .25s cubic-bezier(.4,0,.2,1), box-shadow .25s cubic-bezier(.4,0,.2,1), border-color .25s cubic-bezier(.4,0,.2,1)",
  "& svg": { flexShrink: 0 },
  w: "100%",
  h: "50px",
  borderRadius: "11px",
  textStyle: "lead",
  fontWeight: 600,
  bg: "accent",
  color: "#fff",
  boxShadow: "none",
  _hover: { bg: "accentHover", boxShadow: "none" },
});

// Start-icon slot: 20px glyph, 8px from the label, -4px into the padding.
const startIconCss = css({ ml: "-4px", mr: "8px" });

const cardCss = css({ maxW: "480px", mx: "auto", borderRadius: "16px", borderWidth: "1px", borderStyle: "solid", borderColor: "border", overflow: "hidden", bg: "#fff", color: "ink" });
const cardBodyCss = css({ p: "26px 22px 18px" });
const cardFooterCss = css({ p: "14px 22px 18px", borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "border" });

function ResultCard({ children, footer }: { children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className={cardCss}>
      <div className={cardBodyCss}>{children}</div>
      {footer && <div className={cardFooterCss}>{footer}</div>}
    </div>
  );
}

const resultIconWrapCss = css({ display: "flex", justifyContent: "center", mb: "20px" });
const resultIconCss = cva({
  base: { w: "88px", h: "88px", borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center" },
  variants: {
    tone: {
      amber: { bg: "#FFFBEB", color: "#B45309", boxShadow: "inset 0 0 0 1px #FCD9A6" },
      green: { bg: "#ECFDF5", color: "#047857", boxShadow: "inset 0 0 0 1px #A7F3D0" },
      red: { bg: "#FEF2F2", color: "#DC2626", boxShadow: "inset 0 0 0 1px #FBD2D2" },
    },
  },
});

function ResultIcon({ tone, children }: { tone: "amber" | "green" | "red"; children: React.ReactNode }) {
  return (
    <div className={resultIconWrapCss}>
      <div className={resultIconCss({ tone })}>{children}</div>
    </div>
  );
}

// `mb` on the h1 and `m` on the p are dropped: globals.css's unlayered
// `h1-h6, p { margin: 0 }` already beat the old `sx`, so they never applied.
const headingWrapCss = css({ textAlign: "center", mb: "20px" });
const headingTitleCss = css({ textStyle: "title", fontWeight: 700, color: "heading" });
const headingSubCss = css({ textStyle: "body", color: "muted" });

function Heading({ title, sub }: { title: string; sub: string }) {
  return (
    <div className={headingWrapCss}>
      <h1 className={headingTitleCss}>{title}</h1>
      <p className={headingSubCss}>{sub}</p>
    </div>
  );
}

const pendingRowCss = css({ display: "flex", alignItems: "center", gap: "10px", p: "13px 15px", borderRadius: "12px", bg: "#FFFBEB", borderWidth: "1px", borderStyle: "solid", borderColor: "#FCD9A6" });
const pendingPillCss = css({ display: "inline-flex", alignItems: "center", gap: "7.2px", h: "26px", px: "11.2px", borderRadius: "999px", bg: "#fff", color: "#B45309", textStyle: "meta", fontWeight: 600, flexShrink: 0 });
const pendingDotCss = css({ w: "7px", h: "7px", borderRadius: "50%", bg: "#F59E0B" });
const pendingWhenCss = css({ textStyle: "meta", color: "#B45309" });
const pendingLockRowCss = css({ display: "flex", alignItems: "center", gap: "8px", mt: "14px", color: "muted" });
const pendingLockTextCss = css({ textStyle: "meta", fontWeight: 600 });
const pendingNoteCss = css({ textStyle: "meta", color: "muted", textAlign: "center" });

export function KycPendingView({ docTypeLabel, submittedAt, onDone }: { docTypeLabel: string | null; submittedAt: string | null; onDone: () => void }) {
  const submitted = submittedAt ? new Date(submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;
  return (
    <ResultCard footer={<button type="button" onClick={onDone} className={primaryBtn}>Back to KickAir</button>}>
      <ResultIcon tone="amber"><Clock size={40} /></ResultIcon>
      <Heading title="We're reviewing your documents" sub="Thanks — everything's been submitted. We'll notify you once it's reviewed, usually within 1–2 business days." />
      <div className={pendingRowCss}>
        <div className={pendingPillCss}>
          <span className={pendingDotCss} />Pending review
        </div>
        {submitted && <p className={pendingWhenCss}>Submitted {submitted}</p>}
      </div>
      {docTypeLabel && (
        <div className={pendingLockRowCss}>
          <Lock size={15} />
          <p className={pendingLockTextCss}>{docTypeLabel} · locked while we review</p>
        </div>
      )}
      <p className={pendingNoteCss}>
        You can keep using KickAir while you wait. Some actions stay limited until you&apos;re verified.
      </p>
    </ResultCard>
  );
}

const approvedBadgeWrapCss = css({ display: "flex", justifyContent: "center", mb: "16px" });
const approvedBadgeCss = css({ display: "flex", alignItems: "center", gap: "7.2px", px: "14px", h: "32px", borderRadius: "999px", bg: "#ECFDF5", borderWidth: "1px", borderStyle: "solid", borderColor: "#A7F3D0", color: "#047857", textStyle: "ui", fontWeight: 600 });
const listBoxCss = css({ borderWidth: "1px", borderStyle: "solid", borderColor: "border", borderRadius: "13px", px: "16px" });
const overlineCss = css({ textStyle: "eyebrow", fontWeight: 600, color: "muted" });
const unlockedRowCss = cva({
  base: { display: "flex", alignItems: "center", gap: "11.2px", py: "10px" },
  variants: { divided: { true: { borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "border" }, false: {} } },
});
const unlockedIconCss = css({ flexShrink: 0, w: "30px", h: "30px", borderRadius: "9px", bg: "#ECFDF5", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center" });
const unlockedTextCss = css({ textStyle: "body", color: "body" });

const UNLOCKED = ["Withdraw earnings and get paid", "Place and accept orders without limits", "A verified badge on your profile"];

export function KycApprovedView({ onDone }: { onDone: () => void }) {
  return (
    <ResultCard footer={<button type="button" onClick={onDone} className={primaryBtn}>Start using KickAir</button>}>
      <ResultIcon tone="green"><BadgeCheck size={44} /></ResultIcon>
      <Heading title="You're verified" sub="Your identity has been confirmed. You now have full access to everything on KickAir." />
      <div className={approvedBadgeWrapCss}>
        <div className={approvedBadgeCss}>
          <Check size={15} />Identity verified
        </div>
      </div>
      <div className={listBoxCss}>
        <p className={overlineCss}>Now unlocked</p>
        {UNLOCKED.map((t, i) => (
          <div key={t} className={unlockedRowCss({ divided: !!i })}>
            <div className={unlockedIconCss}><Check size={16} /></div>
            <p className={unlockedTextCss}>{t}</p>
          </div>
        ))}
      </div>
    </ResultCard>
  );
}

const helpNoteCss = css({ textStyle: "meta", color: "muted", textAlign: "center" });
const helpLinkCss = css({ color: "accent", fontWeight: 600 });
const reasonBoxCss = css({ display: "flex", gap: "11.2px", p: "14px 16px", borderRadius: "13px", bg: "#FEF2F2", borderWidth: "1px", borderStyle: "solid", borderColor: "#FBD2D2" });
const reasonIconCss = css({ color: "#DC2626", flexShrink: 0, mt: "1px" });
const reasonTitleCss = css({ textStyle: "ui", fontWeight: 700, color: "#B91C1C" });
const reasonTextCss = css({ textStyle: "ui", color: "#7F1D1D" });
const tipsBoxCss = css({ mt: "16px", borderWidth: "1px", borderStyle: "solid", borderColor: "border", borderRadius: "13px", px: "16px" });
const tipRowCss = css({ display: "flex", alignItems: "center", gap: "11.2px", py: "10px" });
const tipIconCss = css({ flexShrink: 0, w: "28px", h: "28px", borderRadius: "8px", bg: "fill", color: "body", display: "flex", alignItems: "center", justifyContent: "center" });
const tipTextCss = css({ textStyle: "ui", color: "body" });

const TIPS: [string, React.ReactNode][] = [
  ["Use a current, non-expired document", <Calendar key="a" size={16} />],
  ["Make sure every corner is visible", <Focus key="b" size={16} />],
  ["Avoid glare and shadows", <Sun key="c" size={16} />],
];

export function KycRejectedView({ reason, onResubmit }: { reason: string | null; onResubmit: () => void }) {
  return (
    <ResultCard
      footer={
        <>
          <button type="button" onClick={onResubmit} className={primaryBtn}>
            <RotateCcw size={20} className={startIconCss} />
            Resubmit documents
          </button>
          <p className={helpNoteCss}>
            Need help? <span className={helpLinkCss}>Contact support</span>
          </p>
        </>
      }
    >
      <ResultIcon tone="red"><AlertCircle size={40} /></ResultIcon>
      <Heading title="We couldn't verify your identity" sub="Don't worry — this happens. Fix the issue below and submit again." />
      {reason && (
        <div className={reasonBoxCss}>
          <AlertCircle size={18} className={reasonIconCss} />
          <div>
            <p className={reasonTitleCss}>Reason from our review team</p>
            <p className={reasonTextCss}>{reason}</p>
          </div>
        </div>
      )}
      <div className={tipsBoxCss}>
        <p className={overlineCss}>Before you resubmit</p>
        {TIPS.map(([t, ic]) => (
          <div key={t} className={tipRowCss}>
            <div className={tipIconCss}>{ic}</div>
            <p className={tipTextCss}>{t}</p>
          </div>
        ))}
      </div>
    </ResultCard>
  );
}
