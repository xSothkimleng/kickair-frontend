import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { css } from "styled-system/css";

/**
 * Shared shell for the Terms, Privacy and Contact pages: a title, a "temporary
 * text" notice, then plain sections. The copy on these pages is a working draft
 * for the test period; `DRAFT_NOTICE` says so at the top of each page. Remove the
 * notice (one place) when the client supplies the final text.
 */
export const DRAFT_NOTICE =
  "Temporary text. This page is a working draft for the test period and will be replaced by the final version before the public launch.";

export interface LegalSection {
  heading: string;
  /** Paragraphs, in order. */
  body?: ReactNode[];
  /** Optional bullet list shown after the paragraphs. */
  points?: ReactNode[];
}

// Spacing lives on wrapper divs and `gap`: globals.css zeroes margins on p / h* / ul.
const pageCss = css({ minH: "70vh", bg: "canvas", py: { base: "32px", md: "56px" } });
const columnCss = css({ maxW: "760px", mx: "auto", px: { base: "16px", sm: "24px" }, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "20px" });
const headCss = css({ display: "flex", flexDirection: "column", gap: "6px" });
const titleCss = css({ textStyle: "stat", fontWeight: 600, color: "ink" });
const updatedCss = css({ textStyle: "meta", color: "ink3" });
const noticeCss = css({ display: "flex", gap: "10px", alignItems: "flex-start", p: "14px 16px", borderRadius: "cardSm", bg: "surface", borderWidth: "1px", borderStyle: "solid", borderColor: "hairlineStrong", textStyle: "ui", color: "ink2", boxSizing: "border-box", "& svg": { flexShrink: 0, mt: "2px", color: "ink3" } });
const cardCss = css({ bg: "surface", borderWidth: "1px", borderStyle: "solid", borderColor: "hairline", borderRadius: "card", p: { base: "20px", md: "32px" }, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "28px" });
const sectionCss = css({ display: "flex", flexDirection: "column", gap: "10px" });
const headingCss = css({ textStyle: "lead", fontWeight: 600, color: "ink" });
const paraCss = css({ textStyle: "body", color: "ink2" });
// `pl` on a <ul> is zeroed by globals.css, so the indent sits on a wrapper.
const listIndentCss = css({ pl: "20px" });
const listCss = css({ display: "flex", flexDirection: "column", gap: "6px", listStyleType: "disc", textStyle: "body", color: "ink2" });

export function LegalPage({ title, updated, intro, sections, children }: { title: string; updated: string; intro?: ReactNode; sections: LegalSection[]; children?: ReactNode }) {
  return (
    <main className={pageCss}>
      <div className={columnCss}>
        <div className={headCss}>
          <h1 className={titleCss}>{title}</h1>
          <p className={updatedCss}>Last updated {updated}</p>
        </div>

        <div role="note" className={noticeCss}>
          <Info size={16} aria-hidden />
          <span>{DRAFT_NOTICE}</span>
        </div>

        <div className={cardCss}>
          {intro && <p className={paraCss}>{intro}</p>}
          {children}
          {sections.map((section, i) => (
            <section key={section.heading} className={sectionCss}>
              <h2 className={headingCss}>
                {i + 1}. {section.heading}
              </h2>
              {section.body?.map((p, j) => (
                <p key={j} className={paraCss}>
                  {p}
                </p>
              ))}
              {section.points && (
                <div className={listIndentCss}>
                  <ul className={listCss}>
                    {section.points.map((point, j) => (
                      <li key={j}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
