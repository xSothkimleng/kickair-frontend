import { Suspense } from "react";
import PeoplePage from "@/components/admin/PeoplePage";
// Suspense boundary: the page reads ?q= from the URL (useSearchParams).
export default function Page() { return <Suspense><PeoplePage /></Suspense>; }
