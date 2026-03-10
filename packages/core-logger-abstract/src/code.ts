// ============================================================================
// packages/core-logger-abstract/src/code.ts
// ============================================================================

export enum LogLevel {
  Info = "info",
  Warn = "warn",
  Error = "error",
  Debug = "debug",
}

export type ILogParams = Record<string, unknown>;

export type ILogMethod = (template: string, params?: ILogParams) => void;
export type ILogErrorMethod = ILogMethod;

export interface ILogEntry {
  readonly level: LogLevel;
  readonly message: string;
  readonly category: string;
  readonly timestamp: string;
}

export interface ILogger {
  info: ILogMethod;
  warn: ILogMethod;
  error: ILogErrorMethod;
  debug: ILogMethod;
}

export interface ILoggingStyle {
  format(level: LogLevel, message: string, category: string, timestamp: string): string;
}

export abstract class LogStyleBase implements ILoggingStyle {
  public abstract format(
    level: LogLevel,
    message: string,
    category: string,
    timestamp: string,
  ): string;

  protected toUpper(level: LogLevel): string {
    return level.toUpperCase();
  }
}

export interface IWriterStrategy {
  write(level: LogLevel, formatted: string, category: string): void;
}

export interface ILoggingWriter {
  (level: LogLevel, formatted: string, category: string): void;
}

export interface IClock {
  nowIso(): string;
}

export interface IInterpolator {
  interpolate(template: string, params?: ILogParams): string;
}

export interface IEntryFactory {
  create(level: LogLevel, category: string, template: string, params?: ILogParams): ILogEntry;
}

export interface IStyleResolver {
  getStyle(): ILoggingStyle;
}

export interface IWriterResolver {
  getWriterStrategy(): IWriterStrategy | null;
  getWriter(): ILoggingWriter;
}

export interface IFormatter {
  format(entry: ILogEntry): string;
}

export interface IDispatcher {
  dispatch(entry: ILogEntry): void;
}