// barrel.ts
// Public surface for @monorepo/core-logger
// Re-export ONLY supported contract types and APIs.

export {
  LoggerProvider,
  NullLogger,
  nullLogger,
} from "./logger.js";

export {
  LogLevel,
  ILogger,
  ILogEntry,
  ILogMethod,
  ILogErrorMethod,
  ILogParams,
} from "./logger.js";

export {
  LoggingConfig,
  ILoggingStyle,
  LogStyleBase,
  ConsoleLogStyle,
  defaultLogStyle,
  MinimalStyle,
  BorderStyle,
  CircleStyle,
  FlexStyle,
  DefaultStyle,
} from "./logger.js";

export {
  IWriterStrategy,
  ILoggingWriter,
  MemoryWriter,
  FileWriter,
  DevLogger,
  WinstonWriterAdapter,
  WinstonTransports,
} from "./logger.js";

export {
  interpolateTemplate,
  boxText,
  useMinimalStyle,
  useConsoleLogStyle,
  overrideConsoleLog,
} from "./logger.js";