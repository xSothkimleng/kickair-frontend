"use client";

import { useState } from "react";
import { Box, Typography, TextField, Button, Card, Avatar, Stack, Paper, InputAdornment, Badge, IconButton } from "@mui/material";
import {
  Search as SearchIcon,
  Send as SendIcon,
  AttachFile as PaperclipIcon,
  MoreVert as MoreVerticalIcon,
} from "@mui/icons-material";

export default function MessagesContent() {
  const [selectedConversation, setSelectedConversation] = useState(1);
  const [messageText, setMessageText] = useState("");

  const conversations = [
    {
      id: 1,
      freelancerName: "Sopheak Chan",
      freelancerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
      lastMessage: "I can start working on your project tomorrow. Looking forward to it!",
      timestamp: "5m ago",
      unread: 1,
      online: true,
    },
    {
      id: 2,
      freelancerName: "Sarah Kim",
      freelancerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
      lastMessage: "The final logo designs are ready for your review.",
      timestamp: "2h ago",
      unread: 0,
      online: true,
    },
    {
      id: 3,
      freelancerName: "David Lim",
      freelancerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
      lastMessage: "Thank you for the feedback! I'll make those changes.",
      timestamp: "1d ago",
      unread: 0,
      online: false,
    },
    {
      id: 4,
      freelancerName: "Linda Tan",
      freelancerAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
      lastMessage: "The UI mockups are complete. Would you like to schedule a call?",
      timestamp: "2d ago",
      unread: 0,
      online: false,
    },
  ];

  const messages = [
    {
      id: 1,
      sender: "freelancer",
      text: "Hi! I reviewed your project requirements and I have some questions.",
      timestamp: "10:30 AM",
    },
    {
      id: 2,
      sender: "client",
      text: "Sure, feel free to ask anything!",
      timestamp: "10:32 AM",
    },
    {
      id: 3,
      sender: "freelancer",
      text: "What technologies would you prefer for the backend? Node.js or Python?",
      timestamp: "10:33 AM",
    },
    {
      id: 4,
      sender: "client",
      text: "I think Node.js would be better for this project. We already have some Node.js infrastructure.",
      timestamp: "10:35 AM",
    },
    {
      id: 5,
      sender: "freelancer",
      text: "Perfect! I can start working on your project tomorrow. Looking forward to it!",
      timestamp: "10:37 AM",
    },
  ];

  const selectedFreelancer = conversations.find(c => c.id === selectedConversation);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Send message logic here
      setMessageText("");
    }
  };

  return (
    <Box>
      <Typography variant='h5' fontWeight={600} mb={3}>
        Messages
      </Typography>

      <Card
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "rgba(0,0,0,0.08)",
          height: "calc(100vh - 300px)",
          minHeight: 600,
        }}>
        <Stack direction='row' height='100%'>
          {/* Conversations List */}
          <Box
            sx={{
              width: 360,
              borderRight: "1px solid",
              borderColor: "rgba(0,0,0,0.08)",
              display: "flex",
              flexDirection: "column",
            }}>
            {/* Search */}
            <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "rgba(0,0,0,0.08)" }}>
              <TextField
                placeholder='Search conversations...'
                size='small'
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 10,
                    fontSize: 13,
                  },
                }}
              />
            </Box>

            {/* Conversation List */}
            <Box sx={{ flex: 1, overflow: "auto" }}>
              {conversations.map(conversation => (
                <Button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  sx={{
                    width: "100%",
                    p: 2,
                    textAlign: "left",
                    textTransform: "none",
                    color: "inherit",
                    justifyContent: "flex-start",
                    bgcolor: selectedConversation === conversation.id ? "rgba(0,0,0,0.04)" : "transparent",
                    borderBottom: "1px solid",
                    borderColor: "rgba(0,0,0,0.08)",
                    borderRadius: 0,
                    "&:hover": {
                      bgcolor: "rgba(0,0,0,0.04)",
                    },
                  }}>
                  <Stack direction='row' spacing={1.5} width='100%'>
                    <Badge
                      overlap='circular'
                      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                      variant='dot'
                      sx={{
                        "& .MuiBadge-badge": {
                          bgcolor: conversation.online ? "#16a34a" : "transparent",
                          border: conversation.online ? "2px solid white" : "none",
                        },
                      }}>
                      <Avatar
                        src={conversation.freelancerAvatar}
                        alt={conversation.freelancerName}
                        sx={{ width: 48, height: 48 }}
                      />
                    </Badge>
                    <Box flex={1} minWidth={0}>
                      <Stack direction='row' justifyContent='space-between' alignItems='center' mb={0.5}>
                        <Typography variant='body2' fontWeight={600} noWrap sx={{ flex: 1 }}>
                          {conversation.freelancerName}
                        </Typography>
                        {conversation.unread > 0 && (
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
                            }}>
                            {conversation.unread}
                          </Box>
                        )}
                      </Stack>
                      <Typography variant='caption' color='text.secondary' display='block' noWrap mb={0.5}>
                        {conversation.lastMessage}
                      </Typography>
                      <Typography variant='caption' color='text.disabled'>
                        {conversation.timestamp}
                      </Typography>
                    </Box>
                  </Stack>
                </Button>
              ))}
            </Box>
          </Box>

          {/* Message Thread */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {/* Thread Header */}
            {selectedFreelancer && (
              <Stack
                direction='row'
                justifyContent='space-between'
                alignItems='center'
                sx={{
                  p: 2,
                  borderBottom: "1px solid",
                  borderColor: "rgba(0,0,0,0.08)",
                }}>
                <Stack direction='row' spacing={2} alignItems='center'>
                  <Badge
                    overlap='circular'
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    variant='dot'
                    sx={{
                      "& .MuiBadge-badge": {
                        bgcolor: selectedFreelancer.online ? "#16a34a" : "transparent",
                        border: selectedFreelancer.online ? "2px solid white" : "none",
                      },
                    }}>
                    <Avatar
                      src={selectedFreelancer.freelancerAvatar}
                      alt={selectedFreelancer.freelancerName}
                      sx={{ width: 40, height: 40 }}
                    />
                  </Badge>
                  <Box>
                    <Typography variant='body1' fontWeight={600}>
                      {selectedFreelancer.freelancerName}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {selectedFreelancer.online ? "Online" : "Offline"}
                    </Typography>
                  </Box>
                </Stack>
                <IconButton size='small'>
                  <MoreVerticalIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Stack>
            )}

            {/* Messages */}
            <Box
              sx={{
                flex: 1,
                p: 3,
                overflow: "auto",
                bgcolor: "rgba(0,0,0,0.01)",
              }}>
              <Stack spacing={2}>
                {messages.map(message => (
                  <Stack
                    key={message.id}
                    direction='row'
                    justifyContent={message.sender === "client" ? "flex-end" : "flex-start"}>
                    <Paper
                      sx={{
                        maxWidth: "70%",
                        p: 1.5,
                        borderRadius: 2,
                        ...(message.sender === "client"
                          ? {
                              bgcolor: "#0071e3",
                              color: "white",
                              borderBottomRightRadius: 4,
                            }
                          : {
                              bgcolor: "white",
                              border: "1px solid",
                              borderColor: "rgba(0,0,0,0.08)",
                              borderBottomLeftRadius: 4,
                            }),
                      }}>
                      <Typography variant='body2' mb={0.5}>
                        {message.text}
                      </Typography>
                      <Typography
                        variant='caption'
                        sx={{
                          color: message.sender === "client" ? "rgba(255,255,255,0.7)" : "text.disabled",
                        }}>
                        {message.timestamp}
                      </Typography>
                    </Paper>
                  </Stack>
                ))}
              </Stack>
            </Box>

            {/* Message Input */}
            <Box
              sx={{
                p: 2,
                borderTop: "1px solid",
                borderColor: "rgba(0,0,0,0.08)",
                bgcolor: "white",
              }}>
              <Stack direction='row' spacing={1} alignItems='flex-end'>
                <IconButton size='small'>
                  <PaperclipIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                </IconButton>
                <TextField
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  onKeyPress={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder='Type your message...'
                  multiline
                  maxRows={4}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      fontSize: 13,
                    },
                  }}
                />
                <Button
                  variant='contained'
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  sx={{
                    minWidth: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: "#0071e3",
                    "&:hover": {
                      bgcolor: "#0077ED",
                    },
                  }}>
                  <SendIcon sx={{ fontSize: 20 }} />
                </Button>
              </Stack>
            </Box>
          </Box>
        </Stack>
      </Card>
    </Box>
  );
}
