/**
 * How people pay on KickAir, as words. The plan (Kimleng, 2026-10-01) is ABA PayWay only:
 * scan the ABA KHQR code, or pay with a Visa or Mastercard card.
 *
 * The options themselves are `ABA_METHODS` in components/payment/AbaMethodSelector.tsx;
 * this file is the sentence the marketing pages and the checkout use, so the site never
 * names a method the checkout does not offer. Change both together.
 */
export const PAYMENT_METHODS_TEXT = "ABA KHQR, Visa or Mastercard";
