"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { tokens } from "@/theme";
import { VerifyBody, VerifyButton, VerifyCard, VerifyHeadline, VerifyNotice, VerifyOverline } from "./verifyKit";

interface EmailVerificationWallProps {
  email: string | null;
  onResend: () => Promise<void>;
  onLogout: () => Promise<void>;
}

/** Full-screen wall shown in place of the app until the user clicks the verification link. */
export default function EmailVerificationWall({ email, onResend, onLogout }: EmailVerificationWallProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const resend = async () => {
    setStatus("sending");
    setError("");
    try {
      await onResend();
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "We couldn't resend the email. Please try again.");
      setStatus("error");
    }
  };

  const logout = async () => {
    setLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <VerifyCard>
      <VerifyOverline>Email verification</VerifyOverline>
      <VerifyHeadline>
        One click and
        <br />
        you&apos;re in.
      </VerifyHeadline>
      <Box sx={{ mt: 2.5 }}>
        <VerifyBody>We sent a verification link to</VerifyBody>
      </Box>

      {email ? (
        <Box
          sx={{
            mt: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            px: 2,
            py: 1.5,
            bgcolor: tokens.canvas,
            border: `1px solid ${tokens.border}`,
          }}>
          <Typography sx={{ fontFamily: tokens.mono, fontSize: 14, color: tokens.text, wordBreak: "break-all" }}>{email}</Typography>
          <Typography
            component="button"
            type="button"
            onClick={logout}
            disabled={loggingOut}
            sx={{
              flexShrink: 0,
              background: "none",
              border: 0,
              p: 0,
              fontFamily: "inherit",
              fontSize: 12,
              fontWeight: 600,
              color: tokens.accent,
              cursor: "pointer",
              "&:hover": { color: tokens.accentHover },
              "&:disabled": { opacity: 0.5, cursor: "default" },
            }}>
            {loggingOut ? "Signing out…" : "Not you?"}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ mt: 1.5 }}>
          <VerifyBody sx={{ color: tokens.text }}>the address you signed up with.</VerifyBody>
        </Box>
      )}

      <Box sx={{ mt: 2.5 }}>
        <VerifyBody>
          Open it and press <strong style={{ color: tokens.text, fontWeight: 600 }}>Verify email address</strong> — it takes about ten
          seconds. The link works for 60 minutes.
        </VerifyBody>
      </Box>

      {status === "error" && <VerifyNotice tone="error">{error}</VerifyNotice>}
      {status === "sent" && (
        <VerifyNotice tone="success">A fresh link is on its way{email ? ` to ${email}` : ""}. Give it a minute.</VerifyNotice>
      )}

      <Box sx={{ mt: 3.5, display: "flex", gap: 1.5, flexWrap: "wrap" }}>
        <VerifyButton onClick={resend} disabled={status === "sending" || status === "sent"}>
          {status === "sending" ? "Sending…" : status === "sent" ? "Email sent" : "Resend email"}
        </VerifyButton>
        <VerifyButton variant="secondary" onClick={logout} disabled={loggingOut}>
          {loggingOut ? "Signing out…" : "Sign out"}
        </VerifyButton>
      </Box>

      <Box sx={{ mt: 4.5, pt: 3, borderTop: `1px solid ${tokens.border}` }}>
        <Typography component="div" sx={{ fontSize: 13, fontWeight: 600, color: tokens.text, mb: 0.5 }}>
          Didn&apos;t get it?
        </Typography>
        <Typography sx={{ fontSize: 13, lineHeight: 1.6, color: tokens.text3 }}>
          Give it a minute, then check your Spam or Promotions folder. If the address above is wrong, sign out and create the
          account again with the right one.
        </Typography>
      </Box>
    </VerifyCard>
  );
}
