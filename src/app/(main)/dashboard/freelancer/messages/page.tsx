"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Box, Paper, Typography, IconButton } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import Link from "next/link";
import { ConversationList, ChatView } from "@/components/messages";
import { useConversations } from "@/hooks/useConversations";
import { useChat } from "@/hooks/useChat";
import { Conversation } from "@/types/message";

export default function FreelancerMessagesPage() {
  const searchParams = useSearchParams();
  const conversationIdParam = searchParams.get("id");

  const { conversations, loading: conversationsLoading } = useConversations();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const {
    messages,
    loading: messagesLoading,
    sending,
    sendMessage,
    markAsRead,
  } = useChat(selectedConversation?.id ?? null);

  // Set selected conversation from URL param or first conversation
  useEffect(() => {
    if (conversations.length > 0) {
      if (conversationIdParam) {
        const found = conversations.find((c) => c.id === Number(conversationIdParam));
        if (found) {
          setSelectedConversation(found);
        }
      } else if (!selectedConversation) {
        setSelectedConversation(conversations[0]);
      }
    }
  }, [conversations, conversationIdParam, selectedConversation]);

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
    <Box sx={{ minHeight: "100vh", bgcolor: "#F5F5F7" }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: "white",
          borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
          px: 3,
          py: 2,
        }}
      >
        <Box sx={{ maxWidth: 1440, mx: "auto", display: "flex", alignItems: "center", gap: 2 }}>
          <Link href="/dashboard/freelancer" style={{ textDecoration: "none" }}>
            <IconButton size="small" sx={{ "&:hover": { bgcolor: "rgba(0, 0, 0, 0.05)" } }}>
              <ArrowBack sx={{ fontSize: 20, color: "black" }} />
            </IconButton>
          </Link>
          <Typography variant="h6" fontWeight={600}>
            Messages
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ maxWidth: 1440, mx: "auto", p: 3 }}>
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            height: "calc(100vh - 180px)",
            borderRadius: 4,
            border: "1px solid rgba(0, 0, 0, 0.08)",
            overflow: "hidden",
          }}
        >
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
          />
        </Paper>
      </Box>
    </Box>
  );
}
