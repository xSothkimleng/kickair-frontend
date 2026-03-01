"use client";

import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Card,
  Avatar,
  Badge,
  Button,
  CircularProgress,
  Stack,
} from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import { useConversations } from "@/hooks/useConversations";

function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function MessagesContent() {
  const router = useRouter();
  const { conversations, loading, error } = useConversations();

  const handleViewAll = () => {
    router.push("/dashboard/client/messages");
  };

  const handleConversationClick = (conversationId: number) => {
    router.push(`/dashboard/client/messages?id=${conversationId}`);
  };

  // Show only first 4 conversations as preview
  const previewConversations = conversations.slice(0, 4);
  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Messages
          </Typography>
          {totalUnread > 0 && (
            <Typography variant="body2" color="text.secondary">
              {totalUnread} unread message{totalUnread !== 1 ? "s" : ""}
            </Typography>
          )}
        </Box>
        <Button
          variant="text"
          endIcon={<ArrowForward />}
          onClick={handleViewAll}
          sx={{
            textTransform: "none",
            color: "#0071e3",
            "&:hover": { bgcolor: "rgba(0, 113, 227, 0.05)" },
          }}
        >
          View All
        </Button>
      </Stack>

      <Card
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "rgba(0,0,0,0.08)",
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        ) : error ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : previewConversations.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">No conversations yet</Typography>
          </Box>
        ) : (
          previewConversations.map((conversation, index) => (
            <Box
              key={conversation.id}
              onClick={() => handleConversationClick(conversation.id)}
              sx={{
                p: 2,
                cursor: "pointer",
                borderBottom:
                  index < previewConversations.length - 1
                    ? "1px solid rgba(0,0,0,0.08)"
                    : "none",
                "&:hover": { bgcolor: "rgba(0,0,0,0.02)" },
                transition: "background-color 0.2s",
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  variant="dot"
                  sx={{
                    "& .MuiBadge-badge": {
                      bgcolor: "transparent",
                      border: "none",
                    },
                  }}
                >
                  <Avatar
                    src={conversation.other_participant.avatar_url || undefined}
                    alt={conversation.other_participant.name}
                    sx={{ width: 48, height: 48 }}
                  />
                </Badge>

                <Box flex={1} minWidth={0}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={0.5}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={conversation.unread_count > 0 ? 700 : 600}
                      noWrap
                      sx={{ flex: 1 }}
                    >
                      {conversation.other_participant.name}
                    </Typography>
                    {conversation.unread_count > 0 && (
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          bgcolor: "#9333ea",
                          color: "white",
                          fontSize: 10,
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          ml: 1,
                        }}
                      >
                        {conversation.unread_count}
                      </Box>
                    )}
                  </Stack>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    noWrap
                    mb={0.5}
                  >
                    {conversation.order.title}
                  </Typography>

                  {conversation.latest_message && (
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography
                        variant="caption"
                        sx={{
                          color: conversation.unread_count > 0 ? "black" : "text.secondary",
                          fontWeight: conversation.unread_count > 0 ? 500 : 400,
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {conversation.latest_message.body}
                      </Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ ml: 1 }}>
                        {formatTimestamp(conversation.latest_message.created_at)}
                      </Typography>
                    </Stack>
                  )}
                </Box>
              </Stack>
            </Box>
          ))
        )}

        {conversations.length > 4 && (
          <Box
            sx={{
              p: 2,
              textAlign: "center",
              borderTop: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <Button
              variant="text"
              onClick={handleViewAll}
              sx={{
                textTransform: "none",
                color: "#0071e3",
                fontSize: 13,
              }}
            >
              View {conversations.length - 4} more conversation
              {conversations.length - 4 !== 1 ? "s" : ""}
            </Button>
          </Box>
        )}
      </Card>
    </Box>
  );
}
