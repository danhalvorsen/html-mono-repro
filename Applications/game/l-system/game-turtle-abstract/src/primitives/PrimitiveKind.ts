export const PrimitiveKind = {
  Line: "line",
  Polyline: "polyline",
  Circle: "circle",
  Polygon: "polygon",
} as const;

export type PrimitiveKind = (typeof PrimitiveKind)[keyof typeof PrimitiveKind];