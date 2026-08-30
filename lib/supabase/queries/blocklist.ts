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
