// packages/core-logger.web/tests/code.test.ts

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type {
  ILogger,
  ILoggingStyle,
  ILoggingWriter,
  IWriterStrategy,
} from "@monorepo/core-logger-abstract";

import {
  BorderStyle,
  BrowserConsoleWriter,
  DefaultStyle,
  DevLogger,
  FlexStyle,
  LogLevel,
  LoggerProvider,
  LoggingConfig,
  MemoryWriter,
  MinimalStyle,
  NullLogger,
  boxText,
  defaultLogStyle,
  interpolateTemplate,
  overrideConsoleLog,
  useConsoleLogStyle,
  useMinimalStyle,
} from "../src/code.js";

class TestFixture {
  private readonly originalStyle: ILoggingStyle;
  private readonly originalWriterStrategy: IWriterStrategy | null;
  private readonly originalWriter: ILoggingWriter;
  private readonly originalConsoleLog: typeof console.log;

  public readonly memoryWriter: MemoryWriter;
  public readonly logger: ILogger;
  public readonly category: string;

  public constructor(category = "TestCategory") {
    this.originalStyle = LoggingConfig.style;
    this.originalWriterStrategy = LoggingConfig.writerStrategy;
    this.originalWriter = LoggingConfig.writer;
    this.originalConsoleLog = console.log;

    this.category = category;
    this.memoryWriter = new MemoryWriter();
    this.logger = LoggerProvider.create(this.category);

    LoggingConfig.style = defaultLogStyle;
    LoggingConfig.writerStrategy = null;
    LoggingConfig.writer = this.memoryWriter.asWriter();
  }

  public dispose(): void {
    LoggingConfig.style = this.originalStyle;
    LoggingConfig.writerStrategy = this.originalWriterStrategy;
    LoggingConfig.writer = this.originalWriter;
    console.log = this.originalConsoleLog;
  }

  public stripAnsi(value: string): string {
    return value.replace(
      /\u001B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g,
      "",
    );
  }
}

describe("@monorepo/core-logger.web", () => {
  let fixture: TestFixture;

  beforeEach(() => {
    fixture = new TestFixture();
  });

  afterEach(() => {
    fixture.dispose();
  });

  describe("interpolateTemplate", () => {
    it("should replace known placeholders", () => {
      const result = fixture.stripAnsi(
        interpolateTemplate("Hello {name}, value={value}", {
          name: "Dan",
          value: 42,
        }),
      );

      expect(result).toContain('Hello "Dan", value=42');
    });

    it("should keep unknown placeholders unchanged", () => {
      const result = fixture.stripAnsi(
        interpolateTemplate("Hello {name}, missing={missing}", { name: "Dan" }),
      );

      expect(result).toBe('Hello "Dan", missing={missing}');
    });

    it("should format Error instances in a browser-safe way", () => {
      const result = fixture.stripAnsi(
        interpolateTemplate("Boom: {error}", { error: new Error("Crash!") }),
      );

      expect(result).toContain("Boom: Error: Crash!");
    });

    it("should return the template unchanged when params are undefined", () => {
      const result = interpolateTemplate("No params");
      expect(result).toBe("No params");
    });
  });

  describe("styles", () => {
    it("MinimalStyle should format a compact message", () => {
      const style = new MinimalStyle();

      const formatted = fixture.stripAnsi(
        style.format(
          LogLevel.Info,
          "message",
          "Category",
          "2026-03-10T00:00:00.000Z",
        ),
      );

      expect(formatted).toContain("Category");
      expect(formatted).toContain("INFO");
      expect(formatted).toContain("message");
    });

    it("BorderStyle should wrap message with borders", () => {
      const style = new BorderStyle("dashed");

      const formatted = fixture.stripAnsi(
        style.format(
          LogLevel.Warn,
          "warning",
          "Category",
          "2026-03-10T00:00:00.000Z",
        ),
      );

      expect(formatted).toContain(
        "[2026-03-10T00:00:00.000Z] [Category] [WARN] warning",
      );
      expect(formatted).toContain("\n");
      expect(formatted).toContain("-");
    });

    it("FlexStyle should format using category arrow message", () => {
      const style = new FlexStyle();

      const formatted = fixture.stripAnsi(
        style.format(LogLevel.Debug, "message", "Category", "ignored"),
      );

      expect(formatted).toBe("[Category] → message");
    });

    it("DefaultStyle should box the header and body", () => {
      const style = new DefaultStyle();

      const formatted = fixture.stripAnsi(
        style.format(
          LogLevel.Error,
          "boom",
          "Category",
          "2026-03-10T00:00:00.000Z",
        ),
      );

      expect(formatted).toContain(
        "[2026-03-10T00:00:00.000Z] [Category] [ERROR]",
      );
      expect(formatted).toContain("boom");
      expect(formatted).toContain("│");
    });

    it("boxText should create a deterministic boxed block", () => {
      const result = boxText("a\nbb", { borderChar: "-" });
      expect(result).toBe("------\n│ a  │\n│ bb │\n------");
    });
  });

  describe("configuration helpers", () => {
    it("useMinimalStyle should set MinimalStyle", () => {
      useMinimalStyle();
      expect(LoggingConfig.style).toBeInstanceOf(MinimalStyle);
    });

    it("useConsoleLogStyle should restore default console style", () => {
      useMinimalStyle();
      useConsoleLogStyle();
      expect(LoggingConfig.style).toBe(defaultLogStyle);
    });

    it("overrideConsoleLog should preserve console.log behavior", () => {
      const calls: unknown[][] = [];

      console.log = (...args: unknown[]) => {
        calls.push(args);
      };

      overrideConsoleLog();
      console.log("hello", 42);

      expect(calls).toHaveLength(1);
      expect(calls[0]).toEqual(["hello", 42]);
    });
  });

  describe("LoggerProvider", () => {
    it("should write formatted entries through configured writer", () => {
      fixture.logger.info("Hello {name}", { name: "Dan" });

      expect(fixture.memoryWriter.entries).toHaveLength(1);

      const entry = fixture.memoryWriter.entries[0];
      const formatted = fixture.stripAnsi(entry.message);

      expect(entry.level).toBe(LogLevel.Info);
      expect(entry.category).toBe("TestCategory");
      expect(formatted).toContain("[TestCategory] [INFO]");
      expect(formatted).toContain('Hello "Dan"');
    });

    it("should support warn, error, and debug", () => {
      fixture.logger.warn("warn");
      fixture.logger.error("error");
      fixture.logger.debug("debug");

      expect(fixture.memoryWriter.entries.map((x) => x.level)).toEqual([
        LogLevel.Warn,
        LogLevel.Error,
        LogLevel.Debug,
      ]);
    });

    it("should use writerStrategy when present instead of writer", () => {
      const strategyMemory = new MemoryWriter();
      const writerMemory = new MemoryWriter();

      LoggingConfig.writerStrategy = strategyMemory.asStrategy();
      LoggingConfig.writer = writerMemory.asWriter();

      fixture.logger.info("strategy wins");

      expect(strategyMemory.entries).toHaveLength(1);
      expect(writerMemory.entries).toHaveLength(0);
    });
  });

  describe("NullLogger", () => {
    it("should ignore all log calls", () => {
      const logger = new NullLogger();

      expect(() => {
        logger.info("info");
        logger.warn("warn");
        logger.error("error");
        logger.debug("debug");
      }).not.toThrow();
    });
  });

  describe("DevLogger", () => {
    it("should delegate to LoggerProvider", () => {
      const logger = new DevLogger("DevCategory");

      logger.info("dev message");

      expect(fixture.memoryWriter.entries).toHaveLength(1);
      expect(
        fixture.stripAnsi(fixture.memoryWriter.entries[0].message),
      ).toContain("[DevCategory] [INFO]");
    });
  });

  describe("MemoryWriter", () => {
    it("should capture entries via asWriter", () => {
      const writer = new MemoryWriter();
      const fn = writer.asWriter();

      fn(LogLevel.Info, "formatted", "Category");

      expect(writer.entries).toHaveLength(1);
      expect(writer.formattedEntries).toEqual(["formatted"]);
      expect(writer.entries[0].level).toBe(LogLevel.Info);
      expect(writer.entries[0].category).toBe("Category");
      expect(writer.entries[0].message).toBe("formatted");
    });

    it("should capture entries via asStrategy", () => {
      const writer = new MemoryWriter();

      writer.asStrategy().write(LogLevel.Error, "formatted", "Category");

      expect(writer.entries).toHaveLength(1);
      expect(writer.entries[0].level).toBe(LogLevel.Error);
    });

    it("should clear buffered entries", () => {
      const writer = new MemoryWriter();

      writer.asWriter()(LogLevel.Info, "a", "A");
      writer.asWriter()(LogLevel.Warn, "b", "B");

      writer.clear();

      expect(writer.entries).toHaveLength(0);
      expect(writer.formattedEntries).toHaveLength(0);
    });
  });

  describe("BrowserConsoleWriter", () => {
    it("should write to console via asWriter", () => {
      const calls: unknown[][] = [];
      console.log = (...args: unknown[]) => {
        calls.push(args);
      };

      const writer = new BrowserConsoleWriter();
      writer.asWriter()(LogLevel.Info, "formatted", "Category");

      expect(calls).toHaveLength(1);
      expect(calls[0]).toEqual(["formatted"]);
    });

    it("should write to console via asStrategy", () => {
      const calls: unknown[][] = [];
      console.log = (...args: unknown[]) => {
        calls.push(args);
      };

      const writer = new BrowserConsoleWriter();
      writer.asStrategy().write(LogLevel.Warn, "formatted", "Category");

      expect(calls).toHaveLength(1);
      expect(calls[0]).toEqual(["formatted"]);
    });
  });
});