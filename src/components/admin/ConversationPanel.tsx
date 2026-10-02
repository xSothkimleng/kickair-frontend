"use client";

import { useEffect, useRef, useState } from "react";
import { css, cx } from "styled-system/css";
import { Paperclip, Send } from "lucide-react";
import { api } from "@/lib/api";
import { getEcho } from "@/lib/echo";
import { useAuth } from "@/components/context/AuthContext";
import type { Message } from "@/types/message";
import { useToast } from "./toast";
import { Avatar, Btn, Input, Panel, PanelHead, row, stack, text } from "./ui";
import { ago, errorMessage } from "./format";

const bubbleRow = css({ display: "flex", gap: "10px", alignItems: "flex-end", "&[data-me=true]": { flexDirection: "row-reverse" } });
const bubble = css({
  maxW: "78%", px: "12px", py: "8px", borderRadius: "14px", bg: "var(--td-hover)", textStyle: "ui", borderBottomLeftRadius: "4px", whiteSpace: "pre-wrap", overflowWrap: "anywhere",
  "&[data-me=true]": { bg: "var(--td-ink)", color: "#fff", borderBottomLeftRadius: "14px", borderBottomRightRadius: "4px" },
  "& a": { textDecoration: "underline" },
});

type Party = { id: number | null; name: string; avatar_url: string | null };

/**
 * The client and freelancer's conversation with the admin as a third voice: history
 * once, then live via Echo. Shared by the dispute page and the order page.
 */
export default function ConversationPanel({ conversationId, client, freelancer }: { conversationId: number; client: Party; freelancer: Party }) {
  const toast = useToast();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEnd.current?.scrollIntoView({ block: "end" }); }, [messages]);
  useEffect(() => {
    let active = true;
    api.getConversationMessages(conversationId).then((res) => { if (active) setMessages(res.data ?? []); }).catch(() => {});
    return () => { active = false; };
  }, [conversationId]);
  useEffect(() => {
    let echo: ReturnType<typeof getEcho>;
    try { echo = getEcho(); } catch { return; }
    echo.private(`conversation.${conversationId}`).listen(".message.sent", (event: { message: Message }) => {
      setMessages((prev) => (prev.some((m) => m.id === event.message.id) ? prev : [...prev, { ...event.message, is_mine: event.message.sender_id === user?.id }]));
    });
    return () => { try { echo.leave(`conversation.${conversationId}`); } catch {} };
  }, [conversationId, user?.id]);

  const roleOf = (senderId: number) => (senderId === client.id ? "client" : senderId === freelancer.id ? "freelancer" : "admin");
  const partyOf = (senderId: number) => (senderId === client.id ? client : senderId === freelancer.id ? freelancer : null);

  const send = async () => {
    const body = draft.trim();
    if (!body) return;
    setSending(true);
    try {
      await api.sendConversationMessage(conversationId, body);
      setDraft("");
      const res = await api.getConversationMessages(conversationId);
      setMessages(res.data ?? []);
    } catch (err) {
      toast(errorMessage(err, "Message not sent."), "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <Panel>
      <PanelHead title="Conversation" meta="visible to both parties" />
      <div className={cx(stack({ gap: 3 }), css({ p: "20px", maxH: "420px", overflowY: "auto" }))}>
        {messages.length === 0 ? <p className={text({ size: "meta", tone: 3 })}>No messages yet.</p> : null}
        {messages.map((m) => {
          const p = partyOf(m.sender_id);
          const me = m.is_mine;
          const label = me ? "You · admin" : `${m.sender?.name ?? p?.name ?? "Someone"} · ${roleOf(m.sender_id)}`;
          return (
            <div key={m.id} className={bubbleRow} data-me={me}>
              <Avatar name={m.sender?.name ?? p?.name ?? "?"} size="sm" seed={m.sender_id} src={m.sender?.avatar_url ?? p?.avatar_url} />
              <div className={cx(stack({ gap: 1 }), css({ alignItems: me ? "flex-end" : "flex-start", maxW: "100%" }))}>
                <span className={text({ size: "micro", tone: 3 })}>{label} · {ago(m.created_at)}</span>
                <div className={bubble} data-me={me}>
                  {m.type === "file" && m.file_url ? <a href={m.file_url} target="_blank" rel="noreferrer"><Paperclip size={12} className={css({ display: "inline", verticalAlign: "-1px" })} /> {m.file_name ?? "Attachment"}</a> : m.body}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatEnd} />
      </div>
      <div className={cx(row({ gap: 2 }), css({ p: "12px 16px", borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "var(--td-line)", bg: "var(--td-surface-2)" }))}>
        <Input placeholder="Message both parties…" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} disabled={sending} />
        <Btn variant="primary" onClick={send} disabled={!draft.trim() || sending}><Send size={14} /> {sending ? "Sending…" : "Send"}</Btn>
      </div>
    </Panel>
  );
}
