/** USD money formatter shared across payment surfaces — always 2 decimals. */
export function fmtUsd(n: number | string): string {
  const v = typeof n === "string" ? parseFloat(n) : n;
  return (
    "$" +
    (Number.isFinite(v) ? v : 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}
