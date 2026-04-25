import { genPageMetadata } from "app/seo";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
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

// Ensure we don't cache stale user data
export const dynamic = "force-dynamic";

export default async function Page() {
  const cookieStore = await cookies();
  const uid = cookieStore.get("app_uid")?.value;

  let userInfo = { name: "", email: "" };

  if (uid) {
    const supabase = await createClient();
    try {
      const { data, error } = await supabase.rpc("get_groups_directory", {
        user_id_input: uid,
      });

      if (data && !error) {
        userInfo = {
          name: data.user_name || "",
          email: data.user_email || "",
        };
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  }

  return (
    <Suspense
      fallback={<div className="min-h-screen p-10 text-center">Loading...</div>}
    >
      <AdminClient userInfo={userInfo} />
    </Suspense>
  );
}
