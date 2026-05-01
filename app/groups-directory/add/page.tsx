import { genPageMetadata } from "app/seo";
import { Suspense } from "react";
import AddGroupForm from "@/components/groups-directory/AddGroupForm";
import { AddFormInfoNoAuth } from "@/app/types/groups-directory";

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

// This page is for users to request access to the directory, so we don't have any user info to pass in.
// The form will just be blank and ask them to fill it out.
const info: AddFormInfoNoAuth = {};

export default function Page() {
  return (
    <Suspense
      fallback={<div className="min-h-screen p-10 text-center">Loading...</div>}
    >
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-10 md:mb-12">
          <h2 className="text-xl md:text-3xl font-bold text-brand-soft-green dark:text-brand-goldenrod text-center mb-2">
            Amsterdam Parent Groups Directory
          </h2>
          <h1 className="text-center text-brand-charcoal dark:text-brand-white text-3xl leading-8 font-extrabold tracking-tight md:text-5xl md:leading-10">
            Add a group
          </h1>
        </div>

        <AddGroupForm info={info} />
      </div>
    </Suspense>
  );
}
