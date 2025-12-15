// src/writers/winston/WinstonWriterAdapter.ts
import type { LogLevel } from "../../styles/logStyle.js";
import type { ILoggingWriter } from "../../logging.config.js";
import type winston from "winston";

/**
 * Adapts Winston's logger to our ILoggingWriter contract.
 */
export class WinstonWriterAdapter {
  private readonly category: string;
  private readonly level: LogLevel;
  private readonly logger: winston.Logger;

  constructor(category: string, level: LogLevel, logger: winston.Logger) {
    this.category = category;
    this.level = level;
    this.logger = logger;
  }

  /**
   * Converts the adapter to an ILoggingWriter function.
   */
  asWriter(): ILoggingWriter {
    return (level: LogLevel, formatted: string, category: string): void => {
      this.logger.log({
        level,
        message: formatted,
        category
      });
    };
  }
}
