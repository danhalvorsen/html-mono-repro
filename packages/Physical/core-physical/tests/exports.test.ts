// tests/exports.test.ts

import { describe, expect, it } from "vitest";

describe("core.physical exports", () => {
  it("loads the built module entrypoint", async () => {
    const mod = await import("../dist/index.js");

    expect(mod).toBeDefined();
  });
});