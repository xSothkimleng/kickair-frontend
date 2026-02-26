"use client";

interface RichTextDisplayProps {
  value: string | null | undefined;
  className?: string;
}

export default function RichTextDisplay({ value, className }: RichTextDisplayProps) {
  if (!value) return null;

  return (
    <div
      className={`rich-text-display ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );
}
