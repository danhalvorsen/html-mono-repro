/* ============================================================================
   @monorepo/core-logger — CENTRALIZED SINGLE FILE (TypeScript, ESM)

   Goal: preserve legacy APIs + behavior (1:1 contract) while addressing findings:
   - SRP: Logger delegates to EntryBuilder + Dispatcher
   - DRY: single interpolation implementation used everywhere
   - LSP: NullLogger matches ILogger signature
   - OCP: styles/writers/dispatchers remain pluggable
   - Legacy API preserved:
       - LoggerProvider.create(category): ILogger
       - LoggingConfig.style / writerStrategy / writer(level, formatted, category)
       - ILoggingStyle.format(level, message, category): string
       - IWriterStrategy.write(level, formatted, category): void
       - interpolateTemplate(template, params): string (chalk + util.inspect)
   Dependencies: chalk@5, winston@3
   ============================================================================ */

import chalk from "chalk";
import { inspect } from "util";
import { mkdirSync, appendFileSync } from "fs";
import { dirname } from "path";
import winston from "winston";

/* ============================= PUBLIC TYPES ============================= */

export const enum LogLevel {
  Info = "info",
  Warn = "warn",
  Error = "error",
  Debug = "debug",
}

export type ILogParams = Record<string, any>;

export type ILogMethod = (template: string, params?: ILogParams) => void;
export type ILogErrorMethod = ILogMethod;

export interface ILogEntry {
  level: LogLevel;
  message: string;   // legacy: formatted string (style already applied)
  category: string;
  timestamp: string; // ISO
}

export interface ILogger {
  info: ILogMethod;
  warn: ILogMethod;
  error: ILogErrorMethod;
  debug: ILogMethod;
}

/* ============================= INTERPOLATION (LEGACY) ============================= */

export type InterpolateParams = Record<string, any>;

export function interpolateTemplate(template: string, params?: InterpolateParams): string {
  if (!params) return template;

  return template.replace(/\{([^}]+)\}/g, (_m, keyRaw) => {
    const key = String(keyRaw).trim();
    const value = params[key];

    if (value === undefined) return `{${key}}`;

    return chalk.cyanBright(
      inspect(value, {
        depth: 2,
        breakLength: 100,
        colors: false,
      })
    );
  });
}

/* ============================= STYLES (LEGACY CONTRACT) ============================= */

export interface ILoggingStyle {
  format(level: LogLevel, message: string, category: string): string;
}

export abstract class LogStyleBase implements ILoggingStyle {
  abstract format(level: LogLevel, message: string, category: string): string;
}

export class ConsoleLogStyle extends LogStyleBase {
  format(level: LogLevel, message: string, category: string): string {
    const time = new Date().toISOString();
    const levelStr = typeof level === "string" ? level : String(level);
    return `[${time}] [${category}] [${levelStr}] ${message}`;
  }
}

export const defaultLogStyle: ILoggingStyle = new ConsoleLogStyle();

export class MinimalStyle extends LogStyleBase {
  format(level: LogLevel, msg: string, category: string): string {
    const color =
      level === LogLevel.Info
        ? chalk.greenBright
        : level === LogLevel.Warn
        ? chalk.yellowBright
        : level === LogLevel.Error
        ? chalk.redBright
        : chalk.blueBright;

    return `${chalk.gray(category)} ${color(level.toUpperCase())}: ${msg}`;
  }
}

export class BorderStyle extends LogStyleBase {
  constructor(private readonly borderType: "solid" | "dashed" | "dotted" = "solid") {
    super();
  }

  format(level: LogLevel, msg: string, category: string): string {
    const border =
      this.borderType === "solid" ? "─" : this.borderType === "dashed" ? "-" : "·";

    const text = `[${category}] ${level.toUpperCase()} → ${msg}`;
    const line = border.repeat(text.length);

    return (
      chalk.cyanBright(line) +
      "\n" +
      chalk.white(text) +
      "\n" +
      chalk.cyanBright(line)
    );
  }
}

export class CircleStyle extends LogStyleBase {
  format(level: LogLevel, msg: string, category: string): string {
    const icon =
      level === LogLevel.Info ? "○" :
      level === LogLevel.Warn ? "◔" :
      level === LogLevel.Error ? "●" : "◑";

    return `${chalk.magenta(icon + " " + category)} ${chalk.white(msg)}`;
  }
}

export class FlexStyle extends LogStyleBase {
  format(_level: LogLevel, msg: string, category: string): string {
    return chalk.blueBright(`[${category}]`) + " → " + chalk.white(msg);
  }
}

/* ============================= WRITER STRATEGY (LEGACY CONTRACT) ============================= */

export interface IWriterStrategy {
  write(level: LogLevel, formatted: string, category: string): void;
}

export interface ILoggingWriter {
  (level: LogLevel, formatted: string, category: string): void;
}

/* ============================= LOGGING CONFIG (LEGACY API + SEMANTICS) ============================= */

export const LoggingConfig: {
  style: ILoggingStyle;

  /** Optional pluggable writer strategy. If set, it overrides the default writer. */
  writerStrategy: IWriterStrategy | null;

  /** Fallback writer if no strategy is set. */
  writer: ILoggingWriter;
} = {
  style: {
    format: (_level, message, _category) => message, // identity default
  },

  writerStrategy: null,

  writer(level, formatted, category) {
    if (this.writerStrategy) {
      this.writerStrategy.write(level, formatted, category);
      return;
    }
    console.log(`[${category}] ${formatted}`);
  },
};

/* ============================= INTERNAL SRP REFACTOR (NO API CHANGE) ============================= */

interface IClock {
  nowIso(): string;
}
class SystemClock implements IClock {
  nowIso(): string {
    return new Date().toISOString();
  }
}

interface IInterpolator {
  apply(template: string, params?: ILogParams): string;
}
class TemplateInterpolator implements IInterpolator {
  apply(template: string, params?: ILogParams): string {
    return interpolateTemplate(template, params);
  }
}

interface ILogEntryBuilder {
  build(level: LogLevel, template: string, params: ILogParams | undefined, category: string): ILogEntry;
}
class DefaultLogEntryBuilder implements ILogEntryBuilder {
  constructor(private readonly interpolator: IInterpolator, private readonly clock: IClock) {}

  build(level: LogLevel, template: string, params: ILogParams | undefined, category: string): ILogEntry {
    const raw = this.interpolator.apply(template, params ?? {});
    const formatted = LoggingConfig.style.format(level, raw, category);

    return {
      level,
      message: formatted,
      category,
      timestamp: this.clock.nowIso(),
    };
  }
}

interface ILogDispatcher {
  dispatch(entry: ILogEntry): void;
}
class LoggingConfigDispatcher implements ILogDispatcher {
  dispatch(entry: ILogEntry): void {
    if (LoggingConfig.writerStrategy) {
      LoggingConfig.writerStrategy.write(entry.level, entry.message, entry.category);
      return;
    }
    LoggingConfig.writer(entry.level, entry.message, entry.category);
  }
}

/* ============================= LOGGER PROVIDER (LEGACY API) ============================= */

export class LoggerProvider {
  static create(category: string): ILogger {
    return new Logger(category);
  }
}

class Logger implements ILogger {
  private readonly builder: ILogEntryBuilder;
  private readonly dispatcher: ILogDispatcher;

  constructor(private readonly category: string) {
    // Composition root for each logger instance (keeps behavior deterministic).
    this.builder = new DefaultLogEntryBuilder(new TemplateInterpolator(), new SystemClock());
    this.dispatcher = new LoggingConfigDispatcher();
  }

  info(template: string, params?: ILogParams): void {
    this.log(LogLevel.Info, template, params);
  }
  warn(template: string, params?: ILogParams): void {
    this.log(LogLevel.Warn, template, params);
  }
  debug(template: string, params?: ILogParams): void {
    this.log(LogLevel.Debug, template, params);
  }
  error(template: string, params?: ILogParams): void {
    this.log(LogLevel.Error, template, params);
  }

  private log(level: LogLevel, template: string, params?: ILogParams): void {
    const entry = this.builder.build(level, template, params, this.category);
    this.dispatcher.dispatch(entry);
  }
}

/* ============================= NULL LOGGER (LSP FIX, LEGACY EXPORT) ============================= */

export class NullLogger implements ILogger {
  info(_template: string, _params?: ILogParams): void {}
  warn(_template: string, _params?: ILogParams): void {}
  debug(_template: string, _params?: ILogParams): void {}
  error(_template: string, _params?: ILogParams): void {}
}
export const nullLogger: ILogger = new NullLogger();

/* ============================= UTILITIES (LEGACY) ============================= */

export function boxText(text: string, opts?: { borderChar?: string }): string {
  const border = opts?.borderChar ?? "─";

  const lines = text.split("\n");
  const maxLen = Math.max(...lines.map((l) => l.length));

  const top = border.repeat(maxLen + 4);
  const bottom = top;

  const body = lines.map((line) => `│ ${line.padEnd(maxLen)} │`).join("\n");

  return `${top}\n${body}\n${bottom}`;
}

export class DefaultStyle extends LogStyleBase {
  format(_level: LogLevel, msg: string, category: string): string {
    const content = chalk.gray(`[${category}]`) + "\n" + chalk.white(msg);
    return boxText(content, { borderChar: "─" });
  }
}

/* ============================= WRITERS (LEGACY-STYLE MODULES) ============================= */

/** Memory writer compatible with LoggingConfig.writer (used in tests/regressions). */
export class MemoryWriter {
  readonly entries: ILogEntry[] = [];

  asWriter(): ILoggingWriter {
    return (level: LogLevel, formatted: string, category: string): void => {
      this.entries.push({
        level,
        message: formatted,
        category,
        timestamp: new Date().toISOString(),
      });
    };
  }

  clear(): void {
    this.entries.length = 0;
  }
}

/** Deterministic, synchronous file writer returning LoggingConfig-compatible writer. */
export class FileWriter {
  private readonly filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
    mkdirSync(dirname(this.filePath), { recursive: true });
  }

  asWriter(): ILoggingWriter {
    return (level: LogLevel, formatted: string, category: string): void => {
      const timestamp = new Date().toISOString();
      const entry = `${timestamp} [${category}] ${String(level).toUpperCase()}: ${formatted}\n`;
      appendFileSync(this.filePath, entry, { encoding: "utf8" });
    };
  }
}

/** Fix DRY: DevLogger uses the SAME interpolateTemplate + MinimalStyle (no duplicate regex logic). */
export class DevLogger implements ILogger {
  private readonly style = new MinimalStyle();
  constructor(private readonly category: string = "DemoCategory") {}

  info(t: string, p?: ILogParams): void { this.write(LogLevel.Info, t, p); }
  warn(t: string, p?: ILogParams): void { this.write(LogLevel.Warn, t, p); }
  debug(t: string, p?: ILogParams): void { this.write(LogLevel.Debug, t, p); }
  error(t: string, p?: ILogParams): void { this.write(LogLevel.Error, t, p); }

  private write(level: LogLevel, template: string, params?: ILogParams): void {
    const raw = interpolateTemplate(template, params ?? {});
    const styled = this.style.format(level, raw, this.category);
    console.log(styled);
  }
}

/* ============================= WINSTON INTEGRATION (LEGACY STRATEGY) ============================= */

export interface ConsoleTransportOptions {
  json?: boolean;
  timestamp?: boolean;
  colorize?: boolean;
}

export interface FileTransportOptions {
  filename: string;
  json?: boolean;
  timestamp?: boolean;
}

/** DRY: shared printf formatter */
export const defaultWinstonFormatter = winston.format.printf(({ timestamp, level, message, category }) => {
  if (timestamp) return `${timestamp} [${category}] ${String(level).toUpperCase()}: ${message}`;
  return `[${category}] ${String(level).toUpperCase()}: ${message}`;
});

export class WinstonTransports {
  static console(opts: ConsoleTransportOptions = {}): winston.transport {
    const { json = false, timestamp = true, colorize = false } = opts;
    const formats: winston.Logform.Format[] = [];
    if (timestamp) formats.push(winston.format.timestamp());
    if (colorize) formats.push(winston.format.colorize());
    formats.push(json ? winston.format.json() : defaultWinstonFormatter);

    return new winston.transports.Console({ format: winston.format.combine(...formats) });
  }

  static file(opts: FileTransportOptions): winston.transport {
    const { filename, json = false, timestamp = true } = opts;
    const formats: winston.Logform.Format[] = [];
    if (timestamp) formats.push(winston.format.timestamp());
    formats.push(json ? winston.format.json() : defaultWinstonFormatter);

    return new winston.transports.File({ filename, format: winston.format.combine(...formats) });
  }
}

/**
 * IWriterStrategy implementation using Winston.
 * Preserves legacy override semantics via LoggingConfig.writerStrategy.
 */
export class WinstonWriterAdapter implements IWriterStrategy {
  private readonly logger: winston.Logger;

  constructor(category: string = "default", level: LogLevel = LogLevel.Debug, transports?: winston.transport[]) {
    this.logger = winston.createLogger({
      level,
      defaultMeta: { category },
      transports: transports?.length ? transports : [WinstonTransports.console({ timestamp: true })],
    });
  }

  write(level: LogLevel, formatted: string, category: string): void {
    this.logger.log({ level, category, message: formatted });
  }
}

/* ============================= LEGACY "default-logging.config.ts" (SAFE) ============================= */

/** Legacy-compatible helper to set MinimalStyle without side-effect imports. */
export function useMinimalStyle(): void {
  LoggingConfig.style = new MinimalStyle();
}

/** Legacy-compatible helper to set DefaultStyle/ConsoleLogStyle. */
export function useConsoleLogStyle(): void {
  LoggingConfig.style = defaultLogStyle;
}

/* ============================= OPTIONAL: console override (explicit opt-in) ============================= */

export function overrideConsoleLog(): void {
  const originalLog = console.log;
  console.log = (msg: unknown, ...rest: unknown[]) => {
    const formatted = String(msg);
    originalLog(formatted, ...rest);
  };
}

/* ============================= DEMO ============================= */
/*
useMinimalStyle();
LoggingConfig.writerStrategy = new WinstonWriterAdapter("Demo", LogLevel.Debug, [
  WinstonTransports.console({ timestamp: true, colorize: false }),
  WinstonTransports.file({ filename: "logs/app.log", timestamp: true, json: true }),
]);

const log = LoggerProvider.create("Demo");
log.info("System starting with PID {pid}", { pid: process.pid });
log.debug("Debug value: {value}", { value: 42 });
log.warn("Low memory warning at {usage}%", { usage: 78 });
log.error("Unhandled exception: {error}", { error: new Error("Crash!") });
*/