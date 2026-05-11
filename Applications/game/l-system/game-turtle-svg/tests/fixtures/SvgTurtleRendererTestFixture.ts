import { expect } from "vitest";
import {
  DefaultSvgPrimitiveAdapterRegistry,
  DefaultSvgTurtleRenderer,
  SvgCirclePrimitiveAdapter,
  SvgLinePrimitiveAdapter,
  SvgPolygonPrimitiveAdapter,
  SvgPolylinePrimitiveAdapter,
  type ISvgMapperPipeline,
  type SvgRenderOptions,
} from "../../src/index.js";
import type {
  CirclePrimitive,
  LinePrimitive,
  PolygonPrimitive,
  PolylinePrimitive,
  TurtlePrimitive,
} from "@monorepo/game-turtle-abstract";

export class IdentitySvgMapperPipeline implements ISvgMapperPipeline {
  public mapPrimitive<TPrimitive extends TurtlePrimitive>(
    primitive: TPrimitive,
  ): TPrimitive {
    return primitive;
  }
}

export class OffsetSvgMapperPipeline implements ISvgMapperPipeline {
  public constructor(
    private readonly offsetX: number,
    private readonly offsetY: number,
  ) {}

  public mapPrimitive<TPrimitive extends TurtlePrimitive>(
    primitive: TPrimitive,
  ): TPrimitive {
    switch (primitive.kind) {
      case "line":
        return {
          ...primitive,
          from: this.mapVector(primitive.from),
          to: this.mapVector(primitive.to),
        } as TPrimitive;

      case "polyline":
      case "polygon":
        return {
          ...primitive,
          points: primitive.points.map((point) => this.mapVector(point)),
        } as TPrimitive;

      case "circle":
        return {
          ...primitive,
          center: this.mapVector(primitive.center),
        } as TPrimitive;

      default:
        return primitive;
    }
  }

  private mapVector<TVector extends { readonly x: number; readonly y: number; readonly z: number }>(
    vector: TVector,
  ): TVector {
    return {
      ...vector,
      x: vector.x + this.offsetX,
      y: vector.y + this.offsetY,
    };
  }
}

export class SvgTurtleRendererTestFixture {
  public createDefaultRenderer(
    mapperPipeline: ISvgMapperPipeline = new IdentitySvgMapperPipeline(),
  ): DefaultSvgTurtleRenderer {
    const registry = new DefaultSvgPrimitiveAdapterRegistry([
      new SvgLinePrimitiveAdapter(),
      new SvgPolylinePrimitiveAdapter(),
      new SvgCirclePrimitiveAdapter(),
      new SvgPolygonPrimitiveAdapter(),
    ]);

    return new DefaultSvgTurtleRenderer({
      adapterRegistry: registry,
      mapperPipeline,
    });
  }

  public createDefaultOptions(): SvgRenderOptions {
    return {
      width: 200,
      height: 100,
      viewBox: "0 0 200 100",
    };
  }

  public createLinePrimitive(): LinePrimitive {
    return Object.freeze({
      kind: "line",
      from: Object.freeze({ x: 0, y: 0, z: 0 }),
      to: Object.freeze({ x: 10, y: 0, z: 0 }),
      stroke: Object.freeze({ color: "#000000", width: 1 }),
      metadata: Object.freeze({
        id: "line-1",
        tags: Object.freeze(["fixture"]),
        layer: "test",
        userData: Object.freeze({ source: "unit-test" }),
      }),
    });
  }

  public createPolylinePrimitive(): PolylinePrimitive {
    return Object.freeze({
      kind: "polyline",
      points: Object.freeze([
        Object.freeze({ x: 0, y: 0, z: 0 }),
        Object.freeze({ x: 5, y: 10, z: 0 }),
        Object.freeze({ x: 10, y: 0, z: 0 }),
      ]),
      stroke: Object.freeze({ color: "#111111", width: 2 }),
      metadata: Object.freeze({
        id: "polyline-1",
      }),
    });
  }

  public createCirclePrimitive(): CirclePrimitive {
    return Object.freeze({
      kind: "circle",
      center: Object.freeze({ x: 20, y: 30, z: 0 }),
      radius: 10,
      normal: Object.freeze({ x: 0, y: 0, z: 1 }),
      stroke: Object.freeze({ color: "#222222", width: 3 }),
      fill: Object.freeze({ color: "none" }),
      metadata: Object.freeze({
        id: "circle-1",
      }),
    });
  }

  public createPolygonPrimitive(): PolygonPrimitive {
    return Object.freeze({
      kind: "polygon",
      points: Object.freeze([
        Object.freeze({ x: 0, y: 0, z: 0 }),
        Object.freeze({ x: 10, y: 0, z: 0 }),
        Object.freeze({ x: 10, y: 10, z: 0 }),
      ]),
      stroke: Object.freeze({ color: "#333333", width: 4 }),
      fill: Object.freeze({ color: "none" }),
      metadata: Object.freeze({
        id: "polygon-1",
      }),
    });
  }

  public expectContainsAll(actual: string, expectedParts: readonly string[]): void {
    for (const expectedPart of expectedParts) {
      expect(actual).toContain(expectedPart);
    }
  }

  public expectNoMutation<T>(before: T, after: T): void {
    expect(after).toEqual(before);
  }
}