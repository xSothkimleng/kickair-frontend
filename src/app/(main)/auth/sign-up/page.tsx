"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Paper, Typography, Button, Divider, Alert, Select, MenuItem } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useAuth } from "@/components/context/AuthContext";
import { api } from "@/lib/api";
import GoogleButton from "@/components/auth/GoogleButton";
import {
  TextInput, PasswordInput, PhoneInput, OtpInput, SegmentedControl,
  FieldLabel, FieldHelper, fieldSx, tokens,
} from "@/components/ui/inputs";
import { OtpChannel } from "@/types/user";

type Role = "client" | "freelancer";
type Method = "email" | "phone";

export default function SignUpPage() {
  const router = useRouter();
  const { registerEmail, registerPhone } = useAuth();

  const [step, setStep] = useState<"form" | "otp">("form");
  const [role, setRole] = useState<Role>("client");
  const [method, setMethod] = useState<Method>("email");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [channel, setChannel] = useState<OtpChannel>("telegram");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const e164Phone = () => `+855${phone.replace(/\D/g, "").replace(/^0+/, "")}`;
  const destination = () => (role === "freelancer" ? "/dashboard/freelancer" : "/explore-services");
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
        await api.sendPhoneOtp(e164Phone(), channel);
        setStep("otp");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resendWith = async (next: OtpChannel) => {
    setChannel(next);
    setError("");
    setIsLoading(true);
    try {
      await api.sendPhoneOtp(e164Phone(), next);
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
    <Box sx={{ minHeight: "95vh", display: "flex", alignItems: "center", justifyContent: "center", px: { xs: 2, sm: 6 }, py: 4, backgroundColor: tokens.page }}>
      <Box sx={{ width: "100%", maxWidth: 420 }}>
        <Paper elevation={0} sx={{ borderRadius: 4, border: `1px solid ${tokens.border}`, p: { xs: 3, sm: 4 }, boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 12px 32px rgba(15,23,42,0.07)" }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2.5 }}>
            <Box component="img" src="/assets/images/kickair-logo.png" alt="KickAir" sx={{ height: 36 }} />
          </Box>

          {step === "form" ? (
            <>
              <Box sx={{ textAlign: "center", mb: 2.5 }}>
                <Typography component="h1" sx={{ fontSize: 23, fontWeight: 700, color: tokens.heading, letterSpacing: "-0.02em", mb: 0.5 }}>
                  Create your account
                </Typography>
                <Typography sx={{ fontSize: 14.5, color: tokens.muted }}>Join KickAir</Typography>
              </Box>

              {error && <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>{error}</Alert>}

              <Box component="form" onSubmit={handleFormSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
                    router.push(u.is_freelancer && !u.is_client ? "/dashboard/freelancer" : "/explore-services");
                    router.refresh();
                  }}
                  onError={setError}
                />

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Divider sx={{ flex: 1, borderColor: tokens.border }} />
                  <Typography sx={{ fontSize: 13, color: tokens.muted }}>or</Typography>
                  <Divider sx={{ flex: 1, borderColor: tokens.border }} />
                </Box>

                <TextInput label="Full name" placeholder="Sok Dara" value={name} onChange={setName} autoComplete="name" disabled={isLoading} />

                {/* Combined contact: Email/Phone picker + input */}
                <Box>
                  <FieldLabel>Contact</FieldLabel>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Select
                      value={method}
                      onChange={(e) => { setMethod(e.target.value as Method); setEmail(""); setPhone(""); }}
                      disabled={isLoading}
                      sx={{ ...fieldSx("md"), minWidth: 104 }}>
                      <MenuItem value="email">Email</MenuItem>
                      <MenuItem value="phone">Phone</MenuItem>
                    </Select>
                    <Box sx={{ flex: 1 }}>
                      {method === "email"
                        ? <TextInput type="email" placeholder="you@example.com" value={email} onChange={setEmail} autoComplete="email" disabled={isLoading} />
                        : <PhoneInput placeholder="12 345 678" value={phone} onChange={setPhone} disabled={isLoading} />}
                    </Box>
                  </Box>
                  <FieldHelper>
                    {method === "email" ? "We'll send a verification link here." : "Cambodian number — we'll text you a code to verify."}
                  </FieldHelper>
                </Box>

                <PasswordInput label="Password" placeholder="Create a password" value={password} onChange={setPassword} autoComplete="new-password" helper="At least 8 characters" disabled={isLoading} />
                <PasswordInput label="Confirm password" placeholder="Re-enter your password" value={confirm} onChange={setConfirm} autoComplete="new-password" disabled={isLoading} />

                <Button type="submit" variant="contained" fullWidth disabled={isLoading}
                  sx={{ height: 48, borderRadius: 2.5, textTransform: "none", fontSize: "1rem", fontWeight: 500, color: "common.white", backgroundColor: tokens.accent, "&:hover": { backgroundColor: tokens.accentHover } }}>
                  {isLoading ? "Creating account…" : "Create account"}
                </Button>
              </Box>

              <Box sx={{ mt: 4, display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Typography sx={{ textAlign: "center", fontSize: 14, color: tokens.body }}>
                  Already have an account?{" "}
                  <Box component="a" onClick={() => router.push("/auth/sign-in")} sx={{ color: tokens.accent, fontWeight: 500, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>
                    Sign in
                  </Box>
                </Typography>
                <Typography sx={{ textAlign: "center", fontSize: 12, color: tokens.muted, lineHeight: 1.5 }}>
                  By continuing, you agree to KickAir&rsquo;s Terms of Service and Privacy Policy.
                </Typography>
              </Box>
            </>
          ) : (
            <>
              <Button onClick={() => { setStep("form"); setCode(""); setError(""); }} startIcon={<ArrowBack />}
                sx={{ color: tokens.muted, textTransform: "none", mb: 1, ml: -1, "&:hover": { backgroundColor: "transparent", color: tokens.body } }}>
                Back
              </Button>
              <Typography component="h1" sx={{ fontSize: 23, fontWeight: 700, color: tokens.heading, letterSpacing: "-0.02em", mb: 0.5 }}>
                Verify your phone
              </Typography>
              <Typography sx={{ fontSize: 14.5, color: tokens.muted, mb: 2.5 }}>
                We sent a 6-digit code to {e164Phone()} via {channel === "telegram" ? "Telegram" : "SMS"}.
              </Typography>

              {error && <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>{error}</Alert>}

              <Box component="form" onSubmit={handleVerify} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <OtpInput value={code} onChange={setCode} autoFocus disabled={isLoading} />

                <Button type="submit" variant="contained" fullWidth disabled={isLoading || code.length < 6}
                  sx={{ height: 48, borderRadius: 2.5, textTransform: "none", fontSize: "1rem", fontWeight: 500, color: "common.white", backgroundColor: tokens.accent, "&:hover": { backgroundColor: tokens.accentHover } }}>
                  {isLoading ? "Verifying…" : "Verify & create account"}
                </Button>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 2 }}>
                <Button onClick={() => resendWith(channel)} disabled={isLoading} sx={{ fontSize: 13, color: tokens.muted, textTransform: "none" }}>
                  Resend code
                </Button>
                <Button onClick={() => resendWith(channel === "telegram" ? "sms" : "telegram")} disabled={isLoading} sx={{ fontSize: 13, color: tokens.accent, textTransform: "none" }}>
                  {channel === "telegram" ? "Use SMS instead" : "Use Telegram instead"}
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
