import type { Metadata } from "next";
import SiteFooter from "./SiteFooter";
import SiteNav from "./SiteNav";
import Bento from "./sections/Bento";
import Closing from "./sections/Closing";
import Escrow from "./sections/Escrow";
import Hero from "./sections/Hero";
import Rail from "./sections/Rail";
import Stats from "./sections/Stats";

/**
 * website-v2 — throwaway redesign spike.
 *
 * Outside the (main) route group on purpose: it renders on the root layout only,
 * so the production Navbar/Footer are not in the tree and nothing here can reach
 * the live site. `rm -rf src/app/website-v2` removes the whole thing.
 *
 * The old landing was thirteen sections of the same three-column grid on one
 * flat grey. This is seven, each a different shape on a different ground:
 * white → grey → near-black → white → paper → white.
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
        <Stats />
        <Closing />
      </main>
      <SiteFooter />
    </>
  );
}
