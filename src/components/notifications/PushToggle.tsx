"use client";

import { useEffect, useState } from "react";
import { BellOff, BellPlus, BellRing } from "lucide-react";
import { css } from "styled-system/css";
import { Button, Spinner, Tooltip } from "@/components/ds";
import { isSupported, getPermission, isSubscribed, subscribe, unsubscribe } from "@/lib/webPush";

// span so the tooltip works on a disabled button
const disabledWrapCss = css({ display: "inline-flex" });

/**
 * Self-contained enable/disable button for browser (Chrome) push notifications.
 * Drop it into any header/toolbar — it renders nothing when the browser
 * doesn't support web push.
 */
export default function PushToggle() {
  // null = still detecting (also covers SSR, where we render nothing)
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [denied, setDenied] = useState(false);
  const [supported, setSupported] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isSupported()) return;
    setSupported(true);
    setDenied(getPermission() === "denied");
    isSubscribed().then(setEnabled).catch(() => setEnabled(false));
  }, []);

  if (!supported || enabled === null) return null;

  if (denied) {
    return (
      <Tooltip content='Notifications are blocked for this site. Click the lock icon next to the address bar and allow Notifications, then reload.'>
        <span className={disabledWrapCss}>
          <Button size='sm' variant='outline' disabled>
            <BellOff size={16} />
            Browser notifications blocked
          </Button>
        </span>
      </Tooltip>
    );
  }

  const handleClick = async () => {
    setBusy(true);
    try {
      if (enabled) {
        await unsubscribe();
        setEnabled(false);
      } else {
        const ok = await subscribe();
        setEnabled(ok);
        setDenied(getPermission() === "denied");
      }
    } catch {
      // Leave the current state — the user can retry.
    } finally {
      setBusy(false);
    }
  };

  return (
    <Tooltip
      content={
        enabled
          ? "You'll get native browser notifications even when this tab is in the background. Click to turn off."
          : "Get native browser notifications from KickAir, even when this tab is in the background."
      }>
      <Button size='sm' variant={enabled ? "outline" : "solid"} onClick={handleClick} disabled={busy}>
        {busy ? <Spinner size={14} /> : enabled ? <BellRing size={16} /> : <BellPlus size={16} />}
        {enabled ? "Browser notifications on" : "Enable browser notifications"}
      </Button>
    </Tooltip>
  );
}
