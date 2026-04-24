export interface ILogger {
  info(template: string, params?: Record<string, unknown>): void;
  warn(template: string, params?: Record<string, unknown>): void;
  error(template: string, params?: Record<string, unknown>): void;
  debug(template: string, params?: Record<string, unknown>): void;
}