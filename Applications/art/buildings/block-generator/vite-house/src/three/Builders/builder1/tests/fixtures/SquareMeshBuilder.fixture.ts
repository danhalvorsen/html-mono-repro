// ============================================================================
// FILE: Applications/art/buildings/block-generator/vite-house/tests/Builders/builder1/fixtures/SquareMeshBuilder.fixture.ts
// ============================================================================

import * as THREE from "three";
import { SquareMeshBuilder } from "../../src/SquareMeshBuilder.js";

export interface ISquareMeshBuilderFixture {
  create(): SquareMeshBuilder;
  positions(geometry: THREE.BufferGeometry): number[];
  indices(geometry: THREE.BufferGeometry): number[];
}

export class SquareMeshBuilderFixture implements ISquareMeshBuilderFixture {
  public create(): SquareMeshBuilder {
    return new SquareMeshBuilder();
  }

  public positions(geometry: THREE.BufferGeometry): number[] {
    const attribute = geometry.getAttribute("position");
    if (!attribute) {
      throw new Error("Missing position attribute.");
    }

    return Array.from(attribute.array as ArrayLike<number>);
  }

  public indices(geometry: THREE.BufferGeometry): number[] {
    const index = geometry.getIndex();
    if (!index) {
      throw new Error("Missing index buffer.");
    }

    return Array.from(index.array as ArrayLike<number>);
  }
}