import { describe, expect, it } from "vitest";
import { NOTE_SYMBOLS } from "../../domain/NoteDomain";
import { DEFAULT_OCTAVE_GEOMETRY } from "../../octave/geometry/DefaultOctaveGeometry";
import { DefaultTangentUpperLineSegmentReader } from "../TangentUpperLineSegment";
import { DefaultWaterfallColumnLayout } from "../DefaultWaterfallColumnLayout";
import type { Point } from "../../types";

const expectedUpperSegments: Readonly<Record<string, {
  readonly start: Point;
  readonly end: Point;
  readonly minX: number;
  readonly maxX: number;
  readonly length: number;
}>> = {
  C: { start: [0, 100], end: [15, 100], minX: 0, maxX: 15, length: 15 },
  Cs: { start: [15, 100], end: [28, 100], minX: 15, maxX: 28, length: 13 },
  D: { start: [28, 100], end: [43, 100], minX: 28, maxX: 43, length: 15 },
  Ds: { start: [43, 100], end: [57, 100], minX: 43, maxX: 57, length: 14 },
  E: { start: [57, 100], end: [72, 100], minX: 57, maxX: 72, length: 15 },
  F: { start: [72, 100], end: [85, 100], minX: 72, maxX: 85, length: 13 },
  Fs: { start: [85, 100], end: [99, 100], minX: 85, maxX: 99, length: 14 },
  G: { start: [99, 100], end: [113, 100], minX: 99, maxX: 113, length: 14 },
  Gs: { start: [113, 100], end: [127, 100], minX: 113, maxX: 127, length: 14 },
  A: { start: [127, 100], end: [141, 100], minX: 127, maxX: 141, length: 14 },
  As: { start: [141, 100], end: [155, 100], minX: 141, maxX: 155, length: 14 },
  H: { start: [155, 100], end: [169, 100], minX: 155, maxX: 169, length: 14 }
};

const octaveWidth = 169;

describe("Waterfall column upper-segment contract", () => {
  it("uses tangent upper segment start/end points for column left and width", () => {
    const layout = new DefaultWaterfallColumnLayout();
    const items = layout.getColumnLayoutItems(1);

    expect(items).toHaveLength(NOTE_SYMBOLS.length);

    for (const item of items) {
      const expected = expectedUpperSegments[item.note];

      expect(item.segment.start, item.note).toEqual(expected.start);
      expect(item.segment.end, item.note).toEqual(expected.end);
      expect(item.segment.minX, item.note).toBe(expected.minX);
      expect(item.segment.maxX, item.note).toBe(expected.maxX);
      expect(item.segment.length, item.note).toBe(expected.length);

      expect(item.leftRatio, item.note).toBeCloseTo(expected.minX / octaveWidth, 12);
      expect(item.widthRatio, item.note).toBeCloseTo(expected.length / octaveWidth, 12);

      expect(layout.getColumnStartRatio(item.column, 1), item.note).toBeCloseTo(
        expected.minX / octaveWidth,
        12
      );
      expect(layout.getColumnWidthRatio(item.column, 1), item.note).toBeCloseTo(
        expected.length / octaveWidth,
        12
      );
    }
  });

  it("reads the same segment from raw tangent geometry that waterfall uses", () => {
    const reader = new DefaultTangentUpperLineSegmentReader();
    const layout = new DefaultWaterfallColumnLayout();

    for (const item of layout.getColumnLayoutItems(1)) {
      const geometry =
        DEFAULT_OCTAVE_GEOMETRY.whiteKeys.find((key) => key.name === item.note) ??
        DEFAULT_OCTAVE_GEOMETRY.blackKeys.find((key) => key.name === item.note);

      expect(geometry, item.note).toBeDefined();

      const segment = reader.read(geometry!.points as readonly Point[]);

      expect(segment, item.note).not.toBeNull();
      expect(item.segment.start, item.note).toEqual(segment?.start);
      expect(item.segment.end, item.note).toEqual(segment?.end);
      expect(item.segment.length, item.note).toBe(segment?.length);
    }
  });

  it("keeps upper segment columns contiguous inside one octave", () => {
    const layout = new DefaultWaterfallColumnLayout();
    const items = layout.getColumnLayoutItems(1);

    for (let index = 0; index < items.length - 1; index += 1) {
      const current = items[index];
      const next = items[index + 1];

      expect(current.segment.maxX, `${current.note}->${next.note}`).toBe(next.segment.minX);
      expect(current.leftRatio + current.widthRatio, `${current.note}->${next.note}`).toBeCloseTo(
        next.leftRatio,
        12
      );
    }
  });

  it("offsets upper segment placement by octave index for multi-octave layouts", () => {
    const layout = new DefaultWaterfallColumnLayout();
    const items = layout.getColumnLayoutItems(2);

    const firstC = items.find((item) => item.column === 0);
    const secondC = items.find((item) => item.column === NOTE_SYMBOLS.length);

    expect(firstC).toBeDefined();
    expect(secondC).toBeDefined();

    expect(firstC?.leftRatio).toBeCloseTo(0 / (octaveWidth * 2), 12);
    expect(firstC?.widthRatio).toBeCloseTo(15 / (octaveWidth * 2), 12);

    expect(secondC?.leftRatio).toBeCloseTo(octaveWidth / (octaveWidth * 2), 12);
    expect(secondC?.widthRatio).toBeCloseTo(15 / (octaveWidth * 2), 12);
  });
});