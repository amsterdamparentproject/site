import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { verifyTurnstile, verifyTurnstileForm } from "@/lib/turnstile";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function reply(body: unknown, status = 200) {
  fetchMock.mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

describe("verifyTurnstile", () => {
  it("skips the check when no secret key is configured", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    expect(await verifyTurnstile(undefined)).toEqual({ ok: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  describe("with a secret configured", () => {
    beforeEach(() => vi.stubEnv("TURNSTILE_SECRET_KEY", "test-secret"));

    it("refuses a missing token without calling Cloudflare", async () => {
      const result = await verifyTurnstile(undefined);
      expect(result.ok).toBe(false);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("refuses an oversized token without calling Cloudflare", async () => {
      expect((await verifyTurnstile("x".repeat(2049))).ok).toBe(false);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("accepts a token Cloudflare confirms, sending the secret and token", async () => {
      reply({ success: true });
      expect(await verifyTurnstile("good-token")).toEqual({ ok: true });
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      );
      expect((init.body as URLSearchParams).get("secret")).toBe("test-secret");
      expect((init.body as URLSearchParams).get("response")).toBe("good-token");
    });

    it("refuses a token Cloudflare rejects", async () => {
      reply({ success: false, "error-codes": ["invalid-input-response"] });
      expect((await verifyTurnstile("bad-token")).ok).toBe(false);
    });

    it("lets the request through if Cloudflare returns a server error", async () => {
      reply({}, 500);
      expect(await verifyTurnstile("any")).toEqual({ ok: true });
    });

    it("lets the request through if Cloudflare is unreachable", async () => {
      fetchMock.mockRejectedValue(new Error("network down"));
      expect(await verifyTurnstile("any")).toEqual({ ok: true });
    });
  });
});

describe("verifyTurnstileForm", () => {
  beforeEach(() => vi.stubEnv("TURNSTILE_SECRET_KEY", "test-secret"));

  it("reads the token from the turnstileToken field", async () => {
    reply({ success: true });
    const data = new FormData();
    data.append("turnstileToken", "form-token");
    expect(await verifyTurnstileForm(data)).toEqual({ ok: true });
    const [, init] = fetchMock.mock.calls[0];
    expect((init.body as URLSearchParams).get("response")).toBe("form-token");
  });

  it("refuses a form with no token", async () => {
    expect((await verifyTurnstileForm(new FormData())).ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("ignores a file posted under the token field name", async () => {
    const data = new FormData();
    data.append("turnstileToken", new Blob(["x"]), "x.txt");
    expect((await verifyTurnstileForm(data)).ok).toBe(false);
  });
});
