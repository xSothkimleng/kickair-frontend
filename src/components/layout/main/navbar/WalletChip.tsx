"use client";

import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import { useAuth } from "@/components/context/AuthContext";
import { useWalletSummary } from "@/hooks/useWalletSummary";

/**
 * Steam-style wallet balance next to the profile — money only, links to the
 * Finance tab of whichever dashboard matches the user's roles.
 */
export function WalletChip() {
  const { user } = useAuth();
  const { balance } = useWalletSummary();
  const router = useRouter();

  if (!user || user.is_admin || balance === null) return null;

  const financeHref =
    user.is_freelancer && !user.is_client
      ? "/dashboard/freelancer?tab=finance"
      : "/dashboard/client?tab=finance";

  return (
    <Box
      component="button"
      onClick={() => router.push(financeHref)}
      aria-label={`Wallet balance $${balance.toFixed(2)} — open Finance`}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.625,
        height: 32,
        px: 1.375,
        border: "1px solid rgba(0,0,0,0.12)",
        borderRadius: "999px",
        bgcolor: "transparent",
        cursor: "pointer",
        fontFamily: "inherit",
        fontSize: 13,
        fontWeight: 600,
        color: "rgba(0,0,0,0.8)",
        whiteSpace: "nowrap",
        transition: "border-color .15s, color .15s",
        "&:hover": { color: "black", borderColor: "rgba(0,0,0,0.3)" },
      }}>
      <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 16, opacity: 0.7 }} />
      ${balance.toFixed(2)}
    </Box>
  );
}
