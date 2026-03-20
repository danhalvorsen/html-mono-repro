// ====================================================================================
// FILE: three/materials/MaterialToken.ts
// ====================================================================================

export const MaterialToken = {
  Grass: "grass",
  Road: "road",
  Water: "water",

  BuildingWhite: "building-white",
  BuildingBlue: "building-blue",
  BuildingYellow: "building-yellow",
  BuildingRed: "building-red",

  RoofLight: "roof-light",
  RoofAccent: "roof-accent",

  WindowGlass: "window-glass",
  WindowGlassDark: "window-glass-dark", // NEW
  WindowFrame: "window-frame",

  Balcony: "balcony",
  TreeLeaf: "tree-leaf",
  TreeTrunk: "tree-trunk",
} as const;

export type MaterialToken = (typeof MaterialToken)[keyof typeof MaterialToken];
