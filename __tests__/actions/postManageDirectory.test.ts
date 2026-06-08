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

function withCookie(uid: string) {
  vi.mocked(cookies).mockResolvedValue({
    get: (name: string) =>
      name === "app_uid" ? { name: "app_uid", value: uid } : undefined,
  } as any);
}

// ─── Supabase mock helpers ────────────────────────────────────────────────────

/**
 * Cookie path: .from("users").select("id, email").eq("public_id", uid).single()
 */
function mockUserLookupByUid(result: { id: number; email: string } | null) {
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
 * plus optionally .from("users").insert({...}).select("id").single()
 */
function mockUserLookupByEmail(
  lookupResult: { id: number; public_id: string } | null,
  insertId: number | null = null,
  insertError: any = null,
) {
  const single = vi.fn().mockResolvedValue({ data: lookupResult, error: null });
  const insertSingle = vi.fn().mockResolvedValue({
    data: insertId !== null ? { id: insertId } : null,
    error: insertError,
  });
  const fromResult = {
    select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single }) }),
    insert: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: insertSingle }) }),
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
      vi.fn().mockResolvedValue({ ok: true, status: 200, text: async () => "{}" }),
    );
    // NODE_ENV in Vitest is "test" → isLocal=false → uses N8N_MANAGE_DIRECTORY_WEBHOOK_URL
    vi.stubEnv("N8N_MANAGE_DIRECTORY_WEBHOOK_URL", "https://test-webhook.example.com");
    vi.stubEnv("N8N_WEBHOOK_SECRET", "test-secret");
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  // ── Cookie path (no email in FormData) ──────────────────────────────────────

  describe("cookie path — email absent from FormData", () => {
    it("resolves email, sets userId to user.id, and publicId to the cookie value", async () => {
      withCookie("public-token-abc");
      mockUserLookupByUid({ id: 42, email: "cookie-user@example.com" });

      const formData = new FormData();
      formData.append("email", "");

      await postManageDirectory(formData, "add");

      expect(formData.get("email")).toBe("cookie-user@example.com");
      expect(formData.get("userId")).toBe("42");
      expect(formData.get("publicId")).toBe("public-token-abc");
    });

    it("queries users by public_id using the cookie value", async () => {
      withCookie("uid-xyz");
      const { client } = mockUserLookupByUid({ id: 7, email: "u@example.com" });

      const formData = new FormData();
      formData.append("email", "");
      await postManageDirectory(formData, "add");

      const eqMock = client.from.mock.results[0].value.select.mock.results[0].value.eq;
      expect(eqMock).toHaveBeenCalledWith("public_id", "uid-xyz");
    });

    it("selects id and email (not public_id) from the users table", async () => {
      withCookie("uid-xyz");
      const { client } = mockUserLookupByUid({ id: 7, email: "u@example.com" });

      const formData = new FormData();
      formData.append("email", "");
      await postManageDirectory(formData, "add");

      const selectMock = client.from.mock.results[0].value.select;
      expect(selectMock).toHaveBeenCalledWith("id, email");
    });

    it("leaves email, userId, and publicId unset when no cookie is present", async () => {
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
      withCookie("unknown-uid");
      mockUserLookupByUid(null);

      const formData = new FormData();
      formData.append("email", "");

      await postManageDirectory(formData, "add");

      expect(formData.get("email")).toBe("");
      expect(formData.get("userId")).toBeNull();
      expect(formData.get("publicId")).toBeNull();
    });

    it("treats whitespace-only email as absent (takes cookie path)", async () => {
      noCookie();

      const formData = new FormData();
      formData.append("email", "   ");

      await postManageDirectory(formData, "add");

      expect(vi.mocked(createServiceClient)).not.toHaveBeenCalled();
    });
  });

  // ── Email path (email present in FormData) ──────────────────────────────────

  describe("email path — email present in FormData", () => {
    it("sets userId to user.id and publicId to user.public_id when user exists", async () => {
      mockUserLookupByEmail({ id: 99, public_id: "existing-token" });

      const formData = new FormData();
      formData.append("email", "existing@example.com");

      const result = await postManageDirectory(formData, "add");

      expect(formData.get("userId")).toBe("99");
      expect(formData.get("publicId")).toBe("existing-token");
      expect(result.userCreated).toBe(false);
    });

    it("creates a new user and sets userId + publicId when user is not found", async () => {
      mockUserLookupByEmail(null, 101);

      const formData = new FormData();
      formData.append("email", "newuser@example.com");

      const result = await postManageDirectory(formData, "add");

      expect(formData.get("userId")).toBe("101");
      expect(formData.get("publicId")).toBeTruthy();
      expect(result.userCreated).toBe(true);
    });

    it("inserts new user with the provided email, null name, and empty categories", async () => {
      const { fromResult } = mockUserLookupByEmail(null, 101);

      const formData = new FormData();
      formData.append("email", "newuser@example.com");

      await postManageDirectory(formData, "add");

      expect(fromResult.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "newuser@example.com",
          name: null,
          categories: [],
        }),
      );
    });

    it("generates a unique publicId for each new user", async () => {
      mockUserLookupByEmail(null, 101);
      const formData1 = new FormData();
      formData1.append("email", "a@example.com");
      await postManageDirectory(formData1, "add");

      vi.clearAllMocks();
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200, text: async () => "{}" }));
      mockUserLookupByEmail(null, 102);
      const formData2 = new FormData();
      formData2.append("email", "b@example.com");
      await postManageDirectory(formData2, "add");

      expect(formData1.get("publicId")).not.toBe(formData2.get("publicId"));
    });

    it("does not set userId or publicId and returns userCreated: false when insert fails", async () => {
      mockUserLookupByEmail(null, null, { message: "duplicate key" });

      const formData = new FormData();
      formData.append("email", "newuser@example.com");

      const result = await postManageDirectory(formData, "add");

      expect(formData.get("userId")).toBeNull();
      expect(formData.get("publicId")).toBeNull();
      expect(result.userCreated).toBe(false);
    });

    it("looks up user by email column", async () => {
      const { client } = mockUserLookupByEmail({ id: 5, public_id: "tok" });

      const formData = new FormData();
      formData.append("email", "lookup@example.com");
      await postManageDirectory(formData, "add");

      const eqMock = client.from.mock.results[0].value.select.mock.results[0].value.eq;
      expect(eqMock).toHaveBeenCalledWith("email", "lookup@example.com");
    });

    it("selects id and public_id (not email) when looking up by email", async () => {
      const { client } = mockUserLookupByEmail({ id: 5, public_id: "tok" });

      const formData = new FormData();
      formData.append("email", "lookup@example.com");
      await postManageDirectory(formData, "add");

      const selectMock = client.from.mock.results[0].value.select;
      expect(selectMock).toHaveBeenCalledWith("id, public_id");
    });
  });
});
