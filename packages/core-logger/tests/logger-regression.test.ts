import { describe, it, expect, beforeEach } from "vitest";

import { MemoryWriter } from "../src/writers/MemoryWriter.js";
import { LoggingConfig } from "../src/logging.config.js";
import { LoggerProvider } from "../src/LoggerProvider.js";
import { LogLevel } from "../src/logLevel.js";

// ---------------------------------------------
// SHARED
// ---------------------------------------------
let writer: MemoryWriter;

beforeEach(() => {
  writer = new MemoryWriter();
  LoggingConfig.writer = writer.asWriter();
  LoggingConfig.writerStrategy = null;
});

// ---------------------------------------------
// REGRESSION TESTS
// ---------------------------------------------
describe("Logger – Regression Suite", () => {

  it("MemoryWriter preserves call order", () => {
    const log = LoggerProvider.create("Order");

    log.info("a");
    log.warn("b");
    log.debug("c");

    expect(writer.entries.length).toBe(3);
    expect(writer.entries[0].message).toBe("a");
    expect(writer.entries[1].message).toBe("b");
    expect(writer.entries[2].message).toBe("c");
  });

  it("MemoryWriter assigns correct timestamp format", () => {
    const log = LoggerProvider.create("TS");

    const before = Date.now();
    log.info("hello");
    const after = Date.now();

    const ts = new Date(writer.entries[0].timestamp).getTime();

    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });

  it("LoggingConfig.writerStrategy overrides writer", () => {
    const calls: Array<{ level: LogLevel; msg: string; cat: string }> = [];

    LoggingConfig.writerStrategy = {
      write(level, formatted, category) {
        calls.push({ level, msg: formatted, cat: category });
      }
    };

    const log = LoggerProvider.create("StrategyTest");
    log.error("X");

    expect(calls.length).toBe(1);
    expect(calls[0].level).toBe(LogLevel.Error);
    expect(calls[0].msg).toBe("X");
    expect(calls[0].cat).toBe("StrategyTest");

    // MemoryWriter must *not* receive entries when strategy is active
    expect(writer.entries.length).toBe(0);
  });

  it("LoggerProvider returns clean typed ILogger interface", () => {
    const log = LoggerProvider.create("Iface");

    // Type-safe checks
    log.info("a");
    log.warn("b");
    log.debug("c");
    log.error("d");

    expect(writer.entries.length).toBe(4);
  });

  it("LogLevel enum never drifts from writer expectations", () => {
    const levels: LogLevel[] = [
      LogLevel.Info,
      LogLevel.Warn,
      LogLevel.Error,
      LogLevel.Debug
    ];

    for (const level of levels) {
      const log = LoggerProvider.create("Drift");
      log.info(`lvl=${level}`);
    }

    expect(levels.includes(LogLevel.Info)).toBe(true);
    expect(levels.includes(LogLevel.Warn)).toBe(true);
    expect(levels.includes(LogLevel.Error)).toBe(true);
    expect(levels.includes(LogLevel.Debug)).toBe(true);
  });
});
