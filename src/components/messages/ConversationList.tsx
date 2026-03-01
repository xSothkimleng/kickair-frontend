"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Avatar,
  Badge,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { SearchOutlined } from "@mui/icons-material";
import { Conversation } from "@/types/message";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: number | null;
  onSelect: (conversation: Conversation) => void;
  loading?: boolean;
  participantLabel?: string; // "freelancer" or "client"
}

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

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
  loading = false,
  participantLabel = "participant",
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.other_participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.order.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box
      sx={{
        width: 360,
        borderRight: "1px solid rgba(0, 0, 0, 0.08)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Search */}
      <Box sx={{ p: 2, borderBottom: "1px solid rgba(0, 0, 0, 0.08)" }}>
        <TextField
          fullWidth
          placeholder={`Search ${participantLabel}s...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined sx={{ fontSize: 16, color: "rgba(0, 0, 0, 0.4)" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              height: 36,
              borderRadius: 2,
              bgcolor: "rgba(0, 0, 0, 0.05)",
              fontSize: 13,
              "& fieldset": { border: "none" },
              "&.Mui-focused": { bgcolor: "rgba(0, 0, 0, 0.08)" },
            },
          }}
        />
      </Box>

      {/* Conversations */}
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : filteredConversations.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography sx={{ fontSize: 13, color: "rgba(0, 0, 0, 0.5)" }}>
              {searchQuery ? "No conversations found" : "No conversations yet"}
            </Typography>
          </Box>
        ) : (
          filteredConversations.map((conv) => (
            <Box
              key={conv.id}
              onClick={() => onSelect(conv)}
              sx={{
                p: 2,
                borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
                cursor: "pointer",
                bgcolor: selectedId === conv.id ? "rgba(0, 0, 0, 0.05)" : "transparent",
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
                    src={conv.other_participant.avatar_url || undefined}
                    alt={conv.other_participant.name}
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
                        fontWeight: conv.unread_count > 0 ? 700 : 600,
                        color: "black",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {conv.other_participant.name}
                    </Typography>
                    {conv.latest_message && (
                      <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.4)", ml: 1 }}>
                        {formatTimestamp(conv.latest_message.created_at)}
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
                    {conv.order.title}
                  </Typography>

                  {conv.latest_message && (
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: conv.unread_count > 0 ? "black" : "rgba(0, 0, 0, 0.6)",
                        fontWeight: conv.unread_count > 0 ? 500 : 400,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {conv.latest_message.body}
                    </Typography>
                  )}
                </Box>

                {conv.unread_count > 0 && (
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
                    {conv.unread_count}
                  </Box>
                )}
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}