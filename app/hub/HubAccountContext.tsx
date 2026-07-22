"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createAuthBrowserClient } from "@/lib/supabase/client";
import { getFypMemberProfile, type HubMemberProfile } from "@/app/hub/actions";

// Mirrors postpartum-post/app/(account)/AccountContext.tsx exactly: no
// server-side session, gating happens here via onAuthStateChange. Every
// page under /hub reads from this context (see app/hub/layout.tsx) rather
// than checking auth individually.

type HubAccountContextValue = {
  loading: boolean;
  email: string | null;
  member: HubMemberProfile | null;
};

const HubAccountContext = createContext<HubAccountContextValue>({
  loading: true,
  email: null,
  member: null,
});

export function useHubAccount() {
  return useContext(HubAccountContext);
}

export function HubAccountProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [member, setMember] = useState<HubMemberProfile | null>(null);

  // Registers the auth listener. Deliberately does nothing but read the
  // session and set `email` — no awaited Supabase calls of any kind here.
  // supabase-js has a documented deadlock bug where calling any async
  // Supabase auth method (getSession, signOut, etc.) from inside this
  // callback hangs forever: the callback holds an internal
  // navigator.locks-based mutex that the nested call also needs, and it
  // never releases (https://github.com/supabase/auth-js/issues/762). The
  // actual profile lookup + conditional sign-out happens in the next
  // effect instead, entirely outside this callback's execution context.
  useEffect(() => {
    let supabase;
    try {
      supabase = createAuthBrowserClient();
    } catch (err) {
      // If this throws (e.g. createClient() rejecting a missing/undefined
      // env var), the onAuthStateChange listener below never gets
      // registered — without this catch, loading would stay true forever,
      // since nothing else would ever call setLoading(false).
      console.error(
        "[HubAccountContext] failed to create Supabase client:",
        err,
      );
      setLoading(false);
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionEmail = session?.user?.email ?? null;
      setEmail(sessionEmail);
      if (!sessionEmail) {
        setMember(null);
        setLoading(false);
      }
      // When sessionEmail IS set, loading resolves via the effect below
      // once the profile lookup actually completes.
    });

    return () => subscription.unsubscribe();
  }, []);

  // Looks up the Hub member for the current session's email, and signs out
  // if none is found — safely outside onAuthStateChange's callback (see
  // above). Re-runs whenever `email` changes.
  useEffect(() => {
    if (!email) return;

    let cancelled = false;

    (async () => {
      try {
        const profile = await getFypMemberProfile(email);
        if (cancelled) return;
        if (!profile) {
          // Authenticated in Supabase but no matching firstyear.members
          // row — sign out so the stale session doesn't persist across
          // refreshes. The resulting SIGNED_OUT event (handled by the
          // effect above) clears `email`/`member` and shows HubLoginForm.
          setMember(null);
          await createAuthBrowserClient().auth.signOut();
        } else {
          setMember(profile);
        }
      } catch (err) {
        console.error("[HubAccountContext] profile lookup error:", err);
        if (!cancelled) setMember(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [email]);

  return (
    <HubAccountContext.Provider value={{ loading, email, member }}>
      {children}
    </HubAccountContext.Provider>
  );
}
