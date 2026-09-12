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
  base: { fontSize: "13px", fontWeight: 600, lineHeight: 1.5, textTransform: "capitalize" },
  variants: { off: { true: { color: "rgba(0, 0, 0, 0.3)" }, false: { color: "ink" } } },
});
const body = css({ display: "flex", flexDirection: "column", gap: "12px" });
const editorLabel = css({ lineHeight: 1.5, fontSize: "13px", fontWeight: 500, color: "body" });
const optionalMark = css({ color: "ink3" });
const earnings = css({
  p: "8px 12px",
  bg: "rgba(22,163,74,0.06)",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "rgba(22,163,74,0.15)",
  borderRadius: "8px",
});
const earningsText = css({ lineHeight: 1.5, fontSize: "12.5px", color: "#166534" });
const earningsAmount = css({ fontWeight: 700 });

interface PricingTierCardProps {
  tier: "basic" | "standard" | "premium";
  data: PricingTier;
  onChange: (data: PricingTier) => void;
  onToggle: (enabled: boolean) => void;
  errors?: { price?: string; revisions?: string; delivery?: string };
  onClearError?: (field: "price" | "revisions" | "delivery") => void;
  /** Platform commission rate (0.2 = 20%); null while loading. */
  commissionRate?: number | null;
}

export default function PricingTierCard({ tier, data, onChange, onToggle, errors, onClearError, commissionRate }: PricingTierCardProps) {
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
          <TextInput size="sm" label="Name" value={data.name} onChange={(v) => onChange({ ...data, name: v })} />

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
            onChange={(v) => { onChange({ ...data, deliveryTime: v }); onClearError?.("delivery"); }}
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

          {/* Live earnings preview — the seller-side commission, shown before posting */}
          {commissionRate != null && parseFloat(data.price) > 0 && (
            <div className={earnings}>
              <p className={earningsText}>
                You&apos;ll receive{" "}
                <span className={earningsAmount}>
                  ${(parseFloat(data.price) * (1 - commissionRate)).toFixed(2)}
                </span>
                {" "}· after the {Math.round(commissionRate * 100)}% platform fee
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
