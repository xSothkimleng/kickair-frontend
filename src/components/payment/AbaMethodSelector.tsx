"use client";

import { css } from "styled-system/css";
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

const listCss = css({ display: "flex", flexDirection: "column", gap: "10px" });
const headCss = css({ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "2px" });
const headLabelCss = css({
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "ink3",
  lineHeight: 1.5,
});
const rowCss = css({ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" });
const textColCss = css({ minWidth: 0 });
const nameCss = css({ fontWeight: 600, fontSize: "15px", lineHeight: 1.5 });
const descCss = css({ fontSize: "13px", color: "ink2", lineHeight: 1.5 });
const logosCss = css({ display: "flex", gap: "6px", flexShrink: 0 });

/** ABA step 6 — select payment method on our page (handed to ABA's popup after). */
export default function AbaMethodSelector({
  value,
  onChange,
}: {
  value: AbaMethod | null;
  onChange: (m: AbaMethod) => void;
}) {
  return (
    <div className={listCss}>
      <div className={headCss}>
        <p className={headLabelCss}>Choose a payment method</p>
        <Annot>STEP 6</Annot>
      </div>
      {ABA_METHODS.map(m => (
        <PaymentOption key={m.id} selected={value === m.id} onClick={() => onChange(m.id)}>
          <div className={rowCss}>
            <div className={textColCss}>
              <p className={nameCss}>{m.name}</p>
              <p className={descCss}>{m.desc}</p>
            </div>
            <div className={logosCss}>
              {m.logos.map(l => (
                <PayLogo key={l} id={l} size='sm' />
              ))}
            </div>
          </div>
        </PaymentOption>
      ))}
    </div>
  );
}
