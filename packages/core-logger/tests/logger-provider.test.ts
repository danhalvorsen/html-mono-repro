// tests/logger-provider.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import type { LogLevel } from "../src/logLevel.js";
import { LoggingConfig } from "../src/logging.config.js";
import { LoggerProvider } from "../src/LoggerProvider.js";
import { interpolateTemplate } from "../src/utils/interpolate.js";

import type { ILogger, ILogEntry } from "../src/ILogger.js";

// -------------------------------------------------------------
// STRICT TYPES
// -------------------------------------------------------------

interface IWinstonLogEntry {
  level: string;
  message: string;
  category?: string;
}

const toLogLevel = (level: string): LogLevel => {
  switch (level) {
    case "info":
    case "warn":
    case "debug":
    case "error":
      return level as LogLevel;
    default:
      throw new Error("Invalid Winston level: " + level);
  }
};

// -------------------------------------------------------------
// CAPTURED ARRAY + STRICT WRITER
// -------------------------------------------------------------

const captured: ILogEntry[] = [];

const testWriter = (
  level: LogLevel,
  formatted: string,
  category: string
): void => {
  captured.push({
    level,
    message: formatted,
    category,
    timestamp: new Date().toISOString()
  });
};

// -------------------------------------------------------------
// MOCKS
// -------------------------------------------------------------

vi.mock("chalk", () => ({
  default: new Proxy(
    {},
    {
      get: () => (s: string) => s // disable styling
    }
  )
}));

vi.mock("winston", () => ({
  createLogger: vi.fn(() => ({
    log: vi.fn((entry: IWinstonLogEntry) => {
      captured.push({
        level: toLogLevel(entry.level),
        message: entry.message,
        category: entry.category ?? "",
        timestamp: new Date().toISOString()
      });
    })
  })),

  format: {
    combine: (...x: unknown[]) => x,
    timestamp: () => () => {},
    printf: (f: any) => f,
    json: () => {}
  },

  transports: {
    Console: class {},
    File: class {}
  }
}));

// -------------------------------------------------------------
// TESTS
// -------------------------------------------------------------

describe("LoggerProvider", () => {
  beforeEach(() => {
    captured.length = 0;
    LoggingConfig.writer = testWriter;
  });

  it("starts with an empty captured array", () => {
    expect(captured.length).toBe(0);
  });

  it("clears captured array between tests", () => {
    const log: ILogger = LoggerProvider.create("TestA");
    log.info("test1");
    expect(captured.length).toBe(1);
  });

  it("logs info with interpolation", () => {
    const log = LoggerProvider.create("TestInfo");

    log.info("Hello {name}", { name: "World" });

    expect(captured.length).toBe(1);
    expect(captured[0].level).toBe("info");
    expect(captured[0].message).toBe("Hello 'World'");
  });

  it("logs warn", () => {
    const log = LoggerProvider.create("Warn");

    log.warn("Value {v}", { v: 10 });

    expect(captured.length).toBe(1);
    expect(captured[0].level).toBe("warn");
    expect(captured[0].message).toBe("Value 10");
  });

  it("logs debug", () => {
    const log = LoggerProvider.create("Dbg");

    log.debug("n={x}", { x: 7 });

    expect(captured.length).toBe(1);
    expect(captured[0].level).toBe("debug");
    expect(captured[0].message).toBe("n=7");
  });

  it("logs error with stack", () => {
    const log = LoggerProvider.create("Err");

    log.error("Crashed {code}", { code: 500 });

    expect(captured.length).toBe(1);
    expect(captured[0].level).toBe("error");
    expect(captured[0].message).toContain("Crashed 500");
  });

  it("supports raw interpolation", () => {
    const result = interpolateTemplate("A={a}", { a: 3 });
    expect(result).toBe("A=3");
  });
});
