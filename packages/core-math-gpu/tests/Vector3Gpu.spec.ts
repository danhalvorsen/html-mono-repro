
// ============================================================================
// packages/math-core-gpu/tests/Vector3Gpu.spec.ts
// ============================================================================

import { describe, expect, it } from "vitest";
import { Matrix4Gpu, Vector3Gpu } from "../src/index.js";

describe("Vector3Gpu", () => {
  it("should add vectors", () => {
    const result = new Vector3Gpu(1, 2, 3).add(new Vector3Gpu(4, 5, 6));

    expect(result.equals(new Vector3Gpu(5, 7, 9))).toBe(true);
  });

  it("should transform vector by translation matrix", () => {
    const matrix = Matrix4Gpu.translation(10, 20, 30);
    const result = new Vector3Gpu(1, 2, 3).transform(matrix.toFloat32Array());

    expect(result.equals(new Vector3Gpu(11, 22, 33))).toBe(true);
  });
});
