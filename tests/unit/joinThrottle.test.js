"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const joinThrottle_1 = require("@/sockets/joinThrottle");
(0, vitest_1.describe)('createJoinThrottle', () => {
    (0, vitest_1.beforeEach)(() => vitest_1.vi.useFakeTimers());
    (0, vitest_1.afterEach)(() => vitest_1.vi.useRealTimers());
    (0, vitest_1.it)('permite 10 tentativas dentro da janela', () => {
        const throttle = (0, joinThrottle_1.createJoinThrottle)(10, 60000);
        for (let i = 0; i < 10; i++) {
            (0, vitest_1.expect)(throttle()).toBe(true);
        }
    });
    (0, vitest_1.it)('bloqueia 11ª tentativa na mesma janela', () => {
        const throttle = (0, joinThrottle_1.createJoinThrottle)(10, 60000);
        for (let i = 0; i < 10; i++)
            throttle();
        (0, vitest_1.expect)(throttle()).toBe(false);
    });
    (0, vitest_1.it)('reseta contador após windowMs expirar', () => {
        const throttle = (0, joinThrottle_1.createJoinThrottle)(10, 60000);
        for (let i = 0; i < 10; i++)
            throttle();
        vitest_1.vi.advanceTimersByTime(61000);
        (0, vitest_1.expect)(throttle()).toBe(true);
    });
    (0, vitest_1.it)('instâncias independentes têm contadores isolados', () => {
        const t1 = (0, joinThrottle_1.createJoinThrottle)(2, 60000);
        const t2 = (0, joinThrottle_1.createJoinThrottle)(2, 60000);
        t1();
        t1();
        (0, vitest_1.expect)(t1()).toBe(false);
        (0, vitest_1.expect)(t2()).toBe(true);
        (0, vitest_1.expect)(t2()).toBe(true);
        (0, vitest_1.expect)(t2()).toBe(false);
    });
    (0, vitest_1.it)('maxAttempts=0 sempre bloqueia', () => {
        const throttle = (0, joinThrottle_1.createJoinThrottle)(0, 60000);
        (0, vitest_1.expect)(throttle()).toBe(false);
    });
});
