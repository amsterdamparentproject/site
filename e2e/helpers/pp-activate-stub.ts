/**
 * Local stub for postpartum-post's own POST /api/fyp/activate route.
 *
 * activatePostpartumPost() (lib/fyp/postpartum-post.ts) calls out to a real
 * postpartum-post deployment over HTTP — there's no way to intercept that
 * server-side fetch from Playwright's page.route() (that only sees requests
 * made by the browser page, not ones made by the Next.js server process).
 * Instead, this starts a real local HTTP server standing in for that route,
 * and .env.test's POSTPARTUM_POST_BASE_URL/FYP_ACTIVATE_API_SECRET point at
 * it — see that file's comment. The port here MUST match the one baked into
 * .env.test's POSTPARTUM_POST_BASE_URL.
 *
 * Lets tests control whether a given email is a brand-new PP member
 * (`created: true`, fresh id) or an existing one (`created: false`,
 * whatever id the test pre-registers via `registerExistingMember`) —
 * mirroring the real route's own lookup-or-create behavior.
 */

import http from "http";
import crypto from "crypto";

const STUB_PORT = 3900;

export interface PpActivateRequestBody {
  email: string;
  firstName: string;
  lastName: string;
  planType: string;
  bundleExpiresAt?: string;
}

export interface PpActivateStub {
  url: string;
  requests: PpActivateRequestBody[];
  /** Makes the next activation request for this email resolve as an
   * already-existing PP member with the given id, instead of minting a new
   * one. */
  registerExistingMember: (
    email: string,
    postpartumpostMemberId: string,
  ) => void;
  close: () => Promise<void>;
}

export function startPpActivateStub(): Promise<PpActivateStub> {
  const existingMembers = new Map<string, string>();
  const requests: PpActivateRequestBody[] = [];

  const server = http.createServer((req, res) => {
    if (req.method !== "POST" || req.url !== "/api/fyp/activate") {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not found" }));
      return;
    }

    const expectedAuth = `Bearer ${process.env.FYP_ACTIVATE_API_SECRET}`;
    if (req.headers.authorization !== expectedAuth) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Unauthorized" }));
      return;
    }

    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      const parsed = JSON.parse(body) as PpActivateRequestBody;
      requests.push(parsed);

      const email = parsed.email.toLowerCase();
      const existingId = existingMembers.get(email);

      res.writeHead(200, { "Content-Type": "application/json" });
      if (existingId) {
        res.end(
          JSON.stringify({
            postpartumpost_member_id: existingId,
            created: false,
          }),
        );
      } else {
        res.end(
          JSON.stringify({
            postpartumpost_member_id: crypto.randomUUID(),
            created: true,
          }),
        );
      }
    });
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(STUB_PORT, () => {
      resolve({
        url: `http://localhost:${STUB_PORT}`,
        requests,
        registerExistingMember: (email, postpartumpostMemberId) => {
          existingMembers.set(email.toLowerCase(), postpartumpostMemberId);
        },
        close: () => new Promise((r) => server.close(() => r())),
      });
    });
  });
}
