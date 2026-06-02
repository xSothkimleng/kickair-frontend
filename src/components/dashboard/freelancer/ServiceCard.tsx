import { Box, Typography, IconButton, Chip, Button } from "@mui/material";
import { EditOutlined, VisibilityOutlined, DeleteOutlined, InfoOutlined, ReplayOutlined } from "@mui/icons-material";
import { Service } from "@/types/service";

interface ServiceCardProps {
  service: Service;
  onEdit: () => void;
  onView?: () => void;
  onDelete?: () => void;
}

const STATUS_CONFIG: Record<Service["status"], { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "#16a34a", bg: "rgba(22, 163, 74, 0.1)" },
  pending_review: { label: "Pending review", color: "#b45309", bg: "rgba(217, 119, 6, 0.12)" },
  rejected: { label: "Rejected", color: "#dc2626", bg: "rgba(220, 38, 38, 0.1)" },
  draft: { label: "Draft", color: "#b45309", bg: "rgba(245, 158, 11, 0.1)" },
  disabled: { label: "Disabled", color: "#dc2626", bg: "rgba(220, 38, 38, 0.1)" },
};

export default function ServiceCard({ service, onEdit, onView, onDelete }: ServiceCardProps) {
  // Get price range from pricing options
  const prices = service.pricing_options?.map(opt => parseFloat(opt.price)) || [];
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const status = STATUS_CONFIG[service.status] ?? STATUS_CONFIG.active;

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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5, flexWrap: "wrap" }}>
            <Typography sx={{ fontSize: 15, fontWeight: 500, color: "black" }}>{service.title}</Typography>
            <Chip
              label={status.label}
              size="small"
              sx={{ height: 20, fontSize: 11, fontWeight: 600, color: status.color, bgcolor: status.bg, "& .MuiChip-label": { px: 1 } }}
            />
          </Box>
          <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 1.5 }}>{service.category?.category_name || "Uncategorized"}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>{service.orders_count} orders</Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>•</Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>
              ${minPrice} - ${maxPrice}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {service.status === "rejected" ? (
            <Button
              onClick={onEdit}
              startIcon={<ReplayOutlined sx={{ fontSize: 16 }} />}
              sx={{
                px: 1.5,
                height: 32,
                fontSize: 12,
                fontWeight: 500,
                color: "white",
                bgcolor: "black",
                borderRadius: 2,
                textTransform: "none",
                "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
              }}>
              Resubmit
            </Button>
          ) : (
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
          )}
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

      {service.status === "rejected" && (
        <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 2, bgcolor: "rgba(220, 38, 38, 0.06)", display: "flex", gap: 1, alignItems: "flex-start" }}>
          <InfoOutlined sx={{ fontSize: 16, color: "#dc2626", mt: "1px" }} />
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#dc2626" }}>
              Rejected by admin
            </Typography>
            <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.7)" }}>
              {service.rejection_reason || "No reason provided. Use Resubmit to send it for review again."}
            </Typography>
          </Box>
        </Box>
      )}

      {service.status === "disabled" && (
        <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 2, bgcolor: "rgba(220, 38, 38, 0.06)", display: "flex", gap: 1, alignItems: "flex-start" }}>
          <InfoOutlined sx={{ fontSize: 16, color: "#dc2626", mt: "1px" }} />
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#dc2626" }}>
              Disabled by admin
            </Typography>
            <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.7)" }}>
              {service.rejection_reason || "This service has been taken down. Contact support for details."}
            </Typography>
          </Box>
        </Box>
      )}

      {service.status === "pending_review" && (
        <Typography sx={{ mt: 1, fontSize: 12, color: "#b45309" }}>
          Awaiting admin approval — not visible to the public yet.
        </Typography>
      )}
    </Box>
  );
}
