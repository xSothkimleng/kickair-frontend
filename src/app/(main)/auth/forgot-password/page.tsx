"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MailCheck } from "lucide-react";
import { css } from "styled-system/css";
import { Alert, Link } from "@/components/ds";
import { AuthPage, AuthPrimaryButton, authFooterText, authForm, authLinkStrong, authSubtitle, authTitle } from "@/components/auth/authKit";
import { TextInput } from "@/components/ui/inputs";
import { api } from "@/lib/api";

const centred = css({ textAlign: "center" });
const intro = css({ textAlign: "center", mb: "32px" });
const sentIcon = css({ color: "accent", mb: "12px" });
const alertGap = css({ mb: "20px" });
const footer = css({ mt: "32px" });

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
    <AuthPage>
      {sent ? (
        <div className={centred}>
          <MailCheck size={44} className={sentIcon} aria-hidden="true" />
          <h1 className={authTitle}>Check your inbox</h1>
          <p className={authSubtitle}>
            If <b>{email.trim()}</b> is registered, we&apos;ve sent a link to reset your password. The link expires in 60 minutes — check your spam folder if it doesn&apos;t arrive.
          </p>
          <AuthPrimaryButton onClick={() => router.push("/auth/sign-in")}>Back to sign in</AuthPrimaryButton>
        </div>
      ) : (
        <>
          <div className={intro}>
            <h1 className={authTitle}>Forgot your password?</h1>
            <p className={authSubtitle}>Enter your account email and we&apos;ll send you a reset link.</p>
          </div>

          {error && (
            <Alert tone="error" onClose={() => setError("")} className={alertGap}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className={authForm}>
            <TextInput
              label="Email"
              id="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={isLoading}
            />
            <AuthPrimaryButton type="submit" disabled={isLoading || !email.trim()}>
              {isLoading ? "Sending…" : "Send reset link"}
            </AuthPrimaryButton>
          </form>

          <div className={footer}>
            <p className={authFooterText}>
              Remembered it?{" "}
              <Link href="/auth/sign-in" underline="always" className={authLinkStrong}>
                Sign in
              </Link>
            </p>
          </div>
        </>
      )}
    </AuthPage>
  );
}
