import { Box, Paper, Typography, Grid } from "@mui/material";
import { TextInput, Checkbox, Switch } from "@/components/ui/inputs";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { ServiceFormData } from "../types";

interface CustomOrdersSectionProps {
  formData: ServiceFormData;
  onFormDataChange: (data: ServiceFormData) => void;
}

export default function CustomOrdersSection({ formData, onFormDataChange }: CustomOrdersSectionProps) {
  const { customOrders } = formData;

  const handleChange = (field: keyof typeof customOrders, value: string | boolean) => {
    onFormDataChange({
      ...formData,
      customOrders: { ...customOrders, [field]: value },
    });
  };

  return (
    <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 4 }}>
      <Box sx={{ display: "flex", alignItems: "start", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black", mb: 0.5 }}>Custom Orders (Optional)</Typography>
          <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>
            Allow clients to request custom quotes with their own budget and requirements
          </Typography>
        </Box>
        <Switch checked={customOrders.enabled} onChange={(c) => handleChange("enabled", c)} />
      </Box>

      {customOrders.enabled && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2, borderTop: "1px solid rgba(0, 0, 0, 0.08)" }}>
          <Box sx={{ p: 2, bgcolor: "rgba(245, 158, 11, 0.05)", borderRadius: 3 }}>
            <Typography sx={{ fontSize: 11, color: "#b45309" }}>
              <strong>How it works:</strong> Clients can send you a custom order request with their budget and specific requirements.
              You can review and accept or decline each request.
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ mb: 1.5 }}>
                <Checkbox
                  checked={customOrders.acceptHourlyRate}
                  onChange={(c) => handleChange("acceptHourlyRate", c)}
                  label="Accept hourly rate projects"
                />
              </Box>

              {customOrders.acceptHourlyRate && (
                <TextInput
                  size="sm"
                  label="Hourly Rate (USD/hour)"
                  required
                  inputMode="decimal"
                  value={customOrders.hourlyRate}
                  onChange={(v) => handleChange("hourlyRate", v)}
                  placeholder="50"
                  startIcon="$"
                  endIcon="/hour"
                />
              )}
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextInput
                size="sm"
                label="Minimum Budget (USD)"
                helper="Set a minimum project budget for custom orders"
                inputMode="decimal"
                value={customOrders.minimumBudget}
                onChange={(v) => handleChange("minimumBudget", v)}
                placeholder="100"
                startIcon="$"
              />
            </Grid>
          </Grid>

          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "black", mb: 0.5 }}>
              Instructions for Clients
            </Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.6)", mb: 1 }}>
              Tell clients what information they should provide in their custom order request
            </Typography>
            <RichTextEditor
              value={customOrders.customInstructions}
              onChange={(html) => handleChange("customInstructions", html)}
              placeholder="Please provide: project description, timeline expectations, budget range, any reference materials…"
              minHeight={120}
            />
          </Box>
        </Box>
      )}
    </Paper>
  );
}
