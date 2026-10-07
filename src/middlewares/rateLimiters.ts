import { Request, Response, NextFunction } from "express";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import ServiceError, { ServiceErrorType } from "../shared/errors/ServiceError";
import { ErrorCode } from "../shared/errors/errorCodes";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX = 10;

const TEACHER_SIGNUP_WINDOW_MS = 60 * 60 * 1000;
const TEACHER_SIGNUP_MAX = 20;

const RESPONSE_SUBMISSION_WINDOW_MS = 15 * 60 * 1000;
const RESPONSE_SUBMISSION_MAX = 300;

const PIN_LENGTH = 6;
const EMAIL_MAX_LENGTH = 254;

function createRateLimitHandler() {
  return (
    _req: Request,
    _res: Response,
    next: NextFunction,
    _options: { statusCode: number; message: string },
  ) => {
    next(
      new ServiceError(
        "Muitas requisições. Tente novamente em instantes.",
        ServiceErrorType.TooManyRequests,
        undefined,
        ErrorCode.RATE_LIMITED,
      ),
    );
  };
}

function getLoginKey(req: Request): string {
  const email = req.body?.email;
  if (typeof email === "string" && email.trim().length > 0 && email.trim().length <= EMAIL_MAX_LENGTH) {
    return `login:${email.trim().toLowerCase()}`;
  }
  return ipKeyGenerator(req.ip ?? "unknown");
}

function getResponseSubmissionKey(req: Request): string {
  const pin = req.body?.pin;
  if (typeof pin === "string" && pin.trim().length === PIN_LENGTH) {
    return `submission:${pin.trim()}`;
  }
  return ipKeyGenerator(req.ip ?? "unknown");
}

function isTestEnvironment(): boolean {
  return process.env.NODE_ENV === 'test' || process.env.E2E_TEST === 'true';
}

function createTestAwareRateLimiter(options: any) {
  if (isTestEnvironment()) {
    return (_req: Request, _res: Response, next: NextFunction) => next();
  }
  return rateLimit(options);
}

export const loginRateLimiter = createTestAwareRateLimiter({
  windowMs: LOGIN_WINDOW_MS,
  limit: LOGIN_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: getLoginKey,
  handler: createRateLimitHandler(),
});

export const teacherSignupRateLimiter = createTestAwareRateLimiter({
  windowMs: TEACHER_SIGNUP_WINDOW_MS,
  limit: TEACHER_SIGNUP_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: () => "teacher-signup-global",
  handler: createRateLimitHandler(),
});

export const responseSubmissionRateLimiter = createTestAwareRateLimiter({
  windowMs: RESPONSE_SUBMISSION_WINDOW_MS,
  limit: RESPONSE_SUBMISSION_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getResponseSubmissionKey,
  handler: createRateLimitHandler(),
});

export { LOGIN_WINDOW_MS, LOGIN_MAX, TEACHER_SIGNUP_WINDOW_MS, TEACHER_SIGNUP_MAX, RESPONSE_SUBMISSION_WINDOW_MS, RESPONSE_SUBMISSION_MAX, getLoginKey, getResponseSubmissionKey };