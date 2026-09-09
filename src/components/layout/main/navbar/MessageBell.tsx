"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { registerMessageRefresh } from "@/components/layout/GlobalNotificationToast";
import { Indicator, Tooltip } from "@/components/ds";
import { api } from "@/lib/api";
import { useAuth } from "@/components/context/AuthContext";
import { bellBtnCss } from "./styles";

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
    // First fetch runs from a task (not synchronously in the effect body — React
    // Compiler lint), then poll every 30s.
    const first = setTimeout(fetchUnreadCount, 0);
    const id = setInterval(fetchUnreadCount, 30000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [user, fetchUnreadCount]);

  // Pusher message toasts trigger an immediate refresh of the badge.
  useEffect(() => registerMessageRefresh(fetchUnreadCount), [fetchUnreadCount]);

  if (!user) return null;

  return (
    <Indicator count={unreadCount} max={99}>
      <Tooltip content='Messages'>
        <button type='button' onClick={() => router.push(messagesHref)} className={bellBtnCss} aria-label='Messages'>
          <MessageCircle size={20} />
        </button>
      </Tooltip>
    </Indicator>
  );
}
