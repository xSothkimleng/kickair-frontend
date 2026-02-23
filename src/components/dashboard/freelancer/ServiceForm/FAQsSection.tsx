import { Box, Paper, Typography, Button } from "@mui/material";
import { AddOutlined, HelpOutlineOutlined } from "@mui/icons-material";
import { ServiceFormData, FAQ } from "../types";
import FAQItem from "./FAQItem";

interface FAQsSectionProps {
  formData: ServiceFormData;
  onFormDataChange: (data: ServiceFormData) => void;
}

const MAX_FAQS = 10;

export default function FAQsSection({ formData, onFormDataChange }: FAQsSectionProps) {
  const canAddMore = formData.faqs.length < MAX_FAQS;

  const handleAddFAQ = () => {
    if (!canAddMore) return;
    onFormDataChange({
      ...formData,
      faqs: [...formData.faqs, { question: "", answer: "" }],
    });
  };

  const handleRemoveFAQ = (index: number) => {
    onFormDataChange({
      ...formData,
      faqs: formData.faqs.filter((_, i) => i !== index),
    });
  };

  const handleFAQChange = (index: number, faq: FAQ) => {
    const newFaqs = [...formData.faqs];
    newFaqs[index] = faq;
    onFormDataChange({ ...formData, faqs: newFaqs });
  };

  return (
    <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 4 }}>
      <Box sx={{ display: "flex", alignItems: "start", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black", mb: 0.5 }}>
            Frequently Asked Questions
          </Typography>
          <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>
            Add common questions and answers to help clients understand your service better (optional)
          </Typography>
        </Box>
        {canAddMore && (
          <Button
            onClick={handleAddFAQ}
            startIcon={<AddOutlined sx={{ fontSize: 14 }} />}
            sx={{
              fontSize: 12,
              color: "black",
              textTransform: "none",
              border: "1px solid rgba(0, 0, 0, 0.1)",
              borderRadius: 2,
              px: 2,
              py: 0.75,
              "&:hover": {
                bgcolor: "rgba(0, 0, 0, 0.04)",
                border: "1px solid rgba(0, 0, 0, 0.2)",
              },
            }}>
            Add FAQ
          </Button>
        )}
      </Box>

      {formData.faqs.length > 0 ? (
        <>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {formData.faqs.map((faq, index) => (
              <FAQItem key={index} faq={faq} onChange={faq => handleFAQChange(index, faq)} onRemove={() => handleRemoveFAQ(index)} />
            ))}
          </Box>
          <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.4)" }}>
              {formData.faqs.length}/{MAX_FAQS} FAQs added
            </Typography>
            {canAddMore && (
              <Button
                onClick={handleAddFAQ}
                startIcon={<AddOutlined sx={{ fontSize: 14 }} />}
                sx={{
                  fontSize: 11,
                  color: "rgba(0, 0, 0, 0.6)",
                  textTransform: "none",
                  p: 0,
                  minWidth: "auto",
                  "&:hover": {
                    bgcolor: "transparent",
                    color: "black",
                  },
                }}>
                Add another
              </Button>
            )}
          </Box>
        </>
      ) : (
        <Box
          sx={{
            textAlign: "center",
            py: 4,
            bgcolor: "rgba(0, 0, 0, 0.02)",
            borderRadius: 3,
            border: "1px dashed rgba(0, 0, 0, 0.1)",
          }}>
          <HelpOutlineOutlined sx={{ fontSize: 32, color: "rgba(0, 0, 0, 0.15)", mb: 1 }} />
          <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.5)", mb: 0.5 }}>No FAQs added yet</Typography>
          <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.35)" }}>
            Click &quot;Add FAQ&quot; to help clients understand your service better
          </Typography>
        </Box>
      )}
    </Paper>
  );
}