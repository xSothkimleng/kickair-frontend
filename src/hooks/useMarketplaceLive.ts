"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getEcho } from "@/lib/echo";
import { qk } from "@/lib/queryKeys";

/**
 * Subscribes to the public "marketplace" channel and refreshes the relevant list when a new
 * service/job is approved — so Explore / Opportunities update live for everyone (including
 * logged-out visitors, since this is a public channel that needs no auth).
 */
export function useMarketplaceLive(kind: "service" | "job") {
  const queryClient = useQueryClient();

  useEffect(() => {
    let echo: ReturnType<typeof getEcho>;
    try {
      echo = getEcho();
    } catch {
      return;
    }

    const channel = echo.channel("marketplace");
    channel.listen(".listing.published", (data: { type?: string }) => {
      if (data?.type !== kind) return;
      queryClient.invalidateQueries({ queryKey: kind === "service" ? qk.services.all() : qk.jobs.all() });
    });

    return () => {
      try { echo.leave("marketplace"); } catch {}
    };
  }, [kind, queryClient]);
}
