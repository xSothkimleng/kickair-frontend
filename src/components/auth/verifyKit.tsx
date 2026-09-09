"use client";

/**
 * Shared kit for the email-verification screens (the in-app wall and the
 * /email-verified landing page): one square white card on the grey canvas,
 * logo top-left, editorial headline, square surfaces, black square buttons.
 * Ink palette (`ink`, `ink2`, `ink3`, `hairline*`, `canvas`, `surface`).
 */

import type { ReactNode } from "react";
import Link from "next/link";
import { css, cva, cx } from "styled-system/css";
import { button } from "@/components/ds";

const cardPage = css({ bg: "canvas", display: "flex", alignItems: "center", justifyContent: "center", p: { base: "16px", sm: "32px", md: "48px" } });
// Two known heights (full viewport for the wall, under the navbar for the landing page).
const cardPageMinH = { "100vh": css({ minH: "100vh" }), "85vh": css({ minH: "85vh" }) } as const;
const cardBox = css({
  w: "100%",
  boxSizing: "border-box",
  maxW: "560px",
  bg: "surface",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hairlineStrong",
  borderRadius: "0",
  p: { base: "28px 24px 32px", md: "40px 48px 44px" },
  display: "flex",
  flexDirection: "column",
});
const cardLogo = css({ h: "32px", w: "auto", display: "block", alignSelf: "flex-start", userSelect: "none" });
const cardBody = css({ mt: { base: "32px", md: "40px" } });

export function VerifyCard({ children, minHeight = "100vh" }: { children: ReactNode; minHeight?: keyof typeof cardPageMinH }) {
  return (
    <div className={cx(cardPage, cardPageMinH[minHeight])}>
      <div className={cardBox}>
        {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset, same as before the port */}
        <img src="/assets/images/kickair-logo.png" alt="KickAir" className={cardLogo} />
        <div className={cardBody}>{children}</div>
      </div>
    </div>
  );
}

const overline = css({ fontSize: "11px", lineHeight: 1.5, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, color: "ink3", mb: "12px" });

export function VerifyOverline({ children }: { children: ReactNode }) {
  return <div className={overline}>{children}</div>;
}

const headline = css({ fontSize: { base: "30px", md: "36px" }, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.08, color: "ink" });

export function VerifyHeadline({ children }: { children: ReactNode }) {
  return <h1 className={headline}>{children}</h1>;
}

const body = cva({
  base: { fontSize: "15px", lineHeight: 1.65, color: "ink2" },
  variants: { tone: { default: {}, strong: { color: "ink" } } },
  defaultVariants: { tone: "default" },
});

export function VerifyBody({ children, tone }: { children: ReactNode; tone?: "default" | "strong" }) {
  return <p className={body({ tone })}>{children}</p>;
}

const tag = cva({
  base: { display: "inline-block", px: "10px", py: "4px", fontSize: "12px", fontWeight: 600, letterSpacing: "0.02em", mb: "16px" },
  variants: {
    tone: {
      success: { bg: "successTint", color: "successText" },
      error: { bg: "errorTint", color: "errorText" },
    },
  },
});

export function VerifyTag({ tone, children }: { tone: "success" | "error"; children: ReactNode }) {
  return <span className={tag({ tone })}>{children}</span>;
}

const notice = cva({
  base: { mt: "20px", px: "16px", py: "12px", borderLeftWidth: "2px", borderLeftStyle: "solid" },
  variants: {
    tone: {
      success: { bg: "successTint", borderLeftColor: "success", color: "successText" },
      error: { bg: "errorTint", borderLeftColor: "error", color: "errorText" },
    },
  },
});
const noticeText = css({ fontSize: "13.5px", lineHeight: 1.5, color: "inherit" });

export function VerifyNotice({ tone, children }: { tone: "success" | "error"; children: ReactNode }) {
  return (
    <div role={tone === "error" ? "alert" : "status"} className={notice({ tone })}>
      <p className={noticeText}>{children}</p>
    </div>
  );
}

type VerifyButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary";
  onClick?: () => void;
  disabled?: boolean;
  href?: string;
  type?: "button" | "submit";
};

// Square 48px buttons on the ds button recipe. Text colours are !important because
// globals.css has an unlayered `a { color: inherit }` that beats layered styles on <a> buttons.
const verifyButtonBase = css.raw({
  boxSizing: "border-box", // the recipe sits on <a> too, which is content-box by default
  h: "48px",
  paddingX: "24px",
  fontSize: "15px",
  fontWeight: 600,
  borderRadius: "0",
  transition: "background-color .15s, border-color .15s, opacity .15s",
  _disabled: { opacity: 0.45, cursor: "default", pointerEvents: "none" },
});
const verifyButton = {
  primary: css(button.raw({ variant: "solid" }), verifyButtonBase, {
    bg: "ink",
    color: "#fff !important",
    borderColor: "ink",
    _hover: { bg: "rgba(0,0,0,0.8)", borderColor: "rgba(0,0,0,0.8)" },
  }),
  secondary: css(button.raw({ variant: "outline" }), verifyButtonBase, {
    bg: "transparent",
    color: "var(--colors-ink) !important",
    borderColor: "hairlineStrong",
    _hover: { bg: "rgba(0,0,0,0.04)", borderColor: "ink" },
  }),
};

export function VerifyButton({ children, variant = "primary", onClick, disabled, href, type = "button" }: VerifyButtonProps) {
  const className = verifyButton[variant];
  if (href) {
    return (
      <Link href={href} className={className} aria-disabled={disabled || undefined}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  );
}
