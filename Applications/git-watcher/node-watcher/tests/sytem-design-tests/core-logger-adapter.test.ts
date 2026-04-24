import { beforeEach, describe, expect, test, vi } from "vitest";

const {
  devLoggerConstructorSpy,
  infoSpy,
  warnSpy,
  errorSpy,
  debugSpy,
} = vi.hoisted(() => ({
  devLoggerConstructorSpy: vi.fn(),
  infoSpy: vi.fn(),
  warnSpy: vi.fn(),
  errorSpy: vi.fn(),
  debugSpy: vi.fn(),
}));

vi.mock("@monorepo/core-logger-nodejs", () => ({
  DevLogger: devLoggerConstructorSpy.mockImplementation((_category: string) => ({
    info: infoSpy,
    warn: warnSpy,
    error: errorSpy,
    debug: debugSpy,
  })),
}));

import { CoreLoggerAdapter } from "../../src/index.js";

describe("CoreLoggerAdapter", () => {
  beforeEach(() => {
    devLoggerConstructorSpy.mockClear();
    infoSpy.mockClear();
    warnSpy.mockClear();
    errorSpy.mockClear();
    debugSpy.mockClear();
  });

  test("routes info messages through core logger", () => {
    const logger = new CoreLoggerAdapter();
    logger.info("watch started");

    expect(devLoggerConstructorSpy).toHaveBeenCalledWith("git-watcher");
    expect(infoSpy).toHaveBeenCalledWith("watch started");
  });

  test("routes error messages through core logger", () => {
    const logger = new CoreLoggerAdapter();
    logger.error("watch failed");

    expect(devLoggerConstructorSpy).toHaveBeenCalledWith("git-watcher");
    expect(errorSpy).toHaveBeenCalledWith("watch failed");
  });

  test("routes warn and debug messages through core logger", () => {
    const logger = new CoreLoggerAdapter();
    logger.warn("watch warning");
    logger.debug("watch debug");

    expect(devLoggerConstructorSpy).toHaveBeenCalledWith("git-watcher");
    expect(warnSpy).toHaveBeenCalledWith("watch warning");
    expect(debugSpy).toHaveBeenCalledWith("watch debug");
  });
});
