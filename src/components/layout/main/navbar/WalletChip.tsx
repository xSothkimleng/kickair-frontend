"use client";

import { useRouter } from "next/navigation";
import { Wallet } from "lucide-react";
import { css } from "styled-system/css";
import { useAuth } from "@/components/context/AuthContext";
import { useWalletSummary } from "@/hooks/useWalletSummary";

const chipCss = css({
  appearance: "none",
  display: "flex",
  alignItems: "center",
  gap: "5px",
  h: "32px",
  m: 0,
  px: "11px",
  py: 0,
  border: "1px solid rgba(0,0,0,0.12)",
  borderRadius: "999px",
  bg: "transparent",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: "13px",
  fontWeight: 600,
  color: "rgba(0,0,0,0.8)",
  whiteSpace: "nowrap",
  transition: "border-color .15s, color .15s",
  _hover: { color: "black", borderColor: "rgba(0,0,0,0.3)" },
  "& svg": { opacity: 0.7, flexShrink: 0 },
});

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
    <button
      type='button'
      onClick={() => router.push(financeHref)}
      aria-label={`Wallet balance $${balance.toFixed(2)} — open Finance`}
      className={chipCss}>
      <Wallet size={16} />
      ${balance.toFixed(2)}
    </button>
  );
}
