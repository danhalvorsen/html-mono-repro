// src/calculator/calculator.logger.ts

export interface ILogger {
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
}

export class ConsoleLogger implements ILogger {
  public info(message: string, data?: unknown): void {
    console.info(message, data);
  }
  public warn(message: string, data?: unknown): void {
    console.warn(message, data);
  }
  public error(message: string, data?: unknown): void {
    console.error(message, data);
  }
}

export class NullLogger implements ILogger {
  public info(_message: string, _data?: unknown): void {}
  public warn(_message: string, _data?: unknown): void {}
  public error(_message: string, _data?: unknown): void {}
}