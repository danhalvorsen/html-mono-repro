import { NOTE_SYMBOLS, type NoteSymbol } from "../domain/NoteDomain";
import { DEFAULT_OCTAVE_GEOMETRY } from "../octave/geometry/DefaultOctaveGeometry";
import type { IWaterfallColumnLayout } from "./IWaterfallColumnLayout";

type TangentGeometry = {
  readonly name: string;
  readonly points: readonly (readonly [number, number])[];
};

type LineBounds = {
  readonly minX: number;
  readonly maxX: number;
};

export class DefaultWaterfallColumnLayout implements IWaterfallColumnLayout {
  private readonly boundsByNote = new Map<NoteSymbol, LineBounds>();
  private readonly octaveWidth: number;

  public constructor() {
    this.boundsByNote = this.createBoundsByNote();
    this.octaveWidth = this.readOctaveWidth();
  }

  public getColumnWidthRatios(octaveCount: number): readonly number[] {
    if (!Number.isInteger(octaveCount) || octaveCount <= 0) {
      return [];
    }

    const ratios: number[] = [];
    const totalWidth = this.octaveWidth * octaveCount;

    for (let octaveIndex = 0; octaveIndex < octaveCount; octaveIndex += 1) {
      for (const note of NOTE_SYMBOLS) {
        const bounds = this.boundsByNote.get(note);
        if (bounds === undefined) {
          ratios.push(this.getFallbackWidthRatio(note, totalWidth));
          continue;
        }
        ratios.push((bounds.maxX - bounds.minX) / totalWidth);
      }
    }

    return ratios;
  }

  public getColumnStartRatio(column: number, octaveCount: number): number | null {
    if (!Number.isInteger(column) || column < 0) {
      return null;
    }

    if (!Number.isInteger(octaveCount) || octaveCount <= 0) {
      return null;
    }

    const totalColumns = octaveCount * NOTE_SYMBOLS.length;
    if (column >= totalColumns) {
      return null;
    }

    const octaveIndex = Math.floor(column / NOTE_SYMBOLS.length);
    const noteIndex = column % NOTE_SYMBOLS.length;
    const note = NOTE_SYMBOLS[noteIndex];
    const bounds = this.boundsByNote.get(note);

    const totalWidth = this.octaveWidth * octaveCount;
    if (bounds === undefined) {
      return ((octaveIndex * this.octaveWidth) + noteIndex * this.getFallbackWidthUnits(note)) / totalWidth;
    }

    const globalMinX = octaveIndex * this.octaveWidth + bounds.minX;
    return globalMinX / totalWidth;
  }

  public getColumnWidthRatio(column: number, octaveCount: number): number | null {
    if (!Number.isInteger(column) || column < 0) {
      return null;
    }
    if (!Number.isInteger(octaveCount) || octaveCount <= 0) {
      return null;
    }

    const totalColumns = octaveCount * NOTE_SYMBOLS.length;
    if (column >= totalColumns) {
      return null;
    }

    const noteIndex = column % NOTE_SYMBOLS.length;
    const note = NOTE_SYMBOLS[noteIndex];
    const bounds = this.boundsByNote.get(note);
    const totalWidth = this.octaveWidth * octaveCount;

    if (bounds === undefined) {
      return this.getFallbackWidthRatio(note, totalWidth);
    }

    return (bounds.maxX - bounds.minX) / totalWidth;
  }

  private createBoundsByNote(): Map<NoteSymbol, LineBounds> {
    const map = new Map<NoteSymbol, LineBounds>();
    const allTangents = [
      ...DEFAULT_OCTAVE_GEOMETRY.whiteKeys,
      ...DEFAULT_OCTAVE_GEOMETRY.blackKeys
    ] as readonly TangentGeometry[];

    for (const note of NOTE_SYMBOLS) {
      const tangent = allTangents.find((candidate) => candidate.name === note);
      if (tangent === undefined) {
        continue;
      }
      map.set(note, this.readUpperLineBounds(tangent));
    }

    return map;
  }

  private readUpperLineBounds(tangent: TangentGeometry): LineBounds {
    const points = tangent.points;
    const maxY = Math.max(...points.map((point) => point[1]));

    let bestMinX = Number.POSITIVE_INFINITY;
    let bestMaxX = Number.NEGATIVE_INFINITY;
    let bestLength = Number.NEGATIVE_INFINITY;

    for (let index = 0; index < points.length; index += 1) {
      const current = points[index];
      const next = points[(index + 1) % points.length];

      if (current[1] !== maxY || next[1] !== maxY) {
        continue;
      }

      const minX = Math.min(current[0], next[0]);
      const maxX = Math.max(current[0], next[0]);
      const length = maxX - minX;

      if (length > bestLength) {
        bestLength = length;
        bestMinX = minX;
        bestMaxX = maxX;
      }
    }

    if (Number.isFinite(bestLength) && bestLength > 0) {
      return { minX: bestMinX, maxX: bestMaxX };
    }

    return this.readFullBounds(tangent);
  }

  private readFullBounds(tangent: TangentGeometry): LineBounds {
    const xs = tangent.points.map((point) => point[0]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    return { minX, maxX };
  }

  private readOctaveWidth(): number {
    const allTangents = [
      ...DEFAULT_OCTAVE_GEOMETRY.whiteKeys,
      ...DEFAULT_OCTAVE_GEOMETRY.blackKeys
    ] as readonly TangentGeometry[];
    const xs = allTangents.flatMap((tangent) => tangent.points.map((point) => point[0]));
    return Math.max(...xs) - Math.min(...xs);
  }

  private getFallbackWidthUnits(note: NoteSymbol): number {
    return note.includes("s") ? 14 : 24;
  }

  private getFallbackWidthRatio(note: NoteSymbol, totalWidth: number): number {
    return this.getFallbackWidthUnits(note) / totalWidth;
  }
}
