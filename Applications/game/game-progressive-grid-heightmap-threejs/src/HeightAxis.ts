export const HeightAxis = {
  X: "x",
  Y: "y",
  Z: "z"
} as const;

export type HeightAxis = (typeof HeightAxis)[keyof typeof HeightAxis];