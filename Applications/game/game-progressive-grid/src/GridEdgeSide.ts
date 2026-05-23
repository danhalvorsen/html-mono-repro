export const GridEdgeSide = Object.freeze({
  Left: "Left",
  Right: "Right",
  Bottom: "Bottom",
  Top: "Top",
} as const);

export type GridEdgeSide = (typeof GridEdgeSide)[keyof typeof GridEdgeSide];
