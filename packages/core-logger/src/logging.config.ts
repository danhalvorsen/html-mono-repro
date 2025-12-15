// src/logging.config.ts
 
import type { IWriterStrategy } from "./writers/IWriterStrategy.js";
import { LogLevel } from "./logLevel.js";
export interface ILoggingStyle {
  format(level: LogLevel, message: string, category: string): string;
}

export interface ILoggingWriter {
  (level: LogLevel, formatted: string, category: string): void;
}

export const LoggingConfig: {
  style: ILoggingStyle;

  /**
   * Optional pluggable writer strategy.
   * If set, it overrides the default writer.
   */
  writerStrategy: IWriterStrategy | null;

  /**
   * Fallback writer if no strategy is set.
   */
  writer: ILoggingWriter;
} = {

  style: {
    // Default formatting (identity)
    format: (level, message, category) => message,
  },

  // 🔥 Writer strategy is initially null
  writerStrategy: null,

  // 🔥 Core writer dispatches either to strategy or fallback console.log
  writer(level, formatted, category) {
    if (this.writerStrategy) {
      this.writerStrategy.write(level, formatted, category);
      return;
    }

    // Fallback: basic console writer
    console.log(`[${category}] ${formatted}`);
  }
};
