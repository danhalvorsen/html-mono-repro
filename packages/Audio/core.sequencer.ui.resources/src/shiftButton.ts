import {
  type IButtonVisualStyle,
  type IButtonGeometry,
} from "./svgButton.js";
import { controlStyles } from "./styleSystem.js";

/**
 * Visual style properties for the shift button.
 * Extends the standard button visual contract from svgButton.
 */
export type IShiftButtonSvgStyle = IButtonVisualStyle;

/**
 * Geometric properties for the shift button layout.
 * Extends the standard button geometry contract from svgButton.
 */
export type IShiftButtonGeometry = IButtonGeometry;

/**
 * Complete shift button configuration.
 * @deprecated Separate style and geometry concerns; use IShiftButtonSvgStyle + IShiftButtonGeometry.
 */
export type IShiftButtonStyle = IShiftButtonSvgStyle & IShiftButtonGeometry;

export interface ICreateShiftButtonSvgInput {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly label?: string;
  readonly style?: Partial<IShiftButtonStyle>;
}

export interface IShiftButtonSvgResource {
  readonly svg: string;
}

const defaultStyle = controlStyles.shiftButton.create();

export function createShiftButtonSvg(
  input: ICreateShiftButtonSvgInput,
): IShiftButtonSvgResource {
  validateInput(input);

  const style = { ...defaultStyle, ...input.style };
  const label = escapeXml(input.label ?? "SHIFT");
  const ariaLabel = escapeXml(`Shift button`);
  const radius = Math.min(style.borderRadius, input.width / 2, input.height / 2);
  const cx = input.x + input.width / 2;
  const cy = input.y + input.height / 2;

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${input.width}" height="${input.height}" viewBox="${input.x} ${input.y} ${input.width} ${input.height}" role="img" aria-label="${ariaLabel}">`,
    `  <title>${ariaLabel}</title>`,
    `  <rect x="${input.x}" y="${input.y}" width="${input.width}" height="${input.height}" rx="${radius}" ry="${radius}" fill="${style.fill}" stroke="${style.stroke}" stroke-width="${style.strokeWidth}"/>`,
    `  <text x="${cx}" y="${cy}" fill="${style.textColor}" font-family="${style.fontFamily}" font-size="${style.fontSize}" font-weight="${style.fontWeight}" text-anchor="middle" dominant-baseline="central">${label}</text>`,
    `</svg>`,
  ].join("\n");

  return Object.freeze({ svg });
}

function validateInput(input: ICreateShiftButtonSvgInput): void {
  if (input.id.trim().length === 0) {
    throw new Error("Shift button id must not be empty.");
  }

  if (!Number.isFinite(input.x) || !Number.isFinite(input.y)) {
    throw new Error("Shift button origin must be finite.");
  }

  if (!Number.isFinite(input.width) || input.width <= 0) {
    throw new Error("Shift button width must be greater than zero.");
  }

  if (!Number.isFinite(input.height) || input.height <= 0) {
    throw new Error("Shift button height must be greater than zero.");
  }
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
