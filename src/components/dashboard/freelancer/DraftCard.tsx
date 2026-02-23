import { Box, Typography, Button, IconButton } from "@mui/material";
import { DeleteOutlined } from "@mui/icons-material";
import { Service } from "./types";

interface DraftCardProps {
  draft: Service;
  onContinueEditing: () => void;
  onDelete?: () => void;
}

export default function DraftCard({ draft, onContinueEditing, onDelete }: DraftCardProps) {
  return (
    <Box
      sx={{
        p: 2,
        border: "1px solid rgba(0, 0, 0, 0.1)",
        borderRadius: 3,
        transition: "border-color 0.3s",
        "&:hover": {
          borderColor: "rgba(0, 0, 0, 0.2)",
        },
      }}>
      <Box sx={{ display: "flex", alignItems: "start", justifyContent: "space-between" }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 500, color: "black" }}>{draft.title}</Typography>
            <Box
              sx={{
                px: 1,
                py: 0.25,
                bgcolor: "rgba(245, 158, 11, 0.1)",
                color: "#b45309",
                fontSize: 10,
                borderRadius: 1,
              }}>
              DRAFT
            </Box>
          </Box>
          <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 1 }}>{draft.category}</Typography>
          <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.4)" }}>Last edited {draft.lastEdited}</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            onClick={onContinueEditing}
            sx={{
              px: 2,
              height: 32,
              fontSize: 12,
              color: "black",
              bgcolor: "rgba(0, 0, 0, 0.05)",
              borderRadius: 2,
              textTransform: "none",
              "&:hover": {
                bgcolor: "rgba(0, 0, 0, 0.1)",
              },
            }}>
            Continue Editing
          </Button>
          <IconButton
            onClick={onDelete}
            sx={{
              p: 1,
              color: "rgba(239, 68, 68, 0.6)",
              borderRadius: 2,
              "&:hover": {
                color: "#ef4444",
                bgcolor: "rgba(239, 68, 68, 0.05)",
              },
            }}>
            <DeleteOutlined sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
