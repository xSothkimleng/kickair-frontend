import Link from "next/link";
import Image from "next/image";
import { css } from "styled-system/css";
import { Box } from "styled-system/jsx";
import { PaymentFooterLogos } from "@/components/payment";

// Legacy page-key → real route map (originals used a dead onNavigate(pageKey)).
const HREF: Record<string, string> = {
  services: "/explore-services",
  jobs: "/jobs",
  "why-kickair": "/why-kick-air",
  university: "/kick-air-university",
  register: "/auth/sign-up",
};

type FooterLink = { label: string; page?: string; href?: string };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Platform",
    links: [
      { label: "Browse Services", page: "services" },
      { label: "Find Jobs", page: "jobs" },
      { label: "Why KickAir", page: "why-kickair" },
      { label: "KickAir University", page: "university" },
      { label: "KickAir Pro", page: "why-kickair" },
    ],
  },
  {
    title: "For Freelancers",
    links: [
      { label: "Sign Up Free", page: "register" },
      { label: "Find Work", page: "jobs" },
      { label: "Learn & Grow", page: "university" },
      { label: "Success Stories", page: "why-kickair" },
    ],
  },
  {
    title: "For Clients",
    links: [
      { label: "Hire Talent", page: "services" },
      { label: "Post a Job", page: "jobs" },
      { label: "Upgrade to Pro", page: "why-kickair" },
      { label: "Hiring Guides", page: "university" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", page: "why-kickair" },
      { label: "Reviews", page: "why-kickair" },
      { label: "Terms & Conditions", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Contact Support", href: "#" },
    ],
  },
];

const navLink = css({
  fontSize: "13px",
  color: "rgba(255, 255, 255, 0.6)",
  textDecoration: "none",
  transition: "color .15s",
  _hover: { color: "white" },
});

const socialBtn = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  w: "36px",
  h: "36px",
  borderRadius: "pill",
  bg: "rgba(255, 255, 255, 0.1)",
  color: "white",
  fontSize: "12px",
  textDecoration: "none",
  transition: "background-color .15s",
  _hover: { bg: "rgba(255, 255, 255, 0.2)" },
});

const colTitle = css({ fontSize: "15px", fontWeight: 600, color: "white", mb: "4" });

export default function Footer() {
  return (
    <Box as="footer" bg="black" color="white">
      <Box maxW="1200px" mx="auto" px={{ base: "6", sm: "12" }} py="16">
        <Box
          display="grid"
          gridTemplateColumns={{ base: "1fr 1fr", sm: "repeat(3, 1fr)", md: "1.4fr repeat(4, 1fr)" }}
          gap="12"
          mb="12"
        >
          {/* Column 1 — branding */}
          <Box>
            <Box mb="4">
              <Image src="/assets/images/kickair-logo.png" alt="KickAir" width={120} height={32} style={{ height: 32, width: "auto", marginBottom: 4 }} />
              <Box
                as="p"
                className={css({
                  fontSize: "11px",
                  color: "rgba(255, 255, 255, 0.4)",
                  fontWeight: 500,
                  letterSpacing: "0.05em",
                  mt: "1",
                })}
              >
                PREMIUM FREELANCING
              </Box>
            </Box>
            <Box
              as="p"
              className={css({
                fontSize: "13px",
                color: "rgba(255, 255, 255, 0.6)",
                lineHeight: 1.6,
                mb: "6",
              })}
            >
              Cambodia&apos;s premier marketplace for freelancers and clients. Build your brand, earn your way.
            </Box>
            <Box display="flex" alignItems="center" gap="3">
              <a href="#" aria-label="Facebook" className={socialBtn}>f</a>
              <a href="#" aria-label="LinkedIn" className={socialBtn}>in</a>
              <a href="#" aria-label="Instagram" className={socialBtn}>ig</a>
            </Box>
          </Box>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <Box key={col.title}>
              <Box as="p" className={colTitle}>{col.title}</Box>
              <Box as="ul" listStyleType="none" p="0" m="0">
                {col.links.map((item) => (
                  <Box as="li" key={item.label} mb="3">
                    <Link href={item.page ? HREF[item.page] ?? "#" : item.href ?? "#"} className={navLink}>
                      {item.label}
                    </Link>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>

        {/* Accepted payments (ABA PayWay guideline) */}
        <Box borderTopWidth="1px" borderTopStyle="solid" borderTopColor="rgba(255, 255, 255, 0.1)" pt="8">
          <PaymentFooterLogos variant="dark" />
        </Box>
      </Box>
    </Box>
  );
}
