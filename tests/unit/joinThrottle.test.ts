import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createJoinThrottle } from "../../src/sockets/joinThrottle";

describe("createJoinThrottle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("permite 10 tentativas dentro da janela", () => {
    const throttle = createJoinThrottle(10, 60_000);
    for (let i = 0; i < 10; i++) {
      expect(throttle()).toBe(true);
    }
  });

  it("bloqueia 11ª tentativa na mesma janela", () => {
    const throttle = createJoinThrottle(10, 60_000);
    for (let i = 0; i < 10; i++) throttle();
    expect(throttle()).toBe(false);
  });

  it("reseta contador após windowMs expirar", () => {
    const throttle = createJoinThrottle(10, 60_000);
    for (let i = 0; i < 10; i++) throttle();
    vi.advanceTimersByTime(61_000);
    expect(throttle()).toBe(true);
  });

  it("instâncias independentes têm contadores isolados", () => {
    const t1 = createJoinThrottle(2, 60_000);
    const t2 = createJoinThrottle(2, 60_000);
    t1();
    t1();
    expect(t1()).toBe(false);
    expect(t2()).toBe(true);
    expect(t2()).toBe(true);
    expect(t2()).toBe(false);
  });

  it("maxAttempts=0 sempre bloqueia", () => {
    const throttle = createJoinThrottle(0, 60_000);
    expect(throttle()).toBe(false);
  });
});
