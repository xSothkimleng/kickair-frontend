import { Suspense } from "react";
import ListingsPage from "@/components/admin/ListingsPage";
// Suspense boundary: the page reads ?kind= from the URL (useSearchParams).
export default function Page() { return <Suspense><ListingsPage /></Suspense>; }
