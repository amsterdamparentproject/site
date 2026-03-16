import { genPageMetadata } from "app/seo";
import { Suspense } from "react";
import AccessClient from "./AccessClient";

export const metadata = genPageMetadata({
  title: "Find Your Parent Groups",
});

export default function Page() {
  return (
    <Suspense
      fallback={<div className="min-h-screen p-10 text-center">Loading...</div>}
    >
      <AccessClient />
    </Suspense>
  );
}
