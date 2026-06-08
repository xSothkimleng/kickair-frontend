"use client";

/**
 * Deterministic pseudo-QR matrix — a placeholder visual only, NOT a scannable
 * code. The real KHQR/Alipay/WeChat QR is rendered by ABA PayWay's hosted page.
 */
export default function QrGlyph({ color = "#111", size = 150 }: { color?: string; size?: number }) {
  const N = 21;
  const seed = (x: number, y: number) => ((x * 7 + y * 13 + x * y * 3) % 5) < 2;
  const finder = (x: number, y: number) => (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);

  const cells: React.ReactNode[] = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (finder(x, y)) continue;
      if (seed(x, y)) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width='1' height='1' fill={color} />);
    }
  }

  const Finder = ({ tx, ty }: { tx: number; ty: number }) => (
    <g transform={`translate(${tx},${ty})`}>
      <rect x='0' y='0' width='7' height='7' fill={color} />
      <rect x='1' y='1' width='5' height='5' fill='#fff' />
      <rect x='2' y='2' width='3' height='3' fill={color} />
    </g>
  );

  return (
    <svg width={size} height={size} viewBox='0 0 21 21' shapeRendering='crispEdges'>
      <rect width='21' height='21' fill='#fff' />
      {cells}
      <Finder tx={0} ty={0} />
      <Finder tx={14} ty={0} />
      <Finder tx={0} ty={14} />
    </svg>
  );
}
