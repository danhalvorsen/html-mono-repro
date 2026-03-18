// ====================================================================================
// FILE: tests/three/geometry/IndexedGeometryBuilder.spec.ts
// ====================================================================================

import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { IndexedGeometryBuilderFixture } from "../fixtures/IndexedGeometryBuilderFixture.js";

describe("IndexedGeometryBuilder", () => {
  const fixture = new IndexedGeometryBuilderFixture();

  it("should build a buffer geometry for multiple lofted rectangles", () => {
    const sut = fixture.createConfiguredRoofRingSut();

    const geometry = sut.build();

    expect(geometry).toBeInstanceOf(THREE.BufferGeometry);
  });

  it("should create 8 vertices per lofted rectangle", () => {
    const sut = fixture.createConfiguredRoofRingSut();

    const geometry = sut.build();
    const position = geometry.getAttribute("position");

    expect(position.count).toBe(32);
  });

  it("should create 12 triangles per lofted rectangle", () => {
    const sut = fixture.createConfiguredRoofRingSut();

    const geometry = sut.build();
    const index = geometry.getIndex();

    expect(index).not.toBeNull();
    expect(index?.count).toBe(144);
  });

  it("should build geometry for 5 lofted rectangles", () => {
    const sut = fixture.createConfiguredFiveBoxesSut();

    const geometry = sut.build();

    expect(geometry).toBeInstanceOf(THREE.BufferGeometry);
  });

  it("should create 40 vertices for 5 lofted rectangles", () => {
    const sut = fixture.createConfiguredFiveBoxesSut();

    const geometry = sut.build();
    const position = geometry.getAttribute("position");

    expect(position.count).toBe(40);
  });

  it("should create 180 indices for 5 lofted rectangles", () => {
    const sut = fixture.createConfiguredFiveBoxesSut();

    const geometry = sut.build();
    const index = geometry.getIndex();

    expect(index).not.toBeNull();
    expect(index?.count).toBe(180);
  });

  it("should compute bounding box across 5 lofted rectangles", () => {
    const sut = fixture.createConfiguredFiveBoxesSut();

    const geometry = sut.build();
    const boundingBox = geometry.boundingBox;

    expect(boundingBox).not.toBeNull();

    expect(boundingBox?.min.x).toBeCloseTo(0, 5);
    expect(boundingBox?.min.y).toBeCloseTo(0, 5);
    expect(boundingBox?.min.z).toBeCloseTo(0, 5);

    expect(boundingBox?.max.x).toBeCloseTo(4, 5);
    expect(boundingBox?.max.y).toBeCloseTo(3, 5);
    expect(boundingBox?.max.z).toBeCloseTo(1.2, 5);
  });

  it("should throw when loft is called without a pending rectangle", () => {
    const sut = fixture.createSut();

    expect(() => sut.withLoft(1)).toThrowError(
      "A rectangle must be defined before lofting.",
    );
  });

  it("should throw when build is called with a pending rectangle", () => {
    const sut = fixture
      .createSut()
      .with(fixture.createWall1Start(), fixture.createWall1End());

    expect(() => sut.build()).toThrowError(
      "Pending rectangle must be lofted before build().",
    );
  });

  it("should throw when build is called without any lofted rectangles", () => {
    const sut = fixture.createSut();

    expect(() => sut.build()).toThrowError(
      "At least one lofted rectangle must be defined before build().",
    );
  });

  it("should compute bounding box across all lofted rectangles", () => {
    const sut = fixture.createConfiguredRoofRingSut();

    const geometry = sut.build();
    const boundingBox = geometry.boundingBox;

    expect(boundingBox).not.toBeNull();
    expect(boundingBox?.min.x).toBeCloseTo(0, 5);
    expect(boundingBox?.min.y).toBeCloseTo(0, 5);
    expect(boundingBox?.min.z).toBeCloseTo(0, 5);

    expect(boundingBox?.max.x).toBeCloseTo(4, 5);
    expect(boundingBox?.max.y).toBeCloseTo(3, 5);
    expect(boundingBox?.max.z).toBeCloseTo(1.2, 5);
  });
});