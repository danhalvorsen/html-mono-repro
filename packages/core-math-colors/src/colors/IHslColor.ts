// packages/core-math-colors/src/colors/IHslColor.ts

export interface IHslColor {
  readonly hue: number; // normalized [0..1]
  readonly saturation: number; // normalized [0..1]
  readonly lightness: number; // normalized [0..1]
  readonly alpha: number; // normalized [0..1]
}