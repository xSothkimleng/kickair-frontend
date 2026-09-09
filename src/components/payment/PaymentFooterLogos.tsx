"use client";

import { css, cva } from "styled-system/css";
import PayLogo, { type PayLogoId } from "./PayLogo";

const FOOTER_METHODS: PayLogoId[] = ["visa", "mc", "unionpay", "jcb", "alipay", "wechat"];

const wrapCss = css({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "20px",
});

const titleCss = cva({
  base: {
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    lineHeight: 1.5,
  },
  variants: { dark: { true: { color: "rgba(255,255,255,0.55)" }, false: { color: "ink3" } } },
});

const subCss = cva({
  base: { fontSize: "12px", lineHeight: 1.5 },
  variants: { dark: { true: { color: "rgba(255,255,255,0.4)" }, false: { color: "ink3" } } },
});

const logosCss = css({ display: "flex", gap: "10px", flexWrap: "wrap" });

/**
 * Accepted-payments strip for the site footer (ABA guideline requirement).
 * `variant` keeps it legible on light or dark footer backgrounds.
 */
export default function PaymentFooterLogos({ variant = "light" }: { variant?: "light" | "dark" }) {
  const dark = variant === "dark";
  return (
    <div className={wrapCss}>
      <div>
        <p className={titleCss({ dark })}>Secure payments by ABA PayWay</p>
        <p className={subCss({ dark })}>USD · escrow-protected</p>
      </div>
      <div className={logosCss}>
        {FOOTER_METHODS.map(id => (
          <PayLogo key={id} id={id} />
        ))}
      </div>
    </div>
  );
}
