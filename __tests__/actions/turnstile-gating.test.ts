import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// Every public server action must refuse a submission whose Turnstile check
// fails — and do so before touching n8n, Storage, email or the users table.

const verify = vi.hoisted(() => vi.fn());
vi.mock("@/lib/turnstile", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/turnstile")>("@/lib/turnstile");
  return {
    ...actual,
    verifyTurnstile: verify,
    verifyTurnstileForm: (d: FormData) =>
      verify(d.get(actual.TURNSTILE_FIELD) ?? undefined),
  };
});

const createServiceClient = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("database must not be touched when Turnstile fails");
  }),
);
vi.mock("@/lib/supabase/server", () => ({ createServiceClient }));
vi.mock("@/lib/supabase/queries/blocklist", () => ({
  isEmailBlocked: async () => false,
  isNumericOnlyEmail: () => false,
}));
vi.mock("@/lib/emails/spotlight-submission", () => ({
  sendSpotlightSubmissionEmail: vi.fn(),
}));

import {
  postEvent,
  postRequestDirectory,
  postSpotlight,
} from "@/components/PostToWebhook";

const fetchMock = vi.fn();

beforeEach(() => {
  verify.mockReset();
  createServiceClient.mockClear();
  fetchMock
    .mockReset()
    .mockResolvedValue({ ok: true, status: 200, text: async () => "{}" });
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("N8N_WEBHOOK_SECRET", "s");
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function humanForm(extra: Record<string, string> = {}) {
  const data = new FormData();
  data.append("title", "Baby music class");
  data.append("url", "https://example.com");
  data.append("name", "Alex");
  data.append("email", "person@example.com");
  data.append("groupName", "Test group");
  data.append("hp_company", "");
  data.append("ts", String(Date.now() - 10_000)); // passes the honeypot/timing check
  data.append("turnstileToken", "tok");
  Object.entries(extra).forEach(([k, v]) => data.set(k, v));
  return data;
}

const refusal = { ok: false, error: "We couldn't confirm you're a person." };

describe("Turnstile gating on public server actions", () => {
  it("postEvent refuses and does not call n8n", async () => {
    verify.mockResolvedValue(refusal);
    const res = await postEvent(humanForm());
    expect(res.success).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("postRequestDirectory refuses and does not call n8n", async () => {
    verify.mockResolvedValue(refusal);
    const res = await postRequestDirectory(humanForm());
    expect(res.success).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("postSpotlight refuses and sends no email", async () => {
    verify.mockResolvedValue(refusal);
    const res = await postSpotlight(humanForm({ type: "community" }));
    expect(res.success).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("a honeypot hit still gets the silent fake success, without spending a Turnstile call", async () => {
    const res = await postRequestDirectory(humanForm({ hp_company: "Acme" }));
    expect(res.success).toBe(true);
    expect(verify).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("postRequestDirectory passes the token to verification and does not forward it to n8n", async () => {
    verify.mockResolvedValue({ ok: true });
    vi.stubEnv(
      "TEST_N8N_REQUEST_DIRECTORY_WEBHOOK_URL",
      "https://hook.example.com",
    );
    vi.stubEnv("N8N_REQUEST_DIRECTORY_WEBHOOK_URL", "https://hook.example.com");
    await postRequestDirectory(humanForm());
    expect(verify).toHaveBeenCalledWith("tok");
    const [, init] = fetchMock.mock.calls[0];
    expect((init.body as FormData).has("turnstileToken")).toBe(false);
  });
});
