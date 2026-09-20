"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, MailCheck } from "lucide-react";
import { css } from "styled-system/css";
import { Alert, Link } from "@/components/ds";
import { AuthPage, AuthPrimaryButton, authBackButton, authFooterText, authForm, authLinkStrong, authMutedButton, authSubtitle, authTitle } from "@/components/auth/authKit";
import { TelegramLinkSteps } from "@/components/auth/TelegramLinkSteps";
import { TextInput, PasswordInput, PhoneInput, OtpInput, SelectInput, FieldLabel, FieldHelper } from "@/components/ui/inputs";
import { api } from "@/lib/api";
import { toE164Kh } from "@/lib/phone";

type Method = "email" | "phone";
// request → (email) emailSent | (phone) reset → done
type Step = "request" | "emailSent" | "reset" | "done";

const centred = css({ textAlign: "center" });
const intro = css({ textAlign: "center", mb: "32px" });
const stateIcon = css({ color: "accent", mb: "12px" });
const alertGap = css({ mb: "20px" });
const footer = css({ mt: "32px" });
const contactRow = css({ display: "flex", gap: "8px" });
const contactField = css({ flex: 1 });
const methodSelect = css({ minW: "104px" });
const backIcon = css({ ml: "-4px" });
const resetIntro = css({ mb: "20px" });
const linkSteps = css({ mb: "20px" });
const resendRow = css({ display: "flex", justifyContent: "center", mt: "16px" });

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("request");
  const [method, setMethod] = useState<Method>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  // Set when the number is not linked to the Telegram bot yet (see PhoneOtpDelivery).
  const [botUrl, setBotUrl] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const e164Phone = () => toE164Kh(phone);
  const contactFilled = method === "email" ? !!email.trim() : !!phone.replace(/\D/g, "");

  const requestPhoneCode = async () => {
    const delivery = await api.forgotPasswordPhone(e164Phone());
    setBotUrl(delivery.delivered ? null : delivery.bot_url);
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      if (method === "email") {
        await api.post("/api/auth/forgot-password", { email: email.trim() });
        setStep("emailSent");
      } else {
        await requestPhoneCode();
        setStep("reset");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    setIsLoading(true);
    setError("");
    try {
      await requestPhoneCode();
      setCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend the code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (confirm !== password) {
      setError("Passwords don't match.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await api.resetPasswordPhone({ phone: e164Phone(), code: code.trim(), password, password_confirmation: confirm });
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired code.");
    } finally {
      setIsLoading(false);
    }
  };

  const backToRequest = () => {
    setStep("request");
    setCode("");
    setPassword("");
    setConfirm("");
    setBotUrl(null);
    setError("");
  };

  return (
    <AuthPage>
      {step === "emailSent" && (
        <div className={centred}>
          <MailCheck size={44} className={stateIcon} aria-hidden="true" />
          <h1 className={authTitle}>Check your inbox</h1>
          <p className={authSubtitle}>
            If <b>{email.trim()}</b> is registered, we&apos;ve sent a link to reset your password. The link expires in 60 minutes — check your spam folder if it doesn&apos;t arrive.
          </p>
          <AuthPrimaryButton onClick={() => router.push("/auth/sign-in")}>Back to sign in</AuthPrimaryButton>
        </div>
      )}

      {step === "done" && (
        <div className={centred}>
          <CheckCircle2 size={44} className={stateIcon} aria-hidden="true" />
          <h1 className={authTitle}>Password reset</h1>
          <p className={authSubtitle}>You can now sign in with your new password. Every other device has been signed out.</p>
          <AuthPrimaryButton onClick={() => router.push("/auth/sign-in")}>Sign in</AuthPrimaryButton>
        </div>
      )}

      {step === "request" && (
        <>
          <div className={intro}>
            <h1 className={authTitle}>Forgot your password?</h1>
            <p className={authSubtitle}>Tell us the email or phone number on your account.</p>
          </div>

          {error && (
            <Alert tone="error" onClose={() => setError("")} className={alertGap}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleRequest} className={authForm}>
            <div>
              <FieldLabel>Email or phone</FieldLabel>
              <div className={contactRow}>
                <SelectInput
                  value={method}
                  onChange={(v) => { setMethod(v as Method); setError(""); }}
                  options={[{ value: "email", label: "Email" }, { value: "phone", label: "Phone" }]}
                  disabled={isLoading}
                  fullWidth={false}
                  className={methodSelect}
                />
                <div className={contactField}>
                  {method === "email"
                    ? <TextInput type="email" id="email" placeholder="you@example.com" value={email} onChange={setEmail} autoComplete="email" disabled={isLoading} />
                    : <PhoneInput placeholder="12 345 678" value={phone} onChange={setPhone} disabled={isLoading} />}
                </div>
              </div>
              <FieldHelper>
                {method === "email" ? "We'll email you a link to reset your password." : "We'll send a reset code to your Telegram."}
              </FieldHelper>
            </div>

            <AuthPrimaryButton type="submit" disabled={isLoading || !contactFilled}>
              {isLoading ? "Sending…" : method === "email" ? "Send reset link" : "Send reset code"}
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

      {step === "reset" && (
        <>
          <button type="button" onClick={backToRequest} className={authBackButton}>
            <ArrowLeft size={20} className={backIcon} />
            Back
          </button>
          <div className={resetIntro}>
            <h1 className={authTitle}>Reset your password</h1>
            <p className={authSubtitle}>
              {botUrl
                ? `${e164Phone()} isn't linked to our Telegram bot yet. Link it once and your code arrives there right away.`
                : `We sent a 6-digit code to ${e164Phone()} via Telegram. Enter it with your new password.`}
            </p>
          </div>

          {error && (
            <Alert tone="error" onClose={() => setError("")} className={alertGap}>
              {error}
            </Alert>
          )}

          {botUrl && <TelegramLinkSteps botUrl={botUrl} className={linkSteps} />}

          <form onSubmit={handleReset} className={authForm}>
            <OtpInput value={code} onChange={setCode} autoFocus={!botUrl} disabled={isLoading} />
            <PasswordInput label="New password" placeholder="Create a new password" value={password} onChange={setPassword} autoComplete="new-password" helper="At least 8 characters" disabled={isLoading} />
            <PasswordInput label="Confirm new password" placeholder="Re-enter your new password" value={confirm} onChange={setConfirm} autoComplete="new-password" disabled={isLoading} />

            <AuthPrimaryButton type="submit" disabled={isLoading || code.length < 6 || !password || !confirm}>
              {isLoading ? "Resetting…" : "Reset password"}
            </AuthPrimaryButton>
          </form>

          <div className={resendRow}>
            <button type="button" onClick={resendCode} disabled={isLoading} className={authMutedButton}>
              Resend code
            </button>
          </div>
        </>
      )}
    </AuthPage>
  );
}
