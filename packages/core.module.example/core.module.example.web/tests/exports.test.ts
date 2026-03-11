import { describe, expect, it } from "vitest";

describe("core.module.example.web exports", () => {
  it("loads the module entrypoint", async () => {
    const mod = await import("../src/index.js");
    expect(mod).toBeDefined();
  });
});
