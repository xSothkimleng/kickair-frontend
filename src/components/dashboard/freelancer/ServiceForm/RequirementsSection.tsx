import { Box, Paper, Typography, Button } from "@mui/material";
import { AddOutlined, HelpOutlineOutlined } from "@mui/icons-material";
import { ServiceFormData, Requirement } from "../types";
import RequirementItem from "./RequirementItem";

interface RequirementsSectionProps {
  formData: ServiceFormData;
  onFormDataChange: (data: ServiceFormData) => void;
}

export default function RequirementsSection({ formData, onFormDataChange }: RequirementsSectionProps) {
  const handleAddRequirement = () => {
    onFormDataChange({
      ...formData,
      requirements: [...formData.requirements, { question: "", type: "text", required: false }],
    });
  };

  const handleRemoveRequirement = (index: number) => {
    onFormDataChange({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index),
    });
  };

  const handleRequirementChange = (index: number, requirement: Requirement) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = requirement;
    onFormDataChange({ ...formData, requirements: newRequirements });
  };

  return (
    <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 4 }}>
      <Box sx={{ display: "flex", alignItems: "start", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black", mb: 0.5 }}>Requirements (Optional)</Typography>
          <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>
            Questions for buyers to answer before ordering. Helps you gather necessary information.
          </Typography>
        </Box>
        <Button
          onClick={handleAddRequirement}
          startIcon={<AddOutlined sx={{ fontSize: 14 }} />}
          sx={{
            fontSize: 12,
            color: "rgba(0, 0, 0, 0.6)",
            textTransform: "none",
            "&:hover": {
              color: "black",
              bgcolor: "transparent",
            },
          }}>
          Add Question
        </Button>
      </Box>

      {formData.requirements.length > 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {formData.requirements.map((req, index) => (
            <RequirementItem
              key={index}
              requirement={req}
              onChange={requirement => handleRequirementChange(index, requirement)}
              onRemove={() => handleRemoveRequirement(index)}
            />
          ))}
        </Box>
      ) : (
        <Box sx={{ textAlign: "center", py: 4, bgcolor: "rgba(0, 0, 0, 0.02)", borderRadius: 3 }}>
          <HelpOutlineOutlined sx={{ fontSize: 32, color: "rgba(0, 0, 0, 0.2)", mb: 1 }} />
          <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)" }}>No requirements added yet</Typography>
        </Box>
      )}
    </Paper>
  );
}
