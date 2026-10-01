import { css, cva } from "styled-system/css";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { CurrencyInput, TextInput, Switch } from "@/components/ui/inputs";
import { PricingTier } from "../types";

const tierCard = cva({
  base: { p: "16px", borderWidth: "1px", borderStyle: "solid", borderRadius: "cardSm", transition: "all 0.2s" },
  variants: {
    off: {
      true: { borderColor: "rgba(0, 0, 0, 0.06)", bg: "rgba(0, 0, 0, 0.02)" },
      false: { borderColor: "rgba(0, 0, 0, 0.1)", bg: "white" },
    },
  },
});
const header = cva({
  base: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  variants: { off: { true: { mb: 0 }, false: { mb: "16px" } } },
});
const tierName = cva({
  base: { textStyle: "ui", fontWeight: 600, textTransform: "capitalize" },
  variants: { off: { true: { color: "ink3" }, false: { color: "ink" } } },
});
const body = css({ display: "flex", flexDirection: "column", gap: "12px" });
const editorLabel = css({ textStyle: "ui", fontWeight: 500, color: "body" });
const optionalMark = css({ color: "ink3" });

/** Shown greyed-out in an empty Name field, and saved as the tier's name when it is left empty. */
export const DEFAULT_TIER_NAME = { basic: "Basic", standard: "Standard", premium: "Premium" } as const;

interface PricingTierCardProps {
  tier: "basic" | "standard" | "premium";
  data: PricingTier;
  onChange: (data: PricingTier) => void;
  onToggle: (enabled: boolean) => void;
  errors?: { price?: string; revisions?: string; delivery?: string };
  onClearError?: (field: "price" | "revisions" | "delivery") => void;
}

export default function PricingTierCard({ tier, data, onChange, onToggle, errors, onClearError }: PricingTierCardProps) {
  const disabled = !data.enabled;

  return (
    <div className={tierCard({ off: disabled })}>
      <div className={header({ off: disabled })}>
        <p className={tierName({ off: disabled })}>
          {tier}
        </p>
        <Switch checked={data.enabled} onChange={onToggle} />
      </div>

      {!disabled && (
        <div className={body}>
          <TextInput size="sm" label="Name" value={data.name} onChange={(v) => onChange({ ...data, name: v })} placeholder={DEFAULT_TIER_NAME[tier]} />

          <div>
            <p className={editorLabel}>
              Description <span className={optionalMark}>(optional)</span>
            </p>
            <RichTextEditor value={data.description} onChange={(html) => onChange({ ...data, description: html })} placeholder="What's included?" minHeight={80} />
          </div>

          <TextInput
            size="sm"
            label="Revisions"
            required
            value={data.revisions}
            onChange={(v) => { onChange({ ...data, revisions: v }); onClearError?.("revisions"); }}
            placeholder="e.g., 3 or Unlimited"
            error={errors?.revisions}
          />

          <TextInput
            size="sm"
            label="Delivery Time (days)"
            required
            inputMode="numeric"
            value={data.deliveryTime}
            onChange={(v) => { onChange({ ...data, deliveryTime: v.replace(/[^0-9]/g, "").slice(0, 3) }); onClearError?.("delivery"); }}
            error={errors?.delivery}
          />

          <CurrencyInput
            size="sm"
            label="Price (USD)"
            required
            value={data.price}
            onChange={(v) => { onChange({ ...data, price: v }); onClearError?.("price"); }}
            error={errors?.price}
          />
        </div>
      )}
    </div>
  );
}
