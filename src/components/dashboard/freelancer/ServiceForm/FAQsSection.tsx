import { CircleHelp, Plus } from "lucide-react";
import { css } from "styled-system/css";
import { ServiceFormData, FAQ } from "../types";
import FAQItem from "./FAQItem";

const sectionCard = css({
  bg: "surface",
  borderRadius: "card",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hairline",
  p: "32px",
});
const header = css({ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: "24px" });
const sectionTitle = css({ lineHeight: 1.5, fontSize: "17px", fontWeight: 600, color: "ink" });
const sectionSub = css({ lineHeight: 1.5, fontSize: "11px", color: "ink2" });
/* MUI `Button` base metrics (500 weight, 1.75 line-height, 64px min-width, 6px/8px padding). */
const addBtn = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  boxSizing: "border-box",
  m: 0,
  p: "6px 16px",
  minW: "64px",
  borderRadius: "8px",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "rgba(0, 0, 0, 0.1)",
  bg: "transparent",
  color: "ink",
  fontFamily: "inherit",
  fontSize: "12px",
  fontWeight: 500,
  lineHeight: 1.75,
  cursor: "pointer",
  transition: "background-color .25s, border-color .25s",
  _hover: { bg: "rgba(0, 0, 0, 0.04)", borderColor: "rgba(0, 0, 0, 0.2)" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
  "& svg": { flexShrink: 0 },
});
const list = css({ display: "flex", flexDirection: "column", gap: "16px" });
const footer = css({ mt: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" });
const countText = css({ lineHeight: 1.5, fontSize: "11px", color: "ink3" });
const addMoreBtn = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  m: 0,
  p: 0,
  border: "none",
  bg: "transparent",
  color: "ink2",
  fontFamily: "inherit",
  fontSize: "11px",
  fontWeight: 500,
  lineHeight: 1.75,
  cursor: "pointer",
  transition: "color .25s",
  _hover: { color: "ink" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
  "& svg": { flexShrink: 0 },
});
const empty = css({
  textAlign: "center",
  py: "32px",
  bg: "rgba(0, 0, 0, 0.02)",
  borderRadius: "cardSm",
  borderWidth: "1px",
  borderStyle: "dashed",
  borderColor: "rgba(0, 0, 0, 0.1)",
});
const emptyIcon = css({ display: "inline-block", color: "rgba(0, 0, 0, 0.15)", mb: "8px" });
const emptyTitle = css({ lineHeight: 1.5, fontSize: "12px", color: "rgba(0, 0, 0, 0.5)" });
const emptySub = css({ lineHeight: 1.5, fontSize: "11px", color: "rgba(0, 0, 0, 0.35)" });

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
    <div className={sectionCard}>
      <div className={header}>
        <div>
          <p className={sectionTitle}>
            Frequently Asked Questions
          </p>
          <p className={sectionSub}>
            Add common questions and answers to help clients understand your service better (optional)
          </p>
        </div>
        {canAddMore && (
          <button type="button" onClick={handleAddFAQ} className={addBtn}>
            <Plus size={14} />
            Add FAQ
          </button>
        )}
      </div>

      {formData.faqs.length > 0 ? (
        <>
          <div className={list}>
            {formData.faqs.map((faq, index) => (
              <FAQItem key={index} faq={faq} onChange={faq => handleFAQChange(index, faq)} onRemove={() => handleRemoveFAQ(index)} />
            ))}
          </div>
          <div className={footer}>
            <p className={countText}>
              {formData.faqs.length}/{MAX_FAQS} FAQs added
            </p>
            {canAddMore && (
              <button type="button" onClick={handleAddFAQ} className={addMoreBtn}>
                <Plus size={14} />
                Add another
              </button>
            )}
          </div>
        </>
      ) : (
        <div className={empty}>
          <CircleHelp size={32} className={emptyIcon} />
          <p className={emptyTitle}>No FAQs added yet</p>
          <p className={emptySub}>
            Click &quot;Add FAQ&quot; to help clients understand your service better
          </p>
        </div>
      )}
    </div>
  );
}
