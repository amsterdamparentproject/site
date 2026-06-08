"use server";

import { createServiceClient } from "@/lib/supabase/server";

export async function updateUserProfile(
  uid: string,
  name: string,
  email: string,
  categories: string[],
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient("directory");
  const { error } = await supabase
    .from("users")
    .update({ name: name.trim() || null, email: email.trim(), categories })
    .eq("public_id", uid);
  if (error) return { success: false, error: error.message };
  return { success: true };
}
