export type ErrorCode =
  | "AUTH_EXPIRED"
  | "QUOTA_EXCEEDED"
  | "SERVICE_UNAVAILABLE"
  | "RATE_LIMITED"
  | "VALIDATION_FAILED"
  | "FORBIDDEN"
  | "INTERNAL_ERROR";

export class ApplicationError extends Error {
  public code: ErrorCode;
  public details?: Record<string, any>;
  public httpStatus: number;

  constructor(message: string, code: ErrorCode, httpStatus = 500, details?: Record<string, any>) {
    super(message);
    this.name = "ApplicationError";
    this.code = code;
    this.httpStatus = httpStatus;
    this.details = details;

    // Maintain stack trace (V8 specific)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApplicationError);
    }
  }

  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        code: this.code,
        details: this.details,
      },
    };
  }
}
