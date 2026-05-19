import { describe, expect, expectTypeOf, it } from "vitest";
import type { Polygon } from "@monorepo/game-primetives";
import type { IPolygonBooleanOperations } from "../src/index.js";
import { PolygonBooleanOperationsFixture } from "./fixtures/PolygonBooleanOperationsFixture.js";
import {
  createClosedBoxPolygon,
  createPolygonBooleanFixtureSet,
} from "./fixtures/PolygonFixtures.js";

describe("PolygonFixtures", () => {
  it("should create closed box polygons", () => {
    const polygon = createClosedBoxPolygon({
      x: 1,
      y: 2,
      width: 3,
      height: 4,
    });

    expect(polygon.closed).toBe(true);
    expect(polygon.points).toHaveLength(4);
    expect(polygon.points[0]?.x).toBe(1);
    expect(polygon.points[0]?.y).toBe(2);
    expect(polygon.points[1]?.x).toBe(4);
    expect(polygon.points[1]?.y).toBe(2);
    expect(polygon.points[2]?.x).toBe(4);
    expect(polygon.points[2]?.y).toBe(6);
    expect(polygon.points[3]?.x).toBe(1);
    expect(polygon.points[3]?.y).toBe(6);
  });

  it("should reject invalid box width", () => {
    expect(() =>
      createClosedBoxPolygon({
        x: 0,
        y: 0,
        width: 0,
        height: 1,
      }),
    ).toThrow(RangeError);
  });

  it("should reject invalid box height", () => {
    expect(() =>
      createClosedBoxPolygon({
        x: 0,
        y: 0,
        width: 1,
        height: 0,
      }),
    ).toThrow(RangeError);
  });
});

describe("IPolygonBooleanOperations", () => {
  it("should define a structural polygon boolean operations contract", () => {
    expectTypeOf<PolygonBooleanOperationsFixture>()
      .toMatchTypeOf<IPolygonBooleanOperations>();
  });

  it("should return readonly polygon arrays from union", () => {
    type Result = ReturnType<IPolygonBooleanOperations["union"]>;

    expectTypeOf<Result>().toEqualTypeOf<readonly Polygon[]>();
  });

  it("should return readonly polygon arrays from difference", () => {
    type Result = ReturnType<IPolygonBooleanOperations["difference"]>;

    expectTypeOf<Result>().toEqualTypeOf<readonly Polygon[]>();
  });

  it("should return readonly polygon arrays from intersect", () => {
    type Result = ReturnType<IPolygonBooleanOperations["intersect"]>;

    expectTypeOf<Result>().toEqualTypeOf<readonly Polygon[]>();
  });

  it("should return readonly polygon arrays from xor", () => {
    type Result = ReturnType<IPolygonBooleanOperations["xor"]>;

    expectTypeOf<Result>().toEqualTypeOf<readonly Polygon[]>();
  });

  it("should return a polygon from compose", () => {
    type Result = ReturnType<IPolygonBooleanOperations["compose"]>;

    expectTypeOf<Result>().toEqualTypeOf<Polygon>();
  });

  it("should call compose with polygon list", () => {
    const fixtureSet = createPolygonBooleanFixtureSet();

    const operations = new PolygonBooleanOperationsFixture();

    const result = operations.compose([fixtureSet.subject, ...fixtureSet.clips]);

    expect(result.closed).toBe(true);
    expect(operations.calls).toHaveLength(1);
    expect(operations.calls[0]).toEqual({
      operation: "compose",
      polygons: [fixtureSet.subject, ...fixtureSet.clips],
    });
    expect(operations.calls[0]?.polygons).not.toBe([fixtureSet.subject, ...fixtureSet.clips]);
  });

  it("should call union with subject and clips", () => {
    const fixtureSet = createPolygonBooleanFixtureSet();

    const operations = new PolygonBooleanOperationsFixture({
      unionResult: fixtureSet.allPolygonsResult,
    });

    const result = operations.union(fixtureSet.subject, fixtureSet.clips);

    expect(result).toBe(fixtureSet.allPolygonsResult);
    expect(operations.calls).toHaveLength(1);
    expect(operations.calls[0]).toEqual({
      operation: "union",
      subject: fixtureSet.subject,
      clips: fixtureSet.clips,
    });
    expect(operations.calls[0]?.clips).not.toBe(fixtureSet.clips);
  });

  it("should call difference with subject and clips", () => {
    const fixtureSet = createPolygonBooleanFixtureSet();

    const operations = new PolygonBooleanOperationsFixture({
      differenceResult: fixtureSet.subjectOnlyResult,
    });

    const result = operations.difference(fixtureSet.subject, fixtureSet.clips);

    expect(result).toBe(fixtureSet.subjectOnlyResult);
    expect(operations.calls).toHaveLength(1);
    expect(operations.calls[0]).toEqual({
      operation: "difference",
      subject: fixtureSet.subject,
      clips: fixtureSet.clips,
    });
    expect(operations.calls[0]?.clips).not.toBe(fixtureSet.clips);
  });

  it("should call intersect with subject and clips", () => {
    const fixtureSet = createPolygonBooleanFixtureSet();

    const operations = new PolygonBooleanOperationsFixture({
      intersectResult: [fixtureSet.clipA],
    });

    const result = operations.intersect(fixtureSet.subject, fixtureSet.clips);

    expect(result).toEqual([fixtureSet.clipA]);
    expect(operations.calls).toHaveLength(1);
    expect(operations.calls[0]).toEqual({
      operation: "intersect",
      subject: fixtureSet.subject,
      clips: fixtureSet.clips,
    });
    expect(operations.calls[0]?.clips).not.toBe(fixtureSet.clips);
  });

  it("should call xor with subject and clips", () => {
    const fixtureSet = createPolygonBooleanFixtureSet();

    const operations = new PolygonBooleanOperationsFixture({
      xorResult: fixtureSet.allPolygonsResult,
    });

    const result = operations.xor(fixtureSet.subject, fixtureSet.clips);

    expect(result).toBe(fixtureSet.allPolygonsResult);
    expect(operations.calls).toHaveLength(1);
    expect(operations.calls[0]).toEqual({
      operation: "xor",
      subject: fixtureSet.subject,
      clips: fixtureSet.clips,
    });
    expect(operations.calls[0]?.clips).not.toBe(fixtureSet.clips);
  });

  it("should default every operation result to an empty polygon array", () => {
    const fixtureSet = createPolygonBooleanFixtureSet();
    const operations: IPolygonBooleanOperations =
      new PolygonBooleanOperationsFixture();

    expect(operations.union(fixtureSet.subject, fixtureSet.clips)).toEqual([]);
    expect(operations.difference(fixtureSet.subject, fixtureSet.clips)).toEqual([]);
    expect(operations.intersect(fixtureSet.subject, fixtureSet.clips)).toEqual([]);
    expect(operations.xor(fixtureSet.subject, fixtureSet.clips)).toEqual([]);
  });

  it("should reject compose when polygon list is empty", () => {
    const operations: IPolygonBooleanOperations =
      new PolygonBooleanOperationsFixture();

    expect(() => operations.compose([])).toThrow(RangeError);
  });
});
