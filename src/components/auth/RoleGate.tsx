"use client";

import { useState, type ReactNode } from "react";
import { css } from "styled-system/css";
import { Alert, Spinner } from "@/components/ds";
import { useAuth } from "@/components/context/AuthContext";

const wrapCss = css({ minH: "60vh", display: "flex", alignItems: "center", justifyContent: "center", bg: "page", p: "24px", boxSizing: "border-box" });
const cardCss = css({ maxW: "440px", w: "100%", boxSizing: "border-box", bg: "surface", borderWidth: "1px", borderStyle: "solid", borderColor: "hairline", borderRadius: "card", p: "32px", display: "flex", flexDirection: "column", gap: "12px", textAlign: "center" });
const titleCss = css({ textStyle: "title", fontWeight: 600, color: "ink" });
const textCss = css({ textStyle: "body", color: "ink2" });
const btnCss = css({ mt: "8px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", h: "44px", px: "24px", border: "none", borderRadius: "pill", bg: "ink", color: "white", textStyle: "body", fontWeight: 600, cursor: "pointer", _hover: { bg: "rgba(0, 0, 0, 0.8)" }, _disabled: { opacity: 0.6, cursor: "default" } });

const COPY = {
  freelancer: {
    title: "You don't have a Freelancer Space yet",
    text: "Add the freelancer role to this account to publish services, answer job posts and take custom requests. Your client side stays as it is.",
    button: "Become a freelancer",
  },
  client: {
    title: "You don't have a Client Space yet",
    text: "Add the client role to this account to buy services, post jobs and request custom orders. Your freelancer side stays as it is.",
    button: "Become a client",
  },
} as const;

/**
 * Wraps a space (Client / Freelancer). An account that does not have that role yet
 * gets a one-press way to add it, instead of a page full of "You do not have a
 * freelancer profile" errors.
 */
export function RoleGate({ role, children }: { role: "client" | "freelancer"; children: ReactNode }) {
  const { user, enableRole } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const hasRole = role === "freelancer" ? user?.is_freelancer : user?.is_client;
  if (!user || hasRole) return <>{children}</>;

  const copy = COPY[role];
  const add = async () => {
    setBusy(true);
    setError("");
    try {
      await enableRole(role);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update your account. Please try again.");
      setBusy(false);
    }
  };

  return (
    <div className={wrapCss}>
      <div className={cardCss}>
        <p className={titleCss}>{copy.title}</p>
        <p className={textCss}>{copy.text}</p>
        {error && <Alert tone="error">{error}</Alert>}
        <div>
          <button type="button" onClick={add} disabled={busy} className={btnCss}>
            {busy && <Spinner size={16} />}
            {copy.button}
          </button>
        </div>
      </div>
    </div>
  );
}
