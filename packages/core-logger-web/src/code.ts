// packages/core-logger-web/src/code.ts

import chalk from "chalk";
import {
  LogLevel,
  LogStyleBase,
} from "@monorepo/core-logger-abstract";
import type {
  IClock,
  IDispatcher,
  IEntryFactory,
  IFormatter,
  IInterpolator,
  ILogEntry,
  ILogger,
  ILoggingStyle,
  ILoggingWriter,
  ILogParams,
  IStyleResolver,
  IWriterResolver,
  IWriterStrategy,
} from "@monorepo/core-logger-abstract";

/* ============================= INTERPOLATION ============================= */

export type InterpolateParams = Record<string, unknown>;

function stringifyBrowserValue(value: unknown): string {
  if (value instanceof Error) {
    return `${value.name}: ${value.message}`;
  }

  if (typeof value === "string") {
    return JSON.stringify(value);
  }

  if (
    typeof value === "number" ||
    typeof value === "bigint" ||
    typeof value === "boolean" ||
    typeof value === "undefined" ||
    value === null
  ) {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return Object.prototype.toString.call(value);
  }
}

export function interpolateTemplate(template: string, params?: InterpolateParams): string {
  if (!params) {
    return template;
  }

  return template.replace(/\{([^}]+)\}/g, (_match: string, rawKey: string) => {
    const key = rawKey.trim();
    const value = params[key];

    if (value === undefined) {
      return `{${key}}`;
    }

    return chalk.cyanBright(stringifyBrowserValue(value));
  });
}

/* ============================= STYLES ============================= */

export class ConsoleLogStyle extends LogStyleBase {
  public format(
    level: LogLevel,
    message: string,
    category: string,
    timestamp: string,
  ): string {
    return `[${timestamp}] [${category}] [${this.toUpper(level)}] ${message}`;
  }
}

export const defaultLogStyle: ILoggingStyle = new ConsoleLogStyle();

export class MinimalStyle extends LogStyleBase {
  public format(level: LogLevel, message: string, category: string, _timestamp: string): string {
    const color =
      level === LogLevel.Info
        ? chalk.greenBright
        : level === LogLevel.Warn
          ? chalk.yellowBright
          : level === LogLevel.Error
            ? chalk.redBright
            : chalk.blueBright;

    return `${chalk.gray(category)} ${color(this.toUpper(level))}: ${message}`;
  }
}

export class BorderStyle extends LogStyleBase {
  public constructor(
    private readonly borderType: "solid" | "dashed" | "dotted" = "solid",
  ) {
    super();
  }

  public format(level: LogLevel, message: string, category: string, timestamp: string): string {
    const borderChar =
      this.borderType === "solid"
        ? "─"
        : this.borderType === "dashed"
          ? "-"
          : "·";

    const text = `[${timestamp}] [${category}] [${this.toUpper(level)}] ${message}`;
    const line = borderChar.repeat(Math.max(text.length, 8));

    return `${chalk.cyanBright(line)}\n${chalk.white(text)}\n${chalk.cyanBright(line)}`;
  }
}

export class CircleStyle extends LogStyleBase {
  public format(level: LogLevel, message: string, category: string, _timestamp: string): string {
    const icon =
      level === LogLevel.Info
        ? "○"
        : level === LogLevel.Warn
          ? "◔"
          : level === LogLevel.Error
            ? "●"
            : "◑";

    return `${chalk.magenta(`${icon} ${category}`)} ${chalk.white(message)}`;
  }
}

export class FlexStyle extends LogStyleBase {
  public format(_level: LogLevel, message: string, category: string, _timestamp: string): string {
    return `${chalk.blueBright(`[${category}]`)} → ${chalk.white(message)}`;
  }
}

export function boxText(text: string, opts?: { borderChar?: string }): string {
  const borderChar = opts?.borderChar ?? "─";
  const lines = text.split("\n");
  const width = lines.reduce((max, line) => Math.max(max, line.length), 0);
  const topBottom = borderChar.repeat(width + 4);
  const body = lines.map((line) => `│ ${line.padEnd(width)} │`).join("\n");

  return `${topBottom}\n${body}\n${topBottom}`;
}

export class DefaultStyle extends LogStyleBase {
  public format(level: LogLevel, message: string, category: string, timestamp: string): string {
    const header = chalk.gray(`[${timestamp}] [${category}] [${this.toUpper(level)}]`);
    const body = chalk.white(message);

    return boxText(`${header}\n${body}`, { borderChar: "─" });
  }
}

/* ============================= CONFIG ============================= */

export const LoggingConfig: {
  style: ILoggingStyle;
  writerStrategy: IWriterStrategy | null;
  writer: ILoggingWriter;
} = {
  style: defaultLogStyle,
  writerStrategy: null,
  writer: (_level: LogLevel, formatted: string, _category: string): void => {
    console.log(formatted);
  },
};

export function useMinimalStyle(): void {
  LoggingConfig.style = new MinimalStyle();
}

export function useConsoleLogStyle(): void {
  LoggingConfig.style = defaultLogStyle;
}

export function overrideConsoleLog(): void {
  const originalLog = console.log.bind(console);

  console.log = (message?: unknown, ...optionalParams: unknown[]): void => {
    originalLog(message, ...optionalParams);
  };
}

/* ============================= INTERNAL IMPLEMENTATIONS ============================= */

class SystemClock implements IClock {
  public nowIso(): string {
    return new Date().toISOString();
  }
}

class TemplateInterpolator implements IInterpolator {
  public interpolate(template: string, params?: ILogParams): string {
    return interpolateTemplate(template, params);
  }
}

class DefaultEntryFactory implements IEntryFactory {
  public constructor(
    private readonly interpolator: IInterpolator,
    private readonly clock: IClock,
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

class LoggingConfigStyleResolver implements IStyleResolver {
  public getStyle(): ILoggingStyle {
    return LoggingConfig.style;
  }
}

class LoggingConfigWriterResolver implements IWriterResolver {
  public getWriterStrategy(): IWriterStrategy | null {
    return LoggingConfig.writerStrategy;
  }

  public getWriter(): ILoggingWriter {
    return LoggingConfig.writer;
  }
}

class DefaultFormatter implements IFormatter {
  public constructor(
    private readonly styleResolver: IStyleResolver,
  ) {}

  public format(entry: ILogEntry): string {
    const style = this.styleResolver.getStyle();

    return style.format(
      entry.level,
      entry.message,
      entry.category,
      entry.timestamp,
    );
  }
}

class DefaultDispatcher implements IDispatcher {
  public constructor(
    private readonly formatter: IFormatter,
    private readonly writerResolver: IWriterResolver,
  ) {}

  public dispatch(entry: ILogEntry): void {
    const formatted = this.formatter.format(entry);
    const strategy = this.writerResolver.getWriterStrategy();

    if (strategy !== null) {
      strategy.write(entry.level, formatted, entry.category);
      return;
    }

    const writer = this.writerResolver.getWriter();
    writer(entry.level, formatted, entry.category);
  }
}

/* ============================= LOGGERS ============================= */

class Logger implements ILogger {
  public constructor(
    private readonly category: string,
    private readonly entryFactory: IEntryFactory,
    private readonly dispatcher: IDispatcher,
  ) {}

  public info(template: string, params?: ILogParams): void {
    this.log(LogLevel.Info, template, params);
  }

  public warn(template: string, params?: ILogParams): void {
    this.log(LogLevel.Warn, template, params);
  }

  public error(template: string, params?: ILogParams): void {
    this.log(LogLevel.Error, template, params);
  }

  public debug(template: string, params?: ILogParams): void {
    this.log(LogLevel.Debug, template, params);
  }

  private log(level: LogLevel, template: string, params?: ILogParams): void {
    const entry = this.entryFactory.create(level, this.category, template, params);
    this.dispatcher.dispatch(entry);
  }
}

class LoggerCompositionRoot {
  public createLogger(category: string): ILogger {
    const entryFactory = new DefaultEntryFactory(
      new TemplateInterpolator(),
      new SystemClock(),
    );

    const formatter = new DefaultFormatter(
      new LoggingConfigStyleResolver(),
    );

    const dispatcher = new DefaultDispatcher(
      formatter,
      new LoggingConfigWriterResolver(),
    );

    return new Logger(category, entryFactory, dispatcher);
  }
}

export class LoggerProvider {
  private static readonly compositionRoot = new LoggerCompositionRoot();

  public static create(category: string): ILogger {
    return LoggerProvider.compositionRoot.createLogger(category);
  }
}

export class NullLogger implements ILogger {
  public info(_template: string, _params?: ILogParams): void {}
  public warn(_template: string, _params?: ILogParams): void {}
  public error(_template: string, _params?: ILogParams): void {}
  public debug(_template: string, _params?: ILogParams): void {}
}

export const nullLogger: ILogger = new NullLogger();

export class DevLogger implements ILogger {
  private readonly inner: ILogger;

  public constructor(category = "DemoCategory") {
    this.inner = LoggerProvider.create(category);
  }

  public info(template: string, params?: ILogParams): void {
    this.inner.info(template, params);
  }

  public warn(template: string, params?: ILogParams): void {
    this.inner.warn(template, params);
  }

  public error(template: string, params?: ILogParams): void {
    this.inner.error(template, params);
  }

  public debug(template: string, params?: ILogParams): void {
    this.inner.debug(template, params);
  }
}

/* ============================= WRITERS ============================= */

export class MemoryWriter {
  public readonly entries: ILogEntry[] = [];
  public readonly formattedEntries: string[] = [];

  private record(level: LogLevel, formatted: string, category: string): void {
    this.entries.push({
      level,
      message: formatted,
      category,
      timestamp: new Date().toISOString(),
    });

    this.formattedEntries.push(formatted);
  }

  public asWriter(): ILoggingWriter {
    return (level: LogLevel, formatted: string, category: string): void => {
      this.record(level, formatted, category);
    };
  }

  public asStrategy(): IWriterStrategy {
    return {
      write: (level: LogLevel, formatted: string, category: string): void => {
        this.record(level, formatted, category);
      },
    };
  }

  public clear(): void {
    this.entries.length = 0;
    this.formattedEntries.length = 0;
  }
}

export class BrowserConsoleWriter {
  public asWriter(): ILoggingWriter {
    return (_level: LogLevel, formatted: string, _category: string): void => {
      console.log(formatted);
    };
  }

  public asStrategy(): IWriterStrategy {
    return {
      write: (_level: LogLevel, formatted: string, _category: string): void => {
        console.log(formatted);
      },
    };
  }
}

/* ============================= ABSTRACT CONTRACT RE-EXPORTS ============================= */

export { LogLevel, LogStyleBase };

export type {
  IClock,
  IDispatcher,
  IEntryFactory,
  IFormatter,
  IInterpolator,
  ILogEntry,
  ILogger,
  ILoggingStyle,
  ILoggingWriter,
  ILogErrorMethod,
  ILogMethod,
  ILogParams,
  IStyleResolver,
  IWriterResolver,
  IWriterStrategy,
} from "@monorepo/core-logger-abstract";