"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const rateLimiters_1 = require("@/middlewares/rateLimiters");
const mkReq = (body, ip = '1.2.3.4') => ({ body, ip });
vitest_1.vi.mock('express-rate-limit', () => ({
    ipKeyGenerator: vitest_1.vi.fn((ip) => `ip:${ip}`),
    rateLimit: vitest_1.vi.fn(),
}));
(0, vitest_1.describe)('getLoginKey', () => {
    (0, vitest_1.it)('email válido → login:email.lowercase', () => {
        (0, vitest_1.expect)((0, rateLimiters_1.getLoginKey)(mkReq({ email: 'Test@Exemplo.COM' }))).toBe('login:test@exemplo.com');
    });
    (0, vitest_1.it)('email vazio → IP fallback', () => {
        (0, vitest_1.expect)((0, rateLimiters_1.getLoginKey)(mkReq({ email: '' }))).toBe('ip:1.2.3.4');
    });
    (0, vitest_1.it)('email > 254 chars → IP fallback', () => {
        (0, vitest_1.expect)((0, rateLimiters_1.getLoginKey)(mkReq({ email: 'a'.repeat(255) }))).toBe('ip:1.2.3.4');
    });
    (0, vitest_1.it)('email não-string → IP fallback', () => {
        (0, vitest_1.expect)((0, rateLimiters_1.getLoginKey)(mkReq({ email: 123 }))).toBe('ip:1.2.3.4');
    });
    (0, vitest_1.it)('body ausente → IP fallback', () => {
        (0, vitest_1.expect)((0, rateLimiters_1.getLoginKey)(mkReq({}))).toBe('ip:1.2.3.4');
    });
    (0, vitest_1.it)('req sem body → IP fallback', () => {
        (0, vitest_1.expect)((0, rateLimiters_1.getLoginKey)({})).toBe('ip:unknown');
    });
});
(0, vitest_1.describe)('getResponseSubmissionKey', () => {
    (0, vitest_1.it)('PIN=6 → submission:pin', () => {
        (0, vitest_1.expect)((0, rateLimiters_1.getResponseSubmissionKey)(mkReq({ pin: 'abc123' }))).toBe('submission:abc123');
    });
    (0, vitest_1.it)('PIN≠6 → IP fallback', () => {
        (0, vitest_1.expect)((0, rateLimiters_1.getResponseSubmissionKey)(mkReq({ pin: 'abc12' }))).toBe('ip:1.2.3.4');
        (0, vitest_1.expect)((0, rateLimiters_1.getResponseSubmissionKey)(mkReq({ pin: 'abc1234' }))).toBe('ip:1.2.3.4');
    });
    (0, vitest_1.it)('PIN não-string → IP fallback (segurança NoSQL)', () => {
        (0, vitest_1.expect)((0, rateLimiters_1.getResponseSubmissionKey)(mkReq({ pin: { $ne: null } }))).toBe('ip:1.2.3.4');
        (0, vitest_1.expect)((0, rateLimiters_1.getResponseSubmissionKey)(mkReq({ pin: 123456 }))).toBe('ip:1.2.3.4');
        (0, vitest_1.expect)((0, rateLimiters_1.getResponseSubmissionKey)(mkReq({ pin: [] }))).toBe('ip:1.2.3.4');
    });
    (0, vitest_1.it)('body ausente → IP fallback', () => {
        (0, vitest_1.expect)((0, rateLimiters_1.getResponseSubmissionKey)(mkReq({}))).toBe('ip:1.2.3.4');
    });
});
