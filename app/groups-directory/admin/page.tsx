import { genPageMetadata } from "app/seo";
import { Suspense } from "react";
import AdminClient from "./AdminClient";

export const metadata = genPageMetadata({
  title: "For Admins: Manage Groups Directory",
  description: "Add or edit groups in the Amsterdam Parent Groups Directory.",
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
      <AdminClient />
    </Suspense>
  );
}
