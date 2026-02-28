"use client";

import { useState } from "react";
import { Box, Paper, Typography, Button, Alert, Divider } from "@mui/material";
import { MarkEmailUnread, MailOutline } from "@mui/icons-material";

interface EmailVerificationWallProps {
  email: string | null;
  onResend: () => Promise<void>;
  onLogout: () => Promise<void>;
}

export default function EmailVerificationWall({ email, onResend, onLogout }: EmailVerificationWallProps) {
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const handleResend = async () => {
    setResending(true);
    setResendError("");
    setResendSuccess(false);
    try {
      await onResend();
      setResendSuccess(true);
    } catch {
      setResendError("Failed to resend. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "#F5F5F7",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 3, sm: 6 },
      }}>
      <Box sx={{ width: "100%", maxWidth: 448 }}>
        <Paper
          elevation={0}
          sx={{ borderRadius: 6, border: 1, borderColor: "divider", p: { xs: 4, md: 6 }, textAlign: "center" }}>
          {/* Icon with outer ring */}
          <Box sx={{ position: "relative", width: 88, height: 88, mx: "auto", mb: 4 }}>
            <Box
              sx={{
                position: "absolute",
                inset: -10,
                borderRadius: "50%",
                bgcolor: "primary.main",
                opacity: 0.1,
              }}
            />
            <Box
              sx={{
                width: 88,
                height: 88,
                borderRadius: "50%",
                bgcolor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
              <MarkEmailUnread sx={{ fontSize: 40, color: "primary.contrastText" }} />
            </Box>
          </Box>

          <Typography variant="h4" fontWeight={700} mb={1.5} color="text.primary">
            Verify your email
          </Typography>

          <Typography variant="body1" color="text.secondary" mb={2}>
            We sent a verification link to
          </Typography>

          {/* Email chip */}
          {email && (
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
                bgcolor: "action.hover",
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
                px: 2,
                py: 0.75,
                mb: 3.5,
              }}>
              <MailOutline sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="body2" fontWeight={600} color="text.primary">
                {email}
              </Typography>
            </Box>
          )}

          <Typography variant="body2" color="text.secondary" mb={4} sx={{ lineHeight: 1.75 }}>
            Click the link in the email to activate your account.{" "}
            <Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>
              Check your spam folder
            </Box>{" "}
            if you don&apos;t see it within a few minutes.
          </Typography>

          {resendSuccess && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2, textAlign: "left" }}>
              Verification email resent successfully!
            </Alert>
          )}
          {resendError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2, textAlign: "left" }}>
              {resendError}
            </Alert>
          )}

          <Button
            variant="contained"
            fullWidth
            onClick={handleResend}
            disabled={resending || resendSuccess}
            sx={{
              height: 48,
              borderRadius: 3,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 500,
              mb: 2,
              color: "white !important",
              "&:hover": { backgroundColor: "primary.dark" },
            }}>
            {resending ? "Sending..." : resendSuccess ? "Email sent" : "Resend verification email"}
          </Button>

          <Divider sx={{ mb: 2 }} />

          <Button
            variant="text"
            fullWidth
            onClick={handleLogout}
            disabled={loggingOut}
            sx={{
              height: 44,
              borderRadius: 3,
              textTransform: "none",
              fontSize: "0.875rem",
              color: "text.secondary",
              "&:hover": { color: "text.primary", bgcolor: "action.hover" },
            }}>
            {loggingOut ? "Signing out..." : "Sign out"}
          </Button>
        </Paper>
      </Box>
    </Box>
  );
}
