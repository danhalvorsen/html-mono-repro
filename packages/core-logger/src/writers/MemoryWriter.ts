// src/writers/MemoryWriter.ts
import type { ILogEntry } from "../ILogger.js";
import type { LogLevel } from "../styles/logStyle.js";
import type { ILoggingWriter } from "../logging.config.js";

export class MemoryWriter {
  readonly entries: ILogEntry[] = [];

  asWriter(): ILoggingWriter {
    return (level: LogLevel, formatted: string, category: string): void => {
      this.entries.push({
        level,
        message: formatted,
        category,
        timestamp: new Date().toISOString()
      });
    };
  }

  clear() {
    this.entries.length = 0;
  }
}