import { describe, expect, it } from "vitest";
import {
  DefaultPrimitiveFactory,
  InvalidPrimitiveParameterError,
  PrimitiveKind,
} from "../src/index.js";

describe("DefaultPrimitiveFactory", () => {
  it("creates immutable line primitives", () => {
    const factory = new DefaultPrimitiveFactory();

    const primitive = factory.createLine({
      from: { x: 0, y: 0, z: 0 },
      to: { x: 10, y: 0, z: 0 },
      stroke: { color: "#000000", width: 1 },
      metadata: {
        id: "line-1",
        tags: ["fixture"],
        layer: "test",
        userData: { source: "unit-test" },
      },
    });

    expect(primitive.kind).toBe(PrimitiveKind.Line);
    expect(primitive.from).toEqual({ x: 0, y: 0, z: 0 });
    expect(primitive.to).toEqual({ x: 10, y: 0, z: 0 });
    expect(primitive.metadata?.id).toBe("line-1");
    expect(Object.isFrozen(primitive)).toBe(true);
  });

  it("creates immutable polyline primitives with ordered points", () => {
    const factory = new DefaultPrimitiveFactory();

    const primitive = factory.createPolyline({
      points: [
        { x: 0, y: 0, z: 0 },
        { x: 5, y: 5, z: 0 },
        { x: 10, y: 0, z: 0 },
      ],
      stroke: { color: "#000000", width: 1 },
    });

    expect(primitive.kind).toBe(PrimitiveKind.Polyline);
    expect(primitive.points).toEqual([
      { x: 0, y: 0, z: 0 },
      { x: 5, y: 5, z: 0 },
      { x: 10, y: 0, z: 0 },
    ]);
    expect(Object.isFrozen(primitive)).toBe(true);
  });

  it("rejects polyline primitives with fewer than two points", () => {
    const factory = new DefaultPrimitiveFactory();

    expect(() =>
      factory.createPolyline({
        points: [{ x: 0, y: 0, z: 0 }],
        stroke: { color: "#000000", width: 1 },
      }),
    ).toThrow(InvalidPrimitiveParameterError);
  });

  it("creates immutable circle primitives with 3D normal", () => {
    const factory = new DefaultPrimitiveFactory();

    const primitive = factory.createCircle({
      center: { x: 0, y: 0, z: 0 },
      radius: 10,
      normal: { x: 0, y: 0, z: 1 },
      stroke: { color: "#000000", width: 1 },
      fill: { color: "none" },
    });

    expect(primitive.kind).toBe(PrimitiveKind.Circle);
    expect(primitive.center).toEqual({ x: 0, y: 0, z: 0 });
    expect(primitive.radius).toBe(10);
    expect(primitive.normal).toEqual({ x: 0, y: 0, z: 1 });
    expect(Object.isFrozen(primitive)).toBe(true);
  });

  it("rejects circle primitives with non-positive radius", () => {
    const factory = new DefaultPrimitiveFactory();

    expect(() =>
      factory.createCircle({
        center: { x: 0, y: 0, z: 0 },
        radius: 0,
        normal: { x: 0, y: 0, z: 1 },
      }),
    ).toThrow(InvalidPrimitiveParameterError);
  });

  it("rejects circle primitives with zero normal", () => {
    const factory = new DefaultPrimitiveFactory();

    expect(() =>
      factory.createCircle({
        center: { x: 0, y: 0, z: 0 },
        radius: 10,
        normal: { x: 0, y: 0, z: 0 },
      }),
    ).toThrow(InvalidPrimitiveParameterError);
  });

  it("creates immutable polygon primitives with implicit closure", () => {
    const factory = new DefaultPrimitiveFactory();

    const primitive = factory.createPolygon({
      points: [
        { x: 0, y: 0, z: 0 },
        { x: 10, y: 0, z: 0 },
        { x: 10, y: 10, z: 0 },
      ],
      stroke: { color: "#000000", width: 1 },
      fill: { color: "none" },
    });

    expect(primitive.kind).toBe(PrimitiveKind.Polygon);
    expect(primitive.points).toHaveLength(3);
    expect(Object.isFrozen(primitive)).toBe(true);
  });

  it("rejects polygon primitives with fewer than three points", () => {
    const factory = new DefaultPrimitiveFactory();

    expect(() =>
      factory.createPolygon({
        points: [
          { x: 0, y: 0, z: 0 },
          { x: 10, y: 0, z: 0 },
        ],
      }),
    ).toThrow(InvalidPrimitiveParameterError);
  });
});