"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { css } from "styled-system/css";
import { Box } from "styled-system/jsx";

const faqTrigger = css({
  w: "full",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "4",
  px: "6",
  py: "4",
  m: "0",
  bg: "transparent",
  borderWidth: "0",
  textAlign: "left",
  fontFamily: "inherit",
  cursor: "pointer",
  _hover: { bg: "rgba(0, 0, 0, 0.02)" },
});

const faqs = [
  {
    question: "How does the three-tier pricing work?",
    answer:
      "Freelancers create three package options (Basic, Standard, Premium) with different deliverables and pricing. This gives clients flexibility to choose based on their budget and needs, while freelancers can upsell higher-value packages.",
  },
  {
    question: "Is my money safe with the escrow system?",
    answer:
      "Yes. Your payment is held securely by KickAir until you approve the work. If there are any issues, our team mediates fairly. Freelancers are only paid when you are satisfied or after dispute resolution.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We support Cambodia-friendly payment methods including Wing, ABA Bank, and Pi Pay. International payments via credit card and PayPal are also available.",
  },
  {
    question: "How do I know reviews are real?",
    answer:
      "Only clients who have completed a paid project can leave reviews. No review within 7 days means an automatic 5-star rating. Both parties review each other, ensuring accountability.",
  },
  {
    question: "What's the difference between KickAir and KickAir Pro?",
    answer:
      "KickAir Pro is designed for businesses managing multiple freelancers. It includes Team Workspace for visual project management, priority support, and access to pre-vetted top 1% talent.",
  },
  {
    question: "Can freelancers find long-term stable work?",
    answer:
      "Absolutely. Many clients post part-time and full-time positions with recurring monthly contracts. Browse our Jobs section to find stable opportunities beyond one-off projects.",
  },
];

export default function FaqSection() {
  const [expanded, setExpanded] = useState<number | false>(false);

  const toggle = (panel: number) => setExpanded((current) => (current === panel ? false : panel));

  return (
    <Box as="section" bg="canvas">
      <Box maxW="1200px" mx="auto" px={{ base: "6", sm: "12" }} py={{ base: "12", md: "20" }}>
        {/* Header */}
        <Box textAlign="center" mb="12">
          <Box
            as="h2"
            fontSize={{ base: "28px", md: "40px" }}
            fontWeight={600}
            color="ink"
            letterSpacing="-0.02em"
            mb="3"
          >
            Frequently Asked Questions
          </Box>
          <Box as="p" fontSize={{ base: "16px", md: "19px" }} color="ink2">
            Everything you need to know about KickAir
          </Box>
        </Box>

        {/* FAQ Accordion */}
        <Box display="flex" flexDirection="column" gap="4">
          {faqs.map((faq, index) => {
            const isOpen = expanded === index;
            return (
              <Box
                key={index}
                bg="white"
                borderRadius="card"
                borderWidth="1px"
                borderStyle="solid"
                borderColor="hairline"
                overflow="hidden"
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  className={faqTrigger}
                >
                  <Box as="span" fontSize="15px" fontWeight={600} color="ink">
                    {faq.question}
                  </Box>
                  <ChevronDown
                    size={20}
                    color="rgba(0, 0, 0, 0.6)"
                    style={{
                      flexShrink: 0,
                      transition: "transform .2s ease",
                      transform: isOpen ? "rotate(180deg)" : "none",
                    }}
                  />
                </button>
                {isOpen && (
                  <Box px="6" pb="6" pt="0">
                    <Box as="p" fontSize="14px" color="rgba(0, 0, 0, 0.7)" lineHeight={1.6}>
                      {faq.answer}
                    </Box>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
