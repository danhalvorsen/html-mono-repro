import { ILoggingWriter } from "core-logger/src/logging.config.js";
import { LogLevel } from "core-logger/src/styles/logStyle.js";
import { mkdirSync, appendFileSync } from "fs";
import { dirname } from "path";

/**
 * Strong, synchronous file writer.
 * Guaranteed ordering and deterministic testability.
 */
export class FileWriter {
  private readonly filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;

    // Ensure directories exist
    mkdirSync(dirname(this.filePath), { recursive: true });
  }

  /**
   * Returns a LoggingConfig-compatible writer.
   */
  asWriter(): ILoggingWriter {
    return (level: LogLevel, formatted: string, category: string): void => {
      const timestamp = new Date().toISOString();
      const entry = `${timestamp} [${category}] ${level.toUpperCase()}: ${formatted}\n`;

      appendFileSync(this.filePath, entry, { encoding: "utf8" });
    };
  }
}
