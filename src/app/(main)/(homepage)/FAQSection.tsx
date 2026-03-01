"use client";

import { useState } from "react";
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, Container } from "@mui/material";
import { ExpandMore } from "@mui/icons-material";

export default function FaqSection() {
  const [expanded, setExpanded] = useState<number | false>(false);

  const handleChange = (panel: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

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
      answer: "We support Cambodia-friendly payment methods including Wing, ABA Bank, and Pi Pay. International payments via credit card and PayPal are also available.",
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

  return (
    <Box component="section" sx={{ bgcolor: "#F5F5F7" }}>
      <Container
        sx={{
          mx: "auto",
          px: { xs: 3, sm: 6 },
          py: { xs: 6, md: 10 },
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            component="h2"
            sx={{
              fontSize: { xs: "28px", md: "40px" },
              fontWeight: 600,
              color: "black",
              letterSpacing: "-0.02em",
              mb: 1.5,
            }}
          >
            Frequently Asked Questions
          </Typography>
          <Typography sx={{ fontSize: { xs: "16px", md: "19px" }, color: "rgba(0, 0, 0, 0.6)" }}>Everything you need to know about KickAir</Typography>
        </Box>

        {/* FAQ Accordion */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {faqs.map((faq, index) => (
            <Accordion
              key={index}
              expanded={expanded === index}
              onChange={handleChange(index)}
              sx={{
                bgcolor: "white",
                borderRadius: "16px !important",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                boxShadow: "none",
                overflow: "hidden",
                "&:before": {
                  display: "none",
                },
                "&.Mui-expanded": {
                  margin: 0,
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore sx={{ fontSize: 20 }} />}
                sx={{
                  px: 3,
                  py: 2,
                  "&:hover": {
                    bgcolor: "rgba(0, 0, 0, 0.02)",
                  },
                  "& .MuiAccordionSummary-content": {
                    margin: 0,
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "black",
                  }}
                >
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  px: 3,
                  pb: 3,
                  pt: 0,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "14px",
                    color: "rgba(0, 0, 0, 0.7)",
                    lineHeight: 1.6,
                  }}
                >
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
