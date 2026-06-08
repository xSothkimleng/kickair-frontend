"use client";

import { Box } from "@mui/material";
import { tokens } from "@/theme";

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

const SIZES = { sm: 34, md: 44, lg: 52 } as const;

/**
 * Payment-method logo in a fixed-size slot. Reads a swappable SVG from
 * /public/assets/payment/{id}.svg — replace those with ABA's official assets
 * before go-live. Slot shape (round/square) comes from `tokens.logoRadius`.
 */
export default function PayLogo({ id, size = "md" }: { id: PayLogoId; size?: keyof typeof SIZES }) {
  const px = SIZES[size];
  return (
    <Box
      sx={{
        width: px,
        height: px,
        borderRadius: tokens.logoRadius,
        border: `1px solid ${tokens.border}`,
        overflow: "hidden",
        flex: "none",
        bgcolor: tokens.surface,
      }}>
      <Box
        component='img'
        src={`/assets/payment/${id}.svg`}
        alt={LABELS[id]}
        title={LABELS[id]}
        sx={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
      />
    </Box>
  );
}
