"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { css } from "styled-system/css";
import { api } from "@/lib/api";
import { useAuth } from "@/components/context/AuthContext";
import { VerifyBody, VerifyButton, VerifyCard, VerifyHeadline, VerifyNotice, VerifyTag } from "@/components/auth/verifyKit";

export type VerifiedStatus = "verified" | "expired" | "invalid" | "already";

// Sits under the main navbar, so leave room for it instead of forcing a full viewport.
const PAGE_MIN_HEIGHT = "85vh";

const form = css({ mt: "24px", display: "flex", flexDirection: "column", gap: "12px" });
const label = css({ display: "block", fontSize: "12px", lineHeight: 1.5, fontWeight: 600, color: "ink2", mb: "6px" });
// Square ink-palette text field (was a raw MUI InputBase, not a slate kit field).
const input = css({
  display: "block",
  w: "100%",
  h: "48px",
  boxSizing: "border-box",
  m: "0",
  px: "16px",
  py: "0",
  fontFamily: "inherit",
  fontSize: "15px",
  lineHeight: 1.4375,
  color: "rgba(0,0,0,0.87)",
  bg: "surface",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hairlineStrong",
  borderRadius: "0",
  outline: "none",
  _placeholder: { color: "currentcolor", opacity: 0.42 },
  _focus: { borderColor: "ink" },
});
const actions = css({ display: "flex", gap: "12px", flexWrap: "wrap" });
const hint = css({ fontSize: "12px", lineHeight: 1.5, color: "ink3" });
const gap20 = css({ mt: "20px" });
const gap28 = css({ mt: "28px" });

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
    <form onSubmit={submit} className={form}>
      <div>
        <label htmlFor="resend-link-email" className={label}>
          Email address
        </label>
        <input
          id="resend-link-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={input}
        />
      </div>
      {error && <VerifyNotice tone="error">{error}</VerifyNotice>}
      <div className={actions}>
        <VerifyButton type="submit" disabled={sending}>
          {sending ? "Sending…" : "Send a new link"}
        </VerifyButton>
        <VerifyButton variant="secondary" href="/auth/sign-in">
          Back to sign in
        </VerifyButton>
      </div>
      <p className={hint}>You can request up to 5 links per minute.</p>
    </form>
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
        <div className={gap20}>
          <VerifyBody>
            {expired
              ? "Verification links only work for 60 minutes. Enter the email you signed up with and we'll send a fresh one."
              : "This link doesn't match an account — it may have been copied incompletely. Enter the email you signed up with and we'll send a fresh one."}
          </VerifyBody>
        </div>
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
      <div className={gap20}>
        <VerifyBody>
          {user
            ? "You're signed in and ready. Taking you to Explore Services…"
            : already
              ? "This address was confirmed earlier — nothing else to do here. Sign in and pick up where you left off."
              : "Your email is confirmed and your account is active. Sign in to finish your profile — a finished profile gets noticed first."}
        </VerifyBody>
      </div>
      <div className={gap28}>
        <VerifyButton href={user ? "/explore-services" : "/auth/sign-in"}>{user ? "Go to Explore Services" : "Continue to sign in"}</VerifyButton>
      </div>
    </VerifyCard>
  );
}
