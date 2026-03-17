import { genPageMetadata } from "app/seo";
import { Suspense } from "react";
import AccessClient from "./AccessClient";

export const metadata = genPageMetadata({
  title: "Find Your Parent Groups",
  openGraph: {
    images: [
      `${process.env.BASE_PATH || ""}/static/images/web-share/groups-directory.png`,
    ],
  },
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
