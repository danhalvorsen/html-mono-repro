import { GpuIndexBuffer } from "./GpuIndexBuffer.js";
import { GpuVertexBuffer3 } from "./GpuVertexBuffer3.js";

export class GpuTriangleMesh {
  public constructor(
    public readonly positions: GpuVertexBuffer3,
    public readonly indices: GpuIndexBuffer,
  ) {
    if (this.indices.count % 3 !== 0) {
      throw new Error("Triangle index buffer length must be divisible by 3.");
    }
  }

  public get triangleCount(): number {
    return this.indices.count / 3;
  }
}
