"use client";

import { css, cva } from "styled-system/css";

const rowCss = cva({
  base: { display: "flex", justifyContent: "space-between" },
  variants: { alignTop: { true: { alignItems: "flex-start" }, false: { alignItems: "center" } } },
});

const labelCss = cva({
  base: {},
  variants: {
    strong: {
      true: { textStyle: "lead", fontWeight: 600, color: "ink" },
      false: { textStyle: "body", fontWeight: 400, color: "ink2" },
    },
  },
});

const subCss = css({ textStyle: "micro", fontWeight: 500, color: "ink2" });

const valueCss = cva({
  base: { fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" },
  variants: {
    strong: {
      true: { textStyle: "title", fontWeight: 600 },
      false: { textStyle: "body", fontWeight: 500 },
    },
  },
});

/** Order-summary price line. `strong` for the Total row. */
export default function PriceRow({
  label,
  sub,
  value,
  strong,
}: {
  label: string;
  sub?: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className={rowCss({ alignTop: !!sub })}>
      <div>
        <p className={labelCss({ strong: !!strong })}>{label}</p>
        {sub && <p className={subCss}>{sub}</p>}
      </div>
      <p className={valueCss({ strong: !!strong })}>{value}</p>
    </div>
  );
}
