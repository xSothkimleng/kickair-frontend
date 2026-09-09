/**
 * Shared kit for the auth card screens (sign-in, sign-up, forgot / reset
 * password): one 420px white card on the slate page background, logo on top,
 * centred title, 48px accent primary button. Panda port of the MUI
 * Paper/Typography/Button pattern those pages repeated verbatim.
 *
 * Where the design overrides a value the ds recipes already set (button
 * height, card radius…) the override is merged with `css(recipe.raw(), …)`
 * rather than `className`, because Panda resolves two atoms for the same
 * property by extraction order, not by class order.
 */

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { css, cx } from "styled-system/css";
import { Spinner, button, card } from "@/components/ds";

// MUI `contained` elevation the pages never turned off (shadows[2], shadows[4] on hover).
const SHADOW_REST = "0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)";
const SHADOW_HOVER = "0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)";

const page = css({ minH: "95vh", display: "flex", alignItems: "center", justifyContent: "center", px: { base: "16px", sm: "48px" }, bg: "page" });
const column = css({ w: "100%", maxW: "420px" });
const cardCss = css(card.raw({ padding: "none" }), {
  borderRadius: "0",
  p: { base: "24px", sm: "32px" },
  boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 12px 32px rgba(15,23,42,0.07)",
});
const logoRow = css({ display: "flex", justifyContent: "center", mb: "20px" });
const logo = css({ h: "36px" });

/** Page background + centred 420px card with the KickAir logo. `className` extends the outer page box. */
export function AuthPage({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx(page, className)}>
      <div className={column}>
        <div className={cardCss}>
          <div className={logoRow}>
            {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset, same as before the port */}
            <img src="/assets/images/kickair-logo.png" alt="KickAir" className={logo} />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

/** Suspense fallback: the same page box with a centred spinner. */
export function AuthFallback() {
  return (
    <div className={css({ minH: "95vh", display: "flex", alignItems: "center", justifyContent: "center", bg: "page" })}>
      <Spinner size={40} className={css({ color: "accent" })} />
    </div>
  );
}

// Typography. `h1`/`p` margins are reset by globals.css, so spacing lives on wrappers.
export const authTitle = css({ fontSize: "23px", fontWeight: 700, lineHeight: 1.5, letterSpacing: "-0.02em", color: "heading" });
export const authSubtitle = css({ fontSize: "14.5px", lineHeight: 1.5, color: "muted" });
export const authFooterText = css({ textAlign: "center", fontSize: "14px", lineHeight: 1.5, color: "body" });
/** Bold inline link inside a footer sentence ("Create one", "Sign in"). Use with the ds `Link`. */
export const authLinkStrong = css({ fontWeight: 700, textUnderlineOffset: "3px", _hover: { opacity: 0.85 } });
export const authForm = css({ display: "flex", flexDirection: "column", gap: "16px" });

const primaryButton = css(button.raw({ variant: "solid", full: true }), {
  h: "48px",
  minW: "64px",
  paddingX: "16px",
  fontSize: "16px",
  fontWeight: 500,
  lineHeight: 1.75,
  boxShadow: SHADOW_REST,
  _hover: { bg: "accentHover", boxShadow: SHADOW_HOVER },
  _disabled: { bg: "rgba(0,0,0,0.12)", color: "rgba(0,0,0,0.26)", boxShadow: "none", opacity: 1, cursor: "not-allowed", pointerEvents: "none" },
});

/** Full-width 48px accent button used for every primary auth action. */
export function AuthPrimaryButton({ className, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={cx(primaryButton, className)} {...props} />;
}

/** Bare accent text button sized to its 13px label ("Forgot password?"). */
export const authTextButton = css(button.raw({ variant: "text" }), {
  h: "auto",
  minW: "0",
  paddingX: "0",
  paddingY: "0",
  borderWidth: "0",
  fontSize: "13px",
  fontWeight: 500,
  lineHeight: 1.75,
  _hover: { color: "accent", bg: "transparent", textDecoration: "underline" },
});

/** Muted text button with the MUI text-button box (6px 8px padding, 64px min width). */
export const authMutedButton = css(button.raw({ variant: "text" }), {
  h: "auto",
  minW: "64px",
  paddingX: "8px",
  paddingY: "6px",
  borderWidth: "0",
  fontSize: "13px",
  fontWeight: 500,
  lineHeight: 1.75,
  color: "muted",
  _hover: { color: "muted", bg: "rgba(0,113,227,0.04)", textDecoration: "none" },
});

/** "Back" variant of the muted button: 14px label, icon slot, hover darkens the text. */
export const authBackButton = css(button.raw({ variant: "text" }), {
  h: "auto",
  minW: "64px",
  paddingX: "8px",
  paddingY: "6px",
  borderWidth: "0",
  fontSize: "14px",
  fontWeight: 500,
  lineHeight: 1.75,
  color: "muted",
  _hover: { color: "body", bg: "transparent", textDecoration: "none" },
});
