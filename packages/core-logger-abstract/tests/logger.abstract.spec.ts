// ============================================================================
// packages/core-logger-abstract/tests/logger.abstract.spec.ts
// All tests + fixtures in one file (Vitest)
// ============================================================================

import {
  describe,
  it,
  expect,
  beforeEach,
} from "vitest";

import {
  LogLevel,
  LogStyleBase,
  type IClock,
  type IInterpolator,
  type IEntryFactory,
  type ILogEntry,
  type ILogParams,
  type IWriterStrategy,
  type IFormatter,
  type IDispatcher,
} from "../src/code.js";

// ============================================================================
// Fixtures
// ============================================================================

class TestLogStyle extends LogStyleBase {
  public format(
    level: LogLevel,
    message: string,
    category: string,
    timestamp: string,
  ): string {
    return `${this.toUpper(level)}|${category}|${timestamp}|${message}`;
  }
}

class TestClock implements IClock {
  public constructor(
    private readonly fixed: string = "2026-03-24T12:00:00.000Z",
  ) {}

  public nowIso(): string {
    return this.fixed;
  }
}

class TestInterpolator implements IInterpolator {
  public interpolate(template: string, params?: ILogParams): string {
    if (!params) return template;

    let result = template;

    for (const [k, v] of Object.entries(params)) {
      result = result.replaceAll(`{${k}}`, String(v));
    }

    return result;
  }
}

class TestEntryFactory implements IEntryFactory {
  public constructor(
    private readonly clock: IClock,
    private readonly interpolator: IInterpolator,
  ) {}

  public create(
    level: LogLevel,
    category: string,
    template: string,
    params?: ILogParams,
  ): ILogEntry {
    return {
      level,
      category,
      timestamp: this.clock.nowIso(),
      message: this.interpolator.interpolate(template, params),
    };
  }
}

class SpyWriterStrategy implements IWriterStrategy {
  public readonly calls: Array<{
    level: LogLevel;
    formatted: string;
    category: string;
  }> = [];

  public write(level: LogLevel, formatted: string, category: string): void {
    this.calls.push({ level, formatted, category });
  }
}

class TestFormatter implements IFormatter {
  public constructor(private readonly style: LogStyleBase) {}

  public format(entry: ILogEntry): string {
    return this.style.format(
      entry.level,
      entry.message,
      entry.category,
      entry.timestamp,
    );
  }
}

class TestDispatcher implements IDispatcher {
  public constructor(
    private readonly formatter: IFormatter,
    private readonly writer: IWriterStrategy,
  ) {}

  public dispatch(entry: ILogEntry): void {
    const formatted = this.formatter.format(entry);
    this.writer.write(entry.level, formatted, entry.category);
  }
}

// ============================================================================
// Test Fixture (DRY)
// ============================================================================

class LoggerTestFixture {
  public readonly clock = new TestClock();
  public readonly interpolator = new TestInterpolator();
  public readonly style = new TestLogStyle();
  public readonly entryFactory = new TestEntryFactory(
    this.clock,
    this.interpolator,
  );
  public readonly writer = new SpyWriterStrategy();
  public readonly formatter = new TestFormatter(this.style);
  public readonly dispatcher = new TestDispatcher(
    this.formatter,
    this.writer,
  );
}

// ============================================================================
// Tests
// ============================================================================

describe("core-logger-abstract", () => {
  let fx: LoggerTestFixture;

  beforeEach(() => {
    fx = new LoggerTestFixture();
  });

  describe("Interpolator", () => {
    it("should return template when no params", () => {
      const result = fx.interpolator.interpolate("hello world");

      expect(result).toBe("hello world");
    });

    it("should replace placeholders", () => {
      const result = fx.interpolator.interpolate(
        "hello {name}",
        { name: "dan" },
      );

      expect(result).toBe("hello dan");
    });

    it("should replace multiple placeholders", () => {
      const result = fx.interpolator.interpolate(
        "{a}-{b}",
        { a: 1, b: 2 },
      );

      expect(result).toBe("1-2");
    });
  });

  describe("EntryFactory", () => {
    it("should create entry with interpolated message", () => {
      const entry = fx.entryFactory.create(
        LogLevel.Info,
        "test",
        "hello {name}",
        { name: "dan" },
      );

      expect(entry.message).toBe("hello dan");
      expect(entry.category).toBe("test");
      expect(entry.level).toBe(LogLevel.Info);
      expect(entry.timestamp).toBe("2026-03-24T12:00:00.000Z");
    });

    it("should create entry without params", () => {
      const entry = fx.entryFactory.create(
        LogLevel.Warn,
        "cat",
        "message",
      );

      expect(entry.message).toBe("message");
    });
  });

  describe("Formatter", () => {
    it("should format entry using style", () => {
      const entry = fx.entryFactory.create(
        LogLevel.Error,
        "cat",
        "msg",
      );

      const formatted = fx.formatter.format(entry);

      expect(formatted).toBe(
        "ERROR|cat|2026-03-24T12:00:00.000Z|msg",
      );
    });
  });

  describe("Dispatcher", () => {
    it("should write formatted entry", () => {
      const entry = fx.entryFactory.create(
        LogLevel.Debug,
        "cat",
        "msg",
      );

      fx.dispatcher.dispatch(entry);

      expect(fx.writer.calls.length).toBe(1);

      const call = fx.writer.calls[0];

      expect(call.level).toBe(LogLevel.Debug);
      expect(call.category).toBe("cat");
      expect(call.formatted).toBe(
        "DEBUG|cat|2026-03-24T12:00:00.000Z|msg",
      );
    });

    it("should preserve level and category", () => {
      const entry = fx.entryFactory.create(
        LogLevel.Warn,
        "security",
        "alert",
      );

      fx.dispatcher.dispatch(entry);

      const call = fx.writer.calls[0];

      expect(call.level).toBe(LogLevel.Warn);
      expect(call.category).toBe("security");
    });
  });

  describe("End-to-end flow", () => {
    it("should interpolate, format and dispatch correctly", () => {
      const entry = fx.entryFactory.create(
        LogLevel.Info,
        "app",
        "user {id} logged in",
        { id: 42 },
      );

      fx.dispatcher.dispatch(entry);

      const call = fx.writer.calls[0];

      expect(call.formatted).toBe(
        "INFO|app|2026-03-24T12:00:00.000Z|user 42 logged in",
      );
    });
  });
});