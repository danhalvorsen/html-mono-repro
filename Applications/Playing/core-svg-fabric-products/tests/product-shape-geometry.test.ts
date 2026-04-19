import { describe, expect, it } from "vitest";
import {
  createBoxTriangleGeometry,
  createBoxGeometry,
  createCircleGeometry,
  createTriangleGeometry,
} from "../src/domain/product-shape-geometry.js";
import {
  boxTriangleShapeFixture,
  boxShapeFixture,
  circleShapeFixture,
  triangleShapeFixture,
} from "./fixtures/productShapeFixtures.js";
import { resolveProductShapeStyle } from "../src/style/product-shape-style-tokens.js";

const defaultStrokeWidth =
  resolveProductShapeStyle(circleShapeFixture.style).strokeWidth ?? 0;

describe("product shape geometry", () => {
  it("creates deterministic circle geometry", () => {
    expect(
      createCircleGeometry(
        circleShapeFixture.radius,
        defaultStrokeWidth,
      ),
    ).toEqual({
      center: 26,
      radius: 24,
      size: 52,
    });
  });

  it("creates deterministic box geometry", () => {
    expect(
      createBoxGeometry(
        boxShapeFixture.width,
        boxShapeFixture.height,
        defaultStrokeWidth,
      ),
    ).toEqual({
      x: 2,
      y: 2,
      width: 80,
      height: 40,
      sizeWidth: 84,
      sizeHeight: 44,
    });
  });

  it("creates deterministic triangle geometry", () => {
    expect(
      createTriangleGeometry(
        triangleShapeFixture.side,
        defaultStrokeWidth,
      ),
    ).toEqual({
      size: 64,
      points: `32,2 62,${2 + (Math.sqrt(3) / 2) * 60} 2,${
        2 + (Math.sqrt(3) / 2) * 60
      }`,
    });
  });

  it("creates deterministic box-triangle composition geometry", () => {
    expect(
      createBoxTriangleGeometry(
        boxTriangleShapeFixture.box.width,
        boxTriangleShapeFixture.box.height,
        boxTriangleShapeFixture.triangle.side,
        boxTriangleShapeFixture.layout.gap,
        defaultStrokeWidth,
      ),
    ).toEqual({
      box: {
        x: 2,
        y: 2,
        width: 80,
        height: 40,
        sizeWidth: 84,
        sizeHeight: 44,
      },
      triangle: {
        size: 64,
        points: `32,2 62,${2 + (Math.sqrt(3) / 2) * 60} 2,${
          2 + (Math.sqrt(3) / 2) * 60
        }`,
      },
      width: 160,
      height: 64,
      boxOffsetY: 10,
      triangleOffsetX: 96,
      triangleOffsetY: 0,
    });
  });

  it("normalizes invalid or undersized inputs", () => {
    expect(createCircleGeometry(Number.NaN, -1)).toEqual({
      center: 2,
      radius: 2,
      size: 4,
    });
  });
});
