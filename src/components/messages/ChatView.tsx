"use client";

import { useState, useRef, useEffect } from "react";
import { Box, Typography, TextField, Avatar, Badge, IconButton, Button, CircularProgress, Chip } from "@mui/material";
import { SendOutlined, AddOutlined, WorkOutlineOutlined, SearchOutlined } from "@mui/icons-material";
import { Conversation, Message } from "@/types/message";
import MessageBubble from "./MessageBubble";

interface ChatViewProps {
  conversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  sending: boolean;
  onSendMessage: (body: string) => Promise<void>;
  participantLabel?: string;
}

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
}: ChatViewProps) {
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  messages.forEach(msg => {
    const dateStr = new Date(msg.created_at).toDateString();
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && new Date(lastGroup.messages[0].created_at).toDateString() === dateStr) {
      lastGroup.messages.push(msg);
    } else {
      groupedMessages.push({ date: msg.created_at, messages: [msg] });
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
              <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>{conversation.order.title}</Typography>
            </Box>
          </Box>
        </Box>

        {/* Order Context Banner */}
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
        ) : messages.length === 0 ? (
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography sx={{ fontSize: 13, color: "rgba(0, 0, 0, 0.5)" }}>No messages yet. Start the conversation!</Typography>
          </Box>
        ) : (
          groupedMessages.map((group, groupIdx) => (
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
              {group.messages.map(message => (
                <MessageBubble key={message.id} message={message} />
              ))}
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
