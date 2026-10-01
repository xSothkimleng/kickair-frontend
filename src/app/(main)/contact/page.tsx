import type { Metadata } from "next";
import { Link } from "@/components/ds";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Contact Support | KickAir" };

/**
 * PLACEHOLDER contact details (Kimleng, 2026-10-01: "fake it for now"). The address
 * below is not a real inbox yet; replace it here when the client supplies one.
 */
const SUPPORT_EMAIL = "support@kickair.com";

const SECTIONS: LegalSection[] = [
  {
    heading: "Email us",
    body: [
      <>
        Write to <Link href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</Link>. We reply within one working day, Monday to Friday, 9:00 to 18:00 (Phnom Penh time).
      </>,
    ],
  },
  {
    heading: "A problem with an order",
    body: [
      "Open the order and message the other side first. If you cannot agree, use Open Dispute on the order page. An admin will review it with the full order record in front of them, which is faster than email.",
    ],
  },
  {
    heading: "What to include",
    points: ["The email address or phone number on your account.", "The order number, if your question is about an order.", "What happened and what you expected, in a few sentences."],
  },
  {
    heading: "Other pages",
    body: [
      <>
        <Link href="/terms">Terms of Service</Link> and <Link href="/privacy">Privacy Policy</Link>.
      </>,
    ],
  },
];

export default function ContactPage() {
  return <LegalPage title="Contact Support" updated="1 October 2026" sections={SECTIONS} />;
}
