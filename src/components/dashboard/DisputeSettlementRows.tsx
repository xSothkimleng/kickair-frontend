import { css, cva } from "styled-system/css";
import type { DisputeSettlement } from "@/types/order";
import { MONEY, platformFee } from "@/lib/moneyTerms";

const listCss = css({ display: "flex", flexDirection: "column", gap: "6px", mt: "10px", mb: "10px", maxW: "360px" });
const rowCss = cva({
  base: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "16px" },
  variants: {
    total: {
      true: { pt: "6px", borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "hairline" },
      false: {},
    },
  },
});
const labelCss = cva({
  base: { textStyle: "ui" },
  variants: { total: { true: { color: "ink", fontWeight: 600 }, false: { color: "ink2" } } },
});
const valueCss = cva({
  base: { textStyle: "ui", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" },
  variants: { total: { true: { color: "ink", fontWeight: 600 }, false: { color: "ink" } } },
});

const usd = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

type Row = { label: string; value: string; total?: boolean };

/**
 * Who got what when a dispute ended — inside the resolved box on the order pages.
 * The client sees what came back; the freelancer sees their share, the platform fee
 * and what they receive.
 */
export default function DisputeSettlementRows({ settlement, viewer }: { settlement: DisputeSettlement; viewer: "client" | "freelancer" }) {
  const s = settlement;
  const pct = Math.round(s.commission_rate * 100);

  const rows: Row[] =
    viewer === "client"
      ? [
          { label: "Order total", value: usd(s.order_total) },
          { label: MONEY.releasedToFreelancer, value: s.freelancer_share > 0 ? `−${usd(s.freelancer_share)}` : usd(0) },
          { label: "Refunded to you", value: usd(s.client_refund), total: true },
        ]
      : [
          { label: "Order total", value: usd(s.order_total) },
          { label: MONEY.refundedToClient, value: s.client_refund > 0 ? `−${usd(s.client_refund)}` : usd(0) },
          { label: "Your share", value: usd(s.freelancer_share) },
          { label: platformFee(pct), value: s.platform_fee > 0 ? `−${usd(s.platform_fee)}` : usd(0) },
          { label: MONEY.youReceive, value: usd(s.freelancer_receives), total: true },
        ];

  return (
    <div className={listCss}>
      {rows.map((r) => (
        <div key={r.label} className={rowCss({ total: !!r.total })}>
          <span className={labelCss({ total: !!r.total })}>{r.label}</span>
          <span className={valueCss({ total: !!r.total })}>{r.value}</span>
        </div>
      ))}
    </div>
  );
}
