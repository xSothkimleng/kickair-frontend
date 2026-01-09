import { useState } from "react";
import { Box, Paper, Typography, TextField, Avatar, Badge, IconButton, InputAdornment, Chip, Button } from "@mui/material";
import {
  SearchOutlined,
  PhoneOutlined,
  DescriptionOutlined,
  WorkOutlineOutlined,
  AddOutlined,
  SendOutlined,
} from "@mui/icons-material";

interface Conversation {
  id: number;
  clientName: string;
  clientAvatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
  order: string;
}

interface Message {
  id: number;
  sender: "client" | "freelancer";
  text: string;
  timestamp: string;
  date: string;
  attachment?: {
    type: "image" | "file";
    name: string;
    url: string;
  };
}

export default function MessagesContent() {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(1);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const conversations: Conversation[] = [
    {
      id: 1,
      clientName: "Sarah Chen",
      clientAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
      lastMessage: "Thanks! The logo looks perfect. Can you send the final files?",
      timestamp: "2m ago",
      unread: 2,
      online: true,
      order: "Modern Logo Design - Basic Package",
    },
    {
      id: 2,
      clientName: "David Kim",
      clientAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
      lastMessage: "When can we schedule a call to discuss the website revisions?",
      timestamp: "1h ago",
      unread: 0,
      online: false,
      order: "Website Development - Premium Package",
    },
    {
      id: 3,
      clientName: "Maria Santos",
      clientAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
      lastMessage: "I love the color palette you chose!",
      timestamp: "3h ago",
      unread: 0,
      online: true,
      order: "Social Media Graphics - Standard Package",
    },
    {
      id: 4,
      clientName: "James Wilson",
      clientAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
      lastMessage: "Could you make the banner a bit wider?",
      timestamp: "1d ago",
      unread: 1,
      online: false,
      order: "Banner Design - Basic Package",
    },
    {
      id: 5,
      clientName: "Sophia Park",
      clientAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
      lastMessage: "Perfect! Exactly what I was looking for.",
      timestamp: "2d ago",
      unread: 0,
      online: false,
      order: "Brand Identity - Premium Package",
    },
  ];

  const messages: Message[] =
    selectedConversation === 1
      ? [
          {
            id: 1,
            sender: "client",
            text: "Hi! I received the first draft of the logo. It looks great!",
            timestamp: "10:32 AM",
            date: "Today",
          },
          {
            id: 2,
            sender: "freelancer",
            text: "Thank you so much! I'm glad you like it. Would you like any changes or adjustments?",
            timestamp: "10:35 AM",
            date: "Today",
          },
          {
            id: 3,
            sender: "client",
            text: "Just one small thing - could you make the text slightly bolder?",
            timestamp: "10:38 AM",
            date: "Today",
          },
          {
            id: 4,
            sender: "freelancer",
            text: "Absolutely! I'll make that adjustment and send you the updated version in about 30 minutes.",
            timestamp: "10:40 AM",
            date: "Today",
          },
          {
            id: 5,
            sender: "freelancer",
            text: "Here's the updated version with bolder text. Let me know what you think!",
            timestamp: "11:15 AM",
            date: "Today",
            attachment: {
              type: "image",
              name: "logo-v2.png",
              url: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400",
            },
          },
          {
            id: 6,
            sender: "client",
            text: "Thanks! The logo looks perfect. Can you send the final files?",
            timestamp: "11:48 AM",
            date: "Today",
          },
        ]
      : [];

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  const filteredConversations = conversations.filter(
    conv =>
      conv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.order.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSendMessage = () => {
    if (messageText.trim()) {
      console.log("Sending message:", messageText);
      setMessageText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        height: "calc(100vh - 280px)",
        borderRadius: 4,
        border: "1px solid rgba(0, 0, 0, 0.08)",
        overflow: "hidden",
      }}>
      {/* Conversations List */}
      <Box
        sx={{
          width: 360,
          borderRight: "1px solid rgba(0, 0, 0, 0.08)",
          display: "flex",
          flexDirection: "column",
        }}>
        {/* Search */}
        <Box sx={{ p: 2, borderBottom: "1px solid rgba(0, 0, 0, 0.08)" }}>
          <TextField
            fullWidth
            placeholder='Search messages...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            size='small'
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
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
                "& fieldset": {
                  border: "none",
                },
                "&.Mui-focused": {
                  bgcolor: "rgba(0, 0, 0, 0.08)",
                },
              },
            }}
          />
        </Box>

        {/* Conversations */}
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          {filteredConversations.map(conv => (
            <Box
              key={conv.id}
              onClick={() => setSelectedConversation(conv.id)}
              sx={{
                p: 2,
                borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
                cursor: "pointer",
                bgcolor: selectedConversation === conv.id ? "rgba(0, 0, 0, 0.05)" : "transparent",
                "&:hover": {
                  bgcolor: "rgba(0, 0, 0, 0.02)",
                },
                transition: "background-color 0.2s",
              }}>
              <Box sx={{ display: "flex", alignItems: "start", gap: 1.5 }}>
                <Box sx={{ position: "relative" }}>
                  <Badge
                    overlap='circular'
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    variant='dot'
                    sx={{
                      "& .MuiBadge-badge": {
                        backgroundColor: conv.online ? "#16a34a" : "transparent",
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        border: "2px solid white",
                      },
                    }}>
                    <Avatar src={conv.clientAvatar} alt={conv.clientName} sx={{ width: 48, height: 48 }} />
                  </Badge>
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "black",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      {conv.clientName}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.4)", ml: 1 }}>{conv.timestamp}</Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: "rgba(0, 0, 0, 0.6)",
                      mb: 0.5,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                    {conv.order}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "rgba(0, 0, 0, 0.6)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                    {conv.lastMessage}
                  </Typography>
                </Box>

                {conv.unread > 0 && (
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
                    }}>
                    {conv.unread}
                  </Box>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Conversation Area */}
      {selectedConv ? (
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Conversation Header */}
          <Box sx={{ p: 2, borderBottom: "1px solid rgba(0, 0, 0, 0.08)", bgcolor: "white" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ position: "relative" }}>
                  <Badge
                    overlap='circular'
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    variant='dot'
                    sx={{
                      "& .MuiBadge-badge": {
                        backgroundColor: selectedConv.online ? "#16a34a" : "transparent",
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        border: "2px solid white",
                      },
                    }}>
                    <Avatar src={selectedConv.clientAvatar} alt={selectedConv.clientName} sx={{ width: 40, height: 40 }} />
                  </Badge>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 15, fontWeight: 600, color: "black" }}>{selectedConv.clientName}</Typography>
                  <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>{selectedConv.order}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <IconButton
                  size='small'
                  sx={{
                    p: 1,
                    "&:hover": {
                      bgcolor: "rgba(0, 0, 0, 0.05)",
                    },
                  }}>
                  <PhoneOutlined sx={{ fontSize: 18, color: "rgba(0, 0, 0, 0.6)" }} />
                </IconButton>
                <IconButton
                  size='small'
                  sx={{
                    p: 1,
                    "&:hover": {
                      bgcolor: "rgba(0, 0, 0, 0.05)",
                    },
                  }}>
                  <DescriptionOutlined sx={{ fontSize: 18, color: "rgba(0, 0, 0, 0.6)" }} />
                </IconButton>
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
                    Active Order: {selectedConv.order}
                  </Typography>
                </Box>
                <Button
                  sx={{
                    fontSize: 11,
                    color: "#3b82f6",
                    textTransform: "none",
                    p: 0,
                    minWidth: "auto",
                    "&:hover": {
                      bgcolor: "transparent",
                      textDecoration: "underline",
                    },
                  }}>
                  View Order
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Messages */}
          <Box sx={{ flex: 1, overflowY: "auto", p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
            {messages.map((message, idx) => {
              const showDate = idx === 0 || messages[idx - 1]?.date !== message.date;

              return (
                <Box key={message.id}>
                  {showDate && (
                    <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                      <Chip
                        label={message.date}
                        sx={{
                          height: 24,
                          bgcolor: "rgba(0, 0, 0, 0.05)",
                          color: "rgba(0, 0, 0, 0.6)",
                          fontSize: 11,
                        }}
                      />
                    </Box>
                  )}

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: message.sender === "freelancer" ? "flex-end" : "flex-start",
                    }}>
                    <Box
                      sx={{
                        maxWidth: "60%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: message.sender === "freelancer" ? "flex-end" : "flex-start",
                      }}>
                      <Box
                        sx={{
                          px: 2,
                          py: 1.5,
                          borderRadius: 4,
                          bgcolor: message.sender === "freelancer" ? "#0071e3" : "rgba(0, 0, 0, 0.05)",
                          color: message.sender === "freelancer" ? "white" : "black",
                        }}>
                        <Typography sx={{ fontSize: 13, lineHeight: 1.5 }}>{message.text}</Typography>
                        {message.attachment && (
                          <Box sx={{ mt: 1, borderRadius: 2, overflow: "hidden" }}>
                            {message.attachment.type === "image" && (
                              <img
                                src={message.attachment.url}
                                alt={message.attachment.name}
                                style={{ width: "100%", borderRadius: 8, display: "block" }}
                              />
                            )}
                            <Typography
                              sx={{
                                fontSize: 10,
                                mt: 0.5,
                                color: message.sender === "freelancer" ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.6)",
                              }}>
                              {message.attachment.name}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      <Typography sx={{ fontSize: 10, color: "rgba(0, 0, 0, 0.4)", mt: 0.5, px: 0.5 }}>
                        {message.timestamp}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Message Input */}
          <Box sx={{ p: 2, borderTop: "1px solid rgba(0, 0, 0, 0.08)", bgcolor: "white" }}>
            <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1.5 }}>
              <IconButton
                size='small'
                sx={{
                  p: 1.25,
                  "&:hover": {
                    bgcolor: "rgba(0, 0, 0, 0.05)",
                  },
                }}>
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
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    minHeight: 44,
                    borderRadius: 4,
                    bgcolor: "rgba(0, 0, 0, 0.05)",
                    fontSize: 13,
                    "& fieldset": {
                      border: "none",
                    },
                    "&.Mui-focused": {
                      bgcolor: "rgba(0, 0, 0, 0.08)",
                    },
                  },
                }}
              />

              <IconButton
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
                sx={{
                  p: 1.25,
                  bgcolor: messageText.trim() ? "#0071e3" : "rgba(0, 0, 0, 0.05)",
                  color: messageText.trim() ? "white" : "rgba(0, 0, 0, 0.2)",
                  "&:hover": {
                    bgcolor: messageText.trim() ? "#0077ED" : "rgba(0, 0, 0, 0.05)",
                  },
                  "&.Mui-disabled": {
                    bgcolor: "rgba(0, 0, 0, 0.05)",
                    color: "rgba(0, 0, 0, 0.2)",
                  },
                }}>
                <SendOutlined sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
            <Typography sx={{ fontSize: 10, color: "rgba(0, 0, 0, 0.4)", textAlign: "center", mt: 1 }}>
              Press Enter to send • Shift + Enter for new line
            </Typography>
          </Box>
        </Box>
      ) : (
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
              Choose a client from the list to start messaging
            </Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
}
