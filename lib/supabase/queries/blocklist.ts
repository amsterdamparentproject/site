import { createServiceClient } from "@/lib/supabase/server";

export async function isEmailBlocked(email: string): Promise<boolean> {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) return false;

  const domain = normalized.split("@")[1];
  const candidates = domain ? [normalized, domain] : [normalized];

  const supabase = createServiceClient("activities");
  const { data, error } = await supabase
    .from("submission_blocklist")
    .select("value")
    .in("value", candidates);

  if (error) {
    console.error("isEmailBlocked query failed:", error.message);
    return false;
  }

  return (data?.length ?? 0) > 0;
}

// A local part made up entirely of digits (e.g. "495793980@qq.com") is the
// default, auto-assigned address format several free-mail providers —
// notably QQ — hand out untouched, and it's a pattern mass-created
// spam/bot signups favor because such addresses cost nothing to generate
// in bulk. Genuine users on these providers are free to customize their
// address, so this is a narrow heuristic (used to silently reject
// suspicious submissions before they reach review), not an exact-match
// block like isEmailBlocked above.
export function isNumericOnlyEmail(email: string): boolean {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) return false;
  const localPart = normalized.split("@")[0];
  return /^[0-9]+$/.test(localPart);
}
