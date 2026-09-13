import { css, cva } from "styled-system/css";
import { ServiceFormData } from "../types";
import { useCommissionRate } from "@/hooks/useCommissionRate";

const wrap = css({ mt: "24px", pt: "24px", borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "hairline" });
const title = css({ lineHeight: 1.5, fontSize: "14px", fontWeight: 600, color: "ink" });
const sub = css({ lineHeight: 1.5, fontSize: "11px", color: "ink2" });
/* One column per enabled tier from `sm` up — the count is dynamic, so it has to be a recipe. */
const tierGrid = cva({
  base: { display: "grid", gap: "12px", gridTemplateColumns: "1fr" },
  variants: {
    cols: {
      one: { sm: { gridTemplateColumns: "repeat(1, 1fr)" } },
      two: { sm: { gridTemplateColumns: "repeat(2, 1fr)" } },
      three: { sm: { gridTemplateColumns: "repeat(3, 1fr)" } },
    },
  },
  defaultVariants: { cols: "one" },
});
const COLS = ["one", "one", "two", "three"] as const;
const tierBox = css({ p: "16px", borderWidth: "1px", borderStyle: "solid", borderColor: "hairline", borderRadius: "cardSm" });
const tierName = css({ lineHeight: 1.5, fontSize: "12px", fontWeight: 700, textTransform: "capitalize" });
const rows = css({ display: "flex", flexDirection: "column", gap: "6px" });
const row = css({ display: "flex", justifyContent: "space-between" });
const rowLabel = css({ lineHeight: 1.5, fontSize: "12.5px", color: "ink2" });
const rowValue = css({ lineHeight: 1.5, fontSize: "12.5px", fontFamily: "monospace", fontWeight: 600 });
const feeValue = css({ lineHeight: 1.5, fontSize: "12.5px", fontFamily: "monospace", fontWeight: 600, color: "#B45309" });
const rule = css({ height: "1px", bg: "hairline", my: "2px" });
const netLabel = css({ lineHeight: 1.5, fontSize: "12.5px", fontWeight: 700 });
const netValue = css({ lineHeight: 1.5, fontSize: "13px", fontFamily: "monospace", fontWeight: 700, color: "#166534" });

/**
 * The transparent price breakdown at the foot of the Pricing Options card:
 * for each enabled tier — what the client pays, KickAir's commission, and
 * what actually lands in the freelancer's wallet.
 */
export default function EarningsBreakdown({ pricing }: { pricing: ServiceFormData["pricing"] }) {
  const rate = useCommissionRate();

  const tiers = (["basic", "standard", "premium"] as const)
    .filter(t => pricing[t].enabled && parseFloat(pricing[t].price) > 0)
    .map(t => ({ tier: t, price: parseFloat(pricing[t].price) }));

  if (rate == null || tiers.length === 0) return null;

  return (
    <div className={wrap}>
      <p className={title}>Your earnings per order</p>
      <p className={sub}>
        Clients always pay your exact price — KickAir&apos;s {Math.round(rate * 100)}% commission comes out of your side.
      </p>

      <div className={tierGrid({ cols: COLS[tiers.length] })}>
        {tiers.map(({ tier, price }) => {
          const commission = price * rate;
          const net = price - commission;
          return (
            <div key={tier} className={tierBox}>
              <p className={tierName}>{tier}</p>
              <div className={rows}>
                <div className={row}>
                  <p className={rowLabel}>Client pays</p>
                  <p className={rowValue}>${price.toFixed(2)}</p>
                </div>
                <div className={row}>
                  <p className={rowLabel}>Platform fee ({Math.round(rate * 100)}%)</p>
                  <p className={feeValue}>−${commission.toFixed(2)}</p>
                </div>
                <div className={rule} />
                <div className={row}>
                  <p className={netLabel}>You receive</p>
                  <p className={netValue}>${net.toFixed(2)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
