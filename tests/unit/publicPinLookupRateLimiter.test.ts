import { describe, it, expect, vi } from "vitest";
import type { Request } from "express";
import { publicPinLookupRateLimiter, PUBLIC_LOOKUP_MAX_FAILURES, PUBLIC_LOOKUP_WINDOW_MS } from "../../src/middlewares/rateLimiters";

const mkReq = (ip = "1.2.3.4") =>
  ({ ip }) as unknown as Request;

vi.mock("express-rate-limit", () => ({
  ipKeyGenerator: vi.fn((ip: string) => `ip:${ip}`),
  rateLimit: vi.fn(),
}));

describe("publicPinLookupRateLimiter configuration", () => {
  it("should have correct configuration values", () => {
    expect(PUBLIC_LOOKUP_WINDOW_MS).toBe(15 * 60 * 1000);
    expect(PUBLIC_LOOKUP_MAX_FAILURES).toBe(30);
  });

  it("should be exported as a function", () => {
    expect(typeof publicPinLookupRateLimiter).toBe("function");
  });
});