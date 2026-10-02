export function validateEnv(): string[] {
  const errors: string[] = [];

  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    errors.push("MONGO_URL é obrigatória");
  } else if (!mongoUrl.startsWith("mongodb://") && !mongoUrl.startsWith("mongodb+srv://")) {
    errors.push("MONGO_URL deve começar com mongodb:// ou mongodb+srv://");
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    errors.push("JWT_SECRET é obrigatória");
  } else if (jwtSecret.length < 32) {
    errors.push("JWT_SECRET deve ter no mínimo 32 caracteres");
  }

  const port = process.env.PORT;
  if (port !== undefined) {
    const portNum = Number(port);
    if (!Number.isInteger(portNum) || portNum < 1 || portNum > 65535) {
      errors.push("PORT deve ser um inteiro entre 1 e 65535");
    }
  }

  return errors;
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET não configurada");
  }
  return secret;
}