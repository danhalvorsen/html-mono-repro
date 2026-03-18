// ====================================================================================
// FILE: src/three/geometry/IndexedGeometryBuilder.ts
// ====================================================================================

import * as THREE from "three";
import type { IIndexedGeometryBuilder } from "./IIndexedGeometryBuilder.js";

type PendingRectangle = Readonly<{
  point0: THREE.Vector2;
  point1: THREE.Vector2;
}>;

type LoftedRectangle = Readonly<{
  point0: THREE.Vector2;
  point1: THREE.Vector2;
  height: number;
}>;

type State = Readonly<{
  pending: PendingRectangle | null;
  solids: readonly LoftedRectangle[];
}>;

export class IndexedGeometryBuilder
  implements IIndexedGeometryBuilder<IndexedGeometryBuilder>
{
  private readonly state: State;

  private constructor(state: State) {
    this.state = state;
  }

  public static create(): IndexedGeometryBuilder {
    return new IndexedGeometryBuilder({
      pending: null,
      solids: [],
    });
  }

  public with(
    point0: THREE.Vector2,
    point1: THREE.Vector2,
  ): IndexedGeometryBuilder {
    this.ensureVector(point0, "point0");
    this.ensureVector(point1, "point1");

    if (point0.x === point1.x || point0.y === point1.y) {
      throw new Error(
        "Points must define a rectangle with non-zero width and height.",
      );
    }

    return new IndexedGeometryBuilder({
      ...this.state,
      pending: {
        point0: point0.clone(),
        point1: point1.clone(),
      },
    });
  }

  public withLoft(height: number): IndexedGeometryBuilder {
    if (!Number.isFinite(height) || height <= 0) {
      throw new Error("Loft height must be greater than zero.");
    }

    if (this.state.pending === null) {
      throw new Error("A rectangle must be defined before lofting.");
    }

    return new IndexedGeometryBuilder({
      pending: null,
      solids: [
        ...this.state.solids,
        {
          point0: this.state.pending.point0.clone(),
          point1: this.state.pending.point1.clone(),
          height,
        },
      ],
    });
  }

  public build(): THREE.BufferGeometry {
    if (this.state.pending !== null) {
      throw new Error("Pending rectangle must be lofted before build().");
    }

    if (this.state.solids.length === 0) {
      throw new Error("At least one lofted rectangle must be defined before build().");
    }

    const positions: number[] = [];
    const indices: number[] = [];

    for (const solid of this.state.solids) {
      this.appendSolid(positions, indices, solid);
    }

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(positions), 3),
    );
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    return geometry;
  }

  private appendSolid(
    positions: number[],
    indices: number[],
    solid: LoftedRectangle,
  ): void {
    const minX = Math.min(solid.point0.x, solid.point1.x);
    const maxX = Math.max(solid.point0.x, solid.point1.x);
    const minY = Math.min(solid.point0.y, solid.point1.y);
    const maxY = Math.max(solid.point0.y, solid.point1.y);
    const minZ = 0;
    const maxZ = solid.height;

    const vertexOffset = positions.length / 3;

    positions.push(
      minX, minY, minZ, // 0
      maxX, minY, minZ, // 1
      maxX, maxY, minZ, // 2
      minX, maxY, minZ, // 3
      minX, minY, maxZ, // 4
      maxX, minY, maxZ, // 5
      maxX, maxY, maxZ, // 6
      minX, maxY, maxZ, // 7
    );

    indices.push(
      vertexOffset + 0, vertexOffset + 1, vertexOffset + 2,
      vertexOffset + 0, vertexOffset + 2, vertexOffset + 3,

      vertexOffset + 4, vertexOffset + 7, vertexOffset + 6,
      vertexOffset + 4, vertexOffset + 6, vertexOffset + 5,

      vertexOffset + 0, vertexOffset + 4, vertexOffset + 5,
      vertexOffset + 0, vertexOffset + 5, vertexOffset + 1,

      vertexOffset + 1, vertexOffset + 5, vertexOffset + 6,
      vertexOffset + 1, vertexOffset + 6, vertexOffset + 2,

      vertexOffset + 2, vertexOffset + 6, vertexOffset + 7,
      vertexOffset + 2, vertexOffset + 7, vertexOffset + 3,

      vertexOffset + 3, vertexOffset + 7, vertexOffset + 4,
      vertexOffset + 3, vertexOffset + 4, vertexOffset + 0,
    );
  }

  private ensureVector(vector: THREE.Vector2, name: string): void {
    if (!Number.isFinite(vector.x) || !Number.isFinite(vector.y)) {
      throw new Error(`${name} must contain finite values.`);
    }
  }
}