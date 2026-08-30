import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// Hoisted mocks — must come before any imports that reference these modules
vi.mock("@/lib/supabase/server", () => ({ createServiceClient: vi.fn() }));

import { createServiceClient } from "@/lib/supabase/server";
import { postEvent } from "@/components/PostToWebhook";

// ─── Supabase mock helpers ────────────────────────────────────────────────────

/**
 * Blocklist path: .from("submission_blocklist").select("value").in("value", [...])
 */
function mockBlocklistQuery(matches: { value: string }[] = []) {
  const inFn = vi.fn().mockResolvedValue({ data: matches, error: null });
  const client = {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({ in: inFn }),
    }),
  };
  vi.mocked(createServiceClient).mockReturnValue(client as any);
  return { client, inFn };
}

function buildFormData(overrides: Record<string, string> = {}) {
  const data = new FormData();
  data.append("title", "Parent & child yoga");
  data.append("url", "https://example.com/event");
  data.append("email", "person@example.com");
  data.append("notes", "");
  data.append("hp_company", "");
  data.append("ts", String(Date.now() - 5000));
  Object.entries(overrides).forEach(([key, value]) => data.set(key, value));
  return data;
}

// ─── Test suite ───────────────────────────────────────────────────────────────

describe("postEvent — spam blocking", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue({ ok: true, status: 200, text: async () => "{}" }),
    );
    vi.stubEnv(
      "N8N_EVENT_SUBMIT_WEBHOOK_URL",
      "https://test-webhook.example.com",
    );
    vi.stubEnv(
      "TEST_N8N_EVENT_SUBMIT_WEBHOOK_URL",
      "https://test-webhook.example.com",
    );
    vi.stubEnv("N8N_WEBHOOK_SECRET", "test-secret");
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("fakes a success response and skips the webhook when the honeypot field is filled", async () => {
    mockBlocklistQuery();
    const data = buildFormData({ hp_company: "some bot value" });

    const result = await postEvent(data);

    expect(result).toEqual({ success: true, status: 200, response: "ok" });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("fakes a success response and skips the webhook when submitted too soon after rendering", async () => {
    mockBlocklistQuery();
    const data = buildFormData({ ts: String(Date.now() - 100) });

    const result = await postEvent(data);

    expect(result).toEqual({ success: true, status: 200, response: "ok" });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("fakes a success response and skips the webhook when the timestamp is missing", async () => {
    mockBlocklistQuery();
    const data = buildFormData();
    data.delete("ts");

    const result = await postEvent(data);

    expect(result).toEqual({ success: true, status: 200, response: "ok" });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("fakes a success response and skips the webhook when the email is blocklisted", async () => {
    const { inFn } = mockBlocklistQuery([{ value: "person@example.com" }]);
    const data = buildFormData();

    const result = await postEvent(data);

    expect(result).toEqual({ success: true, status: 200, response: "ok" });
    expect(inFn).toHaveBeenCalledWith("value", [
      "person@example.com",
      "example.com",
    ]);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("proceeds to the webhook for a legitimate submission", async () => {
    mockBlocklistQuery();
    const data = buildFormData();

    const result = await postEvent(data);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
  });
});
