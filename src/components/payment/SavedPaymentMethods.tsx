import { css } from "styled-system/css";
import PayLogo, { type PayLogoId } from "./PayLogo";
import StatusChip from "./StatusChip";

/**
 * MOCK — saved payment methods, shown in Settings to demo how the feature would
 * work. The rows are hardcoded: nothing is stored yet and there is no API behind
 * this. Replace `METHODS` with real data (PayWay card-on-file tokens) before
 * go-live, or hide the section.
 */
const METHODS: { id: PayLogoId; name: string; sub: string; primary: boolean }[] = [
  { id: "khqr", name: "ABA KHQR", sub: "Default · scan to pay", primary: true },
  { id: "visa", name: "Visa ···· 4242", sub: "Expires 09/27", primary: false },
];

const list = css({ display: "flex", flexDirection: "column", gap: "10px" });
const row = css({
  display: "flex", alignItems: "center", gap: "12px", p: "12px",
  borderWidth: "1px", borderStyle: "solid", borderColor: "hairline", borderRadius: "cardSm",
});
const text = css({ flex: 1, minW: 0 });
const name = css({ textStyle: "body", fontWeight: 600 });
const sub = css({ textStyle: "micro", fontWeight: 500, color: "ink2" });

export default function SavedPaymentMethods() {
  return (
    <div className={list}>
      {METHODS.map(m => (
        <div key={m.id} className={row}>
          <PayLogo id={m.id} />
          <div className={text}>
            <p className={name}>{m.name}</p>
            <p className={sub}>{m.sub}</p>
          </div>
          {m.primary && <StatusChip status="neutral" dot={false}>Default</StatusChip>}
        </div>
      ))}
    </div>
  );
}
