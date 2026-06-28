import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// Hoisted mocks — must come before any imports that reference these modules
vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createServiceClient: vi.fn() }));

import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/server";
import { postManageDirectory } from "@/components/PostToWebhook";

// ─── Cookie helpers ───────────────────────────────────────────────────────────

function noCookie() {
  vi.mocked(cookies).mockResolvedValue({ get: () => undefined } as any);
}

function withCookie(publicId: string) {
  vi.mocked(cookies).mockResolvedValue({
    get: (name: string) =>
      name === "app_uid" ? { name: "app_uid", value: publicId } : undefined,
  } as any);
}

// ─── Supabase mock helpers ────────────────────────────────────────────────────

/**
 * Cookie path: .from("users").select("id, email").eq("public_id", uid).single()
 */
function mockUserLookupByPublicId(
  result: { id: string; email: string } | null,
) {
  const single = vi.fn().mockResolvedValue({ data: result, error: null });
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

/**
 * Email path: .from("users").select("id, public_id").eq("email", ...).single()
 * plus optionally .from("users").insert({...}).select("id").single() for new users.
 */
function mockUserLookupByEmail(
  existing: { id: string; public_id: string } | null,
  insertResult: { id: string } | null = null,
  insertError: any = null,
) {
  const single = vi.fn().mockResolvedValue({ data: existing, error: null });
  const insertSingle = vi.fn().mockResolvedValue({
    data: insertResult,
    error: insertError,
  });
  const fromResult = {
    select: vi
      .fn()
      .mockReturnValue({ eq: vi.fn().mockReturnValue({ single }) }),
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({ single: insertSingle }),
    }),
  };
  const client = { from: vi.fn().mockReturnValue(fromResult) };
  vi.mocked(createServiceClient).mockReturnValue(client as any);
  return { client, fromResult, single, insertSingle };
}

// ─── Test suite ───────────────────────────────────────────────────────────────

describe("postManageDirectory — email + userId + publicId resolution", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue({ ok: true, status: 200, text: async () => "{}" }),
    );
    vi.stubEnv(
      "N8N_MANAGE_DIRECTORY_WEBHOOK_URL",
      "https://test-webhook.example.com",
    );
    vi.stubEnv("TEST_N8N_MANAGE_DIRECTORY_WEBHOOK_URL", "https://test-webhook.example.com");
    vi.stubEnv("N8N_WEBHOOK_SECRET", "test-secret");
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  // ── Cookie path ─────────────────────────────────────────────────────────────

  describe("cookie path — email absent from FormData", () => {
    it("sets email, userId (user.id), and publicId (app_uid) from cookie lookup", async () => {
      withCookie("public-token-abc");
      mockUserLookupByPublicId({
        id: "uuid-internal-123",
        email: "user@example.com",
      });

      const formData = new FormData();
      formData.append("email", "");

      await postManageDirectory(formData, "add");

      expect(formData.get("email")).toBe("user@example.com");
      expect(formData.get("userId")).toBe("uuid-internal-123");
      expect(formData.get("publicId")).toBe("public-token-abc");
    });

    it("looks up user by public_id using the cookie value", async () => {
      withCookie("public-token-xyz");
      const { client } = mockUserLookupByPublicId({
        id: "uuid-7",
        email: "u@example.com",
      });

      const formData = new FormData();
      formData.append("email", "");
      await postManageDirectory(formData, "add");

      const eqMock =
        client.from.mock.results[0].value.select.mock.results[0].value.eq;
      expect(eqMock).toHaveBeenCalledWith("public_id", "public-token-xyz");
    });

    it("selects id and email from the users table", async () => {
      withCookie("tok");
      const { client } = mockUserLookupByPublicId({
        id: "uuid-1",
        email: "u@example.com",
      });

      const formData = new FormData();
      formData.append("email", "");
      await postManageDirectory(formData, "add");

      expect(client.from.mock.results[0].value.select).toHaveBeenCalledWith(
        "id, email",
      );
    });

    it("leaves fields unset when no cookie is present", async () => {
      noCookie();

      const formData = new FormData();
      formData.append("email", "");

      const result = await postManageDirectory(formData, "add");

      expect(vi.mocked(createServiceClient)).not.toHaveBeenCalled();
      expect(formData.get("email")).toBe("");
      expect(formData.get("userId")).toBeNull();
      expect(formData.get("publicId")).toBeNull();
      expect(result.userCreated).toBe(false);
    });

    it("leaves fields unset when cookie is present but user not found in DB", async () => {
      withCookie("unknown-token");
      mockUserLookupByPublicId(null);

      const formData = new FormData();
      formData.append("email", "");

      await postManageDirectory(formData, "add");

      expect(formData.get("email")).toBe("");
      expect(formData.get("userId")).toBeNull();
      expect(formData.get("publicId")).toBeNull();
    });
  });

  // ── Email path ──────────────────────────────────────────────────────────────

  describe("email path — email present in FormData", () => {
    it("sets userId (user.id) and publicId (user.public_id) for existing user", async () => {
      mockUserLookupByEmail({ id: "uuid-99", public_id: "pub-token-99" });

      const formData = new FormData();
      formData.append("email", "existing@example.com");

      const result = await postManageDirectory(formData, "add");

      expect(formData.get("userId")).toBe("uuid-99");
      expect(formData.get("publicId")).toBe("pub-token-99");
      expect(result.userCreated).toBe(false);
    });

    it("creates a new user and sets userId + publicId when user is not found", async () => {
      mockUserLookupByEmail(null, { id: "uuid-new" });

      const formData = new FormData();
      formData.append("email", "new@example.com");

      const result = await postManageDirectory(formData, "add");

      expect(formData.get("userId")).toBe("uuid-new");
      expect(formData.get("publicId")).toBeTruthy();
      expect(result.userCreated).toBe(true);
    });

    it("inserts new user with email, a generated public_id, null name, and empty categories", async () => {
      const { fromResult } = mockUserLookupByEmail(null, { id: "uuid-new" });

      const formData = new FormData();
      formData.append("email", "new@example.com");

      await postManageDirectory(formData, "add");

      expect(fromResult.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "new@example.com",
          name: null,
          categories: [],
        }),
      );
    });

    it("generates a unique publicId for each new user", async () => {
      mockUserLookupByEmail(null, { id: "uuid-1" });
      const formData1 = new FormData();
      formData1.append("email", "a@example.com");
      await postManageDirectory(formData1, "add");

      vi.clearAllMocks();
      vi.stubGlobal(
        "fetch",
        vi
          .fn()
          .mockResolvedValue({ ok: true, status: 200, text: async () => "{}" }),
      );
      mockUserLookupByEmail(null, { id: "uuid-2" });
      const formData2 = new FormData();
      formData2.append("email", "b@example.com");
      await postManageDirectory(formData2, "add");

      expect(formData1.get("publicId")).not.toBe(formData2.get("publicId"));
    });

    it("does not set userId or publicId and returns userCreated: false when insert fails", async () => {
      mockUserLookupByEmail(null, null, { message: "duplicate key" });

      const formData = new FormData();
      formData.append("email", "new@example.com");

      const result = await postManageDirectory(formData, "add");

      expect(formData.get("userId")).toBeNull();
      expect(formData.get("publicId")).toBeNull();
      expect(result.userCreated).toBe(false);
    });

    it("selects id and public_id when looking up by email", async () => {
      const { client } = mockUserLookupByEmail({
        id: "uuid-5",
        public_id: "tok",
      });

      const formData = new FormData();
      formData.append("email", "lookup@example.com");
      await postManageDirectory(formData, "add");

      expect(client.from.mock.results[0].value.select).toHaveBeenCalledWith(
        "id, public_id",
      );
    });
  });
});
