"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { css } from "styled-system/css";
import { Avatar, Spinner } from "@/components/ds";
import { useConversations } from "@/hooks/useConversations";

const headerRowCss = css({ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "24px" });
const titleCss = css({ fontSize: "24px", fontWeight: 600, lineHeight: 1.334, color: "ink" });
const subtitleCss = css({ fontSize: "14px", lineHeight: 1.43, color: "ink2" });
// Text button, ported from MUI's default text-button metrics (36.5px tall, 4px radius).
const textBtnRaw = css.raw({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minW: "64px",
  px: "8px",
  py: "6px",
  border: "none",
  borderRadius: "4px",
  bg: "transparent",
  color: "accent",
  fontFamily: "inherit",
  fontWeight: 500,
  lineHeight: 1.75,
  letterSpacing: "0.02857em",
  cursor: "pointer",
  transition: "background-color .25s",
  _hover: { bg: "accentFill" },
});
const viewAllCss = css(textBtnRaw, { gap: "8px", fontSize: "14px", "& svg": { mr: "-4px" } });
const viewMoreCss = css(textBtnRaw, { fontSize: "13px" });
// MUI <Card> = Paper elevation 1 + overflow hidden.
const cardCss = css({
  bg: "surface",
  borderRadius: "cardSm",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hairline",
  overflow: "hidden",
  boxShadow: "0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)",
});
const loadingCss = css({ display: "flex", justifyContent: "center", py: "48px", color: "accent" });
const stateCss = css({ p: "32px", textAlign: "center" });
const errorTextCss = css({ fontSize: "16px", lineHeight: 1.5, color: "error" });
const emptyTextCss = css({ fontSize: "16px", lineHeight: 1.5, color: "ink2" });
const rowRaw = css.raw({ p: "16px", cursor: "pointer", transition: "background-color 0.2s", _hover: { bg: "rgba(0,0,0,0.02)" } });
const rowCss = css(rowRaw, { borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "rgba(0,0,0,0.08)" });
const rowLastCss = css(rowRaw);
const rowInnerCss = css({ display: "flex", alignItems: "center", gap: "16px" });
const colCss = css({ flex: 1, minW: 0 });
const nameRowCss = css({ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "4px" });
const nameRaw = css.raw({
  flex: 1,
  fontSize: "14px",
  lineHeight: 1.43,
  color: "ink",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});
const nameUnreadCss = css(nameRaw, { fontWeight: 700 });
const nameReadCss = css(nameRaw, { fontWeight: 600 });
const unreadPillCss = css({
  w: "20px",
  h: "20px",
  borderRadius: "50%",
  bg: "#9333ea",
  color: "#fff",
  fontSize: "10px",
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  ml: "8px",
});
const captionRaw = css.raw({ fontSize: "12px", lineHeight: 1.66, letterSpacing: "0.03333em" });
const orderTitleCss = css(captionRaw, {
  display: "block",
  color: "ink2",
  mb: "4px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});
const latestRowCss = css({ display: "flex", justifyContent: "space-between", alignItems: "center" });
const latestRaw = css.raw(captionRaw, { flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });
const latestUnreadCss = css(latestRaw, { color: "ink", fontWeight: 500 });
const latestReadCss = css(latestRaw, { color: "ink2", fontWeight: 400 });
const timeCss = css(captionRaw, { color: "ink3", ml: "8px" });
const footerCss = css({ p: "16px", textAlign: "center", borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "rgba(0,0,0,0.08)" });

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
    <div>
      <div className={headerRowCss}>
        <div>
          <h5 className={titleCss}>Messages</h5>
          {totalUnread > 0 && (
            <p className={subtitleCss}>
              {totalUnread} unread message{totalUnread !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <button type="button" onClick={handleViewAll} className={viewAllCss}>
          View All
          <ArrowRight size={20} />
        </button>
      </div>

      <div className={cardCss}>
        {loading ? (
          <div className={loadingCss}>
            <Spinner size={32} />
          </div>
        ) : error ? (
          <div className={stateCss}>
            <p className={errorTextCss}>{error}</p>
          </div>
        ) : previewConversations.length === 0 ? (
          <div className={stateCss}>
            <p className={emptyTextCss}>No conversations yet</p>
          </div>
        ) : (
          previewConversations.map((conversation, index) => (
            <div
              key={conversation.id}
              role="button"
              tabIndex={0}
              onClick={() => handleConversationClick(conversation.id)}
              className={index < previewConversations.length - 1 ? rowCss : rowLastCss}
            >
              <div className={rowInnerCss}>
                <Avatar
                  src={conversation.other_participant.avatar_url || undefined}
                  name={conversation.other_participant.name}
                  px={48}
                />

                <div className={colCss}>
                  <div className={nameRowCss}>
                    <p className={conversation.unread_count > 0 ? nameUnreadCss : nameReadCss}>
                      {conversation.other_participant.name}
                    </p>
                    {conversation.unread_count > 0 && (
                      <div className={unreadPillCss}>{conversation.unread_count}</div>
                    )}
                  </div>

                  {conversation.order?.title && (
                    <span className={orderTitleCss}>{conversation.order.title}</span>
                  )}

                  {conversation.latest_message && (
                    <div className={latestRowCss}>
                      <span className={conversation.unread_count > 0 ? latestUnreadCss : latestReadCss}>
                        {conversation.latest_message.body}
                      </span>
                      <span className={timeCss}>
                        {formatTimestamp(conversation.latest_message.created_at)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {conversations.length > 4 && (
          <div className={footerCss}>
            <button type="button" onClick={handleViewAll} className={viewMoreCss}>
              View {conversations.length - 4} more conversation
              {conversations.length - 4 !== 1 ? "s" : ""}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
