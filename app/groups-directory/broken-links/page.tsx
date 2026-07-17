import { genPageMetadata } from "app/seo";
import { createDirectoryClient } from "@/lib/supabase/server";
import BrokenLinksClient from "./BrokenLinksClient";

export const metadata = genPageMetadata({
  title: "Help us fix broken links — Amsterdam Parent Groups Directory",
  robots: {
    index: false,
    follow: false,
  },
});

// Always fetch fresh — this list changes as links get reported/fixed.
export const dynamic = "force-dynamic";

interface ReportedGroup {
  name: string;
  categories: string[];
  description: string;
  platform: string;
  link: string;
}

export default async function BrokenLinksPage() {
  const supabase = await createDirectoryClient();
  const { data, error } = await supabase.rpc("get_reported_groups");

  if (error) {
    console.error("Broken Links: Supabase error:", error);
  }

  const groups: ReportedGroup[] = error || !data ? [] : data;

  return <BrokenLinksClient groups={groups} />;
}
