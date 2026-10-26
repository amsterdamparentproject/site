import * as Sentry from "@sentry/nextjs";
import { sharedSentryOptions } from "@/lib/sentry/options";

// Runs for middleware.ts (the Groups Directory auth refresh).
Sentry.init({
  ...sharedSentryOptions,
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment:
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV,
});
