import type { Metadata } from "next";
import { Link } from "@/components/ds";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Terms of Service | KickAir" };

const SECTIONS: LegalSection[] = [
  {
    heading: "About KickAir",
    body: [
      "KickAir is a marketplace where clients in Cambodia hire freelancers, and freelancers sell services, answer job posts and take custom requests.",
      "By creating an account or using the site you agree to these terms. If you do not agree, please do not use KickAir.",
    ],
  },
  {
    heading: "Your account",
    points: [
      "Give accurate information and keep it up to date.",
      "One person or business per account. You are responsible for what happens under your account.",
      "Keep your password private. Tell us if you think someone else has used your account.",
      "Freelancers confirm their identity before they can publish a service. Clients confirm their identity before they can post a job.",
    ],
  },
  {
    heading: "Services, jobs and custom orders",
    body: [
      "Freelancers publish services with fixed packages. Clients can buy a package, post a job and choose a proposal, or ask a freelancer for a custom offer.",
      "Every service and job post is reviewed before it goes live. A listing must describe the work honestly and must not break the law or the rights of others.",
    ],
  },
  {
    heading: "Payment and escrow",
    body: [
      "The client pays when the order starts. KickAir holds that money in escrow while the freelancer works.",
      "When the client approves the delivery, the payment is released to the freelancer after the platform fee. The fee is shown to the freelancer before a service is published or an offer is sent. Clients pay the price they see and nothing more.",
    ],
  },
  {
    heading: "Delivery, revisions and approval",
    body: [
      "The freelancer delivers the work on the order page. The client can approve it, or ask for a revision and say what needs to change.",
      "Approving a delivery releases the payment and cannot be undone.",
    ],
  },
  {
    heading: "Disputes",
    body: [
      "If the two sides cannot agree, either of them can open a dispute on the order. Both sides can send evidence once.",
      "A KickAir admin reviews the order record and the evidence, then releases the payment, refunds the client, splits the amount, or asks both sides to continue with written feedback. The admin's decision is final on KickAir.",
    ],
  },
  {
    heading: "Cancellations and refunds",
    body: [
      "An order that has not been delivered can be cancelled, and the money held in escrow goes back to the client's balance.",
      "After a delivery has been approved the order is complete and is no longer refundable through KickAir.",
    ],
  },
  {
    heading: "Reviews",
    body: [
      "Clients can leave a review after an order is completed. Reviews must be honest and about the work. We may remove reviews that are abusive, fake or unrelated.",
    ],
  },
  {
    heading: "What is not allowed",
    points: [
      "Asking for or making payment outside KickAir for work found on KickAir.",
      "Fake accounts, fake reviews, or work you do not have the right to sell.",
      "Illegal, harmful or misleading content.",
      "Harassment or abuse of other members or of KickAir staff.",
    ],
  },
  {
    heading: "Suspension and closing your account",
    body: [
      "We may suspend or ban an account that breaks these terms. We will tell you the reason.",
      "You can deactivate your account in Settings once your open orders are finished. Signing in again within 30 days brings it back.",
    ],
  },
  {
    heading: "Changes to these terms",
    body: ["We may update these terms. When we do, we change the date at the top of this page. Using KickAir after a change means you accept the new terms."],
  },
  {
    heading: "Contact",
    body: [
      <>
        Questions about these terms? See <Link href="/contact">Contact Support</Link>.
      </>,
    ],
  },
];

export default function TermsPage() {
  return <LegalPage title="Terms of Service" updated="1 October 2026" sections={SECTIONS} />;
}
