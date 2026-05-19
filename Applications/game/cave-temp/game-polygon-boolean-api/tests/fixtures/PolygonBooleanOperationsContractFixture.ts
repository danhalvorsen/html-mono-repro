import type { Polygon } from "@monorepo/game-primetives";
import type { IPolygonBooleanOperations } from "../../src/index.js";

export class PolygonBooleanOperationsContractFixture
  implements IPolygonBooleanOperations {
  public compose(polygons: readonly Polygon[]): Polygon {
    const [first] = polygons;

    if (first === undefined) {
      throw new RangeError("compose requires at least one polygon.");
    }

    return first.withClosed();
  }

  public union(
    subject: Polygon,
    clips: readonly Polygon[],
  ): readonly Polygon[] {
    return [subject, ...clips];
  }

  public difference(
    subject: Polygon,
    _clips: readonly Polygon[],
  ): readonly Polygon[] {
    return [subject];
  }

  public intersect(
    _subject: Polygon,
    clips: readonly Polygon[],
  ): readonly Polygon[] {
    return clips;
  }

  public xor(
    subject: Polygon,
    clips: readonly Polygon[],
  ): readonly Polygon[] {
    return [subject, ...clips];
  }
}
