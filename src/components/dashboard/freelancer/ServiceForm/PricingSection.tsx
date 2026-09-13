import { css, cva } from "styled-system/css";
import { ServiceFormData } from "../types";
import PricingTierCard from "./PricingTierCard";
import EarningsBreakdown from "./EarningsBreakdown";
import { useCommissionRate } from "@/hooks/useCommissionRate";

const sectionCard = css({
  bg: "surface",
  borderRadius: "card",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hairline",
  p: "32px",
});
const sectionTitle = css({ textStyle: "lead", fontWeight: 600, color: "ink" });
const sectionSub = cva({
  base: { textStyle: "micro" },
  variants: {
    invalid: {
      true: { color: "#ef4444", fontWeight: 600 },
      false: { color: "ink2", fontWeight: 400 },
    },
  },
});
const tierGrid = css({ display: "grid", gridTemplateColumns: { base: "1fr", md: "repeat(3, 1fr)" }, gap: "16px" });
const noteBox = css({ mt: "16px", p: "16px", bg: "rgba(37, 99, 235, 0.05)", borderRadius: "cardSm" });
const noteText = css({ textStyle: "micro", color: "rgb(29, 78, 216)" });

interface PricingSectionProps {
  formData: ServiceFormData;
  onFormDataChange: (data: ServiceFormData) => void;
  fieldErrors?: Record<string, string>;
  onClearTierError?: (key: string) => void;
}

export default function PricingSection({ formData, onFormDataChange, fieldErrors, onClearTierError }: PricingSectionProps) {
  const commissionRate = useCommissionRate();

  const handleTierChange = (tier: "basic" | "standard" | "premium", data: ServiceFormData["pricing"]["basic"]) => {
    onFormDataChange({
      ...formData,
      pricing: {
        ...formData.pricing,
        [tier]: data,
      },
    });
  };

  const handleTierToggle = (tier: "basic" | "standard" | "premium", enabled: boolean) => {
    onFormDataChange({
      ...formData,
      pricing: {
        ...formData.pricing,
        [tier]: { ...formData.pricing[tier], enabled },
      },
    });
  };

  return (
    <div id='svc-section-pricing' className={sectionCard}>
      <p className={sectionTitle}>Pricing Options</p>
      <p className={sectionSub({ invalid: !!fieldErrors?.noTier })}>
        {fieldErrors?.noTier || "Enable the tiers you want to offer. At least one tier is required."}
      </p>

      <div className={tierGrid}>
        {(["basic", "standard", "premium"] as const).map(tier => (
          <div key={tier} id={`svc-tier-${tier}`}>
            <PricingTierCard
              tier={tier}
              data={formData.pricing[tier]}
              onChange={data => handleTierChange(tier, data)}
              onToggle={enabled => handleTierToggle(tier, enabled)}
              errors={{
                price:    fieldErrors?.[`${tier}_price`],
                revisions: fieldErrors?.[`${tier}_revisions`],
                delivery: fieldErrors?.[`${tier}_delivery`],
              }}
              onClearError={(field) => onClearTierError?.(`${tier}_${field}`)}
              commissionRate={commissionRate}
            />
          </div>
        ))}
      </div>

      <div className={noteBox}>
        <p className={noteText}>
          <strong>Note:</strong> You can update pricing anytime, but edits to a live service go back to admin review and the
          listing is hidden until approved. Existing orders keep the exact price and details they were purchased with — only
          new orders use the updated pricing.
        </p>
      </div>

      {/* What the freelancer nets per tier — lives at the foot of the pricing card */}
      <EarningsBreakdown pricing={formData.pricing} />
    </div>
  );
}
