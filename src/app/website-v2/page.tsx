import type { Metadata } from "next";
import SiteFooter from "./SiteFooter";
import SiteNav from "./SiteNav";
import Bento from "./sections/Bento";
import Closing from "./sections/Closing";
import Escrow from "./sections/Escrow";
import Faq from "./sections/Faq";
import Hero from "./sections/Hero";
import Rail from "./sections/Rail";
import Stats from "./sections/Stats";
import Work from "./sections/Work";

/**
 * website-v2 — throwaway redesign spike.
 *
 * Outside the (main) route group on purpose: it renders on the root layout only,
 * so the production Navbar/Footer are not in the tree and nothing here can reach
 * the live site. `rm -rf src/app/website-v2` removes the whole thing.
 *
 * The old landing was thirteen sections of the same three-column grid on one
 * flat grey. This is eight, each a different shape on a different ground, and no
 * two neighbours share one:
 *
 *   Hero     white    split — type left, product right
 *   Bento    canvas   asymmetric grid
 *   Escrow   ink      full-bleed, the one dark break
 *   Rail     white    a dragged horizontal rail
 *   Work     canvas   the hero mirrored — product left, type right
 *   Stats    white    a band of four figures
 *   Faq      paper    a ruled list beside a sticky heading
 *   Closing  white    one centred decision
 *
 * The first half argues to the client, Work turns to the freelancer, and the
 * last three close for both.
 */
export const metadata: Metadata = {
  title: "Kick Air — v2",
  robots: { index: false, follow: false },
};

export default function WebsiteV2Landing() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <Bento />
        <Escrow />
        <Rail />
        <Work />
        <Stats />
        <Faq />
        <Closing />
      </main>
      <SiteFooter />
    </>
  );
}
