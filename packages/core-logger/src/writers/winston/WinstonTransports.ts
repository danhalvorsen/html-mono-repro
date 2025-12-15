// src/writers/winston/WinstonTransports.ts

import winston from "winston";

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

/**
 * Reusable Winston transport builders.
 * Separated for clean Open–Closed design.
 */
export class WinstonTransports {

  static console(opts: ConsoleTransportOptions = {}): winston.transport {
    const { json = false, timestamp = true, colorize = false } = opts;

    const formats: winston.Logform.Format[] = [];

    if (timestamp) formats.push(winston.format.timestamp());
    if (colorize) formats.push(winston.format.colorize());

    if (json) {
      formats.push(winston.format.json());
    } else {
      formats.push(
        winston.format.printf(({ timestamp, level, message, category }) => {
          if (timestamp) {
            return `${timestamp} [${category}] ${level.toUpperCase()}: ${message}`;
          }
          return `[${category}] ${level.toUpperCase()}: ${message}`;
        })
      );
    }

    return new winston.transports.Console({
      format: winston.format.combine(...formats)
    });
  }

  static file(opts: FileTransportOptions): winston.transport {
    const { filename, json = false, timestamp = true } = opts;

    const formats: winston.Logform.Format[] = [];

    if (timestamp) formats.push(winston.format.timestamp());

    if (json) {
      formats.push(winston.format.json());
    } else {
      formats.push(
        winston.format.printf(({ timestamp, level, message, category }) => {
          if (timestamp) {
            return `${timestamp} [${category}] ${level.toUpperCase()}: ${message}`;
          }
          return `[${category}] ${level.toUpperCase()}: ${message}`;
        })
      );
    }

    return new winston.transports.File({
      filename,
      format: winston.format.combine(...formats)
    });
  }
}
