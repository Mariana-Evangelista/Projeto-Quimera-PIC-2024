export enum ServiceErrorType {
  BadRequest = "BadRequest",
  NotFound = "NotFound",
  Conflict = "Conflict",
  Unauthorized = "Unauthorized",
  Forbidden = "Forbidden",
  Internal = "Internal",
  TooManyRequests = "TooManyRequests",
}

export class ServiceError extends Error {
  public readonly statusCode: number;
  public readonly type: ServiceErrorType;
  public readonly code?: string;

  constructor(message: string, type: ServiceErrorType = ServiceErrorType.BadRequest, statusCode?: number, code?: string) {
    super(message);
    this.name = "ServiceError";
    this.type = type;
    this.statusCode = statusCode ?? ServiceError.mapTypeToStatus(type);
    this.code = code;

    Object.setPrototypeOf(this, new.target.prototype);
  }

  private static mapTypeToStatus(type: ServiceErrorType) {
    switch (type) {
      case ServiceErrorType.BadRequest:
        return 400;
      case ServiceErrorType.Unauthorized:
        return 401;
      case ServiceErrorType.Forbidden:
        return 403;
      case ServiceErrorType.NotFound:
        return 404;
      case ServiceErrorType.Conflict:
        return 409;
      case ServiceErrorType.TooManyRequests:
        return 429;
      case ServiceErrorType.Internal:
      default:
        return 500;
    }
  }
}

export default ServiceError;
