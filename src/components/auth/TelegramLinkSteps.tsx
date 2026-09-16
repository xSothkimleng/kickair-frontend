import { Send } from "lucide-react";
import { css, cx } from "styled-system/css";
import { button } from "@/components/ds";

/**
 * Shown when a phone code could not be delivered because the number is not
 * linked to the KickAir Telegram bot yet. The link opens the bot; once the user
 * shares their contact there, the code arrives in that chat by itself — the only
 * thing left to do on this screen is type it in.
 */

const wrap = css({ display: "flex", flexDirection: "column", gap: "16px" });
const steps = css({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  m: 0,
  pl: "20px",
  textStyle: "body",
  color: "body",
  "& strong": { fontWeight: 600, color: "heading" },
});
const openButton = css(button.raw({ variant: "solid", size: "md", full: true }), {
  // Telegram's brand blue so the button reads as "this leaves for Telegram".
  bg: "#2AABEE",
  _hover: { bg: "#229ED9" },
});

export function TelegramLinkSteps({ botUrl, className }: { botUrl: string; className?: string }) {
  return (
    <div className={cx(wrap, className)}>
      <ol className={steps}>
        <li>Tap <strong>Open Telegram</strong> below.</li>
        <li>Press <strong>Start</strong>, then <strong>Share my phone number</strong>.</li>
        <li>Come back here and enter the 6-digit code from the chat.</li>
      </ol>
      <a href={botUrl} target="_blank" rel="noopener noreferrer" className={openButton}>
        <Send size={18} aria-hidden />
        Open Telegram
      </a>
    </div>
  );
}
