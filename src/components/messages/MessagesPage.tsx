"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { css } from "styled-system/css";
import { Spinner, iconButton, toast } from "@/components/ds";
import ConversationList from "./ConversationList";
import ChatView from "./ChatView";
import { api } from "@/lib/api";
import { useConversations } from "@/hooks/useConversations";
import { useChat } from "@/hooks/useChat";
import { Conversation } from "@/types/message";

export type MessagesRole = "client" | "freelancer";

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
const titleCss = css({ textStyle: "title", fontWeight: 600, color: "ink" });
const bodyCss = css({ maxW: "1440px", mx: "auto", p: { base: "12px", md: "24px" } });
const panelCss = css({
  display: "flex",
  h: { base: "calc(100dvh - 150px)", md: "calc(100vh - 180px)" },
  bg: "surface",
  borderRadius: "card",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hairline",
  overflow: "hidden",
});
// Two panes side by side from `md` up. On a phone only one shows at a time: the list,
// or the open chat (which gets a back button); `data-pane` on the panel says which.
const listPaneCss = css({
  display: { base: "none", md: "flex" },
  "[data-pane=list] > &": { display: "flex" },
  w: { base: "100%", md: "360px" },
  flexShrink: 0,
  minW: 0,
});
const chatPaneCss = css({
  display: { base: "none", md: "flex" },
  "[data-pane=chat] > &": { display: "flex" },
  flex: 1,
  minW: 0,
});
const fallbackCss = css({ display: "flex", justifyContent: "center", alignItems: "center", minH: "100vh" });
const fallbackSpinnerCss = css({ color: "accent" });

function MessagesContent({ role }: { role: MessagesRole }) {
  // Who the viewer is talking to.
  const other = role === "freelancer" ? "client" : "freelancer";
  const searchParams = useSearchParams();
  const conversationIdParam = searchParams.get("id");

  const { conversations, loading: conversationsLoading } = useConversations();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [syncedKey, setSyncedKey] = useState<string | null>(null);
  // A link to one conversation (from an order or a notification) opens straight on the chat.
  const [pane, setPane] = useState<"list" | "chat">(conversationIdParam ? "chat" : "list");

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
    setPane("chat");
    // Update URL without navigation
    const url = new URL(window.location.href);
    url.searchParams.set("id", String(conversation.id));
    window.history.replaceState({}, "", url.toString());
  };

  const handleSendMessage = async (body: string, file?: File) => {
    const sent = await sendMessage(body, file);
    if (!sent) toast.error(file ? "The file could not be sent. Please try again." : "The message could not be sent. Please try again.");
  };

  return (
    <div className={pageCss}>
      {/* Header */}
      <div className={headerCss}>
        <div className={headerInnerCss}>
          <Link href={`/dashboard/${role}`} aria-label="Back to dashboard" className={backCss}>
            <ArrowLeft size={20} />
          </Link>
          <h6 className={titleCss}>Messages</h6>
        </div>
      </div>

      {/* Content */}
      <div className={bodyCss}>
        <div className={panelCss} data-pane={pane}>
          <div className={listPaneCss}>
            <ConversationList
              conversations={conversations}
              selectedId={selectedConversation?.id ?? null}
              onSelect={handleSelectConversation}
              loading={conversationsLoading}
              participantLabel={other}
            />
          </div>
          <div className={chatPaneCss}>
            <ChatView
              conversation={selectedConversation}
              messages={messages}
              loading={messagesLoading}
              sending={sending}
              onSendMessage={handleSendMessage}
              participantLabel={other}
              viewerRole={role}
              onBack={() => setPane("list")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/** The Messages page of a space. Both spaces render this; only the role differs. */
export default function MessagesPage({ role }: { role: MessagesRole }) {
  return (
    <Suspense fallback={<div className={fallbackCss}><Spinner size={40} className={fallbackSpinnerCss} /></div>}>
      <MessagesContent role={role} />
    </Suspense>
  );
}
