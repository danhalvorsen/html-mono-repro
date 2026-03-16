// packages/core-specifications-rules/tests/PointInRectangleRule.test.ts

import { beforeEach, describe, expect, it } from "vitest";
import { PointInRectangleRuleFixture } from "./fixtures/PointInRectangleRuleFixture.js";

describe("SpecificationRule", () => {
  let fixture: PointInRectangleRuleFixture;

  beforeEach(() => {
    fixture = new PointInRectangleRuleFixture();
  });

  it("should return success when point is inside rectangle", () => {
    const sut = fixture.createRule();

    const result = sut.check(fixture.model);

    expect(result.isSuccess).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.renderErrors()).toEqual([]);
  });

  it("should return failure when point is outside rectangle", () => {
    fixture.model = {
      ...fixture.model,
      point: { x: 50, y: 50 },
    };

    const sut = fixture.createRule();

    const result = sut.check(fixture.model);

    expect(result.isSuccess).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.code).toBe("POINT_OUTSIDE_RECTANGLE");
    expect(result.renderErrors()).toEqual([
      "Rule PointInsideRectangle: point (50,50) is outside rectangle",
    ]);
  });

  it("should return success when point is on top left boundary", () => {
    fixture.model = {
      ...fixture.model,
      point: { x: 0, y: 0 },
    };

    const sut = fixture.createRule();

    const result = sut.check(fixture.model);

    expect(result.isSuccess).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should return success when point is on bottom right boundary", () => {
    fixture.model = {
      ...fixture.model,
      point: { x: 10, y: 10 },
    };

    const sut = fixture.createRule();

    const result = sut.check(fixture.model);

    expect(result.isSuccess).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should return failure when point is left of rectangle", () => {
    fixture.model = {
      ...fixture.model,
      point: { x: -1, y: 5 },
    };

    const sut = fixture.createRule();

    const result = sut.check(fixture.model);

    expect(result.isSuccess).toBe(false);
    expect(result.renderErrors()).toEqual([
      "Rule PointInsideRectangle: point (-1,5) is outside rectangle",
    ]);
  });

  it("should return failure when point is above rectangle", () => {
    fixture.model = {
      ...fixture.model,
      point: { x: 5, y: -1 },
    };

    const sut = fixture.createRule();

    const result = sut.check(fixture.model);

    expect(result.isSuccess).toBe(false);
    expect(result.renderErrors()).toEqual([
      "Rule PointInsideRectangle: point (5,-1) is outside rectangle",
    ]);
  });

  it("should return failure when point is right of rectangle", () => {
    fixture.model = {
      ...fixture.model,
      point: { x: 11, y: 5 },
    };

    const sut = fixture.createRule();

    const result = sut.check(fixture.model);

    expect(result.isSuccess).toBe(false);
    expect(result.renderErrors()).toEqual([
      "Rule PointInsideRectangle: point (11,5) is outside rectangle",
    ]);
  });

  it("should return failure when point is below rectangle", () => {
    fixture.model = {
      ...fixture.model,
      point: { x: 5, y: 11 },
    };

    const sut = fixture.createRule();

    const result = sut.check(fixture.model);

    expect(result.isSuccess).toBe(false);
    expect(result.renderErrors()).toEqual([
      "Rule PointInsideRectangle: point (5,11) is outside rectangle",
    ]);
  });
});