"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { registerMessageRefresh } from "@/components/layout/GlobalNotificationToast";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { Badge, IconButton, Tooltip } from "@mui/material";
import { api } from "@/lib/api";
import { useAuth } from "@/components/context/AuthContext";

export function MessageBell() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  const isFreelancer = user?.is_freelancer ?? false;

  // Route to whichever space the user is currently in; fall back to their available profile.
  const messagesHref = pathname?.includes("/dashboard/freelancer")
    ? "/dashboard/freelancer/messages"
    : pathname?.includes("/dashboard/client")
      ? "/dashboard/client/messages"
      : isFreelancer
        ? "/dashboard/freelancer/messages"
        : "/dashboard/client/messages";

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await api.getUnreadMessageCount();
      setUnreadCount(count);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchUnreadCount();
    const id = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(id);
  }, [user, fetchUnreadCount]);

  // Pusher message toasts trigger an immediate refresh of the badge.
  useEffect(() => registerMessageRefresh(fetchUnreadCount), [fetchUnreadCount]);

  if (!user) return null;

  return (
    <Tooltip title="Messages">
      <IconButton onClick={() => router.push(messagesHref)} size="small" sx={{ color: "rgba(0,0,0,0.7)" }}>
        <Badge badgeContent={unreadCount || null} color="error" max={99}>
          <ChatBubbleOutlineIcon sx={{ fontSize: 20 }} />
        </Badge>
      </IconButton>
    </Tooltip>
  );
}
