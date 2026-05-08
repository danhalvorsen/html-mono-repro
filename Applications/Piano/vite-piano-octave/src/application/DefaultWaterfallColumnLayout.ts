import { NOTE_SYMBOLS, type NoteSymbol } from "../domain/NoteDomain";
import {
  DEFAULT_OCTAVE_GEOMETRY,
  type LegacyTangentGeometry
} from "../octave/geometry/DefaultOctaveGeometry";
import type { Point } from "../types";
import type { IWaterfallColumnLayout } from "./IWaterfallColumnLayout";
import {
  DefaultTangentUpperLineSegmentReader,
  type ITangentUpperLineSegmentReader,
  type TangentUpperLineSegment
} from "./TangentUpperLineSegment";

export type WaterfallColumnLayoutItem = {
  readonly column: number;
  readonly octaveIndex: number;
  readonly note: NoteSymbol;
  readonly segment: TangentUpperLineSegment;
  readonly leftRatio: number;
  readonly widthRatio: number;
  readonly leftPercent: number;
  readonly widthPercent: number;
};

export class DefaultWaterfallColumnLayout implements IWaterfallColumnLayout {
  private static readonly COLUMNS_PER_OCTAVE = NOTE_SYMBOLS.length;

  private readonly segmentReader: ITangentUpperLineSegmentReader;
  private readonly segmentsByNote: ReadonlyMap<NoteSymbol, TangentUpperLineSegment>;
  private readonly octaveMinX: number;
  private readonly octaveMaxX: number;
  private readonly octaveWidth: number;

  public constructor(
    segmentReader: ITangentUpperLineSegmentReader = new DefaultTangentUpperLineSegmentReader()
  ) {
    this.segmentReader = segmentReader;
    this.segmentsByNote = this.createSegmentsByNote();

    const segments = Array.from(this.segmentsByNote.values());
    this.octaveMinX = Math.min(...segments.map((segment) => segment.minX));
    this.octaveMaxX = Math.max(...segments.map((segment) => segment.maxX));
    this.octaveWidth = Math.max(1, this.octaveMaxX - this.octaveMinX);
  }

  public getColumnLayoutItems(octaveCount: number): readonly WaterfallColumnLayoutItem[] {
    if (!this.isValidOctaveCount(octaveCount)) {
      return [];
    }

    const result: WaterfallColumnLayoutItem[] = [];

    for (let octaveIndex = 0; octaveIndex < octaveCount; octaveIndex += 1) {
      for (let noteIndex = 0; noteIndex < NOTE_SYMBOLS.length; noteIndex += 1) {
        const note = NOTE_SYMBOLS[noteIndex];
        const segment = this.segmentsByNote.get(note);

        if (segment === undefined) {
          continue;
        }

        const column = octaveIndex * DefaultWaterfallColumnLayout.COLUMNS_PER_OCTAVE + noteIndex;
        const globalStart = octaveIndex * this.octaveWidth + (segment.minX - this.octaveMinX);
        const totalWidth = this.octaveWidth * octaveCount;
        const leftRatio = globalStart / totalWidth;
        const widthRatio = segment.length / totalWidth;

        result.push({
          column,
          octaveIndex,
          note,
          segment,
          leftRatio,
          widthRatio,
          leftPercent: leftRatio * 100,
          widthPercent: widthRatio * 100
        });
      }
    }

    return result;
  }

  public getColumnLayoutItem(
    column: number,
    octaveCount: number
  ): WaterfallColumnLayoutItem | null {
    if (!this.isValidColumn(column, octaveCount)) {
      return null;
    }

    return this.getColumnLayoutItems(octaveCount).find((item) => item.column === column) ?? null;
  }

  public getColumnWidthRatios(octaveCount: number): readonly number[] {
    return this.getColumnLayoutItems(octaveCount).map((item) => item.widthRatio);
  }

  public getColumnStartRatio(column: number, octaveCount: number): number | null {
    return this.getColumnLayoutItem(column, octaveCount)?.leftRatio ?? null;
  }

  public getColumnWidthRatio(column: number, octaveCount: number): number | null {
    return this.getColumnLayoutItem(column, octaveCount)?.widthRatio ?? null;
  }

  private createSegmentsByNote(): ReadonlyMap<NoteSymbol, TangentUpperLineSegment> {
    const map = new Map<NoteSymbol, TangentUpperLineSegment>();

    for (const note of NOTE_SYMBOLS) {
      const tangent = this.findTangent(note);

      if (tangent === null) {
        throw new Error(`Missing tangent geometry for note: ${note}`);
      }

      const segment = this.segmentReader.read(tangent.points as readonly Point[]);

      if (segment === null) {
        throw new Error(`Missing upper line segment for note: ${note}`);
      }

      map.set(note, segment);
    }

    return map;
  }

  private findTangent(note: NoteSymbol): LegacyTangentGeometry | null {
    return (
      DEFAULT_OCTAVE_GEOMETRY.whiteKeys.find((tangent) => tangent.name === note) ??
      DEFAULT_OCTAVE_GEOMETRY.blackKeys.find((tangent) => tangent.name === note) ??
      null
    );
  }

  private isValidOctaveCount(octaveCount: number): boolean {
    return Number.isInteger(octaveCount) && octaveCount > 0;
  }

  private isValidColumn(column: number, octaveCount: number): boolean {
    return (
      Number.isInteger(column) &&
      column >= 0 &&
      this.isValidOctaveCount(octaveCount) &&
      column < octaveCount * DefaultWaterfallColumnLayout.COLUMNS_PER_OCTAVE
    );
  }
}