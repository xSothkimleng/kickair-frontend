"use client";

import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
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
    router.push("/dashboard/freelancer/messages");
  };

  const handleConversationClick = (conversationId: number) => {
    router.push(`/dashboard/freelancer/messages?id=${conversationId}`);
  };

  // Show only first 5 conversations as preview
  const previewConversations = conversations.slice(0, 5);
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

      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid rgba(0, 0, 0, 0.08)",
          overflow: "hidden",
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
                    ? "1px solid rgba(0, 0, 0, 0.05)"
                    : "none",
                "&:hover": { bgcolor: "rgba(0, 0, 0, 0.02)" },
                transition: "background-color 0.2s",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "start", gap: 1.5 }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  variant="dot"
                  sx={{
                    "& .MuiBadge-badge": {
                      backgroundColor: "transparent",
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      border: "2px solid white",
                    },
                  }}
                >
                  <Avatar
                    src={conversation.other_participant.avatar_url || undefined}
                    alt={conversation.other_participant.name}
                    sx={{ width: 48, height: 48 }}
                  />
                </Badge>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: conversation.unread_count > 0 ? 700 : 600,
                        color: "black",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {conversation.other_participant.name}
                    </Typography>
                    {conversation.latest_message && (
                      <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.4)", ml: 1 }}>
                        {formatTimestamp(conversation.latest_message.created_at)}
                      </Typography>
                    )}
                  </Box>

                  <Typography
                    sx={{
                      fontSize: 11,
                      color: "rgba(0, 0, 0, 0.6)",
                      mb: 0.5,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {conversation.order.title}
                  </Typography>

                  {conversation.latest_message && (
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: conversation.unread_count > 0 ? "black" : "rgba(0, 0, 0, 0.6)",
                        fontWeight: conversation.unread_count > 0 ? 500 : 400,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {conversation.latest_message.body}
                    </Typography>
                  )}
                </Box>

                {conversation.unread_count > 0 && (
                  <Box
                    sx={{
                      minWidth: 20,
                      height: 20,
                      bgcolor: "#0071e3",
                      color: "white",
                      fontSize: 10,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 500,
                      flexShrink: 0,
                    }}
                  >
                    {conversation.unread_count}
                  </Box>
                )}
              </Box>
            </Box>
          ))
        )}

        {conversations.length > 5 && (
          <Box
            sx={{
              p: 2,
              textAlign: "center",
              borderTop: "1px solid rgba(0, 0, 0, 0.05)",
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
              View {conversations.length - 5} more conversation
              {conversations.length - 5 !== 1 ? "s" : ""}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
