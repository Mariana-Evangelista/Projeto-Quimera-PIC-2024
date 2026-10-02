import { Request, Response, NextFunction } from "express";
import { JwtPayload, verify } from "jsonwebtoken";
import ServiceError, { ServiceErrorType } from "../shared/errors/ServiceError";
import { ErrorCode } from "../shared/errors/errorCodes";
import { getJwtSecret } from "../shared/env";

export type CustomRequest = Request & { user?: JwtPayload & { id: string } };

export function authMiddleware(
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ServiceError(
      "Acesso negado, token não fornecido",
      ServiceErrorType.Unauthorized,
      undefined,
      ErrorCode.AUTH_UNAUTHORIZED,
    );
  }

  try {
    const decoded = verify(token, getJwtSecret(), { algorithms: ["HS256"] });
    req.user = decoded as CustomRequest["user"];
    next();
  } catch (error) {
    throw new ServiceError(
      "Token inválido",
      ServiceErrorType.Unauthorized,
      undefined,
      ErrorCode.AUTH_UNAUTHORIZED,
    );
  }
}
