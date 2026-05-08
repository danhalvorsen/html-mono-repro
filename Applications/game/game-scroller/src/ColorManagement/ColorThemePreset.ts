export const ColorThemePreset = {
  aurora: "aurora",
  ember: "ember",
  ocean: "ocean",
  mono: "mono",
  random: "random",
} as const;

export type ColorThemePreset = typeof ColorThemePreset[keyof typeof ColorThemePreset];