export const RgbaChannel = {
  Red: "red",
  Green: "green",
  Blue: "blue",
  Alpha: "alpha"
} as const;

export type RgbaChannel = (typeof RgbaChannel)[keyof typeof RgbaChannel];