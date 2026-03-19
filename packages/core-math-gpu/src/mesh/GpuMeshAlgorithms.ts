// ============================================================================
// packages/math-core-gpu/src/mesh/GpuMeshAlgorithms.ts
// ============================================================================

import { Vector3Gpu } from "../primitives/Vector3Gpu.js";
import { GpuTriangleMesh } from "./GpuTriangleMesh.js";

export class GpuMeshAlgorithms {
  public static computeTriangleNormal(
    a: Vector3Gpu,
    b: Vector3Gpu,
    c: Vector3Gpu,
  ): Vector3Gpu {
    return b.subtract(a).cross(c.subtract(a)).normalize();
  }

  public static computeFaceNormals(mesh: GpuTriangleMesh): Float32Array {
    const normals = new Float32Array(mesh.triangleCount * 3);

    for (let triangleIndex = 0; triangleIndex < mesh.triangleCount; triangleIndex++) {
      const base = triangleIndex * 3;

      const ia = mesh.indices.get(base);
      const ib = mesh.indices.get(base + 1);
      const ic = mesh.indices.get(base + 2);

      const a = mesh.positions.get(ia);
      const b = mesh.positions.get(ib);
      const c = mesh.positions.get(ic);

      const normal = this.computeTriangleNormal(a, b, c);
      normals[base] = normal.x;
      normals[base + 1] = normal.y;
      normals[base + 2] = normal.z;
    }

    return normals;
  }
}

