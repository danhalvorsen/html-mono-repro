export const ColorMangmentPresetName = {
  NeonFlow: "neon-flow",
  Ocean: "ocean",
  Heat: "heat",
  Mono: "mono",
} as const;

export type ColorMangmentPresetNameValue =
  (typeof ColorMangmentPresetName)[keyof typeof ColorMangmentPresetName];