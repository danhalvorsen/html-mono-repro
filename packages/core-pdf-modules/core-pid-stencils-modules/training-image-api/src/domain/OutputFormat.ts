export const OutputFormat = {
  Svg: "svg",
  Png: "png",
  Jpg: "jpg",
  Pdf: "pdf",
} as const;

export type OutputFormat = typeof OutputFormat[keyof typeof OutputFormat];