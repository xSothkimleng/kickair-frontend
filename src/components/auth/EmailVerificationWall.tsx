"use client";

import { useState } from "react";
import { css } from "styled-system/css";
import { VerifyBody, VerifyButton, VerifyCard, VerifyHeadline, VerifyNotice, VerifyOverline } from "./verifyKit";

interface EmailVerificationWallProps {
  email: string | null;
  onResend: () => Promise<void>;
  onLogout: () => Promise<void>;
}

const gap20 = css({ mt: "20px" });
const gap12 = css({ mt: "12px" });
const emailRow = css({
  mt: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "16px",
  px: "16px",
  py: "12px",
  bg: "canvas",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hairline",
});
const emailText = css({ fontFamily: "mono", fontSize: "14px", lineHeight: 1.5, color: "ink", wordBreak: "break-all" });
const notYou = css({
  flexShrink: 0,
  bg: "none",
  border: "0",
  p: "0",
  fontFamily: "inherit",
  fontSize: "12px",
  lineHeight: 1.5,
  fontWeight: 600,
  color: "accent",
  cursor: "pointer",
  _hover: { color: "accentHover" },
  _disabled: { opacity: 0.5, cursor: "default" },
});
const strong = css({ color: "ink", fontWeight: 600 });
const actions = css({ mt: "28px", display: "flex", gap: "12px", flexWrap: "wrap" });
const footer = css({ mt: "36px", pt: "24px", borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "hairline" });
const footerTitle = css({ fontSize: "13px", lineHeight: 1.5, fontWeight: 600, color: "ink", mb: "4px" });
const footerBody = css({ fontSize: "13px", lineHeight: 1.6, color: "ink3" });

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
      <div className={gap20}>
        <VerifyBody>We sent a verification link to</VerifyBody>
      </div>

      {email ? (
        <div className={emailRow}>
          <p className={emailText}>{email}</p>
          <button type="button" onClick={logout} disabled={loggingOut} className={notYou}>
            {loggingOut ? "Signing out…" : "Not you?"}
          </button>
        </div>
      ) : (
        <div className={gap12}>
          <VerifyBody tone="strong">the address you signed up with.</VerifyBody>
        </div>
      )}

      <div className={gap20}>
        <VerifyBody>
          Open it and press <strong className={strong}>Verify email address</strong> — it takes about ten
          seconds. The link works for 60 minutes.
        </VerifyBody>
      </div>

      {status === "error" && <VerifyNotice tone="error">{error}</VerifyNotice>}
      {status === "sent" && (
        <VerifyNotice tone="success">A fresh link is on its way{email ? ` to ${email}` : ""}. Give it a minute.</VerifyNotice>
      )}

      <div className={actions}>
        <VerifyButton onClick={resend} disabled={status === "sending" || status === "sent"}>
          {status === "sending" ? "Sending…" : status === "sent" ? "Email sent" : "Resend email"}
        </VerifyButton>
        <VerifyButton variant="secondary" onClick={logout} disabled={loggingOut}>
          {loggingOut ? "Signing out…" : "Sign out"}
        </VerifyButton>
      </div>

      <div className={footer}>
        <div className={footerTitle}>Didn&apos;t get it?</div>
        <p className={footerBody}>
          Give it a minute, then check your Spam or Promotions folder. If the address above is wrong, sign out and create the
          account again with the right one.
        </p>
      </div>
    </VerifyCard>
  );
}
