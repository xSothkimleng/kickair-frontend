import { css } from "styled-system/css";
import { TextInput, Switch } from "@/components/ui/inputs";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { ServiceFormData } from "../types";

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
const panel = css({
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  pt: "16px",
  borderTopWidth: "1px",
  borderTopStyle: "solid",
  borderTopColor: "hairline",
});
const noteBox = css({ p: "16px", bg: "rgba(245, 158, 11, 0.05)", borderRadius: "cardSm" });
const noteText = css({ lineHeight: 1.5, fontSize: "11px", color: "pendingText" });
const halfGrid = css({ display: "grid", gridTemplateColumns: { base: "1fr", md: "repeat(2, 1fr)" }, gap: "16px" });
const fieldLabel = css({ lineHeight: 1.5, fontSize: "13px", fontWeight: 600, color: "ink" });
const fieldHint = css({ lineHeight: 1.5, fontSize: "11px", color: "ink2" });

interface CustomOrdersSectionProps {
  formData: ServiceFormData;
  onFormDataChange: (data: ServiceFormData) => void;
}

export default function CustomOrdersSection({ formData, onFormDataChange }: CustomOrdersSectionProps) {
  const { customOrders } = formData;

  const handleChange = (field: keyof typeof customOrders, value: string | boolean) => {
    onFormDataChange({
      ...formData,
      customOrders: { ...customOrders, [field]: value },
    });
  };

  return (
    <div className={sectionCard}>
      <div className={header}>
        <div>
          <p className={sectionTitle}>Custom Orders (Optional)</p>
          <p className={sectionSub}>
            Allow clients to request custom quotes with their own budget and requirements
          </p>
        </div>
        <Switch checked={customOrders.enabled} onChange={(c) => handleChange("enabled", c)} />
      </div>

      {customOrders.enabled && (
        <div className={panel}>
          <div className={noteBox}>
            <p className={noteText}>
              <strong>How it works:</strong> Clients can send you a custom order request with their budget and specific requirements.
              You can review and accept or decline each request.
            </p>
          </div>

          <div className={halfGrid}>
            <div>
              <TextInput
                size="sm"
                label="Minimum Budget (USD)"
                helper="Set a minimum project budget for custom orders"
                inputMode="decimal"
                value={customOrders.minimumBudget}
                onChange={(v) => handleChange("minimumBudget", v)}
                placeholder="100"
                startIcon="$"
              />
            </div>
          </div>

          <div>
            <p className={fieldLabel}>
              Instructions for Clients
            </p>
            <p className={fieldHint}>
              Tell clients what information they should provide in their custom order request
            </p>
            <RichTextEditor
              value={customOrders.customInstructions}
              onChange={(html) => handleChange("customInstructions", html)}
              placeholder="Please provide: project description, timeline expectations, budget range, any reference materials…"
              minHeight={120}
            />
          </div>
        </div>
      )}
    </div>
  );
}
