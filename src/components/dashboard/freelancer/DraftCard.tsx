import { Trash2 } from "lucide-react";
import { css } from "styled-system/css";
import { iconButton } from "@/components/ds";
import { Service } from "@/types/service";

const cardBox = css({
  p: "16px",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "rgba(0, 0, 0, 0.1)",
  borderRadius: "cardSm",
  transition: "border-color 0.3s",
  _hover: { borderColor: "rgba(0, 0, 0, 0.2)" },
});
const row = css({ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" });
const main = css({ flex: 1, minW: 0 });
const titleRow = css({ display: "flex", alignItems: "center", gap: "8px", mb: "4px" });
const title = css({ textStyle: "body", fontWeight: 500, color: "ink", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });
const draftPill = css({
  px: "8px",
  py: "2px",
  bg: "rgba(245, 158, 11, 0.1)",
  color: "pendingText",
  textStyle: "micro",
  fontWeight: 600,
  borderRadius: "4px",
  flexShrink: 0,
});
const category = css({ textStyle: "meta", color: "ink2" });
const edited = css({ textStyle: "micro", color: "ink3" });
const sideActions = css({ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 });
const continueBtn = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  m: 0,
  px: "16px",
  h: "32px",
  minW: "64px",
  border: "none",
  borderRadius: "8px",
  bg: "rgba(0, 0, 0, 0.05)",
  color: "ink",
  textStyle: "meta",
  fontWeight: 500,
  whiteSpace: "nowrap",
  cursor: "pointer",
  transition: "background-color .25s",
  _hover: { bg: "rgba(0, 0, 0, 0.1)" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
});
const deleteBtn = css(iconButton.raw({ shape: "square" }), {
  w: "32px",
  h: "32px",
  borderRadius: "8px",
  color: "rgba(239, 68, 68, 0.6)",
  _hover: { color: "#ef4444", bg: "rgba(239, 68, 68, 0.05)" },
});

interface DraftCardProps {
  draft: Service;
  onContinueEditing: () => void;
  onDelete?: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function DraftCard({ draft, onContinueEditing, onDelete }: DraftCardProps) {
  return (
    <div className={cardBox}>
      <div className={row}>
        <div className={main}>
          <div className={titleRow}>
            <p className={title}>
              {draft.title?.trim() || "Untitled service"}
            </p>
            <div className={draftPill}>
              DRAFT
            </div>
          </div>
          <p className={category}>
            {draft.category?.category_name ?? "No category yet"}
          </p>
          <p className={edited}>
            Last edited {timeAgo(draft.updated_at)}
          </p>
        </div>
        <div className={sideActions}>
          <button type="button" onClick={onContinueEditing} className={continueBtn}>
            Continue Editing
          </button>
          <button type="button" onClick={onDelete} aria-label="Delete draft" className={deleteBtn}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
