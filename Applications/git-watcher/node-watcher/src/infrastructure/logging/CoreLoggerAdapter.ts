import { DevLogger } from "@monorepo/core-logger-nodejs";
import type { ILogger } from "../../contracts/logging/ILogger.js";

export class CoreLoggerAdapter implements ILogger {
  private readonly logger = new DevLogger("git-watcher");

  public info(template: string, params?: Record<string, unknown>): void {
    if (params === undefined) {
      this.logger.info(template);
      return;
    }

    this.logger.info(template, params);
  }

  public warn(template: string, params?: Record<string, unknown>): void {
    if (params === undefined) {
      this.logger.warn(template);
      return;
    }

    this.logger.warn(template, params);
  }

  public error(template: string, params?: Record<string, unknown>): void {
    if (params === undefined) {
      this.logger.error(template);
      return;
    }

    this.logger.error(template, params);
  }

  public debug(template: string, params?: Record<string, unknown>): void {
    if (params === undefined) {
      this.logger.debug(template);
      return;
    }

    this.logger.debug(template, params);
  }
}