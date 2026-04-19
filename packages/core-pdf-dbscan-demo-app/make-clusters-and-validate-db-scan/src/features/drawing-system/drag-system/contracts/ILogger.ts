export type LogLevel = "debug" | "info" | "warn";

export interface ILogger {
    log(level: LogLevel, message: string, data?: unknown): void;
}
