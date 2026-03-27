// ============================================================================
// FILE: packages/core-design-pattern-composite-tree-threejs/tests/exports.test.ts
// ============================================================================

import { describe, expect, it } from "vitest";

describe("package exports", () => {
  it("loads the built module entrypoint", async () => {
    const mod = await import("../dist/index.js");

    expect(mod).toBeDefined();
    expect(typeof mod.PrimitiveCompositeNode).toBe("function");
    expect(typeof mod.TransformNode).toBe("function");
    expect(typeof mod.PrimitiveTreeSearch).toBe("function");
  });
});
