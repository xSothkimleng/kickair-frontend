"use client";

import { useEffect, useRef } from "react";
import { getEcho } from "@/lib/echo";

/**
 * Subscribes to the public "marketplace" channel for live changes to ONE service — the
 * freelancer edited it (forcing it back to pending_review), saved it as a draft, or deleted
 * it. Lets the service detail page block a purchase of a listing that is no longer available
 * in the form the visitor is looking at. Mirrors useMarketplaceLive's pattern; works for
 * logged-out visitors too since the channel is public.
 */
export function useServiceListingLive(serviceId: number, onChanged: (status: string) => void) {
  // Keep the latest callback without resubscribing on every render.
  const onChangedRef = useRef(onChanged);
  onChangedRef.current = onChanged;

  useEffect(() => {
    let echo: ReturnType<typeof getEcho>;
    try {
      echo = getEcho();
    } catch {
      return;
    }

    const channel = echo.channel("marketplace");
    channel.listen(".service.changed", (data: { id?: number; status?: string }) => {
      if (data?.id !== serviceId) return;
      onChangedRef.current(data?.status ?? "pending_review");
    });

    return () => {
      try { echo.leave("marketplace"); } catch {}
    };
  }, [serviceId]);
}
