// src/writers/winston/WinstonWriterAdapter.ts
import winston from "winston";
import type { IWriterStrategy } from "../IWriterStrategy.js";
import { LogLevel } from "../../styles/logStyle.js"

/**
 * Winston adapter for core-logger.
 * Keeps core-logger pure while enabling enterprise-grade logging.
 */
export class WinstonWriterAdapter implements IWriterStrategy {

  private readonly logger: winston.Logger;

  constructor(category: string = "default", level: LogLevel = LogLevel.Debug) {
  this.logger = winston.createLogger({
    level,
    defaultMeta: { category },

    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.printf(({ timestamp, level, message, category }) =>
            `${timestamp} [${category}] ${level.toUpperCase()}: ${message}`
          )
        )
      })
    ]
  });
}
  /**
   * Adapts core-logger calls into Winston's logging pipeline.
   */
  write(level: LogLevel, formatted: string, category: string): void {
    this.logger.log({
      level,
      category,
      message: formatted
    });
  }
}
