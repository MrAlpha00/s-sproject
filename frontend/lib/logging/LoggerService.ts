export type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

export interface LogContext {
  organizationId?: string;
  userId?: string;
  sessionId?: string;
  eventId?: string;
  correlationId?: string;
  [key: string]: any;
}

export class LoggerService {
  private static generateCorrelationId(): string {
    return `corr_${Math.random().toString(36).substring(2, 9)}`;
  }

  private static logMessage(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ) {
    const payload = {
      timestamp: new Date().toISOString(),
      level,
      message,
      correlationId: context?.correlationId || this.generateCorrelationId(),
      organizationId: context?.organizationId || null,
      userId: context?.userId || null,
      sessionId: context?.sessionId || null,
      eventId: context?.eventId || null,
      metadata: context ? { ...context } : {},
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : null,
    };

    // Remove duplicates from metadata
    if (payload.metadata) {
      delete payload.metadata.correlationId;
      delete payload.metadata.organizationId;
      delete payload.metadata.userId;
      delete payload.metadata.sessionId;
      delete payload.metadata.eventId;
    }

    // Output formatted json line to stdout (production standard for APM scrapers)
    if (process.env.NODE_ENV === "production") {
      console.log(JSON.stringify(payload));
    } else {
      // Friendly console logger for dev local pings
      const color =
        level === "ERROR"
          ? "\x1b[31m"
          : level === "WARN"
          ? "\x1b[33m"
          : level === "DEBUG"
          ? "\x1b[35m"
          : "\x1b[36m";
      console.log(
        `[${payload.timestamp}] ${color}[${level}]\x1b[0m corr=${payload.correlationId}: ${message}`,
        Object.keys(payload.metadata).length > 0 ? payload.metadata : "",
        error || ""
      );
    }
  }

  static info(message: string, context?: LogContext) {
    this.logMessage("INFO", message, context);
  }

  static warn(message: string, context?: LogContext) {
    this.logMessage("WARN", message, context);
  }

  static error(message: string, error?: Error, context?: LogContext) {
    this.logMessage("ERROR", message, context, error);
  }

  static debug(message: string, context?: LogContext) {
    this.logMessage("DEBUG", message, context);
  }
}
