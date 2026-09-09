"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { css } from "styled-system/css";
import { Spinner, iconButton } from "@/components/ds";
import { ConversationList, ChatView } from "@/components/messages";
import { api } from "@/lib/api";
import { useConversations } from "@/hooks/useConversations";
import { useChat } from "@/hooks/useChat";
import { Conversation } from "@/types/message";

const pageCss = css({ minH: "100vh", bg: "canvas" });
const headerCss = css({
  bg: "surface",
  borderBottomWidth: "1px",
  borderBottomStyle: "solid",
  borderBottomColor: "hairline",
  px: "24px",
  py: "16px",
});
const headerInnerCss = css({ maxW: "1440px", mx: "auto", display: "flex", alignItems: "center", gap: "16px" });
// `a { color: inherit }` in globals.css beats the recipe's colour, so the icon carries it.
const backCss = css(iconButton.raw({ size: "sm" }), {
  _hover: { bg: "rgba(0, 0, 0, 0.05)" },
  "& svg": { color: "ink" },
});
const titleCss = css({ fontSize: "20px", fontWeight: 600, lineHeight: 1.6, letterSpacing: "0.0075em", color: "ink" });
const bodyCss = css({ maxW: "1440px", mx: "auto", p: "24px" });
const panelCss = css({
  display: "flex",
  h: "calc(100vh - 180px)",
  bg: "surface",
  borderRadius: "card",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hairline",
  overflow: "hidden",
});
const fallbackCss = css({ display: "flex", justifyContent: "center", alignItems: "center", minH: "100vh" });
const fallbackSpinnerCss = css({ color: "accent" });

function FreelancerMessagesContent() {
  const searchParams = useSearchParams();
  const conversationIdParam = searchParams.get("id");

  const { conversations, loading: conversationsLoading } = useConversations();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [syncedKey, setSyncedKey] = useState<string | null>(null);

  const {
    messages,
    loading: messagesLoading,
    sending,
    sendMessage,
    markAsRead,
  } = useChat(selectedConversation?.id ?? null);

  // Select the conversation from the URL param — fetching it directly if it isn't
  // in the paginated list, so deep links from orders/notifications always open the
  // right thread (with its name + history) — otherwise fall back to the first one.
  // The synchronous half runs during render (React's "adjust state when the inputs
  // change" pattern); a setState in an effect body would cascade an extra render.
  const conversationId = conversationIdParam ? Number(conversationIdParam) : null;
  const listedConversation = conversationId !== null ? conversations.find((c) => c.id === conversationId) : undefined;
  const syncKey = `${conversationIdParam ?? ""}|${conversations.length}`;
  if (syncKey !== syncedKey) {
    setSyncedKey(syncKey);
    if (conversationId !== null) {
      if (listedConversation && selectedConversation?.id !== conversationId) {
        setSelectedConversation(listedConversation);
      }
    } else if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  }

  // Deep link to a conversation that isn't in the loaded page of the list.
  useEffect(() => {
    if (conversationId === null || listedConversation || selectedConversation?.id === conversationId) return;
    api.get(`/api/conversations/${conversationId}`)
      .then((res) => { if (res?.data) setSelectedConversation(res.data as Conversation); })
      .catch(() => {});
  }, [conversationId, listedConversation, selectedConversation]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversation && selectedConversation.unread_count > 0) {
      markAsRead();
    }
  }, [selectedConversation, markAsRead]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    // Update URL without navigation
    const url = new URL(window.location.href);
    url.searchParams.set("id", String(conversation.id));
    window.history.replaceState({}, "", url.toString());
  };

  const handleSendMessage = async (body: string) => {
    await sendMessage(body);
  };

  return (
    <div className={pageCss}>
      {/* Header */}
      <div className={headerCss}>
        <div className={headerInnerCss}>
          <Link href="/dashboard/freelancer" aria-label="Back to dashboard" className={backCss}>
            <ArrowLeft size={20} />
          </Link>
          <h6 className={titleCss}>Messages</h6>
        </div>
      </div>

      {/* Content */}
      <div className={bodyCss}>
        <div className={panelCss}>
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversation?.id ?? null}
            onSelect={handleSelectConversation}
            loading={conversationsLoading}
            participantLabel="client"
          />
          <ChatView
            conversation={selectedConversation}
            messages={messages}
            loading={messagesLoading}
            sending={sending}
            onSendMessage={handleSendMessage}
            participantLabel="client"
            viewerRole="freelancer"
          />
        </div>
      </div>
    </div>
  );
}

export default function FreelancerMessagesPage() {
  return (
    <Suspense fallback={<div className={fallbackCss}><Spinner size={40} className={fallbackSpinnerCss} /></div>}>
      <FreelancerMessagesContent />
    </Suspense>
  );
}
