"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { css, cx } from "styled-system/css";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/context/AuthContext";
import { Btn, Field, Input, stack, text } from "./ui";

const wrap = css({ minH: "100vh", display: "grid", placeItems: "center", bg: "var(--td-canvas)", fontFamily: "var(--td-font)", px: "24px" });
const card = css({ w: "100%", maxW: "400px", bg: "var(--td-surface)", borderWidth: "1px", borderStyle: "solid", borderColor: "var(--td-line)", borderRadius: "16px", p: "28px", boxShadow: "var(--td-shadow-sm)" });
const mark = css({ w: "40px", h: "40px", borderRadius: "11px", bg: "var(--td-ink)", color: "#fff", display: "grid", placeItems: "center", mb: "18px" });
const errorBox = css({ display: "flex", gap: "8px", alignItems: "flex-start", p: "10px 12px", borderRadius: "10px", bg: "var(--td-red-soft)", color: "var(--td-red)", fontSize: "13px", "& svg": { flexShrink: 0, mt: "1px" } });

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { loginEmail, logout } = useAuth();
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const u = await loginEmail(email, password);
      if (!u.is_admin) {
        // A valid non-admin account — don't leave them authenticated here.
        await logout();
        setError("This account doesn't have admin access.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid credentials. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={wrap}>
      <div className={css({ w: "100%", maxW: "400px" })}>
        <form className={card} onSubmit={submit}>
          <div className={mark}><ShieldCheck size={20} /></div>
          <h1 className={text({ size: "xl", weight: 600 })}>Sign in to the admin console</h1>
          <p className={cx(text({ size: "sm", tone: 2 }), css({ mt: "4px", mb: "20px" }))}>KickAir staff only.</p>
          <div className={stack({ gap: 4 })}>
            {error ? <div className={errorBox}><AlertCircle size={15} /> {error}</div> : null}
            <Field label="Email">
              <Input type="email" autoComplete="email" autoFocus required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@kickair.com" disabled={busy} />
            </Field>
            <Field label="Password">
              <Input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" disabled={busy} />
            </Field>
            <Btn type="submit" variant="primary" size="lg" full disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Btn>
          </div>
        </form>
        <p className={cx(text({ size: "xs", tone: 3 }), css({ textAlign: "center", mt: "16px" }))}>Authorised personnel only.</p>
      </div>
    </div>
  );
}
