
import * as THREE from "three";
import { expect } from "vitest";
import { RectBuilder } from "../../src/three/Builders/Quad/src/RectBuilder.js";
import { RectSemantic } from "../../src/three/Builders/Quad/src/RectSemantic.js";

export interface IRectBuilderFixture {
  createSut(): RectBuilder;
  getPositions(geometry: THREE.BufferGeometry): ReadonlyArray<THREE.Vector3>;
  getBoundingBox(geometry: THREE.BufferGeometry): THREE.Box3;
  expectVectorClose(actual: THREE.Vector3, expected: Readonly<{ x: number; y: number; z: number }>, epsilon?: number): void;
  expectAnyVertexClose(geometry: THREE.BufferGeometry, expected: Readonly<{ x: number; y: number; z?: number }>, epsilon?: number): void;
  expectDimensions(geometry: THREE.BufferGeometry, expected: Readonly<{ width: number; height: number; depth: number }>, epsilon?: number): void;
}

export class RectBuilderFixture implements IRectBuilderFixture {
  public createSut(): RectBuilder {
    return new RectBuilder();
  }

  public getPositions(geometry: THREE.BufferGeometry): ReadonlyArray<THREE.Vector3> {
    const attribute = geometry.getAttribute("position");

    if (attribute === undefined) {
      throw new Error("position attribute is missing.");
    }

    const positions: THREE.Vector3[] = [];

    for (let index = 0; index < attribute.count; index += 1) {
      positions.push(
        new THREE.Vector3(
          attribute.getX(index),
          attribute.getY(index),
          attribute.getZ(index),
        ),
      );
    }

    return positions;
  }

  public getBoundingBox(geometry: THREE.BufferGeometry): THREE.Box3 {
    const cloned = geometry.clone();
    cloned.computeBoundingBox();

    if (cloned.boundingBox === null) {
      throw new Error("bounding box could not be computed.");
    }

    return cloned.boundingBox.clone();
  }

  public expectVectorClose(
    actual: THREE.Vector3,
    expected: Readonly<{ x: number; y: number; z: number }>,
    epsilon: number = 1e-6,
  ): void {
    expect(actual.x).toBeCloseTo(expected.x, this.toPrecision(epsilon));
    expect(actual.y).toBeCloseTo(expected.y, this.toPrecision(epsilon));
    expect(actual.z).toBeCloseTo(expected.z, this.toPrecision(epsilon));
  }

  public expectAnyVertexClose(
    geometry: THREE.BufferGeometry,
    expected: Readonly<{ x: number; y: number; z?: number }>,
    epsilon: number = 1e-6,
  ): void {
    const positions = this.getPositions(geometry);

    const found = positions.some((position) => {
      const z = expected.z ?? position.z;

      return (
        Math.abs(position.x - expected.x) <= epsilon &&
        Math.abs(position.y - expected.y) <= epsilon &&
        Math.abs(position.z - z) <= epsilon
      );
    });

    expect(found).toBe(true);
  }

  public expectDimensions(
    geometry: THREE.BufferGeometry,
    expected: Readonly<{ width: number; height: number; depth: number }>,
    epsilon: number = 1e-6,
  ): void {
    const box = this.getBoundingBox(geometry);
    const size = box.getSize(new THREE.Vector3());

    expect(size.x).toBeCloseTo(expected.width, this.toPrecision(epsilon));
    expect(size.y).toBeCloseTo(expected.height, this.toPrecision(epsilon));
    expect(size.z).toBeCloseTo(expected.depth, this.toPrecision(epsilon));
  }

  private toPrecision(epsilon: number): number {
    if (epsilon <= 0) {
      return 6;
    }

    return Math.max(0, Math.round(Math.abs(Math.log10(epsilon))));
  }
}

export const fixture = new RectBuilderFixture();
export { RectSemantic };
