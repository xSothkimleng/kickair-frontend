"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { qk } from "@/lib/queryKeys";
import { useAuth } from "@/components/context/AuthContext";
import type { Wallet } from "@/types/wallet";

/**
 * Lightweight wallet fetch for the navbar balance chip. Uses a child key of
 * qk.wallet() so every existing `invalidateQueries({ queryKey: qk.wallet() })`
 * (checkout, withdraw, realtime events) refreshes it too — but without
 * colliding with the differently-shaped caches other surfaces store under
 * the bare ["wallet"] key.
 */
export function useWalletSummary() {
  const { user } = useAuth();

  const { data } = useQuery({
    queryKey: [...qk.wallet(), "summary"],
    queryFn: async () => (await api.get("/api/wallet")).data as Wallet,
    enabled: !!user && !user.is_admin,
    staleTime: 30_000,
  });

  const balance = data ? parseFloat(String(data.available_balance_raw)) : null;

  return { balance };
}
