// Applications/vite-piano-octave/src/adapters/SvgOctaveAdapter.ts

export const GEOMETRY_HEIGHT_PERCENT = 100;
export const SPACE_PERCENT = 1;

// tolerances
export const EPS = 1e-6;

// total gap between overlapping edges (each polygon moves GAP/2 away from the overlap line)
export const GAP = 1.5;

export type Point = readonly [number, number];

export type Segment = {
  readonly a: Point;
  readonly b: Point;
};

export type RawPolygon2D = {
  name: string;
  points: number[][];
};
