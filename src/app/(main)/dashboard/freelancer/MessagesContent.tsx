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
const cardCss = css({
  bg: "surface",
  borderRadius: "card",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hairline",
  overflow: "hidden",
});
const loadingCss = css({ display: "flex", justifyContent: "center", py: "48px", color: "accent" });
const stateCss = css({ p: "32px", textAlign: "center" });
const errorTextCss = css({ fontSize: "16px", lineHeight: 1.5, color: "error" });
const emptyTextCss = css({ fontSize: "16px", lineHeight: 1.5, color: "ink2" });
const rowRaw = css.raw({ p: "16px", cursor: "pointer", transition: "background-color 0.2s", _hover: { bg: "rgba(0, 0, 0, 0.02)" } });
const rowCss = css(rowRaw, { borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "rgba(0, 0, 0, 0.05)" });
const rowLastCss = css(rowRaw);
const rowInnerCss = css({ display: "flex", alignItems: "start", gap: "12px" });
// The old MUI <Badge variant="dot"> was styled transparent with a 2px white ring.
const avatarWrapCss = css({ position: "relative", display: "inline-flex", verticalAlign: "middle", flexShrink: 0 });
const avatarRingCss = css({
  position: "absolute",
  bottom: "14%",
  right: "14%",
  w: "12px",
  h: "12px",
  boxSizing: "border-box",
  borderRadius: "50%",
  border: "2px solid white",
  bg: "transparent",
  transform: "translate(50%, 50%)",
  transformOrigin: "100% 100%",
});
const colCss = css({ flex: 1, minW: 0 });
const nameRowCss = css({ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "4px" });
const truncateRaw = css.raw({ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });
const nameRaw = css.raw(truncateRaw, { fontSize: "13px", lineHeight: 1.5, color: "ink" });
const nameUnreadCss = css(nameRaw, { fontWeight: 700 });
const nameReadCss = css(nameRaw, { fontWeight: 600 });
const timeCss = css({ fontSize: "11px", lineHeight: 1.5, color: "ink3", ml: "8px" });
const orderTitleCss = css(truncateRaw, { fontSize: "11px", lineHeight: 1.5, color: "ink2" });
const latestRaw = css.raw(truncateRaw, { fontSize: "12px", lineHeight: 1.5 });
const latestUnreadCss = css(latestRaw, { color: "ink", fontWeight: 500 });
const latestReadCss = css(latestRaw, { color: "ink2", fontWeight: 400 });
const unreadPillCss = css({
  minW: "20px",
  h: "20px",
  bg: "accent",
  color: "#fff",
  fontSize: "10px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 500,
  flexShrink: 0,
});
const footerCss = css({ p: "16px", textAlign: "center", borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "rgba(0, 0, 0, 0.05)" });

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
                <span className={avatarWrapCss}>
                  <Avatar
                    src={conversation.other_participant.avatar_url || undefined}
                    name={conversation.other_participant.name}
                    px={48}
                  />
                  <span aria-hidden="true" className={avatarRingCss} />
                </span>

                <div className={colCss}>
                  <div className={nameRowCss}>
                    <p className={conversation.unread_count > 0 ? nameUnreadCss : nameReadCss}>
                      {conversation.other_participant.name}
                    </p>
                    {conversation.latest_message && (
                      <p className={timeCss}>{formatTimestamp(conversation.latest_message.created_at)}</p>
                    )}
                  </div>

                  {conversation.order?.title && (
                    <p className={orderTitleCss}>{conversation.order.title}</p>
                  )}

                  {conversation.latest_message && (
                    <p className={conversation.unread_count > 0 ? latestUnreadCss : latestReadCss}>
                      {conversation.latest_message.body}
                    </p>
                  )}
                </div>

                {conversation.unread_count > 0 && (
                  <div className={unreadPillCss}>{conversation.unread_count}</div>
                )}
              </div>
            </div>
          ))
        )}

        {conversations.length > 5 && (
          <div className={footerCss}>
            <button type="button" onClick={handleViewAll} className={viewMoreCss}>
              View {conversations.length - 5} more conversation
              {conversations.length - 5 !== 1 ? "s" : ""}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
