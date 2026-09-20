/**
 * Turn what someone typed into a Cambodian phone field into the E.164 form the
 * API stores ("+85512964520"): digits only, no leading zero, +855 in front. A
 * number typed with its country code ("855 12 964 520", "+855012964520") is
 * recognised rather than prefixed twice.
 *
 * The API normalises every phone field the same way (PhoneNumber::normalize), so
 * this exists to show the user the exact number we are about to use.
 */
export function toE164Kh(typed: string): string {
  let digits = typed.replace(/\D/g, "");

  if (digits.startsWith("00")) digits = digits.slice(2);

  // "855…" is only the country code when a whole national number (8–9 digits)
  // follows it — 085 is a real operator prefix.
  if (digits.startsWith("855")) {
    const rest = digits.slice(3).replace(/^0+/, "");
    if (typed.trim().startsWith("+") || (rest.length >= 8 && rest.length <= 9)) return `+855${rest}`;
  }

  return `+855${digits.replace(/^0+/, "")}`;
}
