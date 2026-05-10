import { describe, expect, it } from "vitest";
import { DefaultWaterfallKeyPositionProjector } from "../src/application/DefaultWaterfallKeyPositionProjector";
import { DEFAULT_OCTAVE_GEOMETRY } from "../src/octave/geometry/DefaultOctaveGeometry";

type TangentGeometry = {
  readonly name: string;
  readonly points: readonly (readonly [number, number])[];
};

class TangentGeometryCenterReader {
  public readCenterX(tangent: TangentGeometry): number {
    const xs = tangent.points.map((point) => point[0]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    return (minX + maxX) / 2;
  }

  public readTotalWidth(tangents: readonly TangentGeometry[]): number {
    const allXs = tangents.flatMap((tangent) =>
      tangent.points.map((point) => point[0])
    );
    return Math.max(...allXs) - Math.min(...allXs);
  }
}

describe("Waterfall column alignment", () => {
  it("should align projected waterfall center with tangent geometry center", () => {
    const projector = new DefaultWaterfallKeyPositionProjector();
    const centerReader = new TangentGeometryCenterReader();

    const allTangents = [
      ...DEFAULT_OCTAVE_GEOMETRY.whiteKeys,
      ...DEFAULT_OCTAVE_GEOMETRY.blackKeys
    ] as readonly TangentGeometry[];

    const totalWidth = centerReader.readTotalWidth(allTangents);

    const deltas = allTangents.map((tangent) => {
      const position = projector.project(tangent.name, 0, 1);
      if (position === null) {
        throw new Error(`Unexpected unprojected tangent: ${tangent.name}`);
      }

      const tangentCenterX = centerReader.readCenterX(tangent);
      const projectedCenterX = position.centerRatio * totalWidth;

      return Math.abs(tangentCenterX - projectedCenterX);
    });

    const worstDelta = Math.max(...deltas);

    expect(worstDelta).toBeLessThan(0.001);
  });
});
