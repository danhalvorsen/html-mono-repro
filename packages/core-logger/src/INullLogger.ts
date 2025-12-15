import { ILogger } from "./ILogger.js";

export class NullLogger implements ILogger {
  info(message?: unknown, ...meta: unknown[]): void {}
  warn(message?: unknown, ...meta: unknown[]): void {}
  debug(message?: unknown, ...meta: unknown[]): void {}
  error(message?: unknown, ...meta: unknown[]): void {}
}

// Optional: shared instance
export const nullLogger = new NullLogger();
