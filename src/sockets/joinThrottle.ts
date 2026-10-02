export function createJoinThrottle(maxAttempts: number, windowMs: number) {
  let attempts = 0;
  let windowStart = Date.now();

  return function checkThrottle(): boolean {
    const now = Date.now();

    if (now - windowStart >= windowMs) {
      attempts = 0;
      windowStart = now;
    }

    attempts++;

    return attempts <= maxAttempts;
  };
}