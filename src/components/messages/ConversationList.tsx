"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { css, cva } from "styled-system/css";
import { Avatar, Spinner } from "@/components/ds";
import { Conversation } from "@/types/message";

const rootCss = css({
  w: "360px",
  borderRightWidth: "1px",
  borderRightStyle: "solid",
  borderRightColor: "hairline",
  display: "flex",
  flexDirection: "column",
  h: "100%",
});

const searchWrapCss = css({
  p: "16px",
  borderBottomWidth: "1px",
  borderBottomStyle: "solid",
  borderBottomColor: "hairline",
});

// The former MUI OutlinedInput: 36px tall, 8px radius, 5 % black fill, no border,
// 8 % on focus. Written out (rather than layered on `fieldRoot`) so the atomic
// classes can't fight the kit recipe's border/background.
const searchFieldCss = css({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  w: "100%",
  h: "36px",
  px: "14px",
  boxSizing: "border-box",
  bg: "rgba(0, 0, 0, 0.05)",
  borderRadius: "8px",
  fontSize: "13px",
  color: "ink",
  _focusWithin: { bg: "rgba(0, 0, 0, 0.08)" },
});

const searchIconCss = css({
  display: "inline-flex",
  alignItems: "center",
  flexShrink: 0,
  color: "ink3",
  "& svg": { display: "block" },
});

const searchInputCss = css({
  flex: 1,
  minW: 0,
  w: "100%",
  boxSizing: "border-box",
  m: 0,
  p: 0,
  bg: "transparent",
  border: "none",
  outline: "none",
  boxShadow: "none",
  appearance: "none",
  fontFamily: "inherit",
  fontSize: "inherit",
  lineHeight: 1.5,
  color: "inherit",
  _placeholder: { color: "rgba(0, 0, 0, 0.42)", opacity: 1 },
  "&::-webkit-search-cancel-button, &::-webkit-search-decoration": { WebkitAppearance: "none", appearance: "none" },
});

const listCss = css({ flex: 1, overflowY: "auto" });
const loadingCss = css({ display: "flex", justifyContent: "center", py: "32px" });
const spinnerCss = css({ color: "accent" });
const emptyCss = css({ p: "24px", textAlign: "center" });
const emptyTextCss = css({ fontSize: "13px", color: "rgba(0, 0, 0, 0.5)" });

const rowCss = cva({
  base: {
    p: "16px",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
    cursor: "pointer",
    transition: "background-color 0.2s",
    _hover: { bg: "rgba(0, 0, 0, 0.02)" },
  },
  variants: {
    selected: { true: { bg: "rgba(0, 0, 0, 0.05)" }, false: { bg: "transparent" } },
  },
});

const rowInnerCss = css({ display: "flex", alignItems: "start", gap: "12px" });

// MUI <Badge variant="dot" overlap="circular" anchorOrigin={bottom,right}> with a
// transparent fill and a 2px white ring.
const avatarWrapCss = css({ position: "relative", display: "inline-flex", verticalAlign: "middle", flexShrink: 0 });
const avatarDotCss = css({
  position: "absolute",
  bottom: "14%",
  right: "14%",
  transform: "translate(50%, 50%)",
  w: "12px",
  h: "12px",
  boxSizing: "border-box",
  borderRadius: "50%",
  bg: "transparent",
  borderWidth: "2px",
  borderStyle: "solid",
  borderColor: "white",
});

const bodyColCss = css({ flex: 1, minW: 0 });
const titleRowCss = css({ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "4px" });
const nameCss = cva({
  base: { fontSize: "13px", color: "ink", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  variants: { unread: { true: { fontWeight: 700 }, false: { fontWeight: 600 } } },
});
const timeCss = css({ fontSize: "11px", color: "ink3", flexShrink: 0 });
// `mb`/`ml` on these <p>s were already dead under MUI too — globals.css zeroes
// margin *and* padding on `p` outside any layer — so they are dropped, not ported.
const orderTitleCss = css({
  fontSize: "11px",
  color: "ink2",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});
const previewCss = cva({
  base: { fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  variants: {
    unread: {
      true: { color: "ink", fontWeight: 500 },
      false: { color: "ink2", fontWeight: 400 },
    },
  },
});
const unreadBadgeCss = css({
  minW: "20px",
  h: "20px",
  bg: "accent",
  color: "white",
  fontSize: "10px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 500,
  flexShrink: 0,
});

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
      (conv.order?.title ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={rootCss}>
      {/* Search */}
      <div className={searchWrapCss}>
        <div className={searchFieldCss}>
          <span className={searchIconCss}>
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder={`Search ${participantLabel}s...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={searchInputCss}
          />
        </div>
      </div>

      {/* Conversations */}
      <div className={listCss}>
        {loading ? (
          <div className={loadingCss}>
            <Spinner size={24} className={spinnerCss} />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className={emptyCss}>
            <p className={emptyTextCss}>
              {searchQuery ? "No conversations found" : "No conversations yet"}
            </p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelect(conv)}
              className={rowCss({ selected: selectedId === conv.id })}>
              <div className={rowInnerCss}>
                <span className={avatarWrapCss}>
                  <Avatar
                    src={conv.other_participant.avatar_url || undefined}
                    name={conv.other_participant.name}
                    px={48}
                  />
                  <span className={avatarDotCss} />
                </span>

                <div className={bodyColCss}>
                  <div className={titleRowCss}>
                    <p className={nameCss({ unread: conv.unread_count > 0 })}>
                      {conv.other_participant.name}
                    </p>
                    {conv.latest_message && (
                      <p className={timeCss}>{formatTimestamp(conv.latest_message.created_at)}</p>
                    )}
                  </div>

                  {conv.order?.title && <p className={orderTitleCss}>{conv.order.title}</p>}

                  {conv.latest_message && (
                    <p className={previewCss({ unread: conv.unread_count > 0 })}>
                      {conv.latest_message.body}
                    </p>
                  )}
                </div>

                {conv.unread_count > 0 && (
                  <div className={unreadBadgeCss}>{conv.unread_count}</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
