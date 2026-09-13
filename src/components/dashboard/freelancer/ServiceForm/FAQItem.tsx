import { X } from "lucide-react";
import { css } from "styled-system/css";
import { iconButton } from "@/components/ds";
import { TextInput, TextArea } from "@/components/ui/inputs";
import { FAQ } from "../types";

const itemBox = css({
  p: "20px",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hairline",
  borderRadius: "cardSm",
  bg: "rgba(0, 0, 0, 0.01)",
});
const row = css({ display: "flex", alignItems: "flex-start", gap: "12px" });
const fields = css({ flex: 1, display: "flex", flexDirection: "column", gap: "16px" });
const removeBtn = css(iconButton.raw({ shape: "square" }), {
  w: "32px",
  h: "32px",
  borderRadius: "8px",
  color: "ink3",
  bg: "rgba(0, 0, 0, 0.05)",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hairline",
  _hover: { color: "#ef4444", bg: "rgba(239, 68, 68, 0.08)", borderColor: "rgba(239, 68, 68, 0.2)" },
});

interface FAQItemProps {
  faq: FAQ;
  onChange: (faq: FAQ) => void;
  onRemove: () => void;
}

const MAX_QUESTION_LENGTH = 200;
const MAX_ANSWER_LENGTH = 500;

export default function FAQItem({ faq, onChange, onRemove }: FAQItemProps) {
  return (
    <div className={itemBox}>
      <div className={row}>
        <div className={fields}>
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
        </div>

        <button type="button" onClick={onRemove} aria-label="Remove FAQ" className={removeBtn}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
