import { describe, expect, it } from "vitest";

describe("core.module.example.web exports", () => {
  it("loads the built module entrypoint", async () => {
    const mod = await import("../dist/index.js");

    expect(mod).toBeDefined();
    expect(typeof mod.buildExampleResponse).toBe("function");
    expect(Array.isArray(mod.exampleData)).toBe(true);
  });
});