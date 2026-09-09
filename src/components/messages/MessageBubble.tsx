"use client";

import { css, cva } from "styled-system/css";
import { Avatar } from "@/components/ds";
import { Message } from "@/types/message";

const rowCss = cva({
  base: { display: "flex", mb: "12px" },
  variants: {
    mine: {
      true: { justifyContent: "flex-end" },
      false: { justifyContent: "flex-start" },
    },
  },
});

const groupCss = cva({
  base: { display: "flex", alignItems: "flex-end", gap: "8px", maxW: "70%" },
  variants: {
    mine: {
      true: { flexDirection: "row-reverse" },
      false: { flexDirection: "row" },
    },
  },
});

const stackCss = cva({
  base: { display: "flex", flexDirection: "column" },
  variants: {
    mine: {
      true: { alignItems: "flex-end" },
      false: { alignItems: "flex-start" },
    },
  },
});

const bubbleCss = cva({
  base: { px: "16px", py: "12px", borderRadius: "16px" },
  variants: {
    mine: {
      true: {
        bg: "accent",
        color: "white",
        borderBottomRightRadius: "4px",
        borderBottomLeftRadius: "16px",
      },
      false: {
        bg: "rgba(0, 0, 0, 0.05)",
        color: "ink",
        borderBottomRightRadius: "16px",
        borderBottomLeftRadius: "4px",
      },
    },
  },
});

const fileWrapCss = css({ mb: "8px" });
// globals.css's unlayered `a { color: inherit; text-decoration: none }` beats every
// layered rule, so the old sx `color`/`textDecoration` on this anchor never rendered —
// the link has always inherited the bubble's colour. Kept as-is rather than "fixed".
const fileLinkCss = css({ fontSize: "13px" });
const bodyCss = css({ fontSize: "13px", lineHeight: 1.5, whiteSpace: "pre-wrap" });
// `mt`/`px` here were dead too: globals.css zeroes margin *and* padding on <p>.
const timeCss = css({ fontSize: "10px", color: "ink3" });

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
    <div className={rowCss({ mine: isMine })}>
      <div className={groupCss({ mine: isMine })}>
        {showAvatar && !isMine && (
          <Avatar src={message.sender.avatar_url || undefined} name={message.sender.name} size="sm" />
        )}

        <div className={stackCss({ mine: isMine })}>
          <div className={bubbleCss({ mine: isMine })}>
            {message.type === "file" && message.file_url && (
              <div className={message.body ? fileWrapCss : undefined}>
                <a
                  href={message.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={fileLinkCss}>
                  {message.file_name || "Attachment"}
                </a>
              </div>
            )}

            {message.body && <p className={bodyCss}>{message.body}</p>}
          </div>

          <p className={timeCss}>
            {formatTime(message.created_at)}
            {isMine && message.read_at && " · Read"}
          </p>
        </div>
      </div>
    </div>
  );
}
