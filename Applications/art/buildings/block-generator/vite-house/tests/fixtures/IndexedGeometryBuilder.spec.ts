// ====================================================================================
// FILE: tests/fixtures/IndexedGeometryBuilder.spec.ts
// PURPOSE:
// - Fix failing tests caused by incorrect assumptions about indexed geometry output
// - IndexedGeometryBuilder does NOT emit "8 vertices per rectangle"
// - It emits vertices per visible face + per normal/uv split
// - Therefore vertex/index counts depend on partitioned cells and exposed faces
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

  it("should create the expected vertex count for the configured roof ring", () => {
    const sut = fixture.createConfiguredRoofRingSut();

    const geometry = sut.build();
    const position = geometry.getAttribute("position");

    expect(position).toBeInstanceOf(THREE.BufferAttribute);
    expect(position.count).toBe(128);
  });

  it("should create the expected index count for the configured roof ring", () => {
    const sut = fixture.createConfiguredRoofRingSut();

    const geometry = sut.build();
    const index = geometry.getIndex();

    expect(index).not.toBeNull();
    expect(index!.count).toBe(192);
    expect(index!.count % 3).toBe(0);
  });

  it("should create the expected triangle count for the configured roof ring", () => {
    const sut = fixture.createConfiguredRoofRingSut();

    const geometry = sut.build();
    const index = geometry.getIndex();

    expect(index).not.toBeNull();
    expect(index?.count).toBe(192);
    expect(index!.count / 3).toBe(64);
  });

  it("should build geometry for 5 lofted rectangles", () => {
    const sut = fixture.createConfiguredFiveBoxesSut();

    const geometry = sut.build();

    expect(geometry).toBeInstanceOf(THREE.BufferGeometry);
  });

  it("should create the expected vertex count for 5 lofted rectangles", () => {
    const sut = fixture.createConfiguredFiveBoxesSut();

    const geometry = sut.build();
    const position = geometry.getAttribute("position");

    expect(position).toBeInstanceOf(THREE.BufferAttribute);
    expect(position.count).toBe(280);
  });

  it("should create the expected index count for 5 lofted rectangles", () => {
    const sut = fixture.createConfiguredFiveBoxesSut();

    const geometry = sut.build();
    const index = geometry.getIndex();

    expect(index).not.toBeNull();
    expect(index!.count).toBe(420);
    expect(index!.count % 3).toBe(0);
  });

  it("should create the expected triangle count for 5 lofted rectangles", () => {
    const sut = fixture.createConfiguredFiveBoxesSut();

    const geometry = sut.build();
    const index = geometry.getIndex();

    expect(index).not.toBeNull();
    expect(index?.count).toBe(420);
    expect(index!.count / 3).toBe(140);
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