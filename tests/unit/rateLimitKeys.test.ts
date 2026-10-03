import { describe, it, expect, vi } from "vitest";
import type { Request } from "express";
import {
  getLoginKey,
  getResponseSubmissionKey,
} from "../../src/middlewares/rateLimiters";

const mkReq = (body: Record<string, unknown>, ip = "1.2.3.4") =>
  ({ body, ip }) as unknown as Request;

vi.mock("express-rate-limit", () => ({
  ipKeyGenerator: vi.fn((ip: string) => `ip:${ip}`),
  rateLimit: vi.fn(),
}));

describe("getLoginKey", () => {
  it("email válido → login:email.lowercase", () => {
    expect(getLoginKey(mkReq({ email: "Test@Exemplo.COM" }))).toBe(
      "login:test@exemplo.com",
    );
  });

  it("email vazio → IP fallback", () => {
    expect(getLoginKey(mkReq({ email: "" }))).toBe("ip:1.2.3.4");
  });

  it("email > 254 chars → IP fallback", () => {
    expect(getLoginKey(mkReq({ email: "a".repeat(255) }))).toBe("ip:1.2.3.4");
  });

  it("email não-string → IP fallback", () => {
    expect(getLoginKey(mkReq({ email: 123 }))).toBe("ip:1.2.3.4");
  });

  it("body ausente → IP fallback", () => {
    expect(getLoginKey(mkReq({}))).toBe("ip:1.2.3.4");
  });

  it("req sem body → IP fallback", () => {
    expect(getLoginKey({} as any)).toBe("ip:unknown");
  });
});

describe("getResponseSubmissionKey", () => {
  it("PIN=6 → submission:pin", () => {
    expect(getResponseSubmissionKey(mkReq({ pin: "abc123" }))).toBe(
      "submission:abc123",
    );
  });

  it("PIN≠6 → IP fallback", () => {
    expect(getResponseSubmissionKey(mkReq({ pin: "abc12" }))).toBe(
      "ip:1.2.3.4",
    );
    expect(getResponseSubmissionKey(mkReq({ pin: "abc1234" }))).toBe(
      "ip:1.2.3.4",
    );
  });

  it("PIN não-string → IP fallback (segurança NoSQL)", () => {
    expect(getResponseSubmissionKey(mkReq({ pin: { $ne: null } }))).toBe(
      "ip:1.2.3.4",
    );
    expect(getResponseSubmissionKey(mkReq({ pin: 123456 }))).toBe("ip:1.2.3.4");
    expect(getResponseSubmissionKey(mkReq({ pin: [] }))).toBe("ip:1.2.3.4");
  });

  it("body ausente → IP fallback", () => {
    expect(getResponseSubmissionKey(mkReq({}))).toBe("ip:1.2.3.4");
  });
});
