import { Box, Typography, Button, IconButton, CircularProgress } from "@mui/material";
import { DeleteOutlined, SendOutlined } from "@mui/icons-material";
import { JobPost } from "@/types/job";

interface JobDraftCardProps {
  draft: JobPost;
  onContinueEditing: () => void;
  onPublish: () => void;
  onDelete: () => void;
  publishing?: boolean;
  deleting?: boolean;
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

export default function JobDraftCard({
  draft,
  onContinueEditing,
  onPublish,
  onDelete,
  publishing = false,
  deleting = false,
}: JobDraftCardProps) {
  const busy = publishing || deleting;

  return (
    <Box
      sx={{
        p: 2,
        border: "1px solid rgba(0, 0, 0, 0.1)",
        borderRadius: 3,
        transition: "border-color 0.3s",
        "&:hover": { borderColor: "rgba(0, 0, 0, 0.2)" },
      }}>
      <Box sx={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 1.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 500, color: "black", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {draft.title?.trim() || "Untitled job"}
            </Typography>
            <Box sx={{ px: 1, py: 0.25, bgcolor: "rgba(245, 158, 11, 0.1)", color: "#b45309", fontSize: 10, fontWeight: 600, borderRadius: 1, flexShrink: 0 }}>
              DRAFT
            </Box>
          </Box>
          <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 1 }}>
            {draft.category?.category_name ?? "No category yet"}
          </Typography>
          <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.4)" }}>
            Last edited {timeAgo(draft.updated_at)}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
          <Button
            onClick={onContinueEditing}
            disabled={busy}
            sx={{
              px: 2,
              height: 32,
              fontSize: 12,
              color: "black",
              bgcolor: "rgba(0, 0, 0, 0.05)",
              borderRadius: 2,
              textTransform: "none",
              whiteSpace: "nowrap",
              "&:hover": { bgcolor: "rgba(0, 0, 0, 0.1)" },
            }}>
            Continue Editing
          </Button>
          <Button
            onClick={onPublish}
            disabled={busy}
            startIcon={publishing ? undefined : <SendOutlined sx={{ fontSize: 14 }} />}
            sx={{
              px: 2,
              height: 32,
              fontSize: 12,
              color: "white",
              bgcolor: "#0071e3",
              borderRadius: 2,
              textTransform: "none",
              whiteSpace: "nowrap",
              "&:hover": { bgcolor: "#0077ED" },
              "&.Mui-disabled": { bgcolor: "rgba(0,113,227,0.4)", color: "white" },
            }}>
            {publishing ? <CircularProgress size={14} sx={{ color: "white" }} /> : "Publish"}
          </Button>
          <IconButton
            onClick={onDelete}
            disabled={busy}
            sx={{
              p: 1,
              color: "rgba(239, 68, 68, 0.6)",
              borderRadius: 2,
              "&:hover": { color: "#ef4444", bgcolor: "rgba(239, 68, 68, 0.05)" },
            }}>
            {deleting ? <CircularProgress size={16} sx={{ color: "#ef4444" }} /> : <DeleteOutlined sx={{ fontSize: 16 }} />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
