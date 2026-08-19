"use client";

import { useEffect, useState } from "react";
import { Button, Tooltip, CircularProgress } from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import NotificationAddIcon from "@mui/icons-material/NotificationAdd";
import { isSupported, getPermission, isSubscribed, subscribe, unsubscribe } from "@/lib/webPush";

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
      <Tooltip title="Notifications are blocked for this site. Click the lock icon next to the address bar and allow Notifications, then reload.">
        {/* span so the tooltip works on a disabled button */}
        <span>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            disabled
            startIcon={<NotificationsOffIcon sx={{ fontSize: 16 }} />}
            sx={{ textTransform: "none", fontSize: 13, borderRadius: "8px" }}
          >
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
      title={
        enabled
          ? "You'll get native browser notifications even when this tab is in the background. Click to turn off."
          : "Get native browser notifications from KickAir, even when this tab is in the background."
      }
    >
      <Button
        size="small"
        variant={enabled ? "outlined" : "contained"}
        onClick={handleClick}
        disabled={busy}
        disableElevation
        startIcon={
          busy ? (
            <CircularProgress size={14} color="inherit" />
          ) : enabled ? (
            <NotificationsActiveIcon sx={{ fontSize: 16 }} />
          ) : (
            <NotificationAddIcon sx={{ fontSize: 16 }} />
          )
        }
        sx={{ textTransform: "none", fontSize: 13, borderRadius: "8px", whiteSpace: "nowrap" }}
      >
        {enabled ? "Browser notifications on" : "Enable browser notifications"}
      </Button>
    </Tooltip>
  );
}
