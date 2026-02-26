export const dropdownPanelSx = {
  position: "absolute" as const,
  top: "100%",
  mt: 0,
  backgroundColor: "white",
  borderRadius: "16px",
  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
  overflow: "hidden",
  border: "1px solid rgba(0,0,0,0.08)",
  zIndex: 1000,
};

export const dropdownItemSx = {
  width: "100%",
  textAlign: "left" as const,
  display: "flex",
  flexDirection: "row" as const,
  alignItems: "flex-start" as const,
  justifyContent: "flex-start" as const,
  gap: 1.5,
  p: 2,
  borderRadius: "12px",
  textTransform: "none" as const,
  color: "black",
  "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
  "& .MuiSvgIcon-root": { transition: "color 0.2s" },
  "&:hover .MuiSvgIcon-root": { color: "black" },
};

export const navBtnSx = {
  textTransform: "none" as const,
  fontSize: 14,
  color: "rgba(0,0,0,0.8)",
  "&:hover": { backgroundColor: "transparent", color: "black" },
};
