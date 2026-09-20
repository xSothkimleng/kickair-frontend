"use client";

import { useRouter } from "next/navigation";
import { Wallet } from "lucide-react";
import { useAuth } from "@/components/context/AuthContext";
import { useWalletSummary } from "@/hooks/useWalletSummary";
import { walletChipCss, pillBalanceCss, pillDividerCss } from "./styles";

/**
 * Steam-style wallet balance — money only, links to the Finance tab of whichever
 * dashboard matches the user's roles. Standalone it is a chip (mobile drawer);
 * `inPill` renders it as the balance half of the navbar's account pill, with the
 * divider that separates it from the name — nothing at all when there's no balance.
 */
export function WalletChip({ inPill = false }: { inPill?: boolean }) {
  const { user } = useAuth();
  const { balance } = useWalletSummary();
  const router = useRouter();

  if (!user || user.is_admin || balance === null) return null;

  const financeHref =
    user.is_freelancer && !user.is_client
      ? "/dashboard/freelancer?tab=finance"
      : "/dashboard/client?tab=finance";

  const label = `Wallet balance $${balance.toFixed(2)} — open Finance`;

  if (inPill) {
    return (
      <>
        <span aria-hidden className={pillDividerCss} />
        <button type='button' onClick={() => router.push(financeHref)} aria-label={label} className={pillBalanceCss}>
          ${balance.toFixed(2)}
        </button>
      </>
    );
  }

  return (
    <button type='button' onClick={() => router.push(financeHref)} aria-label={label} className={walletChipCss}>
      <Wallet size={18} />
      ${balance.toFixed(2)}
    </button>
  );
}
