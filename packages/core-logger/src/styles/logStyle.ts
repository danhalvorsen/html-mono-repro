import { LogLevel } from "../logLevel.js";

export { LogLevel };

/**
 * Base class for all log styles.
 * All styles must be synchronous.
 */
export abstract class LogStyleBase {
  abstract format(
    level: LogLevel,
    message: string,
    category: string
  ): string;
}

export class ConsoleLogStyle extends LogStyleBase {
  format(level: LogLevel, message: string, category: string): string {
    const time = new Date().toISOString();
    // Support numeric or string enum representations
    // Avoid indexing the enum at runtime (const enums are erased), just stringify non-string levels
    const levelStr =
      typeof level === "string" ? level : String(level);
    return `[${time}] [${category}] [${levelStr}] ${message}`;
  }
}

export const defaultLogStyle = new ConsoleLogStyle();
