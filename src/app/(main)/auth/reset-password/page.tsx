"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Paper, Typography, Button, Alert, CircularProgress } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { PasswordInput, tokens } from "@/components/ui/inputs";
import { api } from "@/lib/api";

function ResetPasswordContent() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";

  const linkBroken = !token || !email;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await api.post("/api/auth/reset-password", {
        token,
        email,
        password,
        password_confirmation: confirm,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "95vh", display: "flex", alignItems: "center", justifyContent: "center", px: { xs: 2, sm: 6 }, backgroundColor: tokens.page }}>
      <Box sx={{ width: "100%", maxWidth: 420 }}>
        <Paper elevation={0} sx={{ borderRadius: 0, border: `1px solid ${tokens.border}`, p: { xs: 3, sm: 4 }, boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 12px 32px rgba(15,23,42,0.07)" }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2.5 }}>
            <Box component="img" src="/assets/images/kickair-logo.png" alt="KickAir" sx={{ height: 36 }} />
          </Box>

          {done ? (
            <Box sx={{ textAlign: "center" }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 44, color: tokens.success, mb: 1.5 }} />
              <Typography component="h1" sx={{ fontSize: 23, fontWeight: 700, color: tokens.heading, letterSpacing: "-0.02em", mb: 0.5 }}>
                Password reset
              </Typography>
              <Typography sx={{ fontSize: 14.5, color: tokens.muted, mb: 3 }}>
                Your password has been changed. Sign in with your new password to continue.
              </Typography>
              <Button
                fullWidth
                variant="contained"
                onClick={() => router.push("/auth/sign-in")}
                sx={{ height: 48, borderRadius: 2.5, textTransform: "none", fontSize: "1rem", fontWeight: 500, color: "common.white", backgroundColor: tokens.accent, "&:hover": { backgroundColor: tokens.accentHover } }}>
                Sign in
              </Button>
            </Box>
          ) : linkBroken ? (
            <Box sx={{ textAlign: "center" }}>
              <Typography component="h1" sx={{ fontSize: 23, fontWeight: 700, color: tokens.heading, letterSpacing: "-0.02em", mb: 0.5 }}>
                Invalid reset link
              </Typography>
              <Typography sx={{ fontSize: 14.5, color: tokens.muted, mb: 3 }}>
                This link is missing its reset details. Request a new one and use the link from the latest email.
              </Typography>
              <Button
                fullWidth
                variant="contained"
                onClick={() => router.push("/auth/forgot-password")}
                sx={{ height: 48, borderRadius: 2.5, textTransform: "none", fontSize: "1rem", fontWeight: 500, color: "common.white", backgroundColor: tokens.accent, "&:hover": { backgroundColor: tokens.accentHover } }}>
                Request a new link
              </Button>
            </Box>
          ) : (
            <>
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Typography component="h1" sx={{ fontSize: 23, fontWeight: 700, color: tokens.heading, letterSpacing: "-0.02em", mb: 0.5 }}>
                  Choose a new password
                </Typography>
                <Typography sx={{ fontSize: 14.5, color: tokens.muted }}>
                  Resetting the password for <b>{email}</b>
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2.5 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography component="label" htmlFor="new-password" sx={{ display: "block", fontSize: 13, fontWeight: 500, color: tokens.body, mb: 0.875 }}>
                    New password
                  </Typography>
                  <PasswordInput id="new-password" value={password} onChange={setPassword} placeholder="At least 8 characters" disabled={isLoading} />
                </Box>
                <Box>
                  <Typography component="label" htmlFor="confirm-password" sx={{ display: "block", fontSize: 13, fontWeight: 500, color: tokens.body, mb: 0.875 }}>
                    Confirm new password
                  </Typography>
                  <PasswordInput id="confirm-password" value={confirm} onChange={setConfirm} placeholder="Repeat the password" disabled={isLoading} />
                </Box>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isLoading || !password || !confirm}
                  sx={{ height: 48, borderRadius: 2.5, textTransform: "none", fontSize: "1rem", fontWeight: 500, color: "common.white", backgroundColor: tokens.accent, "&:hover": { backgroundColor: tokens.accentHover } }}>
                  {isLoading ? "Resetting…" : "Reset password"}
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ minHeight: "95vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: tokens.page }}>
          <CircularProgress sx={{ color: tokens.accent }} />
        </Box>
      }>
      <ResetPasswordContent />
    </Suspense>
  );
}
