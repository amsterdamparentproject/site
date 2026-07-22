"use client";

import { createAuthBrowserClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => createAuthBrowserClient().auth.signOut()}
      data-umami-event="Hub: Sign out"
      className="text-sm text-brand-charcoal/60 dark:text-brand-white/50 hover:text-brand-soft-green dark:hover:text-brand-goldenrod underline cursor-pointer"
    >
      Sign out
    </button>
  );
}
