import { describe, expect, it } from "vitest";
import { RectBuilder } from "../src/RectBuilder.js";
import { RectSemantic } from "../src/RectSemantic.js";
import { RectBuilderFixture } from "./fixtures/RectBuilderFixture.js";

describe("RectBuilder", () => {
  const fixture = new RectBuilderFixture();

  it("should build layout from accumulated rectangles", () => {
    const layout = fixture.createHorizontalPair().build();
    expect(layout.rects).toHaveLength(2);
  });

  it("should place right rectangle adjacent to previous rectangle", () => {
    const rects = fixture.createHorizontalPair().getRects();
    expect(rects[1]?.centerX).toBe(2);
    expect(rects[1]?.centerY).toBe(0);
  });

  it("should place top rectangle adjacent to previous rectangle", () => {
    const rects = new RectBuilder().Add(2, 2, 1).Top().getRects();
    expect(rects[1]?.centerX).toBe(0);
    expect(rects[1]?.centerY).toBe(2);
  });

it("should align semantic placement", () => {
  const rects = fixture.createSemanticPair().getRects();

  expect(rects[1]?.centerX).toBe(0);
  expect(rects[1]?.centerY).toBe(2);
});

  it("should rotate the last rectangle", () => {
    const rects = new RectBuilder().Add(2, 2, 1).Rotate(RectSemantic.Top.Left, 45).getRects();
    expect(rects[0]?.rotationDegrees).toBe(45);
    expect(rects[0]?.pivot).toBe(RectSemantic.Top.Left);
  });

  it("should reject rotate without rectangles", () => {
    expect(() => new RectBuilder().Rotate(RectSemantic.Top.Left, 45)).toThrowError(
      "Rotate requires at least one rect.",
    );
  });

  it("should reject semantic placement with fewer than two rectangles", () => {
    expect(() => new RectBuilder().Add().At.Top.Left()).toThrowError(
      "Semantic placement requires at least two rectangles.",
    );
  });

  it("should reject invalid placement count", () => {
    expect(() => new RectBuilder().Add().Left(0)).toThrowError(
      "count must be an integer greater than zero.",
    );
  });

  it("should reject directional placement without rectangles", () => {
    expect(() => new RectBuilder().Left()).toThrowError("Left requires at least one rect.");
  });

  it("should reject directional placement from rotated rectangle", () => {
    expect(() => fixture.createRotatedSingle().Right()).toThrowError(
      "Directional placement from a rotated rectangle is not supported. Use semantic placement via At.* instead.",
    );
  });
});
