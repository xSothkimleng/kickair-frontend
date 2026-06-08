"use client";

import { Box, Typography } from "@mui/material";
import { tokens } from "@/theme";

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
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: sub ? "flex-start" : "center" }}>
      <Box>
        <Typography sx={{ fontSize: strong ? 17 : 15, fontWeight: strong ? 600 : 400, color: strong ? tokens.text : tokens.text2 }}>
          {label}
        </Typography>
        {sub && (
          <Typography sx={{ fontSize: 11.5, fontWeight: 500, letterSpacing: "0.02em", color: tokens.text2 }}>{sub}</Typography>
        )}
      </Box>
      <Typography
        sx={{
          fontFamily: tokens.mono,
          fontSize: strong ? 20 : 15,
          fontWeight: strong ? 600 : 500,
          letterSpacing: strong ? "-0.02em" : 0,
          whiteSpace: "nowrap",
        }}>
        {value}
      </Typography>
    </Box>
  );
}
