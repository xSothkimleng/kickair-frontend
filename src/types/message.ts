export type MessageType = "text" | "file" | "system";

export interface MessageSender {
  id: number;
  name: string;
  avatar_url: string | null;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender: MessageSender;
  body: string;
  type: MessageType;
  file_url: string | null;
  file_name: string | null;
  is_mine: boolean;
  read_at: string | null;
  created_at: string;
}

export interface ConversationOrder {
  id: number;
  status: string;
  title: string;
  type: "service" | "job";
  created_at: string;
}

export interface ConversationParticipant {
  id: number;
  name: string;
  avatar_url: string | null;
}

export interface ConversationLatestMessage {
  body: string;
  type: MessageType;
  sender_id: number;
  created_at: string;
}

export interface Conversation {
  id: number;
  order_id: number | null;
  order: ConversationOrder | null;
  other_participant: ConversationParticipant;
  latest_message: ConversationLatestMessage | null;
  unread_count: number;
  created_at: string;
}

/** An order lifecycle event shown inline in a conversation. */
export interface ConversationOrderEvent {
  id: number;
  order_id: number;
  order_title: string;
  event_type: string;
  description: string | null;
  actor_role: string | null;
  created_at: string;
}

export interface ConversationsResponse {
  data: Conversation[];
}

export interface MessagesResponse {
  data: Message[];
}

export interface SendMessageResponse {
  data: Message;
}

export interface MarkReadResponse {
  data: {
    marked_read: number;
  };
}