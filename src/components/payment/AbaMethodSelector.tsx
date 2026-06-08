"use client";

import { Box, Typography } from "@mui/material";
import { tokens } from "@/theme";
import PaymentOption from "./PaymentOption";
import PayLogo, { type PayLogoId } from "./PayLogo";
import Annot from "./Annot";

export type AbaMethod = "khqr" | "card" | "alipay" | "wechat";

/** ABA PayWay methods per ABA's integration guideline. */
export const ABA_METHODS: { id: AbaMethod; name: string; desc: string; logos: PayLogoId[] }[] = [
  { id: "khqr", name: "ABA KHQR", desc: "Scan with any Cambodian bank app", logos: ["khqr"] },
  { id: "card", name: "Credit / Debit Card", desc: "Visa · Mastercard · UnionPay · JCB", logos: ["visa", "mc", "unionpay", "jcb"] },
  { id: "alipay", name: "Alipay", desc: "Alipay wallet", logos: ["alipay"] },
  { id: "wechat", name: "WeChat Pay", desc: "WeChat wallet", logos: ["wechat"] },
];

/** ABA step 6 — select payment method on our page (handed to ABA's popup after). */
export default function AbaMethodSelector({
  value,
  onChange,
}: {
  value: AbaMethod | null;
  onChange: (m: AbaMethod) => void;
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.25 }}>
        <Typography
          sx={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: tokens.text3 }}>
          Choose a payment method
        </Typography>
        <Annot>STEP 6</Annot>
      </Box>
      {ABA_METHODS.map(m => (
        <PaymentOption key={m.id} selected={value === m.id} onClick={() => onChange(m.id)}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 15 }}>{m.name}</Typography>
              <Typography sx={{ fontSize: 13, color: tokens.text2 }}>{m.desc}</Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 0.75, flexShrink: 0 }}>
              {m.logos.map(l => (
                <PayLogo key={l} id={l} size='sm' />
              ))}
            </Box>
          </Box>
        </PaymentOption>
      ))}
    </Box>
  );
}
