import type { IStyleReference } from "@monorepo/core-style-system";
import type { StyleState } from "./style-state.js";

export interface SvgStyle extends IStyleReference {
  readonly fill?: string;
  readonly stroke?: string;
  readonly strokeWidth?: number;
  readonly strokeDasharray?: string;
  readonly opacity?: number;
  readonly fontFamily?: string;
  readonly fontSize?: number;
  readonly fontWeight?: string | number;
  readonly cornerRadius?: number;
  readonly visible?: boolean;
  readonly paddingX?: number;
  readonly paddingY?: number;
  readonly shadow?: string;
  readonly width?: number;
  readonly height?: number;
  readonly state?: StyleState;
}

export function getStyleFill(style: Readonly<SvgStyle>, fallback = "none"): string {
  return style.fill ?? fallback;
}

export function getStyleStroke(style: Readonly<SvgStyle>, fallback = "none"): string {
  return style.stroke ?? fallback;
}

export function getStyleStrokeWidth(style: Readonly<SvgStyle>, fallback = 1): number {
  return style.strokeWidth ?? fallback;
}

export function getStyleStrokeDasharray(style: Readonly<SvgStyle>, fallback = ""): string {
  return style.strokeDasharray ?? fallback;
}

export function getStyleOpacity(style: Readonly<SvgStyle>, fallback = 1): number {
  return style.opacity ?? fallback;
}

export function getStyleFontFamily(style: Readonly<SvgStyle>, fallback = "inherit"): string {
  return style.fontFamily ?? fallback;
}

export function getStyleFontSize(style: Readonly<SvgStyle>, fallback = 12): number {
  return style.fontSize ?? fallback;
}

export function getStyleFontWeight(
  style: Readonly<SvgStyle>,
  fallback: string | number = 400,
): string | number {
  return style.fontWeight ?? fallback;
}

export function getStyleCornerRadius(style: Readonly<SvgStyle>, fallback = 0): number {
  return style.cornerRadius ?? fallback;
}

export function getStyleVisible(style: Readonly<SvgStyle>, fallback = true): boolean {
  return style.visible ?? fallback;
}
