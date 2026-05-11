import { describe, expect, it } from "vitest";

describe("Slice 3 package subpath export", () => {
  it("loads the new facade through the package subpath", async () => {
    const api = await import("@monorepo/core-ioc-inversify/new");

    expect(typeof api.CreateDefaultContainerBuilder).toBe("function");
    expect(typeof api.ServiceCollection).toBe("function");
    expect(api.ServiceLifetime.Singleton).toBe("Singleton");
  });
});