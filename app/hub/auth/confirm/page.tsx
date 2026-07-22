"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createAuthBrowserClient } from "@/lib/supabase/client";
import HubLoginForm from "@/app/hub/HubLoginForm";

// Mirrors postpartum-post/app/auth/confirm/page.tsx — same dual-path
// handling, since Supabase's default (uncustomized) magic-link email
// template can produce either shape depending on how the link was
// generated:
//   - token_hash query param (standard signInWithOtp email) → verifyOtp()
//   - access_token in the URL hash fragment (e.g. admin.generateLink) →
//     onAuthStateChange() picks it up once getSession() is called
// No server route handler / PKCE code-exchange — the session is
// established entirely client-side, consistent with the rest of the Hub's
// auth (see HubAccountContext.tsx).

type Status = "loading" | "success" | "error" | "invalid";

function Spinner() {
  return <p className="text-center text-sm py-16">Signing you in…</p>;
}

function ConfirmHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");
    const next = "/hub";

    if (tokenHash && type) {
      const supabase = createAuthBrowserClient();
      supabase.auth
        .verifyOtp({ token_hash: tokenHash, type: type as EmailOtpType })
        .then(({ error }) => {
          if (error) {
            console.error("[hub/auth/confirm] verifyOtp error:", error.message);
            setStatus("error");
          } else {
            setStatus("success");
            router.replace(next);
          }
        });
      return;
    }

    if (window.location.hash.includes("access_token")) {
      const supabase = createAuthBrowserClient();
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_IN") {
          subscription.unsubscribe();
          setStatus("success");
          router.replace(next);
        }
      });
      // Triggers the client to process the hash fragment.
      supabase.auth.getSession();
      return;
    }

    setStatus("invalid");
  }, [router, searchParams]);

  if (status === "loading" || status === "success") {
    return <Spinner />;
  }

  return (
    <div className="max-w-sm mx-auto text-center py-16 space-y-6">
      <h2 className="text-xl font-bold text-brand-charcoal dark:text-brand-white">
        {status === "error" ? "This link has expired" : "Invalid sign-in link"}
      </h2>
      <p className="text-sm text-brand-charcoal/70 dark:text-brand-white/60">
        {status === "error"
          ? "Sign-in links expire after 24 hours and can only be used once. Request a new one below."
          : "This link doesn't look right. Try requesting a fresh sign-in link."}
      </p>
      <HubLoginForm />
    </div>
  );
}

export default function HubAuthConfirmPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <ConfirmHandler />
    </Suspense>
  );
}
