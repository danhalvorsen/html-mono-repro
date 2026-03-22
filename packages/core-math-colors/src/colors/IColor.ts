
export interface IColor {
  readonly red: number; // normalized [0..1]
  readonly green: number; // normalized [0..1]
  readonly blue: number; // normalized [0..1]
  readonly alpha: number; // normalized [0..1]

  toHexRgb(): string;
  toHexRgba(): string;
  toCssRgb(): string;
  toCssRgba(): string;
}
