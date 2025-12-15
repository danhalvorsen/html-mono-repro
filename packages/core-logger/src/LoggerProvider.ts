import { LogLevel } from "./logLevel.js";
import type { ILogger, ILogEntry } from "./ILogger.js";
import { LoggingConfig } from "./logging.config.js";
import { interpolateTemplate } from "./utils/interpolate.js";

export class LoggerProvider {
  static create(category: string): ILogger {
    return new Logger(category);
  }
}

class Logger implements ILogger {
  constructor(private readonly category: string) {}

  info(msg: string, params?: Record<string, unknown>) {
    this.write(LogLevel.Info, msg, params);
  }

  warn(msg: string, params?: Record<string, unknown>) {
    this.write(LogLevel.Warn, msg, params);
  }

  debug(msg: string, params?: Record<string, unknown>) {
    this.write(LogLevel.Debug, msg, params);
  }

  error(msg: string, params?: Record<string, unknown>) {
    this.write(LogLevel.Error, msg, params);
  }

  private write(
    level: LogLevel,
    template: string,
    params?: Record<string, unknown>
  ): void {
    const raw = interpolateTemplate(template, params ?? {});
    const formatted = LoggingConfig.style.format(level, raw, this.category);

    const entry: ILogEntry = {
      level,
      message: formatted,
      category: this.category,
      timestamp: new Date().toISOString()
    };

    if (LoggingConfig.writerStrategy) {
      LoggingConfig.writerStrategy.write(level, formatted, this.category);
      return;
    }

    LoggingConfig.writer(level, formatted, this.category);
  }
}
