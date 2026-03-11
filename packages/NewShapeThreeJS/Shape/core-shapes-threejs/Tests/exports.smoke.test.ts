// MonoRepro/packages/NewShapeThreeJS/core-shapes-threejs/Tests/exports.smoke.test.ts
import { describe, it, expect } from "vitest";

describe("core-shapes-threejs ESM barrel", () => {
  it("imports index.js without throwing (barrel/.js correctness)", async () => {
    const m = await import("../src/index.js");
    expect(m).toBeTruthy();
  });
});