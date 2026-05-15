import { Box, Paper, Typography, TextField, Select, MenuItem, Chip, IconButton, InputAdornment } from "@mui/material";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { RoomOutlined, AddOutlined, CloseOutlined } from "@mui/icons-material";
import { ServiceFormData, textFieldSx, textareaSx } from "../types";
import { ServiceCategory } from "@/types/service";
import { useState } from "react";

interface BasicInfoSectionProps {
  formData: ServiceFormData;
  onFormDataChange: (data: ServiceFormData) => void;
  categories: ServiceCategory[];
  categoriesLoading: boolean;
}

export default function BasicInfoSection({ formData, onFormDataChange, categories, categoriesLoading }: BasicInfoSectionProps) {
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed || formData.searchTags.length >= 5 || formData.searchTags.includes(trimmed)) return;
    onFormDataChange({ ...formData, searchTags: [...formData.searchTags, trimmed] });
    setTagInput("");
  };

  const handleRemoveTag = (index: number) => {
    onFormDataChange({ ...formData, searchTags: formData.searchTags.filter((_, i) => i !== index) });
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 4 }}>
      <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black", mb: 3 }}>Basic Information</Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 1 }}>Service Title *</Typography>
          <TextField
            fullWidth
            value={formData.title}
            onChange={e => onFormDataChange({ ...formData, title: e.target.value })}
            placeholder="e.g., I will create a modern logo design for your brand"
            sx={textFieldSx}
          />
        </Box>

        <Box>
          <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 1 }}>Category *</Typography>
          <Select
            fullWidth
            value={formData.categoryId ?? ""}
            onChange={e => onFormDataChange({ ...formData, categoryId: e.target.value as number })}
            displayEmpty
            disabled={categoriesLoading}
            sx={{
              height: 44,
              borderRadius: 3,
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
            }}>
            <MenuItem value="" disabled>
              {categoriesLoading ? "Loading categories..." : "Select a category"}
            </MenuItem>
            {categories.map(cat => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Box>
          <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 1 }}>
            Search Tags <span style={{ opacity: 0.5 }}>({formData.searchTags.length}/5)</span>
          </Typography>
          <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.4)", mb: 1.5 }}>
            Add keywords that buyers might search for. Press Enter or click + to add.
          </Typography>

          {formData.searchTags.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1.5 }}>
              {formData.searchTags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleRemoveTag(index)}
                  deleteIcon={<CloseOutlined sx={{ fontSize: "14px !important" }} />}
                  sx={{
                    fontSize: 12,
                    height: 30,
                    bgcolor: "rgba(0,0,0,0.06)",
                    color: "black",
                    "& .MuiChip-deleteIcon": { color: "rgba(0,0,0,0.4)", "&:hover": { color: "black" } },
                  }}
                />
              ))}
            </Box>
          )}

          {formData.searchTags.length < 5 && (
            <TextField
              fullWidth
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Type a keyword and press Enter"
              sx={{
                ...textFieldSx,
                "& .MuiOutlinedInput-root": {
                  ...textFieldSx["& .MuiOutlinedInput-root"],
                  height: 40,
                },
              }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={handleAddTag}
                        disabled={!tagInput.trim()}
                        sx={{ color: tagInput.trim() ? "black" : "rgba(0,0,0,0.2)" }}>
                        <AddOutlined sx={{ fontSize: 18 }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        </Box>

        <Box>
          <Typography
            sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 1, display: "flex", alignItems: "center", gap: 0.5 }}>
            <RoomOutlined sx={{ fontSize: 14 }} />
            Location
          </Typography>
          <TextField
            fullWidth
            value={formData.location}
            onChange={e => onFormDataChange({ ...formData, location: e.target.value })}
            sx={textFieldSx}
          />
        </Box>

        <Box>
          <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 1 }}>Service Description *</Typography>
          <RichTextEditor
            value={formData.description}
            onChange={html => onFormDataChange({ ...formData, description: html })}
            placeholder="Describe your service in detail. What will you deliver? What makes your service unique?"
            minHeight={150}
          />
        </Box>
      </Box>
    </Paper>
  );
}
