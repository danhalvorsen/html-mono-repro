
// ============================================================================
// FILE: tests/RectBuilder.spec.ts
// ============================================================================

import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { fixture, RectSemantic } from "./fixtures/RectBuilderFixture.js"
import { RectExpectationsFixture } from "./fixtures/RectExpectations.fixture.js";

describe("RectBuilder", () => {
  describe("Given a new builder", () => {
    it("Then it should build indexed BufferGeometry with position, index, normal and uv attributes", () => {
      const sut = fixture.createSut();

      // When
      const geometry = sut
        .Add()
        .BuildGeometry();

      // Then
      expect(geometry).toBeInstanceOf(THREE.BufferGeometry);
      expect(geometry.index).not.toBeNull();
      expect(geometry.getAttribute("position")).toBeDefined();
      expect(geometry.getAttribute("normal")).toBeDefined();
      expect(geometry.getAttribute("uv")).toBeDefined();
    });
  });

  describe("Given default rect creation", () => {
    describe("When Add() is executed", () => {
      it("Then it should create a rect centered at origin with default size 1x1x1", () => {
        const sut = fixture.createSut();

        // When
        const geometry = sut
          .Add()
          .BuildGeometry();

        // Then
        const box = fixture.getBoundingBox(geometry);

        fixture.expectVectorClose(box.min, {
          x: RectExpectationsFixture.DefaultRectBounds.minX,
          y: RectExpectationsFixture.DefaultRectBounds.minY,
          z: RectExpectationsFixture.DefaultRectBounds.minZ,
        });

        fixture.expectVectorClose(box.max, {
          x: RectExpectationsFixture.DefaultRectBounds.maxX,
          y: RectExpectationsFixture.DefaultRectBounds.maxY,
          z: RectExpectationsFixture.DefaultRectBounds.maxZ,
        });

        fixture.expectDimensions(geometry, {
          width: 1,
          height: 1,
          depth: 1,
        });
      });
    });
  });

  describe("Given explicit rect creation", () => {
    describe("When Add(10, 10, 1) is executed", () => {
      it("Then it should create a rect centered at origin with size 10x10x1", () => {
        const sut = fixture.createSut();

        // When
        const geometry = sut
          .Add(10, 10, 1)
          .BuildGeometry();

        // Then
        const box = fixture.getBoundingBox(geometry);

        fixture.expectVectorClose(box.min, { x: -5, y: -5, z: -0.5 });
        fixture.expectVectorClose(box.max, { x: 5, y: 5, z: 0.5 });

        fixture.expectDimensions(geometry, {
          width: 10,
          height: 10,
          depth: 1,
        });
      });
    });
  });

  describe("Given edge-locked placement", () => {
    describe("When Add().Left() is executed", () => {
      it("Then the second rect should share the current rect left edge", () => {
        const sut = fixture.createSut();

        // When
        const geometry = sut
          .Add()
          .Left()
          .BuildGeometry();

        // Then
        const box = fixture.getBoundingBox(geometry);

        fixture.expectVectorClose(box.min, {
          x: RectExpectationsFixture.TwoRectsOriginAndLeftBounds.minX,
          y: RectExpectationsFixture.TwoRectsOriginAndLeftBounds.minY,
          z: RectExpectationsFixture.TwoRectsOriginAndLeftBounds.minZ,
        });

        fixture.expectVectorClose(box.max, {
          x: RectExpectationsFixture.TwoRectsOriginAndLeftBounds.maxX,
          y: RectExpectationsFixture.TwoRectsOriginAndLeftBounds.maxY,
          z: RectExpectationsFixture.TwoRectsOriginAndLeftBounds.maxZ,
        });
      });
    });

    describe("When Add().Right() is executed", () => {
      it("Then the second rect should share the current rect right edge", () => {
        const sut = fixture.createSut();

        // When
        const geometry = sut
          .Add()
          .Right()
          .BuildGeometry();

        // Then
        const box = fixture.getBoundingBox(geometry);

        fixture.expectVectorClose(box.min, { x: -0.5, y: -0.5, z: -0.5 });
        fixture.expectVectorClose(box.max, { x: 1.5, y: 0.5, z: 0.5 });
      });
    });

    describe("When Add().Top() is executed", () => {
      it("Then the second rect should share the current rect top edge", () => {
        const sut = fixture.createSut();

        // When
        const geometry = sut
          .Add()
          .Top()
          .BuildGeometry();

        // Then
        const box = fixture.getBoundingBox(geometry);

        fixture.expectVectorClose(box.min, { x: -0.5, y: -0.5, z: -0.5 });
        fixture.expectVectorClose(box.max, { x: 0.5, y: 1.5, z: 0.5 });
      });
    });

    describe("When Add().Bottom() is executed", () => {
      it("Then the second rect should share the current rect bottom edge", () => {
        const sut = fixture.createSut();

        // When
        const geometry = sut
          .Add()
          .Bottom()
          .BuildGeometry();

        // Then
        const box = fixture.getBoundingBox(geometry);

        fixture.expectVectorClose(box.min, { x: -0.5, y: -1.5, z: -0.5 });
        fixture.expectVectorClose(box.max, { x: 0.5, y: 0.5, z: 0.5 });
      });
    });
  });

  describe("Given semantic point placement", () => {
    describe("When Add().Add(2, 2, 1).Top.Left() is executed", () => {
      it("Then the new rect Bottom.Left should coincide with the current rect Top.Left", () => {
        const sut = fixture.createSut();

        // When
        const geometry = sut
          .Add()
          .Add(2, 2, 1)
          .At.Top
          .Left()
          .BuildGeometry();

        // Then
        const box = fixture.getBoundingBox(geometry);

        // Origin rect: [-0.5..0.5] x [-0.5..0.5]
        // New 2x2 rect aligned so its Bottom.Left = current Top.Left = (-0.5, 0.5)
        // New center = (0.5, 1.5), new bounds = [-0.5..1.5] x [0.5..2.5]
        fixture.expectVectorClose(box.min, { x: -0.5, y: -0.5, z: -0.5 });
        fixture.expectVectorClose(box.max, { x: 1.5, y: 2.5, z: 0.5 });

        fixture.expectAnyVertexClose(geometry, { x: -0.5, y: 0.5 });
      });
    });

    describe("When Add().Add(2, 2, 1).Right.Mid() is executed", () => {
      it("Then the new rect Left.Mid should coincide with the current rect Right.Mid", () => {
        const sut = fixture.createSut();

        // When
        const geometry = sut
          .Add()
          .Add(2, 2, 1)
          .At.Right
          .Mid()
          .BuildGeometry();

        // Then
        const box = fixture.getBoundingBox(geometry);

        fixture.expectVectorClose(box.min, { x: -0.5, y: -1.0, z: -0.5 });
        fixture.expectVectorClose(box.max, { x: 2.5, y: 1.0, z: 0.5 });
        fixture.expectDimensions(geometry, {
          width: 3,
          height: 2,
          depth: 1,
        });
      });
    });
  });

  describe("Given repetition", () => {
    describe("When Add().Left(10) is executed", () => {
      it("Then it should create ten new left rects and preserve edge sharing", () => {
        const sut = fixture.createSut();

        // When
        const geometry = sut
          .Add()
          .Left(10)
          .BuildGeometry();

        // Then
        const box = fixture.getBoundingBox(geometry);

        fixture.expectVectorClose(box.min, {
          x: RectExpectationsFixture.ElevenRectsOriginAndTenLeftBounds.minX,
          y: RectExpectationsFixture.ElevenRectsOriginAndTenLeftBounds.minY,
          z: RectExpectationsFixture.ElevenRectsOriginAndTenLeftBounds.minZ,
        });

        fixture.expectVectorClose(box.max, {
          x: RectExpectationsFixture.ElevenRectsOriginAndTenLeftBounds.maxX,
          y: RectExpectationsFixture.ElevenRectsOriginAndTenLeftBounds.maxY,
          z: RectExpectationsFixture.ElevenRectsOriginAndTenLeftBounds.maxZ,
        });
      });
    });

    describe("When Add().Left(10).Top(10).Right(10).Bottom(10) is executed", () => {
      it("Then it should create a filled 10x10 grid envelope", () => {
        const sut = fixture.createSut();

        // When
        const geometry = sut
          .Add()
          .Left(10)
          .Top(10)
          .Right(10)
          .Bottom(10)
          .BuildGeometry();

        // Then
        const box = fixture.getBoundingBox(geometry);

        fixture.expectVectorClose(box.min, {
          x: RectExpectationsFixture.FilledTenByTenGridBounds.minX,
          y: RectExpectationsFixture.FilledTenByTenGridBounds.minY,
          z: RectExpectationsFixture.FilledTenByTenGridBounds.minZ,
        });

        fixture.expectVectorClose(box.max, {
          x: RectExpectationsFixture.FilledTenByTenGridBounds.maxX,
          y: RectExpectationsFixture.FilledTenByTenGridBounds.maxY,
          z: RectExpectationsFixture.FilledTenByTenGridBounds.maxZ,
        });
      });
    });
  });

  describe("Given pivot-anchored rotation", () => {
    describe("When Add().Right().Rotate(RectSemantic.Top.Right, 45) is executed", () => {
      it("Then the selected semantic point should remain fixed in world space", () => {
        const sut = fixture.createSut();

        // When
        const geometry = sut
          .Add()
          .Right()
          .Rotate(RectSemantic.Top.Right, 45)
          .BuildGeometry();

        // Then
        // Before rotation, the added right rect has center (1,0,0)
        // Its Top.Right semantic point is therefore (1.5, 0.5, z)
        fixture.expectAnyVertexClose(geometry, { x: 1.5, y: 0.5 });
      });

      it("Then a non-pivot vertex should move to its rotated world-space coordinate", () => {
        const sut = fixture.createSut();

        // When
        const geometry = sut
          .Add()
          .Right()
          .Rotate(RectSemantic.Top.Right, 45)
          .BuildGeometry();

        // Then
        // Original Top.Left of the added rect = (0.5, 0.5)
        // Rotated 45 degrees clockwise around pivot (1.5, 0.5):
        // expected ≈ (0.7928932188, 1.2071067812)
        fixture.expectAnyVertexClose(geometry, {
          x: 0.7928932188,
          y: 1.2071067812,
        }, 1e-5);
      });
    });
  });

  describe("Given generated geometry attributes", () => {
    describe("When a default rect is built", () => {
      it("Then position and normal counts should match", () => {
        const sut = fixture.createSut();

        // When
        const geometry = sut
          .Add()
          .BuildGeometry();

        // Then
        const positions = geometry.getAttribute("position");
        const normals = geometry.getAttribute("normal");

        expect(positions).toBeDefined();
        expect(normals).toBeDefined();
        expect(normals.count).toBe(positions.count);
      });

      it("Then uv and position counts should match", () => {
        const sut = fixture.createSut();

        // When
        const geometry = sut
          .Add()
          .BuildGeometry();

        // Then
        const positions = geometry.getAttribute("position");
        const uvs = geometry.getAttribute("uv");

        expect(positions).toBeDefined();
        expect(uvs).toBeDefined();
        expect(uvs.count).toBe(positions.count);
      });
    });
  });

  describe("Given invalid size input", () => {
    describe("When Add(0, 1, 1) is executed", () => {
      it("Then it should throw", () => {
        const sut = fixture.createSut();

        // Then
        expect(() => sut.Add(0, 1, 1)).toThrow();
      });
    });

    describe("When Add(1, -1, 1) is executed", () => {
      it("Then it should throw", () => {
        const sut = fixture.createSut();

        // Then
        expect(() => sut.Add(1, -1, 1)).toThrow();
      });
    });

    describe("When Add(1, 1, 0) is executed", () => {
      it("Then it should throw", () => {
        const sut = fixture.createSut();

        // Then
        expect(() => sut.Add(1, 1, 0)).toThrow();
      });
    });
  });
});
