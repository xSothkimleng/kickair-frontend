import { Box, Typography, IconButton } from "@mui/material";
import { EditOutlined, VisibilityOutlined, DeleteOutlined } from "@mui/icons-material";
import { Service } from "@/types/service";

interface ServiceCardProps {
  service: Service;
  onEdit: () => void;
  onView?: () => void;
  onDelete?: () => void;
}

export default function ServiceCard({ service, onEdit, onView, onDelete }: ServiceCardProps) {
  // Get price range from pricing options
  const prices = service.pricing_options?.map(opt => parseFloat(opt.price)) || [];
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  return (
    <Box
      sx={{
        p: 2,
        border: "1px solid rgba(0, 0, 0, 0.1)",
        borderRadius: 3,
        transition: "border-color 0.3s",
        "&:hover": {
          borderColor: "rgba(0, 0, 0, 0.2)",
        },
      }}>
      <Box sx={{ display: "flex", alignItems: "start", justifyContent: "space-between" }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 500, color: "black", mb: 0.5 }}>{service.title}</Typography>
          <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 1.5 }}>{service.category?.name || "Uncategorized"}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>{service.orders_count} orders</Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>•</Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>
              ${minPrice} - ${maxPrice}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            onClick={onEdit}
            sx={{
              p: 1,
              color: "rgba(0, 0, 0, 0.6)",
              borderRadius: 2,
              "&:hover": {
                color: "black",
                bgcolor: "rgba(0, 0, 0, 0.05)",
              },
            }}>
            <EditOutlined sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton
            onClick={onView}
            sx={{
              p: 1,
              color: "rgba(0, 0, 0, 0.6)",
              borderRadius: 2,
              "&:hover": {
                color: "black",
                bgcolor: "rgba(0, 0, 0, 0.05)",
              },
            }}>
            <VisibilityOutlined sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton
            onClick={onDelete}
            sx={{
              p: 1,
              color: "rgba(239, 68, 68, 0.6)",
              borderRadius: 2,
              "&:hover": {
                color: "#ef4444",
                bgcolor: "rgba(239, 68, 68, 0.05)",
              },
            }}>
            <DeleteOutlined sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
