"use client";

import { useState, useTransition } from "react";
import { createAuthBrowserClient } from "@/lib/supabase/client";
import { checkFypMemberExists } from "@/app/hub/actions";
import Link from "@/components/Link";

// Mirrors postpartum-post/components/MagicLinkRequest.tsx — same
// checkMemberExists-then-signInWithOtp flow. Simplified vs. PP's version:
// PP shows an inline signup form when the email isn't found (its signup
// form is a single email+plan field); FYP's signup form is a much larger
// multi-step flow (due date, family type, plan cards — see
// FYPJoinForm.tsx), so "not found" here just links out to
// /programs/first-year instead of trying to embed that form.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type State = "idle" | "sending" | "sent" | "not_found";

const inputClass =
  "w-full px-4 py-2.5 rounded-lg border border-brand-sand/60 bg-white dark:bg-brand-charcoal text-brand-charcoal dark:text-brand-white/80 focus:outline-none focus:ring-2 focus:ring-brand-soft-green/40 focus:border-brand-soft-green transition placeholder:text-brand-charcoal/30 dark:placeholder:text-brand-white/30";

export default function HubLoginForm() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [state, setState] = useState<State>("idle");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setEmailError("Enter a valid email address");
      return;
    }
    setEmailError(null);
    startTransition(async () => {
      const normalizedEmail = email.toLowerCase();
      const exists = await checkFypMemberExists(normalizedEmail);
      if (!exists) {
        setState("not_found");
        return;
      }
      setState("sending");
      const supabase = createAuthBrowserClient();
      await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/hub/auth/confirm`,
        },
      });
      setState("sent");
    });
  }

  if (state === "sent") {
    return (
      <div className="max-w-sm mx-auto text-center bg-white dark:bg-brand-soft-charcoal rounded-2xl border border-brand-sand/60 shadow-sm p-8">
        <h2 className="text-xl font-bold text-brand-charcoal dark:text-brand-white mb-2">
          Check your inbox
        </h2>
        <p className="text-sm text-brand-charcoal/70 dark:text-brand-white/60">
          We sent a sign-in link to <strong>{email}</strong>. Click it to access
          the Hub.
        </p>
      </div>
    );
  }

  const notFound = state === "not_found";

  return (
    <div className="max-w-sm mx-auto space-y-6">
      <div className="text-center">
        <p className="text-brand-charcoal dark:text-brand-white font-medium mb-1">
          Sign in to the First Year Hub
        </p>
        <p className="text-sm text-brand-charcoal/60 dark:text-brand-white/50 mb-6">
          Enter the email you signed up with and we&apos;ll send you a sign-in
          link.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(null);
                setState("idle");
              }}
              placeholder="your@email.com"
              autoComplete="email"
              className={inputClass}
            />
            {emailError && (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400 text-left">
                {emailError}
              </p>
            )}
            {notFound && (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400 text-left">
                No Hub account found for that email.{" "}
                <Link
                  href="/programs/first-year"
                  className="underline cursor-pointer"
                >
                  Join the First Year Program
                </Link>{" "}
                or try a different email.
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isPending}
            data-umami-event="Hub: Request sign-in link"
            className="w-full py-2.5 px-6 rounded-lg font-semibold text-white bg-brand-soft-green hover:bg-brand-soft-green/90 dark:bg-brand-goldenrod dark:hover:bg-brand-goldenrod/90 dark:text-brand-charcoal transition-colors focus:outline-none focus:ring-2 focus:ring-brand-soft-green/40 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending ? "Checking…" : "Send me a sign-in link"}
          </button>
        </form>
      </div>
    </div>
  );
}
