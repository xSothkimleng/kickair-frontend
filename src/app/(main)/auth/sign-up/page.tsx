"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { css } from "styled-system/css";
import { Alert, Divider, Link, Text } from "@/components/ds";
import { useAuth } from "@/components/context/AuthContext";
import { api } from "@/lib/api";
import GoogleButton from "@/components/auth/GoogleButton";
import { AuthFallback, AuthPage, AuthPrimaryButton, authBackButton, authFooterText, authForm, authMutedButton, authSubtitle, authTitle } from "@/components/auth/authKit";
import { safeRedirect } from "@/lib/redirect";
import {
  TextInput, PasswordInput, PhoneInput, OtpInput, SegmentedControl, SelectInput,
  FieldLabel, FieldHelper,
} from "@/components/ui/inputs";

type Role = "client" | "freelancer";
type Method = "email" | "phone";

const pagePad = css({ py: "32px" });
const intro = css({ textAlign: "center", mb: "20px" });
const alertGap = css({ mb: "16px" });
const orRow = css({ lineHeight: 1.5 });
const contactRow = css({ display: "flex", gap: "8px" });
const contactField = css({ flex: 1 });
const methodSelect = css({ minW: "104px" });
const footer = css({ mt: "32px", display: "flex", flexDirection: "column", gap: "12px" });
const signInLink = css({ fontWeight: 500 });
const backIcon = css({ ml: "-4px" });
const resendRow = css({ display: "flex", justifyContent: "center", mt: "16px" });

function SignUpContent() {
  const router = useRouter();
  const { registerEmail, registerPhone } = useAuth();
  const redirectTo = safeRedirect(useSearchParams().get("redirect"));

  const [step, setStep] = useState<"form" | "otp">("form");
  const [role, setRole] = useState<Role>("client");
  const [method, setMethod] = useState<Method>("email");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const e164Phone = () => `+855${phone.replace(/\D/g, "").replace(/^0+/, "")}`;
  // A return path (e.g. from the purchase gate) wins over the role-based default.
  const destination = () => redirectTo ?? (role === "freelancer" ? "/dashboard/freelancer" : "/explore-services");
  const roleFlags = () => ({ is_client: role === "client", is_freelancer: role === "freelancer" });

  const validateForm = (): string | null => {
    if (!name.trim()) return "Please enter your full name.";
    if (method === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
    } else if (!phone.replace(/\D/g, "")) {
      return "Please enter your phone number.";
    }
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (confirm !== password) return "Passwords don't match.";
    return null;
  };

  const handleFormSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      if (method === "email") {
        await registerEmail({ name: name.trim(), email: email.trim(), password, password_confirmation: confirm, ...roleFlags() });
        router.push(destination());
      } else {
        await api.sendPhoneOtp(e164Phone());
        setStep("otp");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    setError("");
    setIsLoading(true);
    try {
      await api.sendPhoneOtp(e164Phone());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend the code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await registerPhone({ name: name.trim(), phone: e164Phone(), code: code.trim(), password, password_confirmation: confirm, ...roleFlags() });
      router.push(destination());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPage className={pagePad}>
      {step === "form" ? (
        <>
          <div className={intro}>
            <h1 className={authTitle}>Create your account</h1>
            <p className={authSubtitle}>Join KickAir</p>
          </div>

          {error && <Alert tone="error" onClose={() => setError("")} className={alertGap}>{error}</Alert>}

          <form onSubmit={handleFormSubmit} className={authForm}>
            <SegmentedControl
              fullWidth
              ariaLabel="Account type"
              value={role}
              onChange={(v) => setRole(v as Role)}
              options={[
                { value: "client", label: "I want to hire", sub: "Client" },
                { value: "freelancer", label: "I want to work", sub: "Freelancer" },
              ]}
            />

            <GoogleButton
              label="Continue with Google"
              roles={roleFlags()}
              onAuthenticated={(u) => {
                router.push(redirectTo ?? (u.is_freelancer && !u.is_client ? "/dashboard/freelancer" : "/explore-services"));
                router.refresh();
              }}
              onError={setError}
            />

            <Divider className={orRow}>or</Divider>

            <TextInput label="Full name" placeholder="Sok Dara" value={name} onChange={setName} autoComplete="name" disabled={isLoading} />

            {/* Combined contact: Email/Phone picker + input */}
            <div>
              <FieldLabel>Contact</FieldLabel>
              <div className={contactRow}>
                <SelectInput
                  value={method}
                  onChange={(v) => { setMethod(v as Method); setEmail(""); setPhone(""); }}
                  options={[{ value: "email", label: "Email" }, { value: "phone", label: "Phone" }]}
                  disabled={isLoading}
                  fullWidth={false}
                  className={methodSelect}
                />
                <div className={contactField}>
                  {method === "email"
                    ? <TextInput type="email" placeholder="you@example.com" value={email} onChange={setEmail} autoComplete="email" disabled={isLoading} />
                    : <PhoneInput placeholder="12 345 678" value={phone} onChange={setPhone} disabled={isLoading} />}
                </div>
              </div>
              <FieldHelper>
                {method === "email" ? "We'll send a verification link here." : "Cambodian number — we'll text you a code to verify."}
              </FieldHelper>
            </div>

            <PasswordInput label="Password" placeholder="Create a password" value={password} onChange={setPassword} autoComplete="new-password" helper="At least 8 characters" disabled={isLoading} />
            <PasswordInput label="Confirm password" placeholder="Re-enter your password" value={confirm} onChange={setConfirm} autoComplete="new-password" disabled={isLoading} />

            <AuthPrimaryButton type="submit" disabled={isLoading}>
              {isLoading ? "Creating account…" : "Create account"}
            </AuthPrimaryButton>
          </form>

          <div className={footer}>
            <p className={authFooterText}>
              Already have an account?{" "}
              <Link href="/auth/sign-in" className={signInLink}>
                Sign in
              </Link>
            </p>
            <Text size="xs" tone="muted" align="center">
              By continuing, you agree to KickAir&rsquo;s Terms of Service and Privacy Policy.
            </Text>
          </div>
        </>
      ) : (
        <>
          <button type="button" onClick={() => { setStep("form"); setCode(""); setError(""); }} className={authBackButton}>
            <ArrowLeft size={20} className={backIcon} />
            Back
          </button>
          <h1 className={authTitle}>Verify your phone</h1>
          <p className={authSubtitle}>
            We sent a 6-digit code to {e164Phone()} via Telegram. Check your Telegram app.
          </p>

          {error && <Alert tone="error" onClose={() => setError("")} className={alertGap}>{error}</Alert>}

          <form onSubmit={handleVerify} className={authForm}>
            <OtpInput value={code} onChange={setCode} autoFocus disabled={isLoading} />

            <AuthPrimaryButton type="submit" disabled={isLoading || code.length < 6}>
              {isLoading ? "Verifying…" : "Verify & create account"}
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

export default function SignUpPage() {
  return (
    <Suspense fallback={<AuthFallback />}>
      <SignUpContent />
    </Suspense>
  );
}
