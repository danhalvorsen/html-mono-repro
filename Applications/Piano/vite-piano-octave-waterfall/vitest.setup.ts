import { beforeAll, vi } from "vitest";

beforeAll(() => {
  vi.spyOn(console, "log").mockImplementation(() => undefined);

  const originalWarn = console.warn.bind(console);
  vi.spyOn(console, "warn").mockImplementation((...args: unknown[]) => {
    const [firstArg] = args;
    if (
      typeof firstArg === "string" &&
      firstArg.includes("Lit is in dev mode. Not recommended for production!")
    ) {
      return;
    }
    originalWarn(...args);
  });

  const originalError = console.error.bind(console);
  vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
    const [firstArg] = args;
    if (
      typeof firstArg === "string" &&
      firstArg.includes("Lit is in dev mode. Not recommended for production!")
    ) {
      return;
    }
    originalError(...args);
  });
});
