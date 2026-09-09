"use client";

import { useEffect, useState } from "react";
import { Clock, Lock, Smartphone } from "lucide-react";
import { css, cva, cx } from "styled-system/css";
import { BareModal } from "@/components/ds/BareModal";
import { pillButton } from "./pill";
import { fmtUsd } from "./format";
import type { AbaMethod } from "./AbaMethodSelector";
import QrGlyph from "./QrGlyph";

/**
 * SIMULATED ABA PayWay hosted page — represents ABA step 7, which in production
 * is ABA's OWN popup/iframe (not styled by us). This whole component is a
 * stand-in that gets replaced by ABA's real popup + status polling once the
 * merchant account/API is live. Deliberately ABA-navy so it never reads as ours.
 */

const backdropCss = css({ bg: "rgba(10,15,30,0.55)", backdropFilter: "blur(3px)" });
// Clips the navy header / white footer to the panel's 16px radius (the old Paper `overflow: hidden`).
const shellCss = css({ borderRadius: "card", overflow: "hidden" });

const headerCss = css({
  background: "linear-gradient(180deg, var(--colors-aba-navy), var(--colors-aba-navy2))",
  color: "#fff",
  p: "16px 20px",
});
const headTopCss = css({ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "14px" });
const brandCss = css({ display: "flex", alignItems: "center", gap: "9px" });
const brandMarkCss = css({
  width: "30px",
  height: "30px",
  borderRadius: "7px",
  bg: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});
const brandMarkTextCss = css({ fontWeight: 800, fontSize: "13px", color: "aba.navy", letterSpacing: "-0.04em", lineHeight: 1.5 });
const brandNameCss = css({ fontWeight: 700, fontSize: "14px", letterSpacing: "-0.01em", lineHeight: 1.1 });
const brandSubCss = css({ fontSize: "10px", color: "rgba(255,255,255,0.6)", letterSpacing: "0.02em", lineHeight: 1.5 });
const secureCss = css({
  display: "flex",
  alignItems: "center",
  gap: "6px",
  bg: "rgba(255,255,255,0.12)",
  px: "10px",
  py: "5px",
  borderRadius: "pill",
});
const secureIconCss = css({ color: "#7fd1a0", flexShrink: 0 });
const secureTextCss = css({ fontSize: "11px", fontWeight: 600, lineHeight: 1.5 });

const merchantCss = css({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  bg: "rgba(255,255,255,0.08)",
  borderRadius: "12px",
  p: "12px 14px",
});
const merchantLeftCss = css({ display: "flex", alignItems: "center", gap: "10px" });
const merchantAvatarCss = css({
  width: "34px",
  height: "34px",
  borderRadius: "50%",
  bg: "#000",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
  fontSize: "16px",
});
const merchantNameCss = css({ fontSize: "13px", fontWeight: 600, lineHeight: 1.5 });
const merchantSubCss = css({ fontSize: "10.5px", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 });
const amountColCss = css({ textAlign: "right" });
const amountCss = css({ fontFamily: "mono", fontSize: "20px", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.5 });
const currencyCss = css({ fontSize: "10px", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 });

const bodyCss = css({ p: "22px 20px", bg: "aba.bg" });

const footerCss = css({
  p: "13px 20px",
  borderTopWidth: "1px",
  borderTopStyle: "solid",
  borderTopColor: "hairline",
  bg: "#fff",
  display: "flex",
  justifyContent: "space-between",
});
const footerBtnCss = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    m: 0,
    p: 0,
    minW: 0,
    border: "none",
    bg: "transparent",
    fontFamily: "inherit",
    fontSize: "12.5px",
    fontWeight: 500,
    lineHeight: 1.75,
    letterSpacing: "0.02857em",
    cursor: "pointer",
    appearance: "none",
    _hover: { textDecoration: "underline" },
    _focusVisible: { outline: "none", boxShadow: "focusRing" },
  },
  variants: { tone: { ink2: { color: "ink2" }, ink3: { color: "ink3" } } },
});

export default function MockAbaPayWayPopup({
  open,
  method,
  amount,
  merchant = "KickAir",
  onScanComplete,
  onFailure,
  onCancel,
}: {
  open: boolean;
  method: AbaMethod;
  amount: number;
  merchant?: string;
  onScanComplete: () => void;
  onFailure: () => void;
  onCancel: () => void;
}) {
  const isCard = method === "card";
  const methodName = { khqr: "ABA KHQR", alipay: "Alipay", wechat: "WeChat Pay", card: "Card" }[method];

  return (
    <BareModal
      open={open}
      onOpenChange={o => {
        if (!o) onCancel();
      }}
      maxW='420px'
      backdropClassName={backdropCss}>
      <div className={shellCss}>
        {/* ABA hosted header — navy, distinctly ABA */}
        <div className={headerCss}>
          <div className={headTopCss}>
            <div className={brandCss}>
              <div className={brandMarkCss}>
                <span className={brandMarkTextCss}>ABA</span>
              </div>
              <div>
                <div className={brandNameCss}>ABA PayWay</div>
                <div className={brandSubCss}>Powered by ABA Bank</div>
              </div>
            </div>
            <div className={secureCss}>
              <Lock size={12} className={secureIconCss} />
              <span className={secureTextCss}>Secure</span>
            </div>
          </div>

          {/* Merchant + amount */}
          <div className={merchantCss}>
            <div className={merchantLeftCss}>
              <div className={merchantAvatarCss}>K</div>
              <div>
                <div className={merchantNameCss}>{merchant}</div>
                <div className={merchantSubCss}>Merchant payment</div>
              </div>
            </div>
            <div className={amountColCss}>
              <div className={amountCss}>{fmtUsd(amount)}</div>
              <div className={currencyCss}>USD</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className={bodyCss}>
          {isCard ? (
            <CardForm amount={amount} onPay={onScanComplete} />
          ) : (
            <QrPane method={method} methodName={methodName} onComplete={onScanComplete} />
          )}
        </div>

        {/* Hosted footer */}
        <div className={footerCss}>
          <button type='button' onClick={onFailure} className={footerBtnCss({ tone: "ink2" })}>
            Simulate failure ›
          </button>
          <button type='button' onClick={onCancel} className={footerBtnCss({ tone: "ink3" })}>
            Cancel &amp; return
          </button>
        </div>
      </div>
    </BareModal>
  );
}

/* QR / scan variant (KHQR, Alipay, WeChat) */

const qrPaneCss = css({ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" });
const qrHeadRowCss = css({ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" });
const qrMethodCss = css({ fontSize: "14px", fontWeight: 600, lineHeight: 1.5 });
const qrTimerCss = css({
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "12px",
  fontWeight: 600,
  color: "pendingText",
  bg: "pendingTint",
  px: "10px",
  py: "4px",
  borderRadius: "pill",
});
const qrCardCss = css({
  width: "100%",
  maxWidth: "240px",
  borderWidth: "1.5px",
  borderStyle: "solid",
  borderRadius: "14px",
  overflow: "hidden",
  bg: "#fff",
});
const qrCardHeadCss = css({
  color: "#fff",
  p: "8px 12px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});
const qrCardTitleCss = css({ fontWeight: 700, fontSize: "13px", letterSpacing: "0.02em", lineHeight: 1.5 });
const qrCardCurrencyCss = css({ fontSize: "11px", opacity: 0.85, lineHeight: 1.5 });
const qrGlyphWrapCss = css({ p: "18px", display: "flex", justifyContent: "center" });
const qrCaptionWrapCss = css({ px: "16px", pb: "14px", textAlign: "center" });
const qrCaptionCss = css({ fontSize: "11px", color: "ink3", fontFamily: "mono", lineHeight: 1.5 });
const qrHintCss = css({ textAlign: "center", fontSize: "13px", color: "ink2", lineHeight: 1.5 });

const BRAND_COLOR: Record<AbaMethod, string> = { khqr: "#e2202a", alipay: "#1296db", wechat: "#09bb07", card: "#e2202a" };

function QrPane({ method, methodName, onComplete }: { method: AbaMethod; methodName: string; onComplete: () => void }) {
  const timer = useCountdown(292);
  const brandColor = BRAND_COLOR[method];

  return (
    <div className={qrPaneCss}>
      <div className={qrHeadRowCss}>
        <div className={qrMethodCss}>{methodName}</div>
        <div className={qrTimerCss}>
          <Clock size={13} /> Expires in {timer}
        </div>
      </div>

      <div className={qrCardCss} style={{ borderColor: brandColor }}>
        <div className={qrCardHeadCss} style={{ backgroundColor: brandColor }}>
          <div className={qrCardTitleCss}>{method === "khqr" ? "KHQR" : methodName}</div>
          <div className={qrCardCurrencyCss}>USD</div>
        </div>
        <div className={qrGlyphWrapCss}>
          <QrGlyph color='#111' />
        </div>
        <div className={qrCaptionWrapCss}>
          <div className={qrCaptionCss}>placeholder QR · mocked</div>
        </div>
      </div>

      <div className={qrHintCss}>
        {method === "khqr" ? "Scan with any Cambodian banking app" : `Scan with the ${methodName} app`}
      </div>

      <button type='button' onClick={onComplete} className={pillButton({ tone: "accent", size: "md", full: true })}>
        <Smartphone size={16} />
        Open ABA Mobile
      </button>
      <button type='button' onClick={onComplete} className={pillButton({ tone: "black", size: "md", full: true })}>
        I&apos;ve completed the scan
      </button>
    </div>
  );
}

/* Card form variant */

const cardFormCss = css({ display: "flex", flexDirection: "column", gap: "14px" });
const cardRowCss = css({ display: "flex", gap: "12px" });
const cardFieldHalfCss = css({ flex: 1 });
const payBtnCss = css(pillButton.raw({ tone: "accent", size: "lg", full: true }), { mt: "4px" });
const cardNoteCss = css({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "6px",
  color: "ink3",
  fontSize: "11.5px",
});

function CardForm({ amount, onPay }: { amount: number; onPay: () => void }) {
  const [num, setNum] = useState("");
  const fmtCard = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  return (
    <div className={cardFormCss}>
      <AbaField label='Card number'>
        <AbaInput inputMode='numeric' placeholder='1234 5678 9012 3456' value={num} onChange={e => setNum(fmtCard(e.target.value))} />
      </AbaField>
      <div className={cardRowCss}>
        <AbaField label='Expiry' className={cardFieldHalfCss}>
          <AbaInput placeholder='MM / YY' />
        </AbaField>
        <AbaField label='CVV' className={cardFieldHalfCss}>
          <AbaInput placeholder='123' inputMode='numeric' maxLength={4} />
        </AbaField>
      </div>
      <AbaField label='Cardholder name'>
        <AbaInput placeholder='Name on card' />
      </AbaField>
      <button type='button' onClick={onPay} className={payBtnCss}>
        <Lock size={16} />
        Pay {fmtUsd(amount)}
      </button>
      <div className={cardNoteCss}>
        <Lock size={12} /> 3-D Secure · your card details never touch KickAir
      </div>
    </div>
  );
}

const fieldCss = css({ display: "flex", flexDirection: "column" });
const fieldLabelCss = css({ fontSize: "13px", fontWeight: 500, color: "ink2", mb: "7px", lineHeight: 1.5 });

function AbaField({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cx(fieldCss, className)}>
      <label className={fieldLabelCss}>{label}</label>
      {children}
    </div>
  );
}

const inputCss = css({
  width: "100%",
  boxSizing: "border-box",
  height: "44px",
  px: "14px",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hairlineStrong",
  borderRadius: "input",
  bg: "surface",
  fontFamily: "inherit",
  fontSize: "15px",
  color: "ink",
  outline: "none",
  transition: "border-color .15s ease, box-shadow .15s ease",
  _placeholder: { color: "ink3" },
  _focus: { borderColor: "accent", boxShadow: "0 0 0 3px var(--colors-accent-fill)" },
});

function AbaInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputCss} />;
}

function useCountdown(seconds: number) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const t = setInterval(() => setLeft(l => (l > 0 ? l - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}
