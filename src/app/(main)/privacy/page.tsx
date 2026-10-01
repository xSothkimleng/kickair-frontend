import type { Metadata } from "next";
import { Link } from "@/components/ds";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy | KickAir" };

const SECTIONS: LegalSection[] = [
  {
    heading: "What we collect",
    points: [
      "Account details: your name, email address or phone number, and password.",
      "Profile details you choose to add: photo, skills, languages, portfolio, location.",
      "Identity documents, when you verify your identity.",
      "What you do on KickAir: services, job posts, orders, messages, reviews and payments.",
      "Basic technical information, such as the device and browser you sign in from.",
    ],
  },
  {
    heading: "How we use it",
    points: [
      "To run your account and show your profile and listings to other members.",
      "To handle orders, payments, escrow and disputes.",
      "To send you notifications about your account and your orders.",
      "To keep KickAir safe and to prevent fraud.",
    ],
  },
  {
    heading: "Who can see it",
    body: [
      "Your public profile, services, job posts and reviews are visible to anyone on KickAir. Your messages and order details are visible to you, the other side of the order, and KickAir admins when they handle a dispute or a report.",
      "Identity documents are seen only by the KickAir admins who review them. We do not sell your personal information.",
    ],
  },
  {
    heading: "Phone verification",
    body: ["If you sign up with a phone number, the code is sent to you through Telegram. Telegram shares the number of the account that asked for the code, so we can confirm it is yours."],
  },
  {
    heading: "Storage and security",
    body: ["We keep your information on secured servers and limit who can access it. Passwords are stored in hashed form. No system is perfectly secure, so please use a strong password."],
  },
  {
    heading: "Your choices",
    points: [
      "You can edit your profile and contact details in Settings.",
      "You can deactivate your account in Settings. Your profile and listings are hidden while it is deactivated.",
      "You can ask us for a copy of your information, or ask us to delete it, through Contact Support.",
    ],
  },
  {
    heading: "Changes to this policy",
    body: ["We may update this policy. When we do, we change the date at the top of this page."],
  },
  {
    heading: "Contact",
    body: [
      <>
        Questions about your information? See <Link href="/contact">Contact Support</Link>.
      </>,
    ],
  },
];

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" updated="1 October 2026" sections={SECTIONS} />;
}
