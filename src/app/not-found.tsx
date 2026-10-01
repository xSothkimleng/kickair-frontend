import Link from "next/link";
import { css } from "styled-system/css";
import Navbar from "@/components/layout/main/navbar";
import Footer from "@/components/layout/main/Footer";

// The site's own "page not found". It lives at the root so it also answers addresses
// outside every route group, and it brings the navbar and footer with it (the default
// one is a bare line of text with no way back into the site).
const wrapCss = css({ minH: "60vh", bg: "canvas", display: "flex", alignItems: "center", justifyContent: "center", p: "24px", boxSizing: "border-box" });
const cardCss = css({ maxW: "440px", w: "100%", boxSizing: "border-box", textAlign: "center", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" });
const codeCss = css({ textStyle: "eyebrow", color: "ink3" });
const titleCss = css({ textStyle: "heading", fontWeight: 600, color: "ink" });
const textCss = css({ textStyle: "body", color: "ink2" });
const rowCss = css({ mt: "8px", display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" });
const btnRaw = css.raw({ display: "inline-flex", alignItems: "center", justifyContent: "center", h: "42px", px: "22px", borderRadius: "pill", textStyle: "body", fontWeight: 600 });
const primaryCss = css(btnRaw, { bg: "ink", color: "white!", _hover: { bg: "rgba(0, 0, 0, 0.8)" } });
const secondaryCss = css(btnRaw, { bg: "rgba(0, 0, 0, 0.05)", color: "ink!", _hover: { bg: "rgba(0, 0, 0, 0.1)" } });

export default function NotFound() {
  return (
    <div>
      <Navbar />
      <main className={wrapCss}>
        <div className={cardCss}>
          <p className={codeCss}>Page not found</p>
          <h1 className={titleCss}>We could not find that page</h1>
          <p className={textCss}>The link may be old, or the page may have been removed.</p>
          <div className={rowCss}>
            <Link href="/" className={primaryCss}>Go to the homepage</Link>
            <Link href="/explore-services" className={secondaryCss}>Explore services</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
