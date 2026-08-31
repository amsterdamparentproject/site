import { genPageMetadata } from "app/seo";
import { cookies } from "next/headers";
import { createDirectoryClient } from "@/lib/supabase/server";
import SeasonGroupsClient from "@/components/season-groups/SeasonGroupsClient";
import {
  SeasonGroup,
  SeasonGroupExistingProfile,
} from "@/app/types/groups-directory";

export const metadata = genPageMetadata({
  title: "Season Groups",
  description:
    "Join your free, private WhatsApp community of expecting families in Amsterdam due around the same time as you.",
});

// Season Groups (and a visitor's existing profile, if any) are cheap to
// fetch and can change often enough that this stays dynamic rather than
// statically cached — matches /groups-directory's own choice.
export const dynamic = "force-dynamic";

// Unlike /groups-directory, an invalid or missing app_uid here is not an
// error — /season-groups is a public splash page a first-time visitor is
// meant to land on with no cookie at all. A bad uid just means "treat them
// as a new visitor" rather than a hard redirect.
async function getExistingProfile(
  uid: string | undefined,
): Promise<SeasonGroupExistingProfile | null> {
  const isValidUid =
    !!uid &&
    uid.trim() !== "" &&
    uid !== "false" &&
    uid !== "null" &&
    uid !== "undefined";
  if (!isValidUid) return null;

  const supabase = await createDirectoryClient();
  const { data, error } = await supabase.rpc("get_groups_directory", {
    user_id_input: uid!.trim(),
  });

  if (error || !data || !data.user_email) return null;

  return {
    uid: uid!.trim(),
    name: data.user_name || "",
    email: data.user_email,
    categories: data.user_interests || [],
  };
}

export default async function Page() {
  const cookieStore = await cookies();
  const uid = cookieStore.get("app_uid")?.value;

  const supabase = await createDirectoryClient();
  const [{ data: seasonGroupsData, error }, existingProfile] =
    await Promise.all([
      supabase.rpc("get_season_groups"),
      getExistingProfile(uid),
    ]);

  if (error) {
    console.error("Season Groups: Supabase error:", error);
  }

  const seasonGroups: SeasonGroup[] = seasonGroupsData || [];

  return (
    <SeasonGroupsClient
      seasonGroups={seasonGroups}
      existingProfile={existingProfile}
    />
  );
}
