import { Resend } from "resend";

// Mirrors postpartum-post/lib/resend.ts exactly — same Resend account, same
// singleton-client pattern. See lib/emails/base.ts for why site's templates
// otherwise diverge from PP's.
let resendInstance: Resend | null = null;

export function getResend(): Resend {
  if (!resendInstance) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}
