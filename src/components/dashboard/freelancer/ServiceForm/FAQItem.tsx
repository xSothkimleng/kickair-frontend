import { Box, IconButton } from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";
import { TextInput, TextArea } from "@/components/ui/inputs";
import { FAQ } from "../types";

interface FAQItemProps {
  faq: FAQ;
  onChange: (faq: FAQ) => void;
  onRemove: () => void;
}

const MAX_QUESTION_LENGTH = 200;
const MAX_ANSWER_LENGTH = 500;

export default function FAQItem({ faq, onChange, onRemove }: FAQItemProps) {
  return (
    <Box sx={{ p: 2.5, border: "1px solid rgba(0, 0, 0, 0.08)", borderRadius: 3, bgcolor: "rgba(0, 0, 0, 0.01)" }}>
      <Box sx={{ display: "flex", alignItems: "start", gap: 1.5 }}>
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextInput
            label="Question"
            helper={`${faq.question.length}/${MAX_QUESTION_LENGTH}`}
            value={faq.question}
            onChange={(v) => onChange({ ...faq, question: v.slice(0, MAX_QUESTION_LENGTH) })}
            placeholder="e.g., How many revisions do you offer?"
          />
          <TextArea
            label="Answer"
            value={faq.answer}
            onChange={(v) => onChange({ ...faq, answer: v })}
            placeholder="Provide a clear and helpful answer…"
            minRows={3}
            maxLength={MAX_ANSWER_LENGTH}
          />
        </Box>

        <IconButton
          onClick={onRemove}
          sx={{ p: 1, color: "rgba(0, 0, 0, 0.3)", borderRadius: 2, "&:hover": { color: "#ef4444", bgcolor: "rgba(239, 68, 68, 0.05)" } }}>
          <CloseOutlined sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    </Box>
  );
}
