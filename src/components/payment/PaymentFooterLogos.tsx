"use client";

import { Box, Typography } from "@mui/material";
import { tokens } from "@/theme";
import PayLogo, { type PayLogoId } from "./PayLogo";

const FOOTER_METHODS: PayLogoId[] = ["khqr", "visa", "mc", "unionpay", "jcb", "alipay", "wechat"];

/**
 * Accepted-payments strip for the site footer (ABA guideline requirement).
 * `variant` keeps it legible on light or dark footer backgrounds.
 */
export default function PaymentFooterLogos({ variant = "light" }: { variant?: "light" | "dark" }) {
  const dark = variant === "dark";
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2.5,
      }}>
      <Box>
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: dark ? "rgba(255,255,255,0.55)" : tokens.text3,
          }}>
          Secure payments by ABA PayWay
        </Typography>
        <Typography sx={{ fontSize: 12, color: dark ? "rgba(255,255,255,0.4)" : tokens.text3 }}>USD · escrow-protected</Typography>
      </Box>
      <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap" }}>
        {FOOTER_METHODS.map(id => (
          <PayLogo key={id} id={id} />
        ))}
      </Box>
    </Box>
  );
}
