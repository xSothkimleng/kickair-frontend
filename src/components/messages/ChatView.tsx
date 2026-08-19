"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Box, Typography, TextField, Avatar, Badge, IconButton, Button, CircularProgress, Chip } from "@mui/material";
import { SendOutlined, AddOutlined, WorkOutlineOutlined, SearchOutlined, ReceiptLongOutlined } from "@mui/icons-material";
import { Conversation, ConversationOrderEvent, Message } from "@/types/message";
import { api } from "@/lib/api";
import { qk } from "@/lib/queryKeys";
import MessageBubble from "./MessageBubble";

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
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "white",
        }}>
        <Box sx={{ textAlign: "center" }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              bgcolor: "rgba(0, 0, 0, 0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}>
            <SearchOutlined sx={{ fontSize: 24, color: "rgba(0, 0, 0, 0.2)" }} />
          </Box>
          <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black", mb: 1 }}>Select a conversation</Typography>
          <Typography sx={{ fontSize: 13, color: "rgba(0, 0, 0, 0.6)" }}>
            Choose a {participantLabel} from the list to start messaging
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: "1px solid rgba(0, 0, 0, 0.08)", bgcolor: "white" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Badge
              overlap='circular'
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant='dot'
              sx={{
                "& .MuiBadge-badge": {
                  backgroundColor: "transparent",
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  border: "2px solid white",
                },
              }}>
              <Avatar
                src={conversation.other_participant.avatar_url || undefined}
                alt={conversation.other_participant.name}
                sx={{ width: 40, height: 40 }}
              />
            </Badge>
            <Box>
              <Typography sx={{ fontSize: 15, fontWeight: 600, color: "black" }}>
                {conversation.other_participant.name}
              </Typography>
              <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>{conversation.order ? conversation.order.title : "Direct message"}</Typography>
            </Box>
          </Box>
        </Box>

        {/* Order Context Banner — only for order-anchored conversations */}
        {conversation.order && (
          <Box
            sx={{
              mt: 1.5,
              p: 1.5,
              bgcolor: "rgba(37, 99, 235, 0.05)",
              borderRadius: 3,
              border: "1px solid rgba(37, 99, 235, 0.1)",
            }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <WorkOutlineOutlined sx={{ fontSize: 14, color: "#3b82f6" }} />
                <Typography sx={{ fontSize: 12, color: "rgb(29, 78, 216)", fontWeight: 500 }}>
                  Order: {conversation.order.title}
                </Typography>
                <Chip
                  label={conversation.order.status}
                  size='small'
                  sx={{
                    height: 20,
                    fontSize: 10,
                    bgcolor: "rgba(37, 99, 235, 0.1)",
                    color: "#3b82f6",
                  }}
                />
              </Box>
              <Button
                onClick={() => conversation.order && router.push(orderRoute(conversation.order.id))}
                sx={{
                  fontSize: 11,
                  color: "#3b82f6",
                  textTransform: "none",
                  p: 0,
                  minWidth: "auto",
                  "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
                }}>
                View Order
              </Button>
            </Box>
          </Box>
        )}
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 3,
          display: "flex",
          flexDirection: "column",
        }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : items.length === 0 ? (
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography sx={{ fontSize: 13, color: "rgba(0, 0, 0, 0.5)" }}>No messages yet. Start the conversation!</Typography>
          </Box>
        ) : (
          groupedItems.map((group, groupIdx) => (
            <Box key={groupIdx}>
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2, mt: groupIdx > 0 ? 2 : 0 }}>
                <Chip
                  label={formatDateHeader(group.date)}
                  sx={{
                    height: 24,
                    bgcolor: "rgba(0, 0, 0, 0.05)",
                    color: "rgba(0, 0, 0, 0.6)",
                    fontSize: 11,
                  }}
                />
              </Box>
              {group.items.map(item =>
                item.kind === "message" ? (
                  <MessageBubble key={`m-${item.message.id}`} message={item.message} />
                ) : (
                  <Box key={`e-${item.event.id}`} sx={{ display: "flex", justifyContent: "center", my: 1.25 }}>
                    <Box
                      onClick={() => router.push(orderRoute(item.event.order_id))}
                      sx={{
                        display: "flex", alignItems: "center", gap: 0.75, px: 1.5, py: 0.6,
                        bgcolor: "rgba(37, 99, 235, 0.06)", border: "1px solid rgba(37, 99, 235, 0.14)",
                        borderRadius: "999px", cursor: "pointer", maxWidth: "86%",
                        "&:hover": { bgcolor: "rgba(37, 99, 235, 0.1)" },
                      }}>
                      <ReceiptLongOutlined sx={{ fontSize: 13, color: "#3b82f6", flexShrink: 0 }} />
                      <Typography sx={{ fontSize: 11.5, color: "#1D4ED8", fontWeight: 600, whiteSpace: "nowrap" }}>
                        Order #{item.event.order_id}
                      </Typography>
                      <Typography sx={{ fontSize: 11.5, color: "rgba(0,0,0,0.65)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {EVENT_LABEL[item.event.event_type] ?? item.event.event_type} · {item.event.order_title}
                      </Typography>
                      <Typography sx={{ fontSize: 10.5, color: "rgba(0,0,0,0.45)", whiteSpace: "nowrap" }}>
                        {new Date(item.event.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </Typography>
                    </Box>
                  </Box>
                )
              )}
            </Box>
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box sx={{ p: 2, borderTop: "1px solid rgba(0, 0, 0, 0.08)", bgcolor: "white" }}>
        <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1.5 }}>
          <IconButton size='small' sx={{ p: 1.25, "&:hover": { bgcolor: "rgba(0, 0, 0, 0.05)" } }}>
            <AddOutlined sx={{ fontSize: 20, color: "rgba(0, 0, 0, 0.6)" }} />
          </IconButton>

          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Type a message...'
            disabled={sending}
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": {
                minHeight: 44,
                borderRadius: 4,
                bgcolor: "rgba(0, 0, 0, 0.05)",
                fontSize: 13,
                "& fieldset": { border: "none" },
                "&.Mui-focused": { bgcolor: "rgba(0, 0, 0, 0.08)" },
              },
            }}
          />

          <IconButton
            onClick={handleSend}
            disabled={!messageText.trim() || sending}
            sx={{
              p: 1.25,
              bgcolor: messageText.trim() && !sending ? "#0071e3" : "rgba(0, 0, 0, 0.05)",
              color: messageText.trim() && !sending ? "white" : "rgba(0, 0, 0, 0.2)",
              "&:hover": {
                bgcolor: messageText.trim() && !sending ? "#0077ED" : "rgba(0, 0, 0, 0.05)",
              },
              "&.Mui-disabled": {
                bgcolor: "rgba(0, 0, 0, 0.05)",
                color: "rgba(0, 0, 0, 0.2)",
              },
            }}>
            {sending ? (
              <CircularProgress size={20} sx={{ color: "rgba(0, 0, 0, 0.3)" }} />
            ) : (
              <SendOutlined sx={{ fontSize: 20 }} />
            )}
          </IconButton>
        </Box>
        <Typography sx={{ fontSize: 10, color: "rgba(0, 0, 0, 0.4)", textAlign: "center", mt: 1 }}>
          Press Enter to send · Shift + Enter for new line
        </Typography>
      </Box>
    </Box>
  );
}
