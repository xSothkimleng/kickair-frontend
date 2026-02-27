import { Box, Paper, Typography, TextField, Select, MenuItem } from "@mui/material";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { RoomOutlined } from "@mui/icons-material";
import { ServiceFormData, textFieldSx, textareaSx } from "../types";
import { ServiceCategory } from "@/types/service";

interface BasicInfoSectionProps {
  formData: ServiceFormData;
  onFormDataChange: (data: ServiceFormData) => void;
  categories: ServiceCategory[];
  categoriesLoading: boolean;
}

export default function BasicInfoSection({ formData, onFormDataChange, categories, categoriesLoading }: BasicInfoSectionProps) {
  const handleTagChange = (index: number, value: string) => {
    const newTags = [...formData.searchTags];
    newTags[index] = value;
    onFormDataChange({ ...formData, searchTags: newTags });
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
          <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 1 }}>Search Tags * (up to 5 keywords)</Typography>
          <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.4)", mb: 1.5 }}>
            Add keywords that buyers might search for. Our search engine will match these with buyer searches.
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {formData.searchTags.map((tag, index) => (
              <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TextField
                  fullWidth
                  value={tag}
                  onChange={e => handleTagChange(index, e.target.value)}
                  placeholder={`Keyword ${index + 1}`}
                  sx={{
                    ...textFieldSx,
                    "& .MuiOutlinedInput-root": {
                      ...textFieldSx["& .MuiOutlinedInput-root"],
                      height: 40,
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
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
