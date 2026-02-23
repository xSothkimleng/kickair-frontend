import { Box, TextField, IconButton, Typography } from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";
import { FAQ, textFieldSx, textareaSx } from "../types";

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
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 500, color: "rgba(0, 0, 0, 0.7)" }}>Question</Typography>
              <Typography sx={{ fontSize: 10, color: "rgba(0, 0, 0, 0.4)" }}>
                {faq.question.length}/{MAX_QUESTION_LENGTH}
              </Typography>
            </Box>
            <TextField
              fullWidth
              value={faq.question}
              onChange={e => onChange({ ...faq, question: e.target.value.slice(0, MAX_QUESTION_LENGTH) })}
              placeholder="e.g., How many revisions do you offer?"
              sx={textFieldSx}
            />
          </Box>
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 500, color: "rgba(0, 0, 0, 0.7)" }}>Answer</Typography>
              <Typography sx={{ fontSize: 10, color: "rgba(0, 0, 0, 0.4)" }}>
                {faq.answer.length}/{MAX_ANSWER_LENGTH}
              </Typography>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={faq.answer}
              onChange={e => onChange({ ...faq, answer: e.target.value.slice(0, MAX_ANSWER_LENGTH) })}
              placeholder="Provide a clear and helpful answer..."
              sx={textareaSx}
            />
          </Box>
        </Box>

        <IconButton
          onClick={onRemove}
          sx={{
            p: 1,
            color: "rgba(0, 0, 0, 0.3)",
            borderRadius: 2,
            "&:hover": {
              color: "#ef4444",
              bgcolor: "rgba(239, 68, 68, 0.05)",
            },
          }}>
          <CloseOutlined sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    </Box>
  );
}