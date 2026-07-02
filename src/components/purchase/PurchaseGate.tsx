"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, CircularProgress, Dialog, Typography, Alert } from "@mui/material";
import { useAuth } from "@/components/context/AuthContext";

type GateState = null | "login" | "become-client" | "kyc";

/**
 * Purchase precondition gate, shared by every buy entry point (service "Continue",
 * checkout, custom-order funding). Enforces the chain: logged in -> client role ->
 * KYC approved. Call ensureCanPurchase() before starting a purchase; if it returns
 * false a dialog is shown explaining the missing step. Render {gateDialog} once.
 */
export function usePurchaseGate() {
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

  const gateDialog = (
    <Dialog
      open={gate !== null}
      onClose={close}
      slotProps={{ paper: { sx: { borderRadius: 4, p: 1, maxWidth: 420, width: "100%" } } }}>
      <Box sx={{ p: 3 }}>
        {gate === "login" && (
          <>
            <Typography sx={{ fontSize: 20, fontWeight: 600, mb: 1 }}>Sign in to continue</Typography>
            <Typography sx={{ fontSize: 14, color: "rgba(0,0,0,0.6)", mb: 3 }}>
              You need an account to place an order. Sign in or create one to continue to checkout.
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
              <Button fullWidth onClick={() => router.push("/auth/sign-in")} sx={primaryBtn}>
                Sign in
              </Button>
              <Button fullWidth onClick={() => router.push("/auth/sign-up")} sx={secondaryBtn}>
                Create an account
              </Button>
            </Box>
          </>
        )}

        {gate === "become-client" && (
          <>
            <Typography sx={{ fontSize: 20, fontWeight: 600, mb: 1 }}>Switch to a client account</Typography>
            <Typography sx={{ fontSize: 14, color: "rgba(0,0,0,0.6)", mb: 3 }}>
              Orders are placed from a client account. Add one to continue — you keep your freelancer account and can switch
              between them anytime.
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
              <Button fullWidth onClick={becomeClient} disabled={busy} sx={primaryBtn}>
                {busy ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Become a client"}
              </Button>
              <Button fullWidth onClick={close} disabled={busy} sx={secondaryBtn}>
                Cancel
              </Button>
            </Box>
          </>
        )}

        {gate === "kyc" && (
          <>
            <Typography sx={{ fontSize: 20, fontWeight: 600, mb: 1 }}>Verify your identity</Typography>
            <Typography sx={{ fontSize: 14, color: "rgba(0,0,0,0.6)", mb: 3 }}>
              For everyone&apos;s safety, please complete identity verification (KYC) before placing an order. It only takes a
              few minutes.
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
              <Button fullWidth onClick={() => router.push("/dashboard/kyc")} sx={primaryBtn}>
                Verify now
              </Button>
              <Button fullWidth onClick={close} sx={secondaryBtn}>
                Cancel
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Dialog>
  );

  return { ensureCanPurchase, gateDialog };
}

const primaryBtn = {
  height: 46,
  borderRadius: "999px",
  bgcolor: "#000",
  color: "#fff",
  textTransform: "none",
  fontSize: 15,
  fontWeight: 500,
  "&:hover": { bgcolor: "rgba(0,0,0,0.82)" },
  "&.Mui-disabled": { bgcolor: "rgba(0,0,0,0.35)", color: "#fff" },
} as const;

const secondaryBtn = {
  height: 46,
  borderRadius: "999px",
  bgcolor: "rgba(0,0,0,0.05)",
  color: "#000",
  textTransform: "none",
  fontSize: 15,
  fontWeight: 500,
  "&:hover": { bgcolor: "rgba(0,0,0,0.1)" },
} as const;
