
import { describe, it, expect, beforeEach, vi } from "vitest";

import {
  LoggerProvider,
  LoggingConfig,
  MemoryWriter,
  LogLevel,
  MinimalStyle,
  BorderStyle,
  DefaultStyle,
  interpolateTemplate,
  NullLogger,
  type ILogger,
  type ILogEntry,
  type ILoggingStyle,
} from "../src/index.js";

/* ============================= GLOBAL SETUP (deterministic) ============================= */

/**
 * Make output deterministic by stripping chalk styling.
 * (Chalk is ESM; Vitest can mock it fine in Node env.)
 */
vi.mock("chalk", () => ({
  default: new Proxy(
    {},
    {
      get: () => (s: string) => s,
    }
  ),
}));

/* ============================= OOP FIXTURES ============================= */

interface ILoggerHarness {
  installMemory(style?: ILoggingStyle): void;
  installConsoleSpy(): void;
  installStrategySpy(): StrategySpy;
  reset(): void;
  create(category: string): ILogger;
  entries(): ReadonlyArray<ILogEntry>;
  consoleCallCount(): number;
}

class StrategySpy {
  private readonly _calls: Array<{ level: LogLevel; formatted: string; category: string }> = [];

  write(level: LogLevel, formatted: string, category: string): void {
    this._calls.push({ level, formatted, category });
  }

  get calls(): ReadonlyArray<{ level: LogLevel; formatted: string; category: string }> {
    return this._calls;
  }

  get count(): number {
    return this._calls.length;
  }
}

class LoggerHarness implements ILoggerHarness {
  private readonly memory = new MemoryWriter();
  private consoleSpy: ReturnType<typeof vi.spyOn> | null = null;

  installMemory(style?: ILoggingStyle): void {
    LoggingConfig.writer = this.memory.asWriter();
    LoggingConfig.writerStrategy = null;
    LoggingConfig.style = style ?? new MinimalStyle();
  }

  installConsoleSpy(): void {
    if (this.consoleSpy) this.consoleSpy.mockRestore();
    this.consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    LoggingConfig.writerStrategy = null;
  }

  installStrategySpy(): StrategySpy {
    const spy = new StrategySpy();
    LoggingConfig.writerStrategy = { write: spy.write.bind(spy) };
    return spy;
  }

  reset(): void {
    this.memory.clear();
    LoggingConfig.writerStrategy = null;
    if (this.consoleSpy) this.consoleSpy.mockClear();
  }

  create(category: string): ILogger {
    return LoggerProvider.create(category);
  }

  entries(): ReadonlyArray<ILogEntry> {
    return this.memory.entries;
  }

  consoleCallCount(): number {
    return this.consoleSpy?.mock.calls.length ?? 0;
  }
}

/* ============================= OOP ASSERTIONS ============================= */

class LogAssertions {
  static isIsoTimestamp(value: string): boolean {
    const t = new Date(value).getTime();
    return Number.isFinite(t);
  }

  static expectLevel(entry: ILogEntry, level: LogLevel): void {
    expect(entry.level).toBe(level);
  }

  static expectCategory(entry: ILogEntry, category: string): void {
    expect(entry.category).toBe(category);
  }

  static expectMessageContains(entry: ILogEntry, text: string): void {
    expect(entry.message).toContain(text);
  }

  static expectTimestampInRange(entry: ILogEntry, beforeMs: number, afterMs: number): void {
    const ms = new Date(entry.timestamp).getTime();
    expect(ms).toBeGreaterThanOrEqual(beforeMs - 50);
    expect(ms).toBeLessThanOrEqual(afterMs + 50);
  }
}

/* ============================= TESTS ============================= */

describe("core-logger — high coverage (OOP fixtures, DRY)", () => {
  const h = new LoggerHarness();

  beforeEach(() => {
    h.installMemory();
    h.reset();
  });

  describe("interpolateTemplate()", () => {
    it("returns template unchanged when params missing", () => {
      expect(interpolateTemplate("Hello")).toBe("Hello");
    });

    it("keeps unknown placeholders intact", () => {
      expect(interpolateTemplate("Unknown {missingKey}", { ok: true })).toBe("Unknown {missingKey}");
    });

    it("replaces multiple placeholders", () => {
      const out = interpolateTemplate("A={a} B={b}", { a: 1, b: 2 });
      expect(out).toContain("A=");
      expect(out).toContain("1");
      expect(out).toContain("B=");
      expect(out).toContain("2");
    });

    it("replaces repeated keys consistently", () => {
      const out = interpolateTemplate("{x},{x},{x}", { x: 7 });
      expect(out).toContain("7");
      expect(out.split("7").length).toBeGreaterThan(2);
    });

    it("trims placeholder keys", () => {
      const out = interpolateTemplate("V={ v }", { v: 42 });
      expect(out).toContain("42");
    });

    it("formats objects deterministically (inspect)", () => {
      const out = interpolateTemplate("Obj={o}", { o: { a: 1, b: 2 } });
      expect(out).toContain("a: 1");
      expect(out).toContain("b: 2");
    });

    it("formats arrays deterministically", () => {
      const out = interpolateTemplate("Arr={x}", { x: [1, 2, 3] });
      expect(out).toContain("[ 1, 2, 3 ]");
    });

    it("formats Error objects without throwing", () => {
      const out = interpolateTemplate("E={e}", { e: new Error("Boom") });
      expect(out).toContain("Error");
      expect(out).toContain("Boom");
    });
  });

  describe("LoggerProvider + Logger (contract + behavior)", () => {
    it("creates a logger and logs info with interpolation + category", () => {
      const before = Date.now();
      const log = h.create("TestInfo");

      log.info("Hello {name}", { name: "World" });

      const after = Date.now();

      const entries = h.entries();
      expect(entries.length).toBe(1);

      const e = entries[0];
      LogAssertions.expectLevel(e, LogLevel.Info);
      LogAssertions.expectCategory(e, "TestInfo");
      LogAssertions.expectMessageContains(e, "Hello");
      LogAssertions.expectMessageContains(e, "World");
      expect(LogAssertions.isIsoTimestamp(e.timestamp)).toBe(true);
      LogAssertions.expectTimestampInRange(e, before, after);
    });

    it("routes warn/debug/error to correct levels", () => {
      const log = h.create("Levels");

      log.warn("W {x}", { x: 1 });
      log.debug("D {x}", { x: 2 });
      log.error("E {x}", { x: 3 });

      const entries = h.entries();
      expect(entries.length).toBe(3);

      LogAssertions.expectLevel(entries[0], LogLevel.Warn);
      LogAssertions.expectLevel(entries[1], LogLevel.Debug);
      LogAssertions.expectLevel(entries[2], LogLevel.Error);
    });

    it("unknown placeholder remains intact in final message", () => {
      const log = h.create("Missing");
      log.info("X={missing}", { ok: true });

      const e = h.entries()[0];
      LogAssertions.expectMessageContains(e, "{missing}");
    });

    it("writerStrategy overrides writer (writer not invoked, memory stays empty)", () => {
      const spy = h.installStrategySpy();

      const log = h.create("StrategyTest");
      log.error("X");

      expect(spy.count).toBe(1);
      expect(spy.calls[0].level).toBe(LogLevel.Error);
      expect(spy.calls[0].category).toBe("StrategyTest");
      expect(spy.calls[0].formatted).toContain("X");

      expect(h.entries().length).toBe(0);
    });
  });

describe("LoggingConfig fallback writer behavior", () => {
  it("calls LoggingConfig.writer when writerStrategy is null", () => {
    // Arrange: ensure strategy is off
    LoggingConfig.writerStrategy = null;

    // Spy on writer (this is the real fallback contract)
    const writerSpy = vi.fn(LoggingConfig.writer);
    LoggingConfig.writer = writerSpy;

    const log = h.create("ConsoleCat");
    log.info("Hello");

    expect(writerSpy).toHaveBeenCalledTimes(1);

    const [level, formatted, category] = writerSpy.mock.calls[0];
    expect(level).toBe(LogLevel.Info);
    expect(category).toBe("ConsoleCat");
    expect(String(formatted)).toContain("Hello");
  });

  it("does not call LoggingConfig.writer when writerStrategy is active", () => {
    const writerSpy = vi.fn(LoggingConfig.writer);
    LoggingConfig.writer = writerSpy;

    const spy = h.installStrategySpy();

    const log = h.create("NoWriter");
    log.warn("W");

    expect(spy.count).toBe(1);
    expect(writerSpy).not.toHaveBeenCalled();
  });
});
  describe("Styles (sync, pure formatting)", () => {
    it("MinimalStyle includes category + level + message", () => {
      const s = new MinimalStyle();
      const out = s.format(LogLevel.Info, "Msg", "Cat");
      expect(out).toContain("Cat");
      expect(out).toContain("INFO");
      expect(out).toContain("Msg");
    });

    it("BorderStyle renders correct glyph based on variant", () => {
      expect(new BorderStyle("solid").format(LogLevel.Info, "M", "C")).toContain("─");
      expect(new BorderStyle("dashed").format(LogLevel.Info, "M", "C")).toContain("-");
      expect(new BorderStyle("dotted").format(LogLevel.Info, "M", "C")).toContain("·");
    });

    it("DefaultStyle wraps content in box", () => {
      const out = new DefaultStyle().format(LogLevel.Warn, "Hello", "BoxCat");
      expect(out).toContain("BoxCat");
      expect(out).toContain("Hello");
      expect(out).toMatch(/─/);
      expect(out).toMatch(/│/);
    });
  });

  describe("NullLogger (LSP-correct)", () => {
    it("never throws and matches ILogger signature", () => {
      const log = new NullLogger();
      expect(() => log.info("a")).not.toThrow();
      expect(() => log.warn("b", { x: 1 })).not.toThrow();
      expect(() => log.debug("c")).not.toThrow();
      expect(() => log.error("d", { err: new Error("x") })).not.toThrow();
    });
  });
});