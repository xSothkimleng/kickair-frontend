"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { css } from "styled-system/css";
import { Alert, Divider, Link } from "@/components/ds";
import { useAuth } from "@/components/context/AuthContext";
import GoogleButton from "@/components/auth/GoogleButton";
import { AuthFallback, AuthPage, AuthPrimaryButton, authFooterText, authForm, authLinkStrong, authSubtitle, authTextButton, authTitle } from "@/components/auth/authKit";
import { TextInput, PasswordInput } from "@/components/ui/inputs";
import { safeRedirect } from "@/lib/redirect";
import { User } from "@/types/user";

const intro = css({ textAlign: "center", mb: "32px" });
const orRow = css({ my: "20px", lineHeight: 1.5 });
const alertGap = css({ mb: "20px" });
const labelRow = css({ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: "7px" });
const label = css({ fontSize: "13px", fontWeight: 500, lineHeight: 1.5, color: "body" });
const footer = css({ mt: "32px" });

function SignInContent() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { loginEmail, loginPhone } = useAuth();
  const router = useRouter();
  const redirectTo = safeRedirect(useSearchParams().get("redirect"));

  const goAfterAuth = (loggedInUser: User) => {
    // Honor an explicit return path (e.g. bounced here from the purchase gate)
    // before falling back to the role-based default landing.
    if (redirectTo) {
      router.push(redirectTo);
      router.refresh();
      return;
    }
    let destination = "/explore-services";
    if (loggedInUser.is_admin) {
      destination = "/admin";
    } else if (loggedInUser.is_freelancer && !loggedInUser.is_client) {
      destination = "/dashboard/freelancer";
    }
    router.push(destination);
    router.refresh();
  };

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

      goAfterAuth(loggedInUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPage>
      <div className={intro}>
        <h1 className={authTitle}>Welcome back</h1>
        <p className={authSubtitle}>Sign in to continue to KickAir</p>
      </div>

      <GoogleButton label="Continue with Google" onAuthenticated={goAfterAuth} onError={setError} />

      <Divider className={orRow}>or</Divider>

      {error && (
        <Alert tone="error" onClose={() => setError("")} className={alertGap}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className={authForm}>
        <TextInput
          label="Email or phone"
          id="identifier"
          value={identifier}
          onChange={setIdentifier}
          placeholder="you@example.com or +855…"
          autoComplete="username"
          disabled={isLoading}
        />

        <div>
          <div className={labelRow}>
            <label htmlFor="password" className={label}>
              Password
            </label>
            <button type="button" onClick={() => router.push("/auth/forgot-password")} className={authTextButton}>
              Forgot password?
            </button>
          </div>
          <PasswordInput id="password" value={password} onChange={setPassword} placeholder="Enter your password" disabled={isLoading} />
        </div>

        <AuthPrimaryButton type="submit" disabled={isLoading}>
          {isLoading ? "Signing in…" : "Sign in"}
        </AuthPrimaryButton>
      </form>

      <div className={footer}>
        <p className={authFooterText}>
          New to KickAir?{" "}
          <Link href="/auth/sign-up" underline="always" className={authLinkStrong}>
            Create one
          </Link>
        </p>
      </div>
    </AuthPage>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<AuthFallback />}>
      <SignInContent />
    </Suspense>
  );
}
