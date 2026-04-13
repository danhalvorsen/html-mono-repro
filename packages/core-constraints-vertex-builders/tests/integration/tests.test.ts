// ============================================================================
// FILE: tests/integration/RectBuilder.integration.spec.ts
// PURPOSE:
// - integration tests that verify real contracts
// - includes world-coordinate assertions
// - avoids brittle hard-coded center assumptions that belong to unit tests
// ============================================================================

import * as THREE from "three";
import { describe, expect, it } from "vitest";

import { RectBuilder } from "../../src/RectBuilder.js";
import { RectSemantic } from "../../src/RectSemantic.js";
import { RectGeometryService } from "../../src/RectGeometryService.js";
import { ThreeRectGeometryFactory } from "../../src/ThreeRectGeometryFactory.js";
import type { IRectState } from "../../src/IRectState.js";
import type { RectSemanticPoint } from "../../src/RectSemanticPoint.js";
import { CliStringOptionReader } from "composite-tree-system/core-tools-typescript/src/code.js";

class RectIntegrationAssertions {
  private readonly geometryService = new RectGeometryService();

  public expectGeometry(geometry: THREE.BufferGeometry, rectCount: number): void {
    expect(geometry).toBeInstanceOf(THREE.BufferGeometry);
    expect(geometry.getAttribute("position")).toBeTruthy();
    expect(geometry.getAttribute("normal")).toBeTruthy();
    expect(geometry.getAttribute("uv")).toBeTruthy();
    expect(geometry.index).toBeTruthy();
    expect(geometry.getAttribute("position").count).toBe(rectCount * 8);
  }

  public expectRectRotation(
    rect: IRectState,
    expectedDegrees: number,
    expectedPivot?: RectSemanticPoint,
  ): void {
    expect(rect.rotationDegrees).toBeCloseTo(expectedDegrees, 8);

    if (expectedPivot !== undefined) {
      expect(rect.pivot).toBe(expectedPivot);
    }
  }

  public expectWorldPoint(
    rect: IRectState,
    semantic: RectSemanticPoint,
    expectedX: number,
    expectedY: number,
    expectedZ: number,
  ): void {
    const point = this.geometryService.getWorldSemanticPoint(rect, semantic);

    expect(point.x).toBeCloseTo(expectedX, 8);
    expect(point.y).toBeCloseTo(expectedY, 8);
    expect(point.z).toBeCloseTo(expectedZ, 8);
  }

  public expectSemanticCoincidence(
    sourceRect: IRectState,
    targetRect: IRectState,
    semantic: RectSemanticPoint,
  ): void {
    const sourcePoint = this.geometryService.getWorldSemanticPoint(sourceRect, semantic);
    const targetOppositePoint = this.geometryService.getOppositeWorldSemanticPoint(
      targetRect,
      semantic,
    );

    expect(sourcePoint.x).toBeCloseTo(targetOppositePoint.x, 8);
    expect(sourcePoint.y).toBeCloseTo(targetOppositePoint.y, 8);
    expect(sourcePoint.z).toBeCloseTo(targetOppositePoint.z, 8);
  }
}

describe("RectBuilder integration", () => {
  const geometryFactory = new ThreeRectGeometryFactory();
  const assertion = new RectIntegrationAssertions();

  it("should build a horizontal strip of façade panels", () => {
    const result = new RectBuilder()
      .Add(2, 3, 0.2)
      .Right(4)
      .build();

    expect(result.rects).toHaveLength(5);

    for (let index = 1; index < result.rects.length; index += 1) {
      assertion.expectSemanticCoincidence(
        result.rects[index - 1]!,
        result.rects[index]!,
        RectSemantic.Right.Mid,
      );
    }

    assertion.expectWorldPoint(result.rects[0]!, RectSemantic.Left.Mid, -1, 0, 0);
    assertion.expectWorldPoint(result.rects[4]!, RectSemantic.Right.Mid, 9, 0, 0);

    const geometry = geometryFactory.create(result.rects);
    assertion.expectGeometry(geometry, 5);
  });

  it("should align a window module to the wall top-left semantic point", () => {
    const result = new RectBuilder()
      .Add(4, 4, 0.2)
      .Add(1, 2, 0.1)
      .At.Top.Left()
      .build();

    expect(result.rects).toHaveLength(2);

    const wall = result.rects[0]!;
    const window = result.rects[1]!;

    assertion.expectSemanticCoincidence(wall, window, RectSemantic.Top.Left);

    assertion.expectWorldPoint(wall, RectSemantic.Top.Left, -2, 2, 0);
    assertion.expectWorldPoint(window, RectSemantic.Bottom.Left, -2, 2, 0);

    const geometry = geometryFactory.create(result.rects);
    assertion.expectGeometry(geometry, 2);
  });

  it("should support mixed-size composition for a simple building silhouette", () => {
    const result = new RectBuilder()
      .Add(6, 2, 0.2)
      .Add(4, 3, 0.2).At.Top.Mid()
      .Add(2, 2, 0.2).At.Top.Mid()
      .build();

    expect(result.rects).toHaveLength(3);

    assertion.expectSemanticCoincidence(
      result.rects[0]!,
      result.rects[1]!,
      RectSemantic.Top.Mid,
    );

    assertion.expectSemanticCoincidence(
      result.rects[1]!,
      result.rects[2]!,
      RectSemantic.Top.Mid,
    );

    assertion.expectWorldPoint(result.rects[2]!, RectSemantic.Top.Mid, 0, 5.5, 0);

    const geometry = geometryFactory.create(result.rects);
    assertion.expectGeometry(geometry, 3);
  });

  it("should create a rotated extension panel around Top.Right pivot", () => {
    const result = new RectBuilder()
      .Add(2, 2, 0.2)
      .Right()
      .Rotate(RectSemantic.Top.Right, 45)
      .build();

    expect(result.rects).toHaveLength(2);

    assertion.expectRectRotation(result.rects[0]!, 0);
    assertion.expectRectRotation(result.rects[1]!, 45, RectSemantic.Top.Right);

    // pivot world position must stay invariant after rotation
    assertion.expectWorldPoint(result.rects[1]!, RectSemantic.Top.Right, 3, 1, 0);

    const geometry = geometryFactory.create(result.rects);
    assertion.expectGeometry(geometry, 2);
  });

  it("should reject directional placement after rotation in the same composition", () => {
    expect(() =>
      new RectBuilder()
        .Add(2, 2, 0.2)
        .Right()
        .Rotate(RectSemantic.Top.Right, 45)
        .Top()
        .build(),
    ).toThrow();
  });
});

describe("RectBuilder rotation integration", () => {
  const geometryFactory = new ThreeRectGeometryFactory();
  const assertion = new RectIntegrationAssertions();

  it("should preserve semantic validity across Add().Rotate().Add().Rotate().Add()", () => {
    const result = new RectBuilder()
      .Add(2, 2, 0.2)
      .Right()
      .Rotate(RectSemantic.Top.Right, 45)
      .Add(4, 1, 0.2)
      .At.Top.Mid()
      .Rotate(RectSemantic.Bottom.Mid, -30)
      .Add(1, 3, 0.2)
      .At.Right.Mid()
      .build();

    expect(result.rects).toHaveLength(4);

    assertion.expectRectRotation(result.rects[1]!, 45, RectSemantic.Top.Right);
    assertion.expectRectRotation(result.rects[2]!, -30, RectSemantic.Bottom.Mid);
    assertion.expectRectRotation(result.rects[3]!, 0);

    assertion.expectSemanticCoincidence(
      result.rects[1]!,
      result.rects[2]!,
      RectSemantic.Top.Mid,
    );

    assertion.expectSemanticCoincidence(
      result.rects[2]!,
      result.rects[3]!,
      RectSemantic.Right.Mid,
    );

    const geometry = geometryFactory.create(result.rects);
    assertion.expectGeometry(geometry, 4);
  });

  it("should support chained rotations with mixed semantic placements", () => {
    const result = new RectBuilder()
      .Add(4, 2, 0.2)
      .Top()
      .Rotate(RectSemantic.Bottom.Left, 90)
      .Add(2, 2, 0.2)
      .At.Top.Right()
      .Rotate(RectSemantic.Left.Mid, 180)
      .Add(1, 4, 0.2)
      .At.Bottom.Mid()
      .Rotate(RectSemantic.Top.Right, -45)
      .Add(3, 1, 0.2)
      .At.Left.End()
      .build();

    expect(result.rects).toHaveLength(5);

    assertion.expectRectRotation(result.rects[1]!, 90, RectSemantic.Bottom.Left);
    assertion.expectRectRotation(result.rects[2]!, 180, RectSemantic.Left.Mid);
    assertion.expectRectRotation(result.rects[3]!, -45, RectSemantic.Top.Right);

    assertion.expectSemanticCoincidence(
      result.rects[1]!,
      result.rects[2]!,
      RectSemantic.Top.Right,
    );

    assertion.expectSemanticCoincidence(
      result.rects[2]!,
      result.rects[3]!,
      RectSemantic.Bottom.Mid,
    );

    assertion.expectSemanticCoincidence(
      result.rects[3]!,
      result.rects[4]!,
      RectSemantic.Left.End,
    );

    const geometry = geometryFactory.create(result.rects);
    assertion.expectGeometry(geometry, 5);
  });

  it("should allow Add().Rotate().Add().Rotate().Add() when later placements are semantic placements", () => {
    const result = new RectBuilder()
      .Add(2, 2, 0.2)
      .Rotate(RectSemantic.Top.Right, 45)
      .Add(2, 1, 0.2)
      .At.Top.Right()
      .Rotate(RectSemantic.Left.Mid, 90)
      .Add(1, 1, 0.2)
      .At.Bottom.Left()
      .build();

    expect(result.rects).toHaveLength(3);

    assertion.expectRectRotation(result.rects[0]!, 45, RectSemantic.Top.Right);
    assertion.expectRectRotation(result.rects[1]!, 90, RectSemantic.Left.Mid);
    assertion.expectRectRotation(result.rects[2]!, 0);

    assertion.expectSemanticCoincidence(
      result.rects[0]!,
      result.rects[1]!,
      RectSemantic.Top.Right,
    );

    assertion.expectSemanticCoincidence(
      result.rects[1]!,
      result.rects[2]!,
      RectSemantic.Bottom.Left,
    );

    const geometry = geometryFactory.create(result.rects);
    assertion.expectGeometry(geometry, 3);
  });
});CliStringOptionReader