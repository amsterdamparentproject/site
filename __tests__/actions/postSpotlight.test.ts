import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// Hoisted mocks — must come before any imports that reference these modules
vi.mock("@/lib/supabase/server", () => ({ createServiceClient: vi.fn() }));

const sendMock = vi
  .fn()
  .mockResolvedValue({ data: { id: "test" }, error: null });
vi.mock("@/lib/resend", () => ({
  getResend: () => ({ emails: { send: sendMock } }),
}));

import { createServiceClient } from "@/lib/supabase/server";
import { postSpotlight } from "@/components/PostToWebhook";

// ─── Supabase blocklist mock helper (mirrors postEvent.test.ts) ──────────────

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
  data.append("type", "community");
  data.append("method", "form");
  data.append("name", "Jane Doe");
  data.append("email", "person@example.com");
  data.append("docLink", "");
  data.append(
    "interviewJSON",
    JSON.stringify([{ question: "Q1", answer: "A1" }]),
  );
  data.append(
    "bioJSON",
    JSON.stringify([{ label: "Originally from", answer: "Utrecht" }]),
  );
  data.append("hp_company", "");
  data.append("ts", String(Date.now() - 5000));
  Object.entries(overrides).forEach(([key, value]) => data.set(key, value));
  return data;
}

// ─── Test suite ───────────────────────────────────────────────────────────────

describe("postSpotlight — spam blocking", () => {
  beforeEach(() => {
    sendMock.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("fakes a success response and skips the email when the honeypot field is filled", async () => {
    mockBlocklistQuery();
    const data = buildFormData({ hp_company: "some bot value" });

    const result = await postSpotlight(data);

    expect(result).toEqual({ success: true });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("fakes a success response and skips the email when submitted too soon after rendering", async () => {
    mockBlocklistQuery();
    const data = buildFormData({ ts: String(Date.now() - 100) });

    const result = await postSpotlight(data);

    expect(result).toEqual({ success: true });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("fakes a success response and skips the email when the timestamp is missing", async () => {
    mockBlocklistQuery();
    const data = buildFormData();
    data.delete("ts");

    const result = await postSpotlight(data);

    expect(result).toEqual({ success: true });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("fakes a success response and skips the email when the email is blocklisted", async () => {
    const { inFn } = mockBlocklistQuery([{ value: "person@example.com" }]);
    const data = buildFormData();

    const result = await postSpotlight(data);

    expect(result).toEqual({ success: true });
    expect(inFn).toHaveBeenCalledWith("value", [
      "person@example.com",
      "example.com",
    ]);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("sends the notification email for a legitimate form submission", async () => {
    mockBlocklistQuery();
    const data = buildFormData();

    const result = await postSpotlight(data);

    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
    const [[call]] = sendMock.mock.calls;
    expect(call.subject).toContain("Jane Doe");
    expect(call.html).toContain("Jane Doe");
  });

  it("sends the doc link when method is 'doc'", async () => {
    mockBlocklistQuery();
    const data = buildFormData({
      method: "doc",
      docLink: "https://docs.google.com/document/d/abc123",
      interviewJSON: "[]",
      bioJSON: "[]",
    });

    const result = await postSpotlight(data);

    expect(result.success).toBe(true);
    const [[call]] = sendMock.mock.calls;
    expect(call.html).toContain("docs.google.com/document/d/abc123");
  });
});
