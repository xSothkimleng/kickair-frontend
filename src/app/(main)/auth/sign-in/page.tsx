"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Paper, Typography, Button, Divider, Alert } from "@mui/material";
import { useAuth } from "@/components/context/AuthContext";
import GoogleButton from "@/components/auth/GoogleButton";
import { TextInput, PasswordInput, tokens } from "@/components/ui/inputs";

export default function SignInPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { loginEmail, loginPhone } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Auto-detect: an "@" means email, otherwise treat it as a phone number.
      const isEmail = identifier.includes("@");
      const loggedInUser = isEmail
        ? await loginEmail(identifier.trim(), password)
        : await loginPhone(identifier.trim(), password);

      let destination = "/explore-services";
      if (loggedInUser.is_admin) {
        destination = "/admin";
      } else if (loggedInUser.is_freelancer && !loggedInUser.is_client) {
        destination = "/dashboard/freelancer";
      }

      router.push(destination);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "95vh", display: "flex", alignItems: "center", justifyContent: "center", px: { xs: 2, sm: 6 }, backgroundColor: tokens.page }}>
      <Box sx={{ width: "100%", maxWidth: 420 }}>
        <Paper elevation={0} sx={{ borderRadius: 4, border: `1px solid ${tokens.border}`, p: { xs: 3, sm: 4 }, boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 12px 32px rgba(15,23,42,0.07)" }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2.5 }}>
            <Box component="img" src="/assets/images/kickair-logo.png" alt="KickAir" sx={{ height: 36 }} />
          </Box>

          <Typography component="h1" sx={{ fontSize: 23, fontWeight: 700, color: tokens.heading, letterSpacing: "-0.02em", mb: 0.5 }}>
            Welcome back
          </Typography>
          <Typography sx={{ fontSize: 14.5, color: tokens.muted, mb: 3 }}>
            Sign in to continue to KickAir
          </Typography>

          <GoogleButton label="Continue with Google" />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, my: 2.5 }}>
            <Divider sx={{ flex: 1, borderColor: tokens.border }} />
            <Typography sx={{ fontSize: 13, color: tokens.muted }}>or</Typography>
            <Divider sx={{ flex: 1, borderColor: tokens.border }} />
          </Box>

          {error && (
            <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2.5 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextInput
              label="Email or phone"
              id="identifier"
              value={identifier}
              onChange={setIdentifier}
              placeholder="you@example.com or +855…"
              autoComplete="username"
              disabled={isLoading}
            />

            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 0.875 }}>
                <Typography component="label" htmlFor="password" sx={{ fontSize: 13, fontWeight: 500, color: tokens.body }}>
                  Password
                </Typography>
                <Button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  sx={{ minWidth: 0, p: 0, fontSize: 13, color: tokens.accent, textTransform: "none", "&:hover": { backgroundColor: "transparent", textDecoration: "underline" } }}>
                  Forgot password?
                </Button>
              </Box>
              <PasswordInput id="password" value={password} onChange={setPassword} placeholder="Enter your password" disabled={isLoading} />
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
              sx={{ height: 48, borderRadius: 2.5, textTransform: "none", fontSize: "1rem", fontWeight: 500, color: "common.white", backgroundColor: tokens.accent, "&:hover": { backgroundColor: tokens.accentHover } }}>
              {isLoading ? "Signing in…" : "Sign in"}
            </Button>
          </Box>

          <Typography sx={{ textAlign: "center", fontSize: 14, color: tokens.body, mt: 2.5 }}>
            New to KickAir?{" "}
            <Box component="a" onClick={() => router.push("/auth/sign-up")} sx={{ color: tokens.accent, fontWeight: 500, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>
              Create one
            </Box>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
