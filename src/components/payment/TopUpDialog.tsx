"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Box, Button, Dialog, IconButton, Typography } from "@mui/material";
import { Close as CloseIcon, Add as AddIcon, InfoOutlined as InfoIcon } from "@mui/icons-material";
import { api } from "@/lib/api";
import { qk } from "@/lib/queryKeys";
import { tokens } from "@/theme";
import AbaMethodSelector, { type AbaMethod } from "./AbaMethodSelector";
import { usePaymentProcessing } from "./usePaymentProcessing";
import { fmtUsd } from "./format";
import Annot from "./Annot";

const CHIPS = [10, 25, 50, 100];

/**
 * Wallet top-up. Form (amount + ABA method) → shared payment flow → success.
 * Used standalone on the wallet page and as the insufficient-balance path on
 * checkout. Hides its form while the ABA popup / result overlay is showing.
 */
export default function TopUpDialog({
  open,
  onClose,
  currentBalance,
  suggestedAmount = 25,
  returnNote,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  currentBalance: number;
  suggestedAmount?: number;
  returnNote?: string;
  onSuccess?: () => void;
}) {
  const qc = useQueryClient();
  const [amount, setAmount] = useState<string>(String(suggestedAmount));
  const [custom, setCustom] = useState(false);
  const [method, setMethod] = useState<AbaMethod | null>(null);

  useEffect(() => {
    if (open) {
      setAmount(String(suggestedAmount));
      setCustom(false);
      setMethod(null);
    }
  }, [open, suggestedAmount]);

  const amt = Number(amount) || 0;
  const valid = amt >= 1 && !!method;

  const finish = () => {
    onSuccess?.();
    onClose();
  };

  const flow = usePaymentProcessing({
    context: "topup",
    perform: async () => {
      await api.post("/api/wallet/deposit", { amount: amt });
      await qc.invalidateQueries({ queryKey: qk.wallet() });
      qc.invalidateQueries({ queryKey: qk.dashboard.client() });
    },
    onSuccessPrimary: finish,
    onSuccessDone: finish,
    getNewBalance: () => currentBalance + amt,
    reference: { success: "#KA-TP-48217", failure: "#KA-ERR-90341 · ABA PayWay" },
  });

  const setChip = (v: number) => {
    setCustom(false);
    setAmount(String(v));
  };

  return (
    <>
      <Dialog
        open={open && !flow.active}
        onClose={onClose}
        fullWidth
        maxWidth='xs'
        PaperProps={{ sx: { borderRadius: `${tokens.radius.card}px` } }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: "20px 24px", borderBottom: `1px solid ${tokens.border}` }}>
          <Box>
            <Annot>STEP 1–3 · top up</Annot>
            <Typography sx={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.015em" }}>Add money to wallet</Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: tokens.text2 }}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        <Box sx={{ p: 3 }}>
          {returnNote && (
            <Box sx={{ display: "flex", gap: 1, mb: 2.25, p: "11px 13px", bgcolor: tokens.accentFill, border: `1px solid rgba(${tokens.accentRgb},0.2)`, borderRadius: `${tokens.radius.tile}px` }}>
              <InfoIcon sx={{ fontSize: 16, color: tokens.accent }} />
              <Typography sx={{ fontSize: 12.5, color: tokens.accent }}>{returnNote}</Typography>
            </Box>
          )}

          {/* Amount display */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, mb: 2.5 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: tokens.text3 }}>Amount (USD)</Typography>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.25 }}>
              <Typography sx={{ fontSize: 30, fontWeight: 500, color: tokens.text3 }}>$</Typography>
              <Typography sx={{ fontFamily: tokens.mono, fontSize: 52, fontWeight: 600, letterSpacing: "-0.03em" }}>
                {amt ? (amt % 1 ? amt.toFixed(2) : amt) : "0"}
              </Typography>
            </Box>
          </Box>

          {/* Quick-pick chips */}
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, mb: 1.25 }}>
            {CHIPS.map(v => {
              const active = !custom && amt === v;
              return (
                <Box
                  key={v}
                  component='button'
                  type='button'
                  onClick={() => setChip(v)}
                  sx={{
                    height: 44,
                    borderRadius: `${tokens.radius.tile}px`,
                    cursor: "pointer",
                    font: "inherit",
                    fontSize: 15,
                    fontWeight: 600,
                    border: `1px solid ${active ? tokens.accent : tokens.borderStrong}`,
                    bgcolor: active ? tokens.accentFill : tokens.surface,
                    color: active ? tokens.accent : tokens.text,
                  }}>
                  ${v}
                </Box>
              );
            })}
          </Box>

          {/* Custom */}
          <Box
            component='button'
            type='button'
            onClick={() => {
              setCustom(true);
              setAmount("");
            }}
            sx={{
              width: "100%",
              height: 44,
              borderRadius: `${tokens.radius.tile}px`,
              cursor: "pointer",
              font: "inherit",
              fontSize: 14,
              fontWeight: 500,
              mb: custom ? 1 : 2.5,
              border: `1px solid ${custom ? tokens.accent : tokens.borderStrong}`,
              bgcolor: custom ? tokens.accentFill : tokens.surface,
              color: custom ? tokens.accent : tokens.text2,
            }}>
            Custom amount
          </Box>
          {custom && (
            <Box sx={{ position: "relative", mb: 2.5 }}>
              <Box component='span' sx={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: tokens.text3, fontSize: 16 }}>
                $
              </Box>
              <Box
                component='input'
                type='number'
                autoFocus
                placeholder='0.00'
                value={amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                sx={{
                  width: "100%",
                  boxSizing: "border-box",
                  height: 44,
                  pl: "28px",
                  pr: "14px",
                  border: `1px solid ${tokens.borderStrong}`,
                  borderRadius: `${tokens.radius.input}px`,
                  bgcolor: tokens.surface,
                  font: "inherit",
                  fontSize: 16,
                  fontWeight: 600,
                  outline: "none",
                  "&:focus": { borderColor: tokens.accent, boxShadow: `0 0 0 3px ${tokens.accentFill}` },
                }}
              />
            </Box>
          )}

          {/* Method selector */}
          <Box sx={{ mb: 2.75 }}>
            <AbaMethodSelector value={method} onChange={setMethod} />
          </Box>

          <Button
            fullWidth
            disabled={!valid}
            onClick={() => method && flow.startAba(method, amt)}
            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
            sx={{
              height: 52,
              borderRadius: "999px",
              bgcolor: "#000",
              color: "#fff",
              textTransform: "none",
              fontSize: 16,
              fontWeight: 500,
              "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
              "&.Mui-disabled": { bgcolor: "rgba(0,0,0,0.18)", color: "#fff" },
            }}>
            Add {fmtUsd(amt)} to wallet
          </Button>
          <Typography sx={{ textAlign: "center", fontSize: 11.5, color: tokens.text3, mt: 1.75 }}>
            Balance is stored in your KickAir wallet · USD
          </Typography>
        </Box>
      </Dialog>

      {flow.overlay}
    </>
  );
}
