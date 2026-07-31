import { createFirstYearStorageClient } from "@/lib/supabase/server";

// Private Supabase Storage bucket backing the Hub's resource guides — see
// migration 011's sibling doc note in fyp-plan-access.md ("resource guides
// need to be uploaded to Supabase storage and read from there"). Not public:
// every download goes through getFypResourceDownloadUrl, which requires a
// verified Hub session (member or staff — see app/hub/actions.ts) before
// minting a short-lived signed URL. Bucket itself is created by
// `yarn update-fyp-guides` (scripts/update-fyp-guides.mjs), run once per
// environment (not from app code — mirrors how migrations are run by hand
// via the Supabase SQL editor, not applied automatically).
export const FYP_GUIDES_BUCKET = "fyp-guides";

// How long a signed download URL stays valid. Short-lived on purpose — this
// is a private bucket, so a leaked/shared link should go stale quickly
// rather than acting as a permanent public mirror of the old static path.
const SIGNED_URL_EXPIRY_SECONDS = 300;

/**
 * Mints a short-lived signed URL for a guide already uploaded to the FYP
 * guides bucket. Callers MUST verify the caller is a signed-in Hub
 * member/staff (requireHubMember) before calling this — it doesn't check
 * identity itself, same division of concerns as lib/fyp/members.ts's
 * pure DB functions vs. app/hub/actions.ts's auth-checking Server Actions.
 */
export async function getResourceDownloadUrl(
  storagePath: string,
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  const supabase = createFirstYearStorageClient();
  const { data, error } = await supabase.storage
    .from(FYP_GUIDES_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_EXPIRY_SECONDS);

  if (error || !data?.signedUrl) {
    return {
      success: false,
      error: error?.message ?? "Failed to generate download link",
    };
  }

  return { success: true, url: data.signedUrl };
}
