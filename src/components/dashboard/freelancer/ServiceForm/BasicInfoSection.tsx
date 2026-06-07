import { Box, Paper, Typography } from "@mui/material";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { TextInput, SelectInput, TagInput } from "@/components/ui/inputs";
import { ServiceFormData } from "../types";
import { ServiceCategory } from "@/types/service";

interface BasicInfoSectionProps {
  formData: ServiceFormData;
  onFormDataChange: (data: ServiceFormData) => void;
  categories: ServiceCategory[];
  categoriesLoading: boolean;
  fieldErrors?: { title?: string; category?: string };
}

export default function BasicInfoSection({ formData, onFormDataChange, categories, categoriesLoading, fieldErrors }: BasicInfoSectionProps) {
  return (
    <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 4 }}>
      <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black", mb: 3 }}>Basic Information</Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextInput
          label="Service Title"
          required
          value={formData.title}
          onChange={(v) => onFormDataChange({ ...formData, title: v })}
          placeholder="e.g., I will create a modern logo design for your brand"
          error={fieldErrors?.title}
        />

        <SelectInput
          label="Category"
          required
          value={formData.categoryId ?? ""}
          onChange={(v) => onFormDataChange({ ...formData, categoryId: Number(v) })}
          options={categories.map((cat) => ({ value: cat.id, label: cat.category_name }))}
          placeholder={categoriesLoading ? "Loading categories…" : "Select a category"}
          disabled={categoriesLoading}
          error={fieldErrors?.category}
        />

        <TagInput
          label={`Search Tags (${formData.searchTags.length}/5)`}
          helper="Add keywords that buyers might search for. Press Enter to add (up to 5)."
          value={formData.searchTags}
          onChange={(v) => onFormDataChange({ ...formData, searchTags: v.slice(0, 5) })}
          placeholder="Type a keyword and press Enter"
        />

        <TextInput
          label="Location"
          value={formData.location}
          onChange={(v) => onFormDataChange({ ...formData, location: v })}
        />

        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#334155", mb: 0.875 }}>
            Service Description <Typography component="span" sx={{ color: "#DC2626" }}>*</Typography>
          </Typography>
          <RichTextEditor
            value={formData.description}
            onChange={(html) => onFormDataChange({ ...formData, description: html })}
            placeholder="Describe your service in detail. What will you deliver? What makes your service unique?"
            minHeight={150}
          />
        </Box>
      </Box>
    </Paper>
  );
}
