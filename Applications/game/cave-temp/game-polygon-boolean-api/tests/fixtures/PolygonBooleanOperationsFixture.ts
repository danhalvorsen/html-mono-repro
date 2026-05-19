import type { Polygon } from "@monorepo/game-primetives";
import type { IPolygonBooleanOperations } from "../../src/index.js";

export type PolygonBooleanFixtureOperation =
  | "compose"
  | "union"
  | "difference"
  | "intersect"
  | "xor";

export type PolygonBooleanFixtureCall = Readonly<{
  operation: PolygonBooleanFixtureOperation;
  subject?: Polygon;
  clips?: readonly Polygon[];
  polygons?: readonly Polygon[];
}>;

export type PolygonBooleanOperationsFixtureOptions = Readonly<{
  composeResult?: Polygon;
  unionResult?: readonly Polygon[];
  differenceResult?: readonly Polygon[];
  intersectResult?: readonly Polygon[];
  xorResult?: readonly Polygon[];
}>;

export class PolygonBooleanOperationsFixture implements IPolygonBooleanOperations {
  readonly #composeResult?: Polygon;
  readonly #unionResult: readonly Polygon[];
  readonly #differenceResult: readonly Polygon[];
  readonly #intersectResult: readonly Polygon[];
  readonly #xorResult: readonly Polygon[];
  readonly #calls: PolygonBooleanFixtureCall[] = [];

  public constructor(options: PolygonBooleanOperationsFixtureOptions = {}) {
    this.#composeResult = options.composeResult;
    this.#unionResult = options.unionResult ?? [];
    this.#differenceResult = options.differenceResult ?? [];
    this.#intersectResult = options.intersectResult ?? [];
    this.#xorResult = options.xorResult ?? [];
  }

  public get calls(): readonly PolygonBooleanFixtureCall[] {
    return this.#calls;
  }

  public compose(
    polygons: readonly Polygon[],
  ): Polygon {
    this.#calls.push({
      operation: "compose",
      polygons: [...polygons],
    });

    const [first] = polygons;
    const result = this.#composeResult ?? first;

    if (result === undefined) {
      throw new RangeError("compose requires at least one polygon.");
    }

    return result.withClosed();
  }

  public union(
    subject: Polygon,
    clips: readonly Polygon[],
  ): readonly Polygon[] {
    this.record("union", subject, clips);
    return this.#unionResult;
  }

  public difference(
    subject: Polygon,
    clips: readonly Polygon[],
  ): readonly Polygon[] {
    this.record("difference", subject, clips);
    return this.#differenceResult;
  }

  public intersect(
    subject: Polygon,
    clips: readonly Polygon[],
  ): readonly Polygon[] {
    this.record("intersect", subject, clips);
    return this.#intersectResult;
  }

  public xor(
    subject: Polygon,
    clips: readonly Polygon[],
  ): readonly Polygon[] {
    this.record("xor", subject, clips);
    return this.#xorResult;
  }

  private record(
    operation: PolygonBooleanFixtureOperation,
    subject: Polygon,
    clips: readonly Polygon[],
  ): void {
    this.#calls.push({
      operation,
      subject,
      clips: [...clips],
    });
  }
}
