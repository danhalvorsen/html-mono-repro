import { DEFAULT_OCTAVE_GEOMETRY } from "../octave/geometry/DefaultOctaveGeometry";
import type {
  IWaterfallKeyPositionProjector,
  WaterfallKeyPosition
} from "./IWaterfallKeyPositionProjector";

type TangentGeometry = {
  readonly name: string;
  readonly points: readonly (readonly [number, number])[];
};

type TangentBounds = {
  readonly minX: number;
  readonly maxX: number;
};

export class DefaultWaterfallKeyPositionProjector
  implements IWaterfallKeyPositionProjector
{
  private readonly tangentsByNote = new Map<string, TangentGeometry>();
  private readonly octaveWidth: number;

  public constructor() {
    const tangents = [
      ...DEFAULT_OCTAVE_GEOMETRY.whiteKeys,
      ...DEFAULT_OCTAVE_GEOMETRY.blackKeys
    ];

    for (const tangent of tangents) {
      this.tangentsByNote.set(tangent.name, tangent);
    }

    const allX = tangents.flatMap((tangent) =>
      tangent.points.map((point) => point[0])
    );
    this.octaveWidth = Math.max(...allX) - Math.min(...allX);
  }

  public project(
    note: string,
    octaveIndex: number,
    octaveCount: number
  ): WaterfallKeyPosition | null {
    if (!Number.isInteger(octaveIndex) || octaveIndex < 0) {
      return null;
    }

    if (!Number.isInteger(octaveCount) || octaveCount <= 0) {
      return null;
    }

    if (octaveIndex >= octaveCount) {
      return null;
    }

    const tangent = this.tangentsByNote.get(note);
    if (tangent === undefined) {
      return null;
    }

    const bounds = this.readBounds(tangent);
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const keyWidth = Math.max(1, bounds.maxX - bounds.minX);

    const totalWidth = this.octaveWidth * octaveCount;
    const globalCenter = octaveIndex * this.octaveWidth + centerX;

    return {
      centerRatio: globalCenter / totalWidth,
      widthRatio: keyWidth / totalWidth
    };
  }

  private readBounds(tangent: TangentGeometry): TangentBounds {
    const xs = tangent.points.map((point) => point[0]);
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs)
    };
  }
}

