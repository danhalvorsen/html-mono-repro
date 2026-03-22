
// ============================================================================
// packages/math-core-gpu/tests/GpuMeshAlgorithms.spec.ts
// ============================================================================

import { describe, expect, it } from "vitest";
import {
  GpuIndexBuffer,
  GpuMeshAlgorithms,
  GpuTriangleMesh,
  GpuVertexBuffer3,
  Vector3Gpu,
} from "../src/index.js";

describe("GpuMeshAlgorithms", () => {
  it("should compute a unit z normal for a planar triangle", () => {
    const positions = new GpuVertexBuffer3(3);
    positions.set(0, new Vector3Gpu(0, 0, 0));
    positions.set(1, new Vector3Gpu(1, 0, 0));
    positions.set(2, new Vector3Gpu(0, 1, 0));

    const indices = new GpuIndexBuffer(3);
    indices.copyFrom([0, 1, 2]);

    const mesh = new GpuTriangleMesh(positions, indices);
    const normals = GpuMeshAlgorithms.computeFaceNormals(mesh);

    expect(Array.from(normals)).toEqual([0, 0, 1]);
  });
});