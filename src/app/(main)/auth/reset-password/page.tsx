"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CircleCheck } from "lucide-react";
import { css } from "styled-system/css";
import { Alert } from "@/components/ds";
import { AuthFallback, AuthPage, AuthPrimaryButton, authForm, authSubtitle, authTitle } from "@/components/auth/authKit";
import { FieldLabel, PasswordInput } from "@/components/ui/inputs";
import { api } from "@/lib/api";

const centred = css({ textAlign: "center" });
const intro = css({ textAlign: "center", mb: "32px" });
const doneIcon = css({ color: "success", mb: "12px" });
const alertGap = css({ mb: "20px" });

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
    <AuthPage>
      {done ? (
        <div className={centred}>
          <CircleCheck size={44} className={doneIcon} aria-hidden="true" />
          <h1 className={authTitle}>Password reset</h1>
          <p className={authSubtitle}>Your password has been changed. Sign in with your new password to continue.</p>
          <AuthPrimaryButton onClick={() => router.push("/auth/sign-in")}>Sign in</AuthPrimaryButton>
        </div>
      ) : linkBroken ? (
        <div className={centred}>
          <h1 className={authTitle}>Invalid reset link</h1>
          <p className={authSubtitle}>This link is missing its reset details. Request a new one and use the link from the latest email.</p>
          <AuthPrimaryButton onClick={() => router.push("/auth/forgot-password")}>Request a new link</AuthPrimaryButton>
        </div>
      ) : (
        <>
          <div className={intro}>
            <h1 className={authTitle}>Choose a new password</h1>
            <p className={authSubtitle}>
              Resetting the password for <b>{email}</b>
            </p>
          </div>

          {error && (
            <Alert tone="error" onClose={() => setError("")} className={alertGap}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className={authForm}>
            <div>
              <FieldLabel htmlFor="new-password">New password</FieldLabel>
              <PasswordInput id="new-password" value={password} onChange={setPassword} placeholder="At least 8 characters" disabled={isLoading} />
            </div>
            <div>
              <FieldLabel htmlFor="confirm-password">Confirm new password</FieldLabel>
              <PasswordInput id="confirm-password" value={confirm} onChange={setConfirm} placeholder="Repeat the password" disabled={isLoading} />
            </div>
            <AuthPrimaryButton type="submit" disabled={isLoading || !password || !confirm}>
              {isLoading ? "Resetting…" : "Reset password"}
            </AuthPrimaryButton>
          </form>
        </>
      )}
    </AuthPage>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
