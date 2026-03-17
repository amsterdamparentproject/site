import { genPageMetadata } from "app/seo";
import { Suspense } from "react";
import AccessClient from "./AccessClient";

export const metadata = genPageMetadata({
  title: "Find Your Parent Groups",
  description:
    "Did you know there's a huge, thriving community of 1000+ Amsterdam parents(-to-be) on WhatsApp, Facebook, and other platforms? Request access to the Amsterdam Parent Groups Directory, with peronalized invite links to the online groups.",
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
