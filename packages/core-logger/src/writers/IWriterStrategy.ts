// src/writers/IWriterStrategy.ts
import type { LogLevel } from "../styles/logStyle.js";

/**
 * Unified writer contract for all logging backends.
 * Allows pluggable writers like Winston, FileWriter, MemoryWriter, etc.
 */
export interface IWriterStrategy {
  write(level: LogLevel, formatted: string, category: string): void;
}
