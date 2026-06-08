import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// Hoisted mocks — must come before any imports that reference these modules
vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createServiceClient: vi.fn() }));

import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/server";
import { postManageDirectory } from "@/components/PostToWebhook";

// Builds a chainable Supabase mock that resolves .single() with the given value
function mockSupabaseUser(result: { data: { email: string } | null }) {
  const single = vi.fn().mockResolvedValue(result);
  const client = {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single }),
      }),
    }),
  };
  vi.mocked(createServiceClient).mockReturnValue(client as any);
  return { client, single };
}

describe("postManageDirectory — email resolution", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200, text: async () => "{}" }),
    );
    // NODE_ENV in Vitest is "test" so isLocal=false → uses N8N_MANAGE_DIRECTORY_WEBHOOK_URL
    vi.stubEnv("N8N_MANAGE_DIRECTORY_WEBHOOK_URL", "https://test-webhook.example.com");
    vi.stubEnv("N8N_WEBHOOK_SECRET", "test-secret");
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("resolves email from Supabase when FormData email is empty and cookie is present", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: (name: string) =>
        name === "app_uid" ? { name: "app_uid", value: "uid-abc123" } : undefined,
    } as any);
    mockSupabaseUser({ data: { email: "resolved@example.com" } });

    const formData = new FormData();
    formData.append("groupName", "Test Group");
    formData.append("inviteLink", "https://chat.whatsapp.com/test");
    formData.append("email", "");

    await postManageDirectory(formData, "add");

    expect(formData.get("email")).toBe("resolved@example.com");
  });

  it("queries users by public_id when resolving email", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: (name: string) =>
        name === "app_uid" ? { name: "app_uid", value: "uid-xyz" } : undefined,
    } as any);
    const { client } = mockSupabaseUser({ data: { email: "user@example.com" } });

    const formData = new FormData();
    formData.append("email", "");
    await postManageDirectory(formData, "add");

    expect(client.from).toHaveBeenCalledWith("users");
    const eqMock = client.from.mock.results[0].value.select.mock.results[0].value.eq;
    expect(eqMock).toHaveBeenCalledWith("public_id", "uid-xyz");
  });

  it("skips Supabase lookup when email is already in FormData", async () => {
    const formData = new FormData();
    formData.append("groupName", "Test Group");
    formData.append("inviteLink", "https://chat.whatsapp.com/test");
    formData.append("email", "already@example.com");

    await postManageDirectory(formData, "add");

    expect(vi.mocked(createServiceClient)).not.toHaveBeenCalled();
    expect(formData.get("email")).toBe("already@example.com");
  });

  it("skips Supabase lookup when email is whitespace-only", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: () => undefined,
    } as any);

    const formData = new FormData();
    formData.append("email", "   ");

    await postManageDirectory(formData, "add");

    // whitespace-only triggers the lookup path, but no cookie → no Supabase call
    expect(vi.mocked(createServiceClient)).not.toHaveBeenCalled();
  });

  it("leaves email empty when no cookie is present", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: () => undefined,
    } as any);

    const formData = new FormData();
    formData.append("email", "");

    await postManageDirectory(formData, "add");

    expect(vi.mocked(createServiceClient)).not.toHaveBeenCalled();
    expect(formData.get("email")).toBe("");
  });

  it("leaves email empty when cookie is present but user not found in DB", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: (name: string) =>
        name === "app_uid" ? { name: "app_uid", value: "unknown-uid" } : undefined,
    } as any);
    mockSupabaseUser({ data: null });

    const formData = new FormData();
    formData.append("email", "");

    await postManageDirectory(formData, "add");

    expect(formData.get("email")).toBe("");
  });
});
