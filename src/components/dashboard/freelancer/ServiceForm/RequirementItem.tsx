import { Box, TextField, Select, MenuItem, Checkbox, FormControlLabel, IconButton, Typography } from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";
import { Requirement } from "../types";

interface RequirementItemProps {
  requirement: Requirement;
  onChange: (requirement: Requirement) => void;
  onRemove: () => void;
}

export default function RequirementItem({ requirement, onChange, onRemove }: RequirementItemProps) {
  return (
    <Box sx={{ p: 2, border: "1px solid rgba(0, 0, 0, 0.1)", borderRadius: 3 }}>
      <Box sx={{ display: "flex", alignItems: "start", gap: 1.5 }}>
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
          <TextField
            fullWidth
            value={requirement.question}
            onChange={e => onChange({ ...requirement, question: e.target.value })}
            placeholder="Enter your question"
            sx={{
              "& .MuiOutlinedInput-root": {
                height: 40,
                borderRadius: 2,
                bgcolor: "white",
                fontSize: 13,
                "& fieldset": {
                  borderColor: "rgba(0, 0, 0, 0.1)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(0, 0, 0, 0.2)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "rgba(0, 0, 0, 0.2)",
                  borderWidth: 1,
                },
              },
            }}
          />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Select
              value={requirement.type}
              onChange={e => onChange({ ...requirement, type: e.target.value })}
              sx={{
                height: 36,
                borderRadius: 2,
                bgcolor: "white",
                fontSize: 12,
                "& fieldset": {
                  borderColor: "rgba(0, 0, 0, 0.1)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(0, 0, 0, 0.2)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "rgba(0, 0, 0, 0.2)",
                  borderWidth: 1,
                },
              }}>
              <MenuItem value="text">Free Text</MenuItem>
              <MenuItem value="multiple">Multiple Choice</MenuItem>
              <MenuItem value="attachment">Attachment</MenuItem>
            </Select>

            <FormControlLabel
              control={
                <Checkbox
                  checked={requirement.required}
                  onChange={e => onChange({ ...requirement, required: e.target.checked })}
                  sx={{
                    color: "rgba(0, 0, 0, 0.2)",
                    "&.Mui-checked": {
                      color: "black",
                    },
                  }}
                />
              }
              label={<Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)" }}>Required</Typography>}
            />
          </Box>
        </Box>

        <IconButton
          onClick={onRemove}
          sx={{
            p: 1,
            color: "rgba(239, 68, 68, 0.6)",
            borderRadius: 2,
            "&:hover": {
              color: "#ef4444",
              bgcolor: "rgba(239, 68, 68, 0.05)",
            },
          }}>
          <CloseOutlined sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    </Box>
  );
}
