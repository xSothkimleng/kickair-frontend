"use client";

import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { css, cx } from "styled-system/css";
import { Spinner, button } from "@/components/ds";
import { useAuth } from "@/components/context/AuthContext";
import { User } from "@/types/user";

const GOOGLE_CONFIGURED = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

type GoogleButtonProps = {
  label: string;
  roles?: { is_client?: boolean; is_freelancer?: boolean };
  onAuthenticated: (user: User) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
  /** Optional extra classes merged last (e.g. to match a pill-shaped surface). */
  className?: string;
  /** @deprecated MUI-era style override; ignored since the Panda port. Pass `className` instead. */
  sx?: Record<string, unknown>;
};

/**
 * "Continue with Google" button. When Google isn't configured for this deployment
 * (no NEXT_PUBLIC_GOOGLE_CLIENT_ID), we render a static fallback instead of mounting
 * the OAuth hook — useGoogleLogin initializes a Google token client with the client id,
 * and an empty id crashes the whole page via React's error boundary.
 */
export default function GoogleButton(props: GoogleButtonProps) {
  if (!GOOGLE_CONFIGURED) {
    return (
      <GoogleButtonView
        label={props.label}
        loading={false}
        disabled={props.disabled}
        className={props.className}
        onClick={() => props.onError?.("Google sign-in isn't configured on this site yet.")}
      />
    );
  }

  return <ConfiguredGoogleButton {...props} />;
}

/**
 * The real button, only mounted when Google is configured.
 *
 * `roles` carries the role pre-selected on the sign-up page; it's ignored when the
 * Google account already exists.
 */
function ConfiguredGoogleButton({ label, roles, onAuthenticated, onError, disabled, className }: GoogleButtonProps) {
  const { googleAuth } = useAuth();
  const [loading, setLoading] = useState(false);

  const login = useGoogleLogin({
    flow: "implicit",
    scope: "email profile",
    onSuccess: async (tokenResponse) => {
      try {
        const user = await googleAuth(tokenResponse.access_token, roles);
        onAuthenticated(user);
      } catch (err) {
        onError?.(err instanceof Error ? err.message : "Google sign-in failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setLoading(false);
      onError?.("Google sign-in was cancelled or could not complete.");
    },
    onNonOAuthError: () => setLoading(false),
  });

  return (
    <GoogleButtonView
      label={label}
      loading={loading}
      disabled={disabled}
      className={className}
      onClick={() => {
        setLoading(true);
        login();
      }}
    />
  );
}

// ds outline button at the 46px / 15px-500 size these screens use; the disabled
// palette mirrors the MUI outlined default the loading state used to show.
const googleButton = css(button.raw({ variant: "outline", full: true }), {
  h: "46px",
  paddingX: "15px",
  fontSize: "15px",
  fontWeight: 500,
  lineHeight: 1.75,
  gap: "8px",
  _hover: { bg: "#F8FAFC", borderColor: "borderStrong" },
  _disabled: { color: "rgba(0,0,0,0.26)", borderColor: "rgba(0,0,0,0.12)", opacity: 1, cursor: "not-allowed", pointerEvents: "none" },
});
const startIcon = css({ w: "18px", h: "18px", ml: "-4px", flexShrink: 0 });
const startSpinner = css({ ml: "-4px", color: "placeholder" });

function GoogleButtonView({
  label,
  loading,
  disabled,
  onClick,
  className,
}: {
  label: string;
  loading: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled || loading} className={cx(googleButton, className)}>
      {loading ? <Spinner size={18} className={startSpinner} /> : <GoogleIcon />}
      {loading ? "Connecting…" : label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg className={startIcon} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}
