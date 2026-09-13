import { css } from "styled-system/css";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { TextInput, TagInput } from "@/components/ui/inputs";
import CategoryPicker from "@/components/category/CategoryPicker";
import { ServiceFormData } from "../types";
import { ServiceCategory } from "@/types/service";

/* The form sections are white cards (flat panels, radius 16, 32px pad). */
const sectionCard = css({
  bg: "surface",
  borderRadius: "card",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hairline",
  p: "32px",
});
const sectionTitle = css({ textStyle: "lead", fontWeight: 600, color: "ink" });
const fieldStack = css({ display: "flex", flexDirection: "column", gap: "16px" });
const editorLabel = css({ textStyle: "ui", fontWeight: 500, color: "body" });
const requiredMark = css({ color: "error" });

interface BasicInfoSectionProps {
  formData: ServiceFormData;
  onFormDataChange: (data: ServiceFormData) => void;
  categories: ServiceCategory[];
  categoriesLoading: boolean;
  fieldErrors?: { title?: string; category?: string };
}

export default function BasicInfoSection({ formData, onFormDataChange, categories, categoriesLoading, fieldErrors }: BasicInfoSectionProps) {
  return (
    <div className={sectionCard}>
      <p className={sectionTitle}>Basic Information</p>

      <div className={fieldStack}>
        <TextInput
          label="Service Title"
          required
          value={formData.title}
          onChange={(v) => onFormDataChange({ ...formData, title: v })}
          placeholder="e.g., I will create a modern logo design for your brand"
          error={fieldErrors?.title}
        />

        <CategoryPicker
          tree={categories}
          loading={categoriesLoading}
          required
          value={{
            categoryId: formData.categoryId,
            requestedCategory: formData.requestedCategory,
            requestedParentId: formData.requestedParentId,
          }}
          onChange={(v) =>
            onFormDataChange({
              ...formData,
              categoryId: v.categoryId,
              requestedCategory: v.requestedCategory,
              requestedParentId: v.requestedParentId,
            })
          }
          error={fieldErrors?.category}
        />

        <TagInput
          label={`Search Tags (${formData.searchTags.length}/5)`}
          helper="Add keywords that clients might search for. Press Enter to add (up to 5)."
          value={formData.searchTags}
          onChange={(v) => onFormDataChange({ ...formData, searchTags: v.slice(0, 5) })}
          placeholder="Type a keyword and press Enter"
        />

        <TextInput
          label="Location"
          value={formData.location}
          onChange={(v) => onFormDataChange({ ...formData, location: v })}
        />

        <div>
          <p className={editorLabel}>
            Service Description <span className={requiredMark}>*</span>
          </p>
          <RichTextEditor
            value={formData.description}
            onChange={(html) => onFormDataChange({ ...formData, description: html })}
            placeholder="Describe your service in detail. What will you deliver? What makes your service unique?"
            minHeight={150}
          />
        </div>
      </div>
    </div>
  );
}
