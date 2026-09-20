export type DropdownType =
  | "why"
  | "freelancer"
  | "client"
  | "pro"
  | "language"
  | "profile"
  | null;

export type UserMode = "freelancer" | "client";

export interface Language {
  label: string;
  code: string;
}

/**
 * The language switch is hidden everywhere (desktop bar + mobile drawer) until real
 * translations exist: today it only stores a preference and sets <html lang>, so it
 * promised something the site doesn't do. Flip to `true` to bring it back.
 */
export const SHOW_LANGUAGE_SWITCH = false;

export const LANGUAGES: Language[] = [
  { label: "English", code: "en" },
  { label: "ខ្មែរ", code: "km" },
  { label: "中文", code: "zh" },
];
