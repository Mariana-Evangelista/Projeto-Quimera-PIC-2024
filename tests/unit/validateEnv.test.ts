import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { validateEnv, getJwtSecret } from "../../src/shared/env";

describe("validateEnv", () => {
  const originalEnv = { ...process.env };

  function setValidEnv() {
    process.env.MONGO_URL = "mongodb://localhost:27017/db";
    process.env.JWT_SECRET = "a".repeat(32);
    process.env.CORS_ORIGIN = "http://localhost:3000";
  }

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    setValidEnv();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("retorna [] com variáveis válidas", () => {
    expect(validateEnv()).toEqual([]);
  });

  it("falha MONGO_URL ausente", () => {
    delete process.env.MONGO_URL;
    expect(validateEnv()).toContain("MONGO_URL é obrigatória");
  });

  it("falha MONGO_URL protocolo inválido", () => {
    process.env.MONGO_URL = "postgres://x";
    expect(validateEnv()).toContain(
      "MONGO_URL deve começar com mongodb:// ou mongodb+srv://",
    );
  });

  it("falha JWT_SECRET ausente", () => {
    delete process.env.JWT_SECRET;
    expect(validateEnv()).toContain("JWT_SECRET é obrigatória");
  });

  it("falha JWT_SECRET < 32", () => {
    process.env.JWT_SECRET = "x".repeat(31);
    expect(validateEnv()).toContain(
      "JWT_SECRET deve ter no mínimo 32 caracteres",
    );
  });

  it("falha CORS_ORIGIN ausente", () => {
    delete process.env.CORS_ORIGIN;
    expect(validateEnv()).toContain("CORS_ORIGIN é obrigatória");
  });

  it("falha CORS_ORIGIN URL inválida", () => {
    process.env.CORS_ORIGIN = "not-a-url";
    expect(validateEnv()).toContain(
      "CORS_ORIGIN deve ser uma URL válida (ex.: http://localhost:3000)",
    );
  });

  it("falha CORS_ORIGIN protocolo inválido", () => {
    process.env.CORS_ORIGIN = "ftp://x";
    expect(validateEnv()).toContain(
      "CORS_ORIGIN deve usar protocolo http:// ou https://",
    );
  });

  it("falha PORT inválida", () => {
    process.env.PORT = "70000";
    expect(validateEnv()).toContain("PORT deve ser um inteiro entre 1 e 65535");
  });

  it("getJwtSecret retorna secret", () => {
    process.env.JWT_SECRET = "x".repeat(32);
    expect(getJwtSecret()).toBe("x".repeat(32));
  });

  it("getJwtSecret lança sem secret", () => {
    delete process.env.JWT_SECRET;
    expect(() => getJwtSecret()).toThrow("JWT_SECRET não configurada");
  });
});
