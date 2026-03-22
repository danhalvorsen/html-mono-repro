
// ============================================================================
// packages/math-core-gpu/src/mesh/GpuVertexBuffer3.ts
// ============================================================================

import { Guard } from "../common/Guard.js";
import { Vector3Gpu } from "../primitives/Vector3Gpu.js";

export class GpuVertexBuffer3 {
  private readonly values: Float32Array;

  public constructor(vertexCapacity: number) {
    if (vertexCapacity < 0) {
      throw new Error("vertexCapacity must be non-negative.");
    }
    this.values = new Float32Array(vertexCapacity * 3);
  }

  public get vertexCount(): number {
    return this.values.length / 3;
  }

  public get stride(): number {
    return 3;
  }

  public get raw(): Float32Array {
    return this.values;
  }

  public set(index: number, value: Vector3Gpu): void {
    if (index < 0 || index >= this.vertexCount) {
      throw new Error("Index out of bounds.");
    }
    const offset = index * 3;

    this.values[offset] = value.x;
    this.values[offset + 1] = value.y;
    this.values[offset + 2] = value.z;
  }

  public get(index: number): Vector3Gpu {
    Guard.index(index, this.vertexCount, "index");
    const offset = index * 3;

    return new Vector3Gpu(
      this.values[offset],
      this.values[offset + 1],
      this.values[offset + 2],
    );
  }

  public copyFrom(vertices: readonly Vector3Gpu[]): void {
    if (vertices.length !== this.vertexCount) {
      throw new Error("Vertex count mismatch.");
    }

    for (let i = 0; i < vertices.length; i++) {
      const vertex = vertices[i];
      if (vertex !== undefined) {
        this.set(i, vertex);
      }
    }
  }
}
