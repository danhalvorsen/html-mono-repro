// src/logLevel.ts

/**
 * Fully typed, compile-time safe log levels.
 * Runtime never changes.
 */
export const enum LogLevel {
  Info = "info",
  Warn = "warn",
  Error = "error",
  Debug = "debug"
}