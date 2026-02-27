"use client";

import { useState } from "react";
import { Box, Paper, Typography, Button, Alert } from "@mui/material";
import { MarkEmailUnread } from "@mui/icons-material";

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
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 3, sm: 6 },
        bgcolor: "background.default",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 448, textAlign: "center" }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 6,
            border: 1,
            borderColor: "divider",
            p: { xs: 4, md: 6 },
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              bgcolor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
            }}
          >
            <MarkEmailUnread sx={{ fontSize: 36, color: "primary.contrastText" }} />
          </Box>

          <Typography variant="h5" fontWeight={600} mb={1} color="text.primary">
            Verify your email
          </Typography>

          <Typography variant="body1" color="text.secondary" mb={email ? 1 : 3}>
            We sent a verification link to
          </Typography>

          {email && (
            <Typography variant="body1" fontWeight={600} color="text.primary" mb={3}>
              {email}
            </Typography>
          )}

          <Typography variant="body2" color="text.secondary" mb={4}>
            Click the link in the email to activate your account. Check your spam folder if you don&apos;t see it.
          </Typography>

          {resendSuccess && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              Verification email resent! Check your inbox.
            </Alert>
          )}

          {resendError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
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
            }}
          >
            {resending ? "Sending..." : resendSuccess ? "Email sent" : "Resend verification email"}
          </Button>

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
            }}
          >
            {loggingOut ? "Signing out..." : "Sign out"}
          </Button>
        </Paper>
      </Box>
    </Box>
  );
}
