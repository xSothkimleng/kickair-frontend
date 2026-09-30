import type { Metadata } from "next";
import SiteNav from "../SiteNav";
import Explore from "./Explore";

export const metadata: Metadata = {
  title: "Browse services — Kick Air v2",
  robots: { index: false, follow: false },
};

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = first(params.q) ?? "";
  const category = first(params.category) ?? "All";

  return (
    <>
      <SiteNav />
      {/* Keyed on the params: searching again from the nav while already here
          has to reset the filters, and state initialisers only run on mount. */}
      <Explore key={`${q}|${category}`} initialQuery={q} initialCategory={category} />
    </>
  );
}
