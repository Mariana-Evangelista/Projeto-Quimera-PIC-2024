"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const env_1 = require("@/shared/env");
(0, vitest_1.describe)('validateEnv', () => {
    const originalEnv = Object.assign({}, process.env);
    function setValidEnv() {
        process.env.MONGO_URL = 'mongodb://localhost:27017/db';
        process.env.JWT_SECRET = 'a'.repeat(32);
        process.env.CORS_ORIGIN = 'http://localhost:3000';
    }
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.resetModules();
        process.env = Object.assign({}, originalEnv);
        setValidEnv();
    });
    (0, vitest_1.afterAll)(() => {
        process.env = originalEnv;
    });
    (0, vitest_1.it)('retorna [] com variáveis válidas', () => {
        (0, vitest_1.expect)((0, env_1.validateEnv)()).toEqual([]);
    });
    (0, vitest_1.it)('falha MONGO_URL ausente', () => {
        delete process.env.MONGO_URL;
        (0, vitest_1.expect)((0, env_1.validateEnv)()).toContain('MONGO_URL é obrigatória');
    });
    (0, vitest_1.it)('falha MONGO_URL protocolo inválido', () => {
        process.env.MONGO_URL = 'postgres://x';
        (0, vitest_1.expect)((0, env_1.validateEnv)()).toContain('MONGO_URL deve começar com mongodb:// ou mongodb+srv://');
    });
    (0, vitest_1.it)('falha JWT_SECRET ausente', () => {
        delete process.env.JWT_SECRET;
        (0, vitest_1.expect)((0, env_1.validateEnv)()).toContain('JWT_SECRET é obrigatória');
    });
    (0, vitest_1.it)('falha JWT_SECRET < 32', () => {
        process.env.JWT_SECRET = 'x'.repeat(31);
        (0, vitest_1.expect)((0, env_1.validateEnv)()).toContain('JWT_SECRET deve ter no mínimo 32 caracteres');
    });
    (0, vitest_1.it)('falha CORS_ORIGIN ausente', () => {
        delete process.env.CORS_ORIGIN;
        (0, vitest_1.expect)((0, env_1.validateEnv)()).toContain('CORS_ORIGIN é obrigatória');
    });
    (0, vitest_1.it)('falha CORS_ORIGIN URL inválida', () => {
        process.env.CORS_ORIGIN = 'not-a-url';
        (0, vitest_1.expect)((0, env_1.validateEnv)()).toContain('CORS_ORIGIN deve ser uma URL válida (ex.: http://localhost:3000)');
    });
    (0, vitest_1.it)('falha CORS_ORIGIN protocolo inválido', () => {
        process.env.CORS_ORIGIN = 'ftp://x';
        (0, vitest_1.expect)((0, env_1.validateEnv)()).toContain('CORS_ORIGIN deve usar protocolo http:// ou https://');
    });
    (0, vitest_1.it)('falha PORT inválida', () => {
        process.env.PORT = '70000';
        (0, vitest_1.expect)((0, env_1.validateEnv)()).toContain('PORT deve ser um inteiro entre 1 e 65535');
    });
    (0, vitest_1.it)('getJwtSecret retorna secret', () => {
        process.env.JWT_SECRET = 'x'.repeat(32);
        (0, vitest_1.expect)((0, env_1.getJwtSecret)()).toBe('x'.repeat(32));
    });
    (0, vitest_1.it)('getJwtSecret lança sem secret', () => {
        delete process.env.JWT_SECRET;
        (0, vitest_1.expect)(() => (0, env_1.getJwtSecret)()).toThrow('JWT_SECRET não configurada');
    });
});
