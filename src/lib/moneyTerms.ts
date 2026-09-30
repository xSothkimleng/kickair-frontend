/**
 * The one place money wording lives. Approved by the client on 2026-09-23
 * (kickair-feedback/rounds/20.9.2026-terminology-approved.docx). Every screen reads
 * from here, so changing a term is one edit. The API side mirrors this in
 * kickair-api/lang/en/money.php; keep the two in step.
 *
 * Case: sentence case. Where the surrounding UI is Title Case (the dashboard stat
 * cards, the "Why KickAir" steps) wrap the term in `titleCase()`. Never write these
 * words inline in a component, and never use an em dash in user-facing copy.
 */
export const MONEY = {
  // Amounts in the wallet
  availableBalance: "Available balance",
  committedToOrders: "Committed to orders",
  pendingEarnings: "Pending earnings",
  totalSpent: "Total spent",
  totalEarnings: "Total earnings",
  // Prices, fees and paying
  youPay: "You pay",
  clientPays: "Client pays",
  youReceive: "You'll receive",
  acceptAndPay: "Accept and pay",
  balanceAfter: "Balance after",
  shortBy: "Short by",
  // Payment protection, release and refunds
  approveAndRelease: "Approve and release payment",
  paymentReleased: "Payment released",
  earningReleased: "Earning released",
  refundReceived: "Refund received",
  refundedToClient: "Refunded to client",
  releasedToFreelancer: "Released to freelancer",
  // Wallet actions and history entries
  topUp: "Top up",
  withdraw: "Withdraw",
  withdrawal: "Withdrawal",
  committedToOrder: "Committed to order",
  orderCompletedReleased: "Order completed, payment released",
} as const;

/** "Platform fee (20%)" as a row label. */
export const platformFee = (pct: number) => `Platform fee (${pct}%)`;

/** The same fee inside a sentence. */
export const afterPlatformFee = (pct: number) => `after the platform fee (${pct}%)`;

/** The one sentence that explains payment protection. */
export const escrowSentence = (freelancerName = "the freelancer") =>
  `Your payment is held in escrow and released to ${freelancerName} only when you approve the delivery.`;

/** The short form for badges, notes and success screens. */
export const ESCROW_SHORT = "Held in escrow until you approve the delivery.";

const SMALL_WORDS = new Set(["a", "an", "and", "the", "to", "of", "in", "for", "on", "at", "by"]);

/** "Committed to orders" → "Committed to Orders", for UI that is Title Case. */
export function titleCase(term: string): string {
  return term
    .split(" ")
    .map((w, i) => (i > 0 && SMALL_WORDS.has(w.toLowerCase()) ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}
