"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, Plus, Receipt, Search, Send } from "lucide-react";
import { css, cva } from "styled-system/css";
import { Avatar, Spinner, button, iconButton } from "@/components/ds";
import { Conversation, ConversationOrderEvent, Message } from "@/types/message";
import { api } from "@/lib/api";
import { qk } from "@/lib/queryKeys";
import MessageBubble from "./MessageBubble";

/* ── empty state (no conversation selected) ── */
const emptyRootCss = css({ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", bg: "surface" });
const emptyInnerCss = css({ textAlign: "center" });
const emptyIconWrapCss = css({
  w: "48px",
  h: "48px",
  borderRadius: "50%",
  bg: "rgba(0, 0, 0, 0.05)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  mx: "auto",
  mb: "16px",
  color: "rgba(0, 0, 0, 0.2)",
});
// globals.css zeroes margin/padding on <p> outside any layer, so the `mb` these
// carried as MUI Typography never rendered — dropped rather than ported.
const emptyTitleCss = css({ fontSize: "17px", fontWeight: 600, color: "ink" });
const emptyCopyCss = css({ fontSize: "13px", color: "ink2" });

/* ── shell ── */
const rootCss = css({ flex: 1, display: "flex", flexDirection: "column" });
const headerCss = css({
  p: "16px",
  borderBottomWidth: "1px",
  borderBottomStyle: "solid",
  borderBottomColor: "hairline",
  bg: "surface",
});
const rowBetweenCss = css({ display: "flex", alignItems: "center", justifyContent: "space-between" });
const headerIdentityCss = css({ display: "flex", alignItems: "center", gap: "12px" });
const headerNameCss = css({ fontSize: "15px", fontWeight: 600, color: "ink" });
const headerSubCss = css({ fontSize: "11px", color: "ink2" });

// MUI <Badge variant="dot" overlap="circular" anchorOrigin={bottom,right}> —
// transparent fill inside a 2px white ring.
const avatarWrapCss = css({ position: "relative", display: "inline-flex", verticalAlign: "middle", flexShrink: 0 });
const avatarDotCss = css({
  position: "absolute",
  bottom: "14%",
  right: "14%",
  transform: "translate(50%, 50%)",
  w: "10px",
  h: "10px",
  boxSizing: "border-box",
  borderRadius: "50%",
  bg: "transparent",
  borderWidth: "2px",
  borderStyle: "solid",
  borderColor: "white",
});

/* ── order context banner ── */
const bannerCss = css({
  mt: "12px",
  p: "12px",
  bg: "rgba(37, 99, 235, 0.05)",
  borderRadius: "12px",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "rgba(37, 99, 235, 0.1)",
});
const bannerLeftCss = css({ display: "flex", alignItems: "center", gap: "8px" });
const bannerIconCss = css({ color: "#3b82f6", flexShrink: 0 });
const bannerTextCss = css({ fontSize: "12px", color: "rgb(29, 78, 216)", fontWeight: 500 });
const viewOrderBtnCss = css(button.raw({ variant: "text" }), {
  h: "auto",
  minW: "auto",
  px: 0,
  py: 0,
  borderWidth: 0,
  borderRadius: 0,
  fontSize: "11px",
  fontWeight: 500,
  lineHeight: 1.75,
  letterSpacing: "0.02857em",
  color: "#3b82f6",
  _hover: { bg: "transparent", color: "#3b82f6", textDecoration: "underline" },
});

/* ── chip (MUI <Chip size="small" | default>) ── */
const chipCss = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    maxW: "100%",
    borderRadius: "pill",
    fontFamily: "inherit",
    fontWeight: 400,
    whiteSpace: "nowrap",
  },
  variants: {
    tone: {
      status: { h: "20px", px: "8px", fontSize: "10px", bg: "rgba(37, 99, 235, 0.1)", color: "#3b82f6" },
      date: { h: "24px", px: "12px", fontSize: "11px", bg: "rgba(0, 0, 0, 0.05)", color: "ink2" },
    },
  },
});

/* ── message stream ── */
const streamCss = css({ flex: 1, overflowY: "auto", p: "24px", display: "flex", flexDirection: "column" });
const loadingCss = css({ display: "flex", justifyContent: "center", py: "32px" });
const spinnerCss = css({ color: "accent" });
const noMessagesWrapCss = css({ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" });
const noMessagesCss = css({ fontSize: "13px", color: "rgba(0, 0, 0, 0.5)" });
const dateRowCss = cva({
  base: { display: "flex", justifyContent: "center", mb: "16px" },
  variants: { first: { true: { mt: 0 }, false: { mt: "16px" } } },
});

/* ── inline order event pill ── */
const eventRowCss = css({ display: "flex", justifyContent: "center", my: "10px" });
const eventPillCss = css({
  display: "flex",
  alignItems: "center",
  gap: "6px",
  px: "12px",
  py: "4.8px",
  bg: "rgba(37, 99, 235, 0.06)",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "rgba(37, 99, 235, 0.14)",
  borderRadius: "999px",
  cursor: "pointer",
  maxW: "86%",
  _hover: { bg: "rgba(37, 99, 235, 0.1)" },
});
const eventIconCss = css({ color: "#3b82f6", flexShrink: 0 });
const eventOrderCss = css({ fontSize: "11.5px", color: "#1D4ED8", fontWeight: 600, whiteSpace: "nowrap" });
const eventLabelCss = css({ fontSize: "11.5px", color: "rgba(0,0,0,0.65)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });
const eventTimeCss = css({ fontSize: "10.5px", color: "rgba(0,0,0,0.45)", whiteSpace: "nowrap" });

/* ── composer ── */
const composerWrapCss = css({
  p: "16px",
  borderTopWidth: "1px",
  borderTopStyle: "solid",
  borderTopColor: "hairline",
  bg: "surface",
});
const composerRowCss = css({ display: "flex", alignItems: "flex-end", gap: "12px" });
const addBtnCss = css(iconButton.raw({ shape: "round", variant: "ghost" }), {
  w: "40px",
  h: "40px",
  color: "ink2",
  _hover: { bg: "rgba(0, 0, 0, 0.05)", color: "ink2" },
});
// MUI multiline OutlinedInput: 16px radius, 5 % black fill, no border, 8 % on focus.
const fieldCss = css({
  display: "flex",
  alignItems: "stretch",
  flex: 1,
  minW: 0,
  minH: "44px",
  px: "14px",
  boxSizing: "border-box",
  bg: "rgba(0, 0, 0, 0.05)",
  borderRadius: "16px",
  fontSize: "13px",
  color: "ink",
  _focusWithin: { bg: "rgba(0, 0, 0, 0.08)" },
});
const textareaCss = css({
  display: "block",
  flex: 1,
  minW: 0,
  w: "100%",
  boxSizing: "border-box",
  m: 0,
  px: 0,
  py: "14px",
  bg: "transparent",
  border: "none",
  outline: "none",
  boxShadow: "none",
  appearance: "none",
  resize: "none",
  overflowY: "hidden",
  fontFamily: "inherit",
  fontSize: "inherit",
  lineHeight: 1.5,
  color: "inherit",
  _placeholder: { color: "rgba(0, 0, 0, 0.42)", opacity: 1 },
  _disabled: { color: "rgba(0, 0, 0, 0.38)", cursor: "default" },
});
const sendBtnActiveCss = css(iconButton.raw({ shape: "round", variant: "ghost" }), {
  w: "40px",
  h: "40px",
  bg: "accent",
  color: "white",
  _hover: { bg: "accentHover", color: "white" },
});
const sendBtnIdleCss = css(iconButton.raw({ shape: "round", variant: "ghost" }), {
  w: "40px",
  h: "40px",
  bg: "rgba(0, 0, 0, 0.05)",
  color: "rgba(0, 0, 0, 0.2)",
  _hover: { bg: "rgba(0, 0, 0, 0.05)", color: "rgba(0, 0, 0, 0.2)" },
  _disabled: { opacity: 1, cursor: "default", pointerEvents: "none" },
});
const sendSpinnerCss = css({ color: "rgba(0, 0, 0, 0.3)" });
const hintCss = css({ fontSize: "10px", color: "ink3", textAlign: "center" });

const COMPOSER_MAX_ROWS = 4;

interface ChatViewProps {
  conversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  sending: boolean;
  onSendMessage: (body: string) => Promise<void>;
  participantLabel?: string;
  /** Which side of the marketplace the viewer is on — decides order links. */
  viewerRole?: "client" | "freelancer";
}

const EVENT_LABEL: Record<string, string> = {
  order_placed: "Order placed",
  order_accepted: "Order accepted",
  work_delivered: "Work delivered",
  work_resubmitted: "Work resubmitted",
  revision_requested: "Revision requested",
  order_completed: "Order completed",
  order_cancelled: "Order cancelled",
  dispute_opened: "Dispute opened",
  dispute_resolved: "Dispute resolved",
  evidence_submitted: "Evidence submitted",
};

/** A message or an inline order event, unified for chronological rendering. */
type ChatItem =
  | { kind: "message"; at: string; message: Message }
  | { kind: "event"; at: string; event: ConversationOrderEvent };

function formatDateHeader(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function ChatView({
  conversation,
  messages,
  loading,
  sending,
  onSendMessage,
  participantLabel = "participant",
  viewerRole = "client",
}: ChatViewProps) {
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const orderRoute = (orderId: number) =>
    viewerRole === "freelancer" ? `/dashboard/freelancer/orders/${orderId}` : `/dashboard/orders/${orderId}`;

  // Order history for every order between the two participants, interleaved
  // with the messages chronologically.
  const { data: eventsRes } = useQuery({
    queryKey: qk.conversationEvents(conversation?.id ?? 0),
    queryFn: () => api.getConversationOrderEvents(conversation!.id),
    enabled: !!conversation,
    staleTime: 30_000,
  });
  const orderEvents = eventsRes?.data ?? [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // scrollToBottom();
  }, [messages]);

  // Replaces MUI's TextareaAutosize (maxRows=4): grow with the content, then scroll.
  useLayoutEffect(() => {
    const el = composerRef.current;
    if (!el) return;
    const cs = getComputedStyle(el);
    const lineHeight = parseFloat(cs.lineHeight) || 20;
    const pad = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
    const max = COMPOSER_MAX_ROWS * lineHeight + pad;
    el.style.height = "auto";
    const content = el.scrollHeight;
    el.style.height = `${Math.min(content, max)}px`;
    el.style.overflowY = content > max ? "auto" : "hidden";
  }, [messageText]);

  const handleSend = async () => {
    if (!messageText.trim() || sending) return;
    const text = messageText;
    setMessageText("");
    await onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Interleave messages and order events chronologically, then group by date.
  const items: ChatItem[] = [
    ...messages.map((m): ChatItem => ({ kind: "message", at: m.created_at, message: m })),
    ...orderEvents.map((e): ChatItem => ({ kind: "event", at: e.created_at, event: e })),
  ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  const groupedItems: { date: string; items: ChatItem[] }[] = [];
  items.forEach(item => {
    const dateStr = new Date(item.at).toDateString();
    const lastGroup = groupedItems[groupedItems.length - 1];
    if (lastGroup && new Date(lastGroup.items[0].at).toDateString() === dateStr) {
      lastGroup.items.push(item);
    } else {
      groupedItems.push({ date: item.at, items: [item] });
    }
  });

  if (!conversation) {
    return (
      <div className={emptyRootCss}>
        <div className={emptyInnerCss}>
          <div className={emptyIconWrapCss}>
            <Search size={24} />
          </div>
          <p className={emptyTitleCss}>Select a conversation</p>
          <p className={emptyCopyCss}>Choose a {participantLabel} from the list to start messaging</p>
        </div>
      </div>
    );
  }

  const canSend = !!messageText.trim() && !sending;

  return (
    <div className={rootCss}>
      {/* Header */}
      <div className={headerCss}>
        <div className={rowBetweenCss}>
          <div className={headerIdentityCss}>
            <span className={avatarWrapCss}>
              <Avatar
                src={conversation.other_participant.avatar_url || undefined}
                name={conversation.other_participant.name}
                px={40}
              />
              <span className={avatarDotCss} />
            </span>
            <div>
              <p className={headerNameCss}>{conversation.other_participant.name}</p>
              <p className={headerSubCss}>
                {conversation.order ? conversation.order.title : "One thread — all your orders & messages"}
              </p>
            </div>
          </div>
        </div>

        {/* Order Context Banner — only for order-anchored conversations */}
        {conversation.order && (
          <div className={bannerCss}>
            <div className={rowBetweenCss}>
              <div className={bannerLeftCss}>
                <Briefcase size={14} className={bannerIconCss} />
                <p className={bannerTextCss}>Order: {conversation.order.title}</p>
                <span className={chipCss({ tone: "status" })}>{conversation.order.status}</span>
              </div>
              <button
                type="button"
                onClick={() => conversation.order && router.push(orderRoute(conversation.order.id))}
                className={viewOrderBtnCss}>
                View Order
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className={streamCss}>
        {loading ? (
          <div className={loadingCss}>
            <Spinner size={24} className={spinnerCss} />
          </div>
        ) : items.length === 0 ? (
          <div className={noMessagesWrapCss}>
            <p className={noMessagesCss}>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          groupedItems.map((group, groupIdx) => (
            <div key={groupIdx}>
              <div className={dateRowCss({ first: groupIdx === 0 })}>
                <span className={chipCss({ tone: "date" })}>{formatDateHeader(group.date)}</span>
              </div>
              {group.items.map(item =>
                item.kind === "message" ? (
                  <MessageBubble key={`m-${item.message.id}`} message={item.message} />
                ) : (
                  <div key={`e-${item.event.id}`} className={eventRowCss}>
                    <div
                      onClick={() => router.push(orderRoute(item.event.order_id))}
                      className={eventPillCss}>
                      <Receipt size={13} className={eventIconCss} />
                      <p className={eventOrderCss}>Order #{item.event.order_id}</p>
                      <p className={eventLabelCss}>
                        {EVENT_LABEL[item.event.event_type] ?? item.event.event_type} · {item.event.order_title}
                      </p>
                      <p className={eventTimeCss}>
                        {new Date(item.event.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={composerWrapCss}>
        <div className={composerRowCss}>
          <button type="button" aria-label="Add attachment" className={addBtnCss}>
            <Plus size={20} />
          </button>

          <div className={fieldCss}>
            <textarea
              ref={composerRef}
              rows={1}
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={sending}
              className={textareaCss}
            />
          </div>

          <button
            type="button"
            aria-label="Send message"
            onClick={handleSend}
            disabled={!canSend}
            className={canSend ? sendBtnActiveCss : sendBtnIdleCss}>
            {sending ? <Spinner size={20} className={sendSpinnerCss} /> : <Send size={20} />}
          </button>
        </div>
        <p className={hintCss}>Press Enter to send · Shift + Enter for new line</p>
      </div>
    </div>
  );
}
