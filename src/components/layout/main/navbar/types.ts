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

export const LANGUAGES: Language[] = [
  { label: "English", code: "en" },
  { label: "ខ្មែរ", code: "km" },
  { label: "中文", code: "zh" },
];
