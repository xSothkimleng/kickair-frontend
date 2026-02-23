"use client";

import { Box, Button } from "@mui/material";
import ServiceCard from "./ServiceCard";
import { Service } from "@/types/service";

interface ServiceGridProps {
  services: Service[];
  searchQuery?: string;
  clearAllFilters: () => void;
}

export default function ServiceGrid({ services, searchQuery, clearAllFilters }: ServiceGridProps) {
  if (services.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 10 }}>
        <Box sx={{ fontSize: 15, color: "rgba(0, 0, 0, 0.6)", mb: 2 }}>
          {searchQuery ? `No results found for "${searchQuery}".` : "No services found matching your filters."}
        </Box>
        <Button
          onClick={clearAllFilters}
          variant='outlined'
          sx={{
            px: 3,
            height: 40,
            fontSize: 13,
            color: "black",
            bgcolor: "white",
            border: "1px solid rgba(0, 0, 0, 0.1)",
            borderRadius: 25,
            textTransform: "none",
            "&:hover": {
              border: "1px solid rgba(0, 0, 0, 0.2)",
              bgcolor: "white",
            },
          }}>
          Clear Filters
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: 800 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          },
          gap: 3,
        }}>
        {services.map(service => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </Box>
    </Box>
  );
}