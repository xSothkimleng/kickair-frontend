"use client";

import { useEffect, useState } from "react";
import { Box, Button, Dialog, Typography } from "@mui/material";
import {
  Lock as LockIcon,
  AccessTime as ClockIcon,
  Smartphone as PhoneIcon,
} from "@mui/icons-material";
import { tokens } from "@/theme";
import { fmtUsd } from "./format";
import type { AbaMethod } from "./AbaMethodSelector";
import QrGlyph from "./QrGlyph";

/**
 * SIMULATED ABA PayWay hosted page — represents ABA step 7, which in production
 * is ABA's OWN popup/iframe (not styled by us). This whole component is a
 * stand-in that gets replaced by ABA's real popup + status polling once the
 * merchant account/API is live. Deliberately ABA-navy so it never reads as ours.
 */
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
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth={false}
      slotProps={{ backdrop: { sx: { bgcolor: "rgba(10,15,30,0.55)", backdropFilter: "blur(3px)" } } }}
      PaperProps={{
        sx: { width: 420, maxWidth: "calc(100% - 32px)", m: 2, borderRadius: `${tokens.radius.card}px`, overflow: "hidden" },
      }}>
      {/* ABA hosted header — navy, distinctly ABA */}
      <Box sx={{ background: `linear-gradient(180deg, ${tokens.abaNavy}, ${tokens.abaNavy2})`, color: "#fff", p: "16px 20px" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.75 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.125 }}>
            <Box sx={{ width: 30, height: 30, borderRadius: "7px", bgcolor: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography sx={{ fontWeight: 800, fontSize: 13, color: tokens.abaNavy, letterSpacing: "-0.04em" }}>ABA</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em", lineHeight: 1.1 }}>ABA PayWay</Typography>
              <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.6)", letterSpacing: "0.02em" }}>Powered by ABA Bank</Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, bgcolor: "rgba(255,255,255,0.12)", px: 1.25, py: 0.625, borderRadius: "999px" }}>
            <LockIcon sx={{ fontSize: 12, color: "#7fd1a0" }} />
            <Typography sx={{ fontSize: 11, fontWeight: 600 }}>Secure</Typography>
          </Box>
        </Box>

        {/* Merchant + amount */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "rgba(255,255,255,0.08)", borderRadius: "12px", p: "12px 14px" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Box sx={{ width: 34, height: 34, borderRadius: "50%", bgcolor: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16 }}>
              K
            </Box>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{merchant}</Typography>
              <Typography sx={{ fontSize: 10.5, color: "rgba(255,255,255,0.55)" }}>Merchant payment</Typography>
            </Box>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography sx={{ fontFamily: tokens.mono, fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>{fmtUsd(amount)}</Typography>
            <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}>USD</Typography>
          </Box>
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ p: "22px 20px", bgcolor: tokens.abaBg }}>
        {isCard ? (
          <CardForm amount={amount} onPay={onScanComplete} />
        ) : (
          <QrPane method={method} methodName={methodName} onComplete={onScanComplete} />
        )}
      </Box>

      {/* Hosted footer */}
      <Box sx={{ p: "13px 20px", borderTop: `1px solid ${tokens.border}`, bgcolor: "#fff", display: "flex", justifyContent: "space-between" }}>
        <Button onClick={onFailure} sx={{ p: 0, minWidth: 0, fontSize: 12.5, color: tokens.text2, textTransform: "none", "&:hover": { bgcolor: "transparent", textDecoration: "underline" } }}>
          Simulate failure ›
        </Button>
        <Button onClick={onCancel} sx={{ p: 0, minWidth: 0, fontSize: 12.5, color: tokens.text3, textTransform: "none", "&:hover": { bgcolor: "transparent", textDecoration: "underline" } }}>
          Cancel &amp; return
        </Button>
      </Box>
    </Dialog>
  );
}

/* QR / scan variant (KHQR, Alipay, WeChat) */
function QrPane({ method, methodName, onComplete }: { method: AbaMethod; methodName: string; onComplete: () => void }) {
  const timer = useCountdown(292);
  const brandColor = ({ khqr: "#e2202a", alipay: "#1296db", wechat: "#09bb07", card: "#e2202a" } as Record<AbaMethod, string>)[method];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.75 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{methodName}</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, fontSize: 12, fontWeight: 600, color: tokens.pendingText, bgcolor: tokens.pendingTint, px: 1.25, py: 0.5, borderRadius: "999px" }}>
          <ClockIcon sx={{ fontSize: 13 }} /> Expires in {timer}
        </Box>
      </Box>

      <Box sx={{ width: "100%", maxWidth: 240, border: `1.5px solid ${brandColor}`, borderRadius: "14px", overflow: "hidden", bgcolor: "#fff" }}>
        <Box sx={{ bgcolor: brandColor, color: "#fff", p: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography sx={{ fontWeight: 700, fontSize: 13, letterSpacing: "0.02em" }}>{method === "khqr" ? "KHQR" : methodName}</Typography>
          <Typography sx={{ fontSize: 11, opacity: 0.85 }}>USD</Typography>
        </Box>
        <Box sx={{ p: 2.25, display: "flex", justifyContent: "center" }}>
          <QrGlyph color='#111' />
        </Box>
        <Box sx={{ px: 2, pb: 1.75, textAlign: "center" }}>
          <Typography sx={{ fontSize: 11, color: tokens.text3, fontFamily: tokens.mono }}>placeholder QR · mocked</Typography>
        </Box>
      </Box>

      <Typography sx={{ textAlign: "center", fontSize: 13, color: tokens.text2 }}>
        {method === "khqr" ? "Scan with any Cambodian banking app" : `Scan with the ${methodName} app`}
      </Typography>

      <Button
        fullWidth
        onClick={onComplete}
        startIcon={<PhoneIcon sx={{ fontSize: 16 }} />}
        sx={{ height: 44, borderRadius: "999px", bgcolor: tokens.accent, color: "#fff", textTransform: "none", fontSize: 15, fontWeight: 500, "&:hover": { bgcolor: tokens.accentHover } }}>
        Open ABA Mobile
      </Button>
      <Button
        fullWidth
        onClick={onComplete}
        sx={{ height: 44, borderRadius: "999px", bgcolor: "#000", color: "#fff", textTransform: "none", fontSize: 15, fontWeight: 500, "&:hover": { bgcolor: "rgba(0,0,0,0.8)" } }}>
        I&apos;ve completed the scan
      </Button>
    </Box>
  );
}

/* Card form variant */
function CardForm({ amount, onPay }: { amount: number; onPay: () => void }) {
  const [num, setNum] = useState("");
  const fmtCard = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
      <AbaField label='Card number'>
        <AbaInput inputMode='numeric' placeholder='1234 5678 9012 3456' value={num} onChange={e => setNum(fmtCard(e.target.value))} />
      </AbaField>
      <Box sx={{ display: "flex", gap: 1.5 }}>
        <AbaField label='Expiry' sx={{ flex: 1 }}>
          <AbaInput placeholder='MM / YY' />
        </AbaField>
        <AbaField label='CVV' sx={{ flex: 1 }}>
          <AbaInput placeholder='123' inputMode='numeric' maxLength={4} />
        </AbaField>
      </Box>
      <AbaField label='Cardholder name'>
        <AbaInput placeholder='Name on card' />
      </AbaField>
      <Button
        fullWidth
        onClick={onPay}
        startIcon={<LockIcon sx={{ fontSize: 16 }} />}
        sx={{ mt: 0.5, height: 52, borderRadius: "999px", bgcolor: tokens.accent, color: "#fff", textTransform: "none", fontSize: 16, fontWeight: 500, "&:hover": { bgcolor: tokens.accentHover } }}>
        Pay {fmtUsd(amount)}
      </Button>
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 0.75, color: tokens.text3, fontSize: 11.5 }}>
        <LockIcon sx={{ fontSize: 12 }} /> 3-D Secure · your card details never touch KickAir
      </Box>
    </Box>
  );
}

function AbaField({ label, children, sx }: { label: string; children: React.ReactNode; sx?: object }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", ...sx }}>
      <Typography component='label' sx={{ fontSize: 13, fontWeight: 500, color: tokens.text2, mb: "7px" }}>
        {label}
      </Typography>
      {children}
    </Box>
  );
}

function AbaInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Box
      component='input'
      {...props}
      sx={{
        width: "100%",
        boxSizing: "border-box",
        height: 44,
        px: "14px",
        border: `1px solid ${tokens.borderStrong}`,
        borderRadius: `${tokens.radius.input}px`,
        bgcolor: tokens.surface,
        font: "inherit",
        fontSize: 15,
        color: tokens.text,
        outline: "none",
        transition: "border-color .15s ease, box-shadow .15s ease",
        "&::placeholder": { color: tokens.text3 },
        "&:focus": { borderColor: tokens.accent, boxShadow: `0 0 0 3px ${tokens.accentFill}` },
      }}
    />
  );
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
