"use client";

import { css, cva } from "styled-system/css";

const rowCss = cva({
  base: { display: "flex", justifyContent: "space-between" },
  variants: { alignTop: { true: { alignItems: "flex-start" }, false: { alignItems: "center" } } },
});

const labelCss = cva({
  base: { lineHeight: 1.5 },
  variants: {
    strong: {
      true: { fontSize: "17px", fontWeight: 600, color: "ink" },
      false: { fontSize: "15px", fontWeight: 400, color: "ink2" },
    },
  },
});

const subCss = css({ fontSize: "11.5px", fontWeight: 500, letterSpacing: "0.02em", color: "ink2", lineHeight: 1.5 });

const valueCss = cva({
  base: { fontFamily: "mono", whiteSpace: "nowrap", lineHeight: 1.5 },
  variants: {
    strong: {
      true: { fontSize: "20px", fontWeight: 600, letterSpacing: "-0.02em" },
      false: { fontSize: "15px", fontWeight: 500, letterSpacing: "0" },
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
