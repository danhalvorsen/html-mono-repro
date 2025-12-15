import { ILogger } from "../ILogger.js";
import { LogLevel } from "../logLevel.js";
import { MinimalStyle } from "../styles/MinimalStyle.js";

export class DevLogger implements ILogger {
  private style = new MinimalStyle();

  private write(level: LogLevel, msg: string, params?: Record<string, any>) {
    const formatted = params
      ? msg.replace(/\{([^}]+)\}/g, (_, k) => String(params[k]))
      : msg;

    const styled = this.style.format(level, formatted, "DemoCategory");

    console.log(styled);
  }

  info(msg: string, params?: Record<string, any>)  { this.write(LogLevel.Info,  msg, params); }
  warn(msg: string, params?: Record<string, any>)  { this.write(LogLevel.Warn,  msg, params); }
  debug(msg: string, params?: Record<string, any>) { this.write(LogLevel.Debug, msg, params); }
  error(msg: string, params?: Record<string, any>) { this.write(LogLevel.Error, msg, params); }
}
