import { genPageMetadata } from "app/seo";
import { Suspense } from "react";
import UpdateClient from "./UpdateClient";
import { createServiceClient } from "@/lib/supabase/server";

export const metadata = genPageMetadata({
  title: "Groups Directory: Update Group",
  description: "Update group details in the Amsterdam Parent Groups Directory",
  robots: {
    index: false,
    follow: false,
  },
});

export interface GroupOption {
  name: string;
  platform: string;
  description: string;
  categories: string[];
}

async function getGroups(): Promise<GroupOption[]> {
  try {
    const supabase = createServiceClient("directory");
    const { data, error } = await supabase
      .from("groups")
      .select("name, platform, description, categories")
      .order("name", { ascending: true });

    if (error || !data) {
      console.error("update: failed to fetch groups", error);
      return [];
    }

    return data
      .filter((g) => g.name)
      .map((g) => ({
        ...g,
        description: g.description ?? "",
        categories: g.categories ?? [],
      }));
  } catch (e) {
    console.error("update: unexpected error", e);
    return [];
  }
}

interface PageProps {
  searchParams: Promise<{ group?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { group } = await searchParams;
  const groups = await getGroups();

  return (
    <Suspense
      fallback={<div className="min-h-screen p-10 text-center">Loading...</div>}
    >
      <div className="max-w-xl mx-auto p-6">
        <div className="mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-brand-soft-green dark:text-brand-goldenrod text-center mb-2">
            Amsterdam Parent Groups Directory
          </h2>
          <h1 className="text-center text-brand-charcoal dark:text-brand-white text-3xl leading-8 font-extrabold tracking-tight md:text-4xl md:leading-10">
            Update a group
          </h1>
          <p className="mt-4 text-center text-brand-soft-charcoal dark:text-brand-white/80 text-sm">
            Update group details here, and we'll update the Directory. This is
            for existing groups only — if you want to add a new group please use
            our{" "}
            <a
              href="/groups-directory/add"
              className="text-brand-soft-green dark:text-brand-goldenrod hover:underline"
            >
              Add a Group
            </a>{" "}
            form.
          </p>
        </div>

        <UpdateClient groups={groups} initialGroupName={group} />
      </div>
    </Suspense>
  );
}
