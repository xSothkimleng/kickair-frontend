"use client";

import { css, cva } from "styled-system/css";

export type PayLogoId = "khqr" | "visa" | "mc" | "unionpay" | "jcb" | "alipay" | "wechat";

const LABELS: Record<PayLogoId, string> = {
  khqr: "ABA KHQR",
  visa: "Visa",
  mc: "Mastercard",
  unionpay: "UnionPay",
  jcb: "JCB",
  alipay: "Alipay",
  wechat: "WeChat Pay",
};

// Slot shape — 50% round (the old theme logoRadius); switch to "22%" for square slots.
const slotCss = cva({
  base: {
    borderRadius: "50%",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "hairline",
    overflow: "hidden",
    flex: "none",
    bg: "surface",
  },
  variants: {
    size: {
      sm: { w: "34px", h: "34px" },
      md: { w: "44px", h: "44px" },
      lg: { w: "52px", h: "52px" },
    },
  },
  defaultVariants: { size: "md" },
});

const imgCss = css({ width: "100%", height: "100%", display: "block", objectFit: "cover" });

/**
 * Payment-method logo in a fixed-size slot. Reads a swappable SVG from
 * /public/assets/payment/{id}.svg — replace those with ABA's official assets
 * before go-live.
 */
export default function PayLogo({ id, size = "md" }: { id: PayLogoId; size?: "sm" | "md" | "lg" }) {
  return (
    <div className={slotCss({ size })}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/assets/payment/${id}.svg`} alt={LABELS[id]} title={LABELS[id]} className={imgCss} />
    </div>
  );
}
