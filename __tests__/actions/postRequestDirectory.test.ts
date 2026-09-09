import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

import { postRequestDirectory } from "@/components/PostToWebhook";
import { isNumericOnlyEmail } from "@/lib/supabase/queries/blocklist";

// ─── isNumericOnlyEmail ─────────────────────────────────────────────────────

describe("isNumericOnlyEmail", () => {
  it("flags an all-digits local part", () => {
    expect(isNumericOnlyEmail("495793980@qq.com")).toBe(true);
  });

  it("does not flag a normal alphabetic local part", () => {
    expect(isNumericOnlyEmail("alex@example.com")).toBe(false);
  });

  it("does not flag a local part with digits mixed with letters", () => {
    expect(isNumericOnlyEmail("alex123@example.com")).toBe(false);
  });

  it("is case- and whitespace-tolerant", () => {
    expect(isNumericOnlyEmail("  123456@QQ.com  ")).toBe(true);
  });

  it("does not flag an empty string", () => {
    expect(isNumericOnlyEmail("")).toBe(false);
  });
});

// ─── postRequestDirectory — spam blocking ──────────────────────────────────

function buildFormData(overrides: Record<string, string> = {}) {
  const data = new FormData();
  data.append("name", "Alex");
  data.append("email", "person@example.com");
  data.append("categories", "Mom, Parenting");
  data.append("otherInterest", "");
  data.append("notes", "");
  data.append("subscribeNewsletter", "No");
  data.append("agreedToTerms", "Yes");
  data.append("hp_company", "");
  data.append("ts", String(Date.now() - 5000));
  Object.entries(overrides).forEach(([key, value]) => data.set(key, value));
  return data;
}

describe("postRequestDirectory — spam blocking", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue({ ok: true, status: 200, text: async () => "{}" }),
    );
    vi.stubEnv(
      "N8N_REQUEST_DIRECTORY_WEBHOOK_URL",
      "https://test-webhook.example.com",
    );
    vi.stubEnv(
      "TEST_N8N_REQUEST_DIRECTORY_WEBHOOK_URL",
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
    const data = buildFormData({ hp_company: "some bot value" });

    const result = await postRequestDirectory(data);

    expect(result).toEqual({ success: true, status: 200, response: "ok" });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("fakes a success response and skips the webhook when submitted too soon after rendering", async () => {
    const data = buildFormData({ ts: String(Date.now() - 100) });

    const result = await postRequestDirectory(data);

    expect(result).toEqual({ success: true, status: 200, response: "ok" });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("fakes a success response and skips the webhook when the timestamp is missing", async () => {
    const data = buildFormData();
    data.delete("ts");

    const result = await postRequestDirectory(data);

    expect(result).toEqual({ success: true, status: 200, response: "ok" });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("fakes a success response and skips the webhook when the email has an all-digits local part", async () => {
    const data = buildFormData({ email: "495793980@qq.com" });

    const result = await postRequestDirectory(data);

    expect(result).toEqual({ success: true, status: 200, response: "ok" });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("proceeds to the webhook for a legitimate submission", async () => {
    const data = buildFormData();

    const result = await postRequestDirectory(data);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
  });

  it("proceeds to the webhook for a real address that happens to contain digits", async () => {
    const data = buildFormData({ email: "alex99@example.com" });

    await postRequestDirectory(data);

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
