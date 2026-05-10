import type { Color } from "@monorepo/core-math-colors";

export interface ColorMangmentGradientStop {
  readonly position: number;
  readonly color: Color;
}

export interface ColorMangmentScheme {
  readonly index: number;
  readonly count: number;
  readonly primary: Color;
  readonly secondary: Color;
  readonly accent: Color;
  readonly gradientStops: readonly ColorMangmentGradientStop[];
  readonly cssLinearGradient: string;
}

export interface IColorMangmentTarget {
  colorMangmentScheme: ColorMangmentScheme;
}

export type ColorMangmentTargetElement =
  HTMLElement & Partial<IColorMangmentTarget>;