"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Paper, Typography, Button, Alert } from "@mui/material";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import { TextInput, tokens } from "@/components/ui/inputs";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await api.post("/api/auth/forgot-password", { email: email.trim() });
      setSent(true);
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

          {sent ? (
            <Box sx={{ textAlign: "center" }}>
              <MarkEmailReadOutlinedIcon sx={{ fontSize: 44, color: tokens.accent, mb: 1.5 }} />
              <Typography component="h1" sx={{ fontSize: 23, fontWeight: 700, color: tokens.heading, letterSpacing: "-0.02em", mb: 0.5 }}>
                Check your inbox
              </Typography>
              <Typography sx={{ fontSize: 14.5, color: tokens.muted, mb: 3 }}>
                If <b>{email.trim()}</b> is registered, we&apos;ve sent a link to reset your password. The link expires in 60 minutes — check your spam folder if it doesn&apos;t arrive.
              </Typography>
              <Button
                fullWidth
                variant="contained"
                onClick={() => router.push("/auth/sign-in")}
                sx={{ height: 48, borderRadius: 2.5, textTransform: "none", fontSize: "1rem", fontWeight: 500, color: "common.white", backgroundColor: tokens.accent, "&:hover": { backgroundColor: tokens.accentHover } }}>
                Back to sign in
              </Button>
            </Box>
          ) : (
            <>
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Typography component="h1" sx={{ fontSize: 23, fontWeight: 700, color: tokens.heading, letterSpacing: "-0.02em", mb: 0.5 }}>
                  Forgot your password?
                </Typography>
                <Typography sx={{ fontSize: 14.5, color: tokens.muted }}>
                  Enter your account email and we&apos;ll send you a reset link.
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2.5 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextInput
                  label="Email"
                  id="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isLoading || !email.trim()}
                  sx={{ height: 48, borderRadius: 2.5, textTransform: "none", fontSize: "1rem", fontWeight: 500, color: "common.white", backgroundColor: tokens.accent, "&:hover": { backgroundColor: tokens.accentHover } }}>
                  {isLoading ? "Sending…" : "Send reset link"}
                </Button>
              </Box>

              <Box sx={{ mt: 4 }}>
                <Typography sx={{ textAlign: "center", fontSize: 14, color: tokens.body }}>
                  Remembered it?{" "}
                  <Box
                    component="a"
                    onClick={() => router.push("/auth/sign-in")}
                    sx={{ color: tokens.accent, fontWeight: 700, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3, "&:hover": { opacity: 0.85 } }}>
                    Sign in
                  </Box>
                </Typography>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
