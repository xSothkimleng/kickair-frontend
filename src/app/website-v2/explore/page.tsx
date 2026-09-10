import type { Metadata } from "next";
import SiteNav from "../SiteNav";
import Explore from "./Explore";

export const metadata: Metadata = {
  title: "Browse services — Kick Air v2",
  robots: { index: false, follow: false },
};

export default function ExplorePage() {
  return (
    <>
      <SiteNav />
      <Explore />
    </>
  );
}
