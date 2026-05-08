// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { Tangent } from "../tangent";
import { DEFAULT_OCTAVE_GEOMETRY } from "../../octave/geometry/DefaultOctaveGeometry";
import type { Point } from "../../types";

type ExpectedSegment = {
  readonly start: Point;
  readonly end: Point;
  readonly length: number;
};

const expectedSegmentsByNote: Readonly<Record<string, ExpectedSegment>> = {
  C: { start: [0, 100], end: [15, 100], length: 15 },
  Cs: { start: [15, 100], end: [28, 100], length: 13 },
  D: { start: [28, 100], end: [43, 100], length: 15 },
  Ds: { start: [43, 100], end: [57, 100], length: 14 },
  E: { start: [57, 100], end: [72, 100], length: 15 },
  F: { start: [72, 100], end: [85, 100], length: 13 },
  Fs: { start: [85, 100], end: [99, 100], length: 14 },
  G: { start: [99, 100], end: [113, 100], length: 14 },
  Gs: { start: [113, 100], end: [127, 100], length: 14 },
  A: { start: [127, 100], end: [141, 100], length: 14 },
  As: { start: [141, 100], end: [155, 100], length: 14 },
  H: { start: [155, 100], end: [169, 100], length: 14 }
};

const allTangents = [
  ...DEFAULT_OCTAVE_GEOMETRY.whiteKeys,
  ...DEFAULT_OCTAVE_GEOMETRY.blackKeys
];

describe("Tangent.getUpperLineSegment", () => {
  it("returns the highest horizontal pn-to-pn+1 segment for every tangent", () => {
    for (const geometry of allTangents) {
      const tangent = document.createElement("piano-tangent") as Tangent;
      tangent.geometry = geometry;

      const actual = tangent.getUpperLineSegment();
      const expected = expectedSegmentsByNote[geometry.name];

      expect(actual, geometry.name).not.toBeNull();
      expect(actual?.start, geometry.name).toEqual(expected.start);
      expect(actual?.end, geometry.name).toEqual(expected.end);
      expect(actual?.length, geometry.name).toBe(expected.length);
      expect(tangent.getLength(), geometry.name).toBe(expected.length);
    }
  });

  it("uses assigned points when geometry is null", () => {
    const tangent = document.createElement("piano-tangent") as Tangent;

    tangent.points = [
      [10, 80],
      [30, 80],
      [30, 10],
      [10, 10]
    ];

    const actual = tangent.getUpperLineSegment();

    expect(actual).not.toBeNull();
    expect(actual?.start).toEqual([10, 80]);
    expect(actual?.end).toEqual([30, 80]);
    expect(actual?.length).toBe(20);
  });

  it("returns null and zero length when no upper segment exists", () => {
    const tangent = document.createElement("piano-tangent") as Tangent;

    tangent.points = [[0, 0]];

    expect(tangent.getUpperLineSegment()).toBeNull();
    expect(tangent.getLength()).toBe(0);
  });
});