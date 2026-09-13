import { CircleHelp, Plus } from "lucide-react";
import { css } from "styled-system/css";
import { ServiceFormData, Requirement } from "../types";
import RequirementItem from "./RequirementItem";

const sectionCard = css({
  bg: "surface",
  borderRadius: "card",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hairline",
  p: "32px",
});
const header = css({ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: "24px" });
const sectionTitle = css({ lineHeight: 1.5, fontSize: "17px", fontWeight: 600, color: "ink" });
const sectionSub = css({ lineHeight: 1.5, fontSize: "11px", color: "ink2" });
/* MUI text `Button` base metrics (500 weight, 1.75 line-height, 64px min-width, 6px/8px padding). */
const addBtn = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  boxSizing: "border-box",
  m: 0,
  p: "6px 8px",
  minW: "64px",
  border: "none",
  borderRadius: "4px",
  bg: "transparent",
  color: "ink2",
  fontFamily: "inherit",
  fontSize: "12px",
  fontWeight: 500,
  lineHeight: 1.75,
  cursor: "pointer",
  transition: "color .25s",
  _hover: { color: "ink", bg: "transparent" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
  "& svg": { flexShrink: 0 },
});
const list = css({ display: "flex", flexDirection: "column", gap: "16px" });
const empty = css({ textAlign: "center", py: "32px", bg: "rgba(0, 0, 0, 0.02)", borderRadius: "cardSm" });
const emptyIcon = css({ display: "inline-block", color: "rgba(0, 0, 0, 0.2)", mb: "8px" });
const emptyText = css({ lineHeight: 1.5, fontSize: "12px", color: "ink2" });

interface RequirementsSectionProps {
  formData: ServiceFormData;
  onFormDataChange: (data: ServiceFormData) => void;
}

export default function RequirementsSection({ formData, onFormDataChange }: RequirementsSectionProps) {
  const handleAddRequirement = () => {
    onFormDataChange({
      ...formData,
      requirements: [...formData.requirements, { question: "", type: "text", required: false }],
    });
  };

  const handleRemoveRequirement = (index: number) => {
    onFormDataChange({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index),
    });
  };

  const handleRequirementChange = (index: number, requirement: Requirement) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = requirement;
    onFormDataChange({ ...formData, requirements: newRequirements });
  };

  return (
    <div className={sectionCard}>
      <div className={header}>
        <div>
          <p className={sectionTitle}>Requirements (Optional)</p>
          <p className={sectionSub}>
            Questions for clients to answer before ordering. Helps you gather necessary information.
          </p>
        </div>
        <button type="button" onClick={handleAddRequirement} className={addBtn}>
          <Plus size={14} />
          Add Question
        </button>
      </div>

      {formData.requirements.length > 0 ? (
        <div className={list}>
          {formData.requirements.map((req, index) => (
            <RequirementItem
              key={index}
              requirement={req}
              onChange={requirement => handleRequirementChange(index, requirement)}
              onRemove={() => handleRemoveRequirement(index)}
            />
          ))}
        </div>
      ) : (
        <div className={empty}>
          <CircleHelp size={32} className={emptyIcon} />
          <p className={emptyText}>No requirements added yet</p>
        </div>
      )}
    </div>
  );
}
