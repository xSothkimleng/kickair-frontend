"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Lock, ShieldCheck, X } from "lucide-react";
import { css, cva, cx } from "styled-system/css";
import { Dialog, Spinner, iconButton } from "@/components/ds";
import { BareModal } from "@/components/ds/BareModal";
import { useAuth } from "@/components/context/AuthContext";
import GoogleButton from "@/components/auth/GoogleButton";
import { pillButton } from "@/components/payment/pill";
import { withRedirect } from "@/lib/redirect";
import type { User } from "@/types/user";

/**
 * A snapshot of what the buyer is about to purchase, shown inside the gate so
 * they never lose the context of their order while signing in / switching roles.
 * Deliberately generic (not service-specific) so a milestone funding or any other
 * buy entry point can populate it too.
 */
export type PurchaseSummary = {
  imageUrl?: string | null;
  title: string;
  tierLabel?: string | null; // e.g. "Basic"
  sellerName?: string | null; // e.g. "KickAir Admin"
  metaLine?: string | null; // e.g. "7-day delivery · 3 revisions"
  amount: number;
};

type GateState = null | "login" | "become-client" | "kyc";

type UsePurchaseGateOptions = {
  /** What the buyer is purchasing — rendered as an order-summary card. */
  summary?: PurchaseSummary | null;
  /** Where to send the buyer after they authenticate (defaults to the app's fallback). */
  redirectTo?: string | null;
};

const CONTENT = {
  login: {
    heading: "Sign in to place your order",
    body: "Sign in or create a free account to continue — you'll come right back here to finish. You won't be charged yet.",
    primary: "Sign in",
    secondary: "Create an account",
  },
  "become-client": {
    heading: "Switch to a client account",
    body: "Orders are placed from a client account. Add one to continue — you keep your freelancer account and can switch anytime.",
    primary: "Become a client",
    secondary: "Cancel",
  },
  kyc: {
    heading: "Verify your identity",
    body: "For everyone's safety, please complete a quick identity check (KYC) before placing an order. It only takes a few minutes.",
    primary: "Verify now",
    secondary: "Cancel",
  },
} as const;

const fmtUsd = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Stable id so `Dialog.Title` keeps labelling the panel (was `aria-labelledby`).
const GATE_IDS = { title: "purchase-gate-heading" };

const panelCss = css({ boxShadow: "0 16px 48px rgba(0,0,0,0.18)" });
const bodyCss = css({ p: { base: "24px 20px 20px", sm: "28px 28px 24px" }, position: "relative", color: "ink" });
// Recipe + overrides merged into one style object: Panda's `cx` only
// concatenates class names, so an override passed as a second class would lose
// to whichever atomic rule the generated sheet happens to emit last.
const closeBtn = css(iconButton.raw({ size: "md", shape: "round", variant: "ghost", tone: "default" }), {
  position: "absolute",
  top: "16px",
  right: "16px",
  w: "32px",
  h: "32px",
  bg: "rgba(0,0,0,0.05)",
  color: "ink2",
  _hover: { bg: "rgba(0,0,0,0.1)", color: "ink2" },
});
const brandRow = css({ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", mb: "20px" });
const brandMark = css({ w: "22px", h: "22px", borderRadius: "7px", bg: "accent", display: "flex", alignItems: "center", justifyContent: "center" });
const brandDot = css({ w: "8px", h: "8px", borderRadius: "2px", bg: "#fff", transform: "rotate(45deg)" });
const brandName = css({ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.01em" });
// The `mb` these two carried as MUI Typography never applied — globals.css's
// unlayered `p, h1-h6 { margin: 0 }` outranks any layered rule — so it's dropped.
const headingCss = css({ fontSize: "20px", fontWeight: 700, lineHeight: 1.25, letterSpacing: "-0.01em", color: "ink" });
const bodyText = css({ fontSize: "14px", lineHeight: 1.5, color: "ink2" });
// GoogleButton merges an extra `className` with `cx`, which can't override its
// own atomic classes — a descendant selector on a wrapper wins on specificity.
const googleWrap = css({
  "& > button": {
    borderRadius: "pill",
    borderColor: "hairlineStrong",
    color: "ink",
    transition: "background 0.15s, box-shadow 0.15s",
    _hover: { borderColor: "hairlineStrong", bg: "surface2", boxShadow: "0 1px 4px rgba(0,0,0,0.10)" },
  },
});
const orRow = css({ display: "flex", alignItems: "center", gap: "12px", my: "16px" });
const orRule = css({ flex: 1, h: "1px", bg: "hairline" });
const orLabel = css({ fontSize: "12px", color: "ink3" });
const errorBox = css({
  display: "flex",
  alignItems: "flex-start",
  gap: "9px",
  bg: "errorTint",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "#dc262633",
  borderRadius: "10px",
  p: "10px 12px",
  mb: "14px",
});
const errorIcon = css({ flex: "0 0 16px", mt: "1px", color: "error" });
const errorText = css({ fontSize: "13px", lineHeight: 1.4, color: "error" });
const stepsRow = css({ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", mb: "18px" });
const primaryBtn = css(pillButton.raw({ tone: "accent", size: "md", full: true }), { h: "46px" });
// `_disabled` reproduces MUI's disabled Button text colour (the gate greys the
// secondary out while "Become a client" is in flight).
const secondaryBtn = css(pillButton.raw({ tone: "grey", size: "md", full: true }), {
  h: "46px",
  mt: "10px",
  _disabled: { color: "rgba(0,0,0,0.26)" },
});
const primarySpinner = css({ ml: "-4px" });
const trustRow = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "16px",
  mt: "20px",
  pt: "18px",
  borderTopWidth: "1px",
  borderTopStyle: "solid",
  borderTopColor: "hairline",
});

/**
 * Purchase precondition gate, shared by every buy entry point (service "Continue",
 * checkout, custom-order funding). Enforces the chain: logged in -> client role ->
 * KYC approved. Call ensureCanPurchase() before starting a purchase; if it returns
 * false a dialog is shown explaining the missing step. Render {gateDialog} once.
 */
export function usePurchaseGate(options: UsePurchaseGateOptions = {}) {
  const { summary = null, redirectTo = null } = options;
  const { user, enableRole } = useAuth();
  const router = useRouter();

  const [gate, setGate] = useState<GateState>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ensureCanPurchase = useCallback((): boolean => {
    if (!user) {
      setGate("login");
      return false;
    }
    if (!user.is_client) {
      setGate("become-client");
      return false;
    }
    if (!user.is_verified_id) {
      setGate("kyc");
      return false;
    }
    return true;
  }, [user]);

  const close = () => {
    if (busy) return;
    setGate(null);
    setError(null);
  };

  const becomeClient = async () => {
    setBusy(true);
    setError(null);
    try {
      const updated = await enableRole("client");
      // Advance straight to the next unmet precondition rather than closing.
      setGate(updated.is_verified_id ? null : "kyc");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not enable your client account. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  // After a Google sign-in from the login gate, keep the buyer in the modal and
  // advance them through any remaining preconditions instead of bouncing pages.
  const afterGoogle = (u: User) => {
    if (!u.is_client) return setGate("become-client");
    if (!u.is_verified_id) return setGate("kyc");
    setGate(null);
    if (redirectTo) {
      router.push(redirectTo);
      router.refresh();
    }
  };

  const onPrimary = () => {
    if (gate === "login") router.push(withRedirect("/auth/sign-in", redirectTo));
    else if (gate === "become-client") becomeClient();
    else if (gate === "kyc") router.push("/dashboard/kyc");
  };

  const onSecondary = () => {
    if (gate === "login") router.push(withRedirect("/auth/sign-up", redirectTo));
    else close();
  };

  const c = gate ? CONTENT[gate] : null;

  const gateDialog = (
    <BareModal
      open={gate !== null}
      onOpenChange={o => { if (!o) close(); }}
      maxW='440px'
      ids={GATE_IDS}
      className={panelCss}>
      {gate && c && (
        <div className={bodyCss}>
          {/* Close */}
          <Dialog.CloseTrigger asChild>
            <button type='button' aria-label='Close' disabled={busy} className={closeBtn}>
              <X size={18} />
            </button>
          </Dialog.CloseTrigger>

          {/* Brand mark */}
          <div className={brandRow}>
            <div className={brandMark}>
              <div className={brandDot} />
            </div>
            <p className={brandName}>KickAir</p>
          </div>

          {/* Order summary */}
          {summary && <OrderSummaryCard summary={summary} />}

          {/* Heading + body */}
          <Dialog.Title className={headingCss}>{c.heading}</Dialog.Title>
          <p className={bodyText}>{c.body}</p>

          {/* Google fast path — login only */}
          {gate === "login" && (
            <>
              <div className={googleWrap}>
                <GoogleButton
                  label='Continue with Google'
                  roles={{ is_client: true }}
                  onAuthenticated={afterGoogle}
                  onError={setError}
                />
              </div>
              <div className={orRow}>
                <div className={orRule} />
                <p className={orLabel}>or</p>
                <div className={orRule} />
              </div>
            </>
          )}

          {/* Error (become-client can fail) */}
          {error && (
            <div role='alert' className={errorBox}>
              <AlertCircle size={16} className={errorIcon} />
              <p className={errorText}>{error}</p>
            </div>
          )}

          {/* KYC step hint */}
          {gate === "kyc" && (
            <div className={stepsRow}>
              <StepPill>1 · ID</StepPill>
              <Arrow />
              <StepPill>2 · Selfie</StepPill>
              <Arrow />
              <StepPill done>3 · Done</StepPill>
            </div>
          )}

          {/* Primary CTA */}
          {busy ? (
            <button type='button' disabled className={primaryBtn}>
              <Spinner size={16} className={primarySpinner} />
              {c.primary}
            </button>
          ) : (
            <button type='button' onClick={onPrimary} className={primaryBtn}>
              {c.primary}
            </button>
          )}

          {/* Secondary */}
          <button type='button' onClick={onSecondary} disabled={busy} className={secondaryBtn}>
            {c.secondary}
          </button>

          {/* Trust row — login only */}
          {gate === "login" && (
            <div className={trustRow}>
              <TrustItem icon={<ShieldCheck size={14} />}>Money-back</TrustItem>
              <TrustItem icon={<Lock size={14} />}>Escrow-protected</TrustItem>
              <TrustItem icon={<CheckCircle2 size={14} />}>Verified</TrustItem>
            </div>
          )}
        </div>
      )}
    </BareModal>
  );

  return { ensureCanPurchase, gateDialog };
}

/* ---- presentational helpers ---- */

const summaryCard = css({
  display: "flex",
  gap: "14px",
  alignItems: "center",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hairline",
  bg: "surface2",
  borderRadius: "12px",
  p: "12px",
  mb: "22px",
});
const summaryThumb = css({
  w: "56px",
  h: "56px",
  flex: "0 0 56px",
  borderRadius: "10px",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});
const summaryThumbEmpty = css({ backgroundImage: "repeating-linear-gradient(45deg,rgba(0,0,0,0.05) 0 6px,rgba(0,0,0,0.09) 6px 12px)" });
const summaryThumbImg = css({ w: "100%", h: "100%", objectFit: "cover" });
const summaryPlaceholder = css({ fontFamily: "mono", fontSize: "7px", color: "ink3", textAlign: "center", lineHeight: 1.2 });
const summaryMain = css({ flex: 1, minWidth: 0 });
const summaryTitle = css({ fontSize: "14px", fontWeight: 500, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });
const summaryMeta = css({ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" });
const summaryMetaGap = css({ mb: "4px" });
const summaryTier = css({
  fontSize: "11px",
  fontWeight: 500,
  color: "accent",
  bg: "accentFill",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "#0071e333",
  borderRadius: "pill",
  px: "9px",
  py: "1px",
});
const summarySeller = css({ fontSize: "12px", color: "ink2" });
const summaryLine = css({ fontSize: "12px", color: "ink3" });
const summaryAmount = css({ fontFamily: "mono", fontSize: "16px", fontWeight: 600, fontVariantNumeric: "tabular-nums", alignSelf: "flex-start" });

function OrderSummaryCard({ summary }: { summary: PurchaseSummary }) {
  return (
    <div className={summaryCard}>
      <div className={cx(summaryThumb, !summary.imageUrl && summaryThumbEmpty)}>
        {summary.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={summary.imageUrl} alt={summary.title} className={summaryThumbImg} />
        ) : (
          <p className={summaryPlaceholder}>
            service
            <br />
            image
          </p>
        )}
      </div>
      <div className={summaryMain}>
        <p className={summaryTitle}>{summary.title}</p>
        <div className={cx(summaryMeta, summary.metaLine && summaryMetaGap)}>
          {summary.tierLabel && <span className={summaryTier}>{summary.tierLabel}</span>}
          {summary.sellerName && <span className={summarySeller}>by {summary.sellerName}</span>}
        </div>
        {summary.metaLine && <p className={summaryLine}>{summary.metaLine}</p>}
      </div>
      <p className={summaryAmount}>{fmtUsd(summary.amount)}</p>
    </div>
  );
}

const stepPill = cva({
  base: { fontSize: "12px", fontWeight: 500, borderRadius: "pill", px: "12px", py: "5px", borderWidth: "1px", borderStyle: "solid" },
  variants: {
    done: {
      true: { color: "successText", bg: "successTint", borderColor: "#16a34a33" },
      false: { color: "ink2", bg: "surface2", borderColor: "hairline" },
    },
  },
  defaultVariants: { done: false },
});

function StepPill({ children, done }: { children: React.ReactNode; done?: boolean }) {
  return <span className={stepPill({ done })}>{children}</span>;
}

const arrowCss = css({ color: "ink3", fontSize: "12px" });

function Arrow() {
  return <span className={arrowCss}>→</span>;
}

// `& svg` keeps MUI SvgIcon's `flex-shrink: 0` for the icons passed in.
const trustItem = css({ display: "flex", alignItems: "center", gap: "5px", color: "ink3", "& svg": { flexShrink: 0 } });
const trustLabel = css({ fontSize: "11px", color: "ink3" });

function TrustItem({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className={trustItem}>
      {icon}
      <p className={trustLabel}>{children}</p>
    </div>
  );
}
