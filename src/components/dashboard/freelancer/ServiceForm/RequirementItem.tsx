import { X } from "lucide-react";
import { css } from "styled-system/css";
import { iconButton } from "@/components/ds";
import { Checkbox, SelectInput, TextInput } from "@/components/ui/inputs";
import { Requirement } from "../types";

const itemBox = css({ p: "16px", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(0, 0, 0, 0.1)", borderRadius: "cardSm" });
const row = css({ display: "flex", alignItems: "flex-start", gap: "12px" });
const fields = css({ flex: 1, display: "flex", flexDirection: "column", gap: "12px" });
const controls = css({ display: "flex", alignItems: "center", gap: "12px" });
const typeSelect = css({ minW: "160px" });
const checkboxLabel = css({ lineHeight: 1.5, fontSize: "12px", color: "ink2" });
const removeBtn = css(iconButton.raw({ shape: "square" }), {
  w: "32px",
  h: "32px",
  borderRadius: "8px",
  color: "rgba(239, 68, 68, 0.6)",
  _hover: { color: "#ef4444", bg: "rgba(239, 68, 68, 0.05)" },
});

const TYPE_OPTIONS = [
  { value: "text", label: "Free Text" },
  { value: "multiple", label: "Multiple Choice" },
  { value: "attachment", label: "Attachment" },
];

interface RequirementItemProps {
  requirement: Requirement;
  onChange: (requirement: Requirement) => void;
  onRemove: () => void;
}

export default function RequirementItem({ requirement, onChange, onRemove }: RequirementItemProps) {
  return (
    <div className={itemBox}>
      <div className={row}>
        <div className={fields}>
          <TextInput
            size="sm"
            value={requirement.question}
            onChange={v => onChange({ ...requirement, question: v })}
            placeholder="Enter your question"
          />

          <div className={controls}>
            <SelectInput
              size="sm"
              fullWidth={false}
              className={typeSelect}
              options={TYPE_OPTIONS}
              value={requirement.type}
              onChange={v => onChange({ ...requirement, type: String(v) })}
            />

            <Checkbox
              checked={requirement.required}
              onChange={c => onChange({ ...requirement, required: c })}
              label={<span className={checkboxLabel}>Required</span>}
            />
          </div>
        </div>

        <button type="button" onClick={onRemove} aria-label="Remove requirement" className={removeBtn}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
