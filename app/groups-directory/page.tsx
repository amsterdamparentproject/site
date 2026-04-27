import { genPageMetadata } from "app/seo";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DirectoryClient from "./DirectoryClient";
import { cookies } from "next/headers";

export const metadata = genPageMetadata({
  title: "Amsterdam Parent Groups Directory",
  openGraph: {
    images: [
      `${process.env.BASE_PATH || ""}/static/images/web-share/groups-directory.png`,
    ],
  },
});

// Ensure we don't cache stale user data
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ uid?: string }>;
}

export default async function DirectoryPage({ searchParams }: PageProps) {
  const { uid: urlUid } = await searchParams;
  const cookieStore = await cookies();

  const uid = urlUid || cookieStore.get("app_uid")?.value;

  // 3. Initialize Supabase Server Client
  const supabase = await createClient();

  // 4. If neither URL nor Cookie has a valid UID, redirect
  const isValidUid =
    uid &&
    uid.trim() !== "" &&
    uid !== "false" &&
    uid !== "null" &&
    uid !== "undefined";
  if (!isValidUid) {
    redirect("/groups-directory/access?noUid=true");
  }

  const { data, error } = await supabase.rpc("get_groups_directory", {
    user_id_input: uid?.trim(),
  });

  if (error || !data) {
    console.error("Groups Directory: Supabase error:", error);
    redirect("/groups-directory/access?noUid=true");
  }

  if (uid && !data.user_name) {
    // We couldn't find the user, so reroute to /access with a warning
    console.warn("Groups Directory: No user found for UID:", uid);
    redirect("/groups-directory/access?badUid=true");
  }

  // 6. Pass data to your Client Component
  return (
    <DirectoryClient
      recommended={data.recommended}
      allGroups={data.all}
      userName={data.user_name}
      userEmail={data.user_email}
      userMaskedEmail={data.user_email_masked}
      userInterests={data.user_interests}
      uid={uid}
    />
  );
}
