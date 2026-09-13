"use client";

import { css } from "styled-system/css";
import ServiceCard from "./ServiceCard";
import ServiceListCard from "./ServiceListCard";
import { Service } from "@/types/service";

interface ServiceGridProps {
  services: Service[];
  searchQuery?: string;
  clearAllFilters: () => void;
  view?: "grid" | "list";
}

const emptyWrapCss = css({ textAlign: "center", py: "80px" });
const emptyTextCss = css({ fontSize: "15px", color: "ink2", mb: "16px" });
const clearBtnCss = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  px: "24px",
  h: "40px",
  m: 0,
  bg: "white",
  color: "ink",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "rgba(0, 0, 0, 0.1)",
  borderRadius: "100px",
  fontFamily: "inherit",
  fontSize: "13px",
  fontWeight: 500,
  lineHeight: 1.75,
  letterSpacing: "0.02857em",
  cursor: "pointer",
  transition: "border-color .25s",
  _hover: { borderColor: "rgba(0, 0, 0, 0.2)", bg: "white" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
});

const listCss = css({ display: "flex", flexDirection: "column", gap: "12px" });
const gridWrapCss = css({ minH: "800px" });
const gridCss = css({
  display: "grid",
  gridTemplateColumns: { base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
  gap: "24px",
});

export default function ServiceGrid({ services, searchQuery, clearAllFilters, view = "grid" }: ServiceGridProps) {
  if (services.length === 0) {
    return (
      <div className={emptyWrapCss}>
        <div className={emptyTextCss}>
          {searchQuery ? `No results found for "${searchQuery}".` : "No services found matching your filters."}
        </div>
        <button type="button" onClick={clearAllFilters} className={clearBtnCss}>
          Clear Filters
        </button>
      </div>
    );
  }

  if (view === "list") {
    return (
      <div className={listCss}>
        {services.map(service => (
          <ServiceListCard key={service.id} service={service} />
        ))}
      </div>
    );
  }

  return (
    <div className={gridWrapCss}>
      <div className={gridCss}>
        {services.map(service => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}
