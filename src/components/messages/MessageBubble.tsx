"use client";

import { Box, Typography, Avatar } from "@mui/material";
import { Message } from "@/types/message";

interface MessageBubbleProps {
  message: Message;
  showAvatar?: boolean;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function MessageBubble({ message, showAvatar = true }: MessageBubbleProps) {
  const isMine = message.is_mine;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isMine ? "flex-end" : "flex-start",
        mb: 1.5,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: isMine ? "row-reverse" : "row",
          alignItems: "flex-end",
          gap: 1,
          maxWidth: "70%",
        }}
      >
        {showAvatar && !isMine && (
          <Avatar
            src={message.sender.avatar_url || undefined}
            alt={message.sender.name}
            sx={{ width: 32, height: 32 }}
          />
        )}

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: isMine ? "flex-end" : "flex-start",
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderRadius: 4,
              bgcolor: isMine ? "#0071e3" : "rgba(0, 0, 0, 0.05)",
              color: isMine ? "white" : "black",
              borderBottomRightRadius: isMine ? 4 : 16,
              borderBottomLeftRadius: isMine ? 16 : 4,
            }}
          >
            {message.type === "file" && message.file_url && (
              <Box sx={{ mb: message.body ? 1 : 0 }}>
                <Typography
                  component="a"
                  href={message.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    fontSize: 13,
                    color: isMine ? "rgba(255,255,255,0.9)" : "#0071e3",
                    textDecoration: "underline",
                  }}
                >
                  {message.file_name || "Attachment"}
                </Typography>
              </Box>
            )}

            {message.body && (
              <Typography sx={{ fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                {message.body}
              </Typography>
            )}
          </Box>

          <Typography
            sx={{
              fontSize: 10,
              color: "rgba(0, 0, 0, 0.4)",
              mt: 0.5,
              px: 0.5,
            }}
          >
            {formatTime(message.created_at)}
            {isMine && message.read_at && " · Read"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}