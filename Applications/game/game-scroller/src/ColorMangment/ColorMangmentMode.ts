export const ColorMangmentMode = {
  Gradient: "gradient",
  Palette: "palette",
  RandomPalette: "random-palette",
} as const;

export type ColorMangmentModeValue =
  (typeof ColorMangmentMode)[keyof typeof ColorMangmentMode];