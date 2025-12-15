import { ILogErrorMethod } from "./ILogErrorMethod.js";
import { ILogMethod } from "./ILogMethod.js";
import { LogLevel } from "./styles/logStyle.js";
export interface ILogEntry {
  level: LogLevel;
  message: string;
  category: string;
  timestamp: string;
}
export interface ILogger {
  info: ILogMethod;
  warn: ILogMethod;
  error: ILogErrorMethod;
  debug: ILogMethod;
}
