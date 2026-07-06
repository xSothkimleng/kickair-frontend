"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, CircularProgress, Dialog, IconButton, Typography } from "@mui/material";
import {
  Close as CloseIcon,
  LockOutlined,
  VerifiedUserOutlined,
  CheckCircleOutline,
} from "@mui/icons-material";
import { useAuth } from "@/components/context/AuthContext";
import GoogleButton from "@/components/auth/GoogleButton";
import { tokens } from "@/theme";
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
    body: "Orders are placed from a client account. Add one to continue — you keep your freelancer account and can switch between them anytime.",
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
    <Dialog
      open={gate !== null}
      onClose={close}
      aria-labelledby="purchase-gate-heading"
      slotProps={{ paper: { sx: { borderRadius: "16px", m: 2, maxWidth: 440, width: "100%", boxShadow: "0 16px 48px rgba(0,0,0,0.18)" } } }}>
      {gate && c && (
        <Box sx={{ p: { xs: "24px 20px 20px", sm: "28px 28px 24px" }, position: "relative", color: tokens.text }}>
          {/* Close */}
          <IconButton
            aria-label="Close"
            onClick={close}
            disabled={busy}
            sx={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, bgcolor: "rgba(0,0,0,0.05)", color: tokens.text2, "&:hover": { bgcolor: "rgba(0,0,0,0.1)" } }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>

          {/* Brand mark */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 2.5 }}>
            <Box sx={{ width: 22, height: 22, borderRadius: "7px", bgcolor: tokens.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "2px", bgcolor: "#fff", transform: "rotate(45deg)" }} />
            </Box>
            <Typography sx={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>KickAir</Typography>
          </Box>

          {/* Order summary */}
          {summary && <OrderSummaryCard summary={summary} />}

          {/* Heading + body */}
          <Typography id="purchase-gate-heading" component="h2" sx={{ fontSize: 20, fontWeight: 700, lineHeight: 1.25, letterSpacing: "-0.01em", mb: 1 }}>
            {c.heading}
          </Typography>
          <Typography sx={{ fontSize: 14, lineHeight: 1.5, color: tokens.text2, mb: 2.5 }}>{c.body}</Typography>

          {/* Google fast path — login only */}
          {gate === "login" && (
            <>
              <GoogleButton
                label="Continue with Google"
                roles={{ is_client: true }}
                onAuthenticated={afterGoogle}
                onError={setError}
                sx={{ borderRadius: "999px", borderColor: tokens.borderStrong, color: tokens.text, "&:hover": { borderColor: tokens.borderStrong, backgroundColor: tokens.surface2 } }}
              />
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, my: 2 }}>
                <Box sx={{ flex: 1, height: "1px", bgcolor: tokens.border }} />
                <Typography sx={{ fontSize: 12, color: tokens.text3 }}>or</Typography>
                <Box sx={{ flex: 1, height: "1px", bgcolor: tokens.border }} />
              </Box>
            </>
          )}

          {/* Error (become-client can fail) */}
          {error && (
            <Box role="alert" sx={{ display: "flex", alignItems: "flex-start", gap: 1, bgcolor: tokens.errorTint, border: `1px solid ${tokens.error}33`, borderRadius: "10px", p: "10px 12px", mb: 1.75 }}>
              <Typography sx={{ fontSize: 13, lineHeight: 1.4, color: tokens.error }}>{error}</Typography>
            </Box>
          )}

          {/* KYC step hint */}
          {gate === "kyc" && (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 2.25 }}>
              <StepPill>1 · ID</StepPill>
              <Arrow />
              <StepPill>2 · Selfie</StepPill>
              <Arrow />
              <StepPill done>3 · Done</StepPill>
            </Box>
          )}

          {/* Primary CTA */}
          {busy ? (
            <Button
              fullWidth
              disabled
              startIcon={<CircularProgress size={16} sx={{ color: "#fff" }} />}
              sx={{ height: 46, borderRadius: "999px", bgcolor: tokens.accent, color: "#fff", textTransform: "none", fontSize: 15, fontWeight: 500, "&.Mui-disabled": { bgcolor: tokens.accent, color: "#fff", opacity: 0.65 } }}>
              {c.primary}
            </Button>
          ) : (
            <Button
              fullWidth
              onClick={onPrimary}
              sx={{ height: 46, borderRadius: "999px", bgcolor: tokens.accent, color: "#fff", textTransform: "none", fontSize: 15, fontWeight: 500, "&:hover": { bgcolor: tokens.accentHover } }}>
              {c.primary}
            </Button>
          )}

          {/* Secondary */}
          <Button
            fullWidth
            onClick={onSecondary}
            disabled={busy}
            sx={{ mt: 1.25, height: 46, borderRadius: "999px", bgcolor: "rgba(0,0,0,0.05)", color: tokens.text, textTransform: "none", fontSize: 15, fontWeight: 500, "&:hover": { bgcolor: "rgba(0,0,0,0.09)" } }}>
            {c.secondary}
          </Button>

          {/* Trust row — login only */}
          {gate === "login" && (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, mt: 2.5, pt: 2.25, borderTop: `1px solid ${tokens.border}` }}>
              <TrustItem icon={<VerifiedUserOutlined sx={{ fontSize: 14 }} />}>Money-back</TrustItem>
              <TrustItem icon={<LockOutlined sx={{ fontSize: 14 }} />}>Escrow-protected</TrustItem>
              <TrustItem icon={<CheckCircleOutline sx={{ fontSize: 14 }} />}>Verified</TrustItem>
            </Box>
          )}
        </Box>
      )}
    </Dialog>
  );

  return { ensureCanPurchase, gateDialog };
}

/* ---- presentational helpers ---- */

function OrderSummaryCard({ summary }: { summary: PurchaseSummary }) {
  return (
    <Box sx={{ display: "flex", gap: 1.75, alignItems: "center", border: `1px solid ${tokens.border}`, bgcolor: tokens.surface2, borderRadius: "12px", p: 1.5, mb: 2.75 }}>
      <Box
        sx={{
          width: 56,
          height: 56,
          flex: "0 0 56px",
          borderRadius: "10px",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: summary.imageUrl ? undefined : "repeating-linear-gradient(45deg,rgba(0,0,0,0.05) 0 6px,rgba(0,0,0,0.09) 6px 12px)",
        }}>
        {summary.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={summary.imageUrl} alt={summary.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Typography sx={{ fontFamily: tokens.mono, fontSize: 7, color: tokens.text3, textAlign: "center", lineHeight: 1.2 }}>
            service
            <br />
            image
          </Typography>
        )}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 500, lineHeight: 1.3, mb: 0.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {summary.title}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: summary.metaLine ? 0.5 : 0, flexWrap: "wrap" }}>
          {summary.tierLabel && (
            <Box component="span" sx={{ fontSize: 11, fontWeight: 500, color: tokens.accent, bgcolor: tokens.accentFill, border: `1px solid ${tokens.accent}33`, borderRadius: "999px", px: 1.125, py: "1px" }}>
              {summary.tierLabel}
            </Box>
          )}
          {summary.sellerName && <Typography component="span" sx={{ fontSize: 12, color: tokens.text2 }}>by {summary.sellerName}</Typography>}
        </Box>
        {summary.metaLine && <Typography sx={{ fontSize: 12, color: tokens.text3 }}>{summary.metaLine}</Typography>}
      </Box>
      <Typography sx={{ fontFamily: tokens.mono, fontSize: 16, fontWeight: 600, fontVariantNumeric: "tabular-nums", alignSelf: "flex-start" }}>
        {fmtUsd(summary.amount)}
      </Typography>
    </Box>
  );
}

function StepPill({ children, done }: { children: React.ReactNode; done?: boolean }) {
  return (
    <Box
      component="span"
      sx={{
        fontSize: 12,
        fontWeight: 500,
        borderRadius: "999px",
        px: 1.5,
        py: 0.625,
        color: done ? tokens.successText : tokens.text2,
        bgcolor: done ? tokens.successTint : tokens.surface2,
        border: `1px solid ${done ? `${tokens.success}33` : tokens.border}`,
      }}>
      {children}
    </Box>
  );
}

function Arrow() {
  return <Box component="span" sx={{ color: tokens.text3, fontSize: 12 }}>→</Box>;
}

function TrustItem({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.625, color: tokens.text3 }}>
      {icon}
      <Typography sx={{ fontSize: 11, color: tokens.text3 }}>{children}</Typography>
    </Box>
  );
}
