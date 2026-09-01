"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import { tokens } from "@/theme";
import { api } from "@/lib/api";
import { useAuth } from "@/components/context/AuthContext";
import { VerifyBody, VerifyButton, VerifyCard, VerifyHeadline, VerifyNotice, VerifyTag } from "@/components/auth/verifyKit";

export type VerifiedStatus = "verified" | "expired" | "invalid" | "already";

// Sits under the main navbar, so leave room for it instead of forcing a full viewport.
const PAGE_MIN_HEIGHT = "85vh";

function ResendLinkForm() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const address = email.trim();
    if (!address) return;
    setSending(true);
    setError("");
    try {
      await api.resendVerificationLink(address);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "We couldn't send the link. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <VerifyNotice tone="success">
        If <strong>{email.trim()}</strong> has a KickAir account that still needs verifying, a new link is on its way.
      </VerifyNotice>
    );
  }

  return (
    <Box component="form" onSubmit={submit} sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Box>
        <Typography
          component="label"
          htmlFor="resend-link-email"
          sx={{ display: "block", fontSize: 12, fontWeight: 600, color: tokens.text2, mb: 0.75 }}>
          Email address
        </Typography>
        <InputBase
          id="resend-link-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          sx={{
            width: "100%",
            height: 48,
            px: 2,
            fontSize: 15,
            border: `1px solid ${tokens.borderStrong}`,
            bgcolor: tokens.surface,
            "&.Mui-focused": { borderColor: tokens.text },
          }}
        />
      </Box>
      {error && <VerifyNotice tone="error">{error}</VerifyNotice>}
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
        <VerifyButton type="submit" disabled={sending}>
          {sending ? "Sending…" : "Send a new link"}
        </VerifyButton>
        <VerifyButton variant="secondary" href="/auth/sign-in">
          Back to sign in
        </VerifyButton>
      </Box>
      <Typography sx={{ fontSize: 12, color: tokens.text3 }}>You can request up to 5 links per minute.</Typography>
    </Box>
  );
}

export default function EmailVerifiedContent({ status }: { status: VerifiedStatus }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const verifiedOk = status === "verified" || status === "already";

  // Registration already signed the user in — once the email is confirmed there is
  // nothing left to do here, so take them straight to Explore Services.
  useEffect(() => {
    if (verifiedOk && !loading && user) router.replace("/explore-services");
  }, [verifiedOk, loading, user, router]);

  if (status === "expired" || status === "invalid") {
    const expired = status === "expired";
    return (
      <VerifyCard minHeight={PAGE_MIN_HEIGHT}>
        <VerifyTag tone="error">{expired ? "Link expired" : "Link not valid"}</VerifyTag>
        <VerifyHeadline>{expired ? "This link has expired" : "This link isn't valid"}</VerifyHeadline>
        <Box sx={{ mt: 2.5 }}>
          <VerifyBody>
            {expired
              ? "Verification links only work for 60 minutes. Enter the email you signed up with and we'll send a fresh one."
              : "This link doesn't match an account — it may have been copied incompletely. Enter the email you signed up with and we'll send a fresh one."}
          </VerifyBody>
        </Box>
        <ResendLinkForm />
      </VerifyCard>
    );
  }

  const already = status === "already";

  return (
    <VerifyCard minHeight={PAGE_MIN_HEIGHT}>
      <VerifyTag tone="success">{already ? "Already verified" : "Email verified"}</VerifyTag>
      <VerifyHeadline>
        {already ? (
          <>
            Already
            <br />
            good to go.
          </>
        ) : (
          <>
            You&apos;re
            <br />
            verified.
          </>
        )}
      </VerifyHeadline>
      <Box sx={{ mt: 2.5 }}>
        <VerifyBody>
          {user
            ? "You're signed in and ready. Taking you to Explore Services…"
            : already
              ? "This address was confirmed earlier — nothing else to do here. Sign in and pick up where you left off."
              : "Your email is confirmed and your account is active. Sign in to finish your profile — a finished profile gets noticed first."}
        </VerifyBody>
      </Box>
      <Box sx={{ mt: 3.5 }}>
        <VerifyButton href={user ? "/explore-services" : "/auth/sign-in"}>{user ? "Go to Explore Services" : "Continue to sign in"}</VerifyButton>
      </Box>
    </VerifyCard>
  );
}
