import { controlStyles } from "./styleSystem.js";

/**
 * Visual style properties for RGB buttons.
 * All properties are driven by @monorepo/core-style-system tokens.
 */
export interface IRgbButtonSvgStyle {
  readonly shellFill: string;
  readonly offOpacity: number;
}

/**
 * Geometric properties for RGB button layout.
 * Component-specific, not tokenized.
 */
export interface IRgbButtonGeometry {
  readonly borderRadius: number;
  readonly borderWidth: number;
}

/**
 * Complete RGB button configuration.
 * @deprecated Separate style and geometry concerns; use IRgbButtonSvgStyle + IRgbButtonGeometry.
 */
export interface IRgbButtonStyle
  extends IRgbButtonSvgStyle,
    IRgbButtonGeometry {}

export interface ICreateRgbButtonSvgInput {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly on?: boolean;
  readonly style?: Partial<IRgbButtonStyle>;
}

export interface IRgbButtonSvgResource {
  readonly on: boolean;
  readonly svg: string;
}

/**
 * Default RGB button style configuration.
 * Visual properties (shellFill, offOpacity) are driven by style tokens.
 * Geometric properties (borderRadius, borderWidth) are component-specific and not tokenized.
 */
const defaultStyle = controlStyles.rgbButton.create();

export function createRgbButtonSvg(
  input: ICreateRgbButtonSvgInput,
): IRgbButtonSvgResource {
  validateInput(input);

  const style = {
    ...defaultStyle,
    ...input.style,
  };

  const on = input.on ?? true;
  const rgb = `rgb(${clampByte(input.r)}, ${clampByte(input.g)}, ${clampByte(input.b)})`;
  const fillOpacity = on ? 1 : style.offOpacity;
  const ariaLabel = `RGB button ${clampByte(input.r)}, ${clampByte(input.g)}, ${clampByte(input.b)} ${on ? "on" : "off"}`;

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${input.width}" height="${input.height}" viewBox="${input.x} ${input.y} ${input.width} ${input.height}" role="img" aria-label="${ariaLabel}">`,
    `  <title>${ariaLabel}</title>`,
    `  <rect x="${input.x}" y="${input.y}" width="${input.width}" height="${input.height}" rx="${style.borderRadius}" ry="${style.borderRadius}" fill="${style.shellFill}"/>`,
    `  <rect x="${input.x + style.borderWidth}" y="${input.y + style.borderWidth}" width="${Math.max(0, input.width - style.borderWidth * 2)}" height="${Math.max(0, input.height - style.borderWidth * 2)}" rx="${Math.max(0, style.borderRadius - style.borderWidth)}" ry="${Math.max(0, style.borderRadius - style.borderWidth)}" fill="${rgb}" fill-opacity="${fillOpacity}"/>`,
    `</svg>`,
  ].join("\n");

  return Object.freeze({ on, svg });
}

function clampByte(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(255, Math.round(value)));
}

function validateInput(input: ICreateRgbButtonSvgInput): void {
  if (input.id.trim().length === 0) {
    throw new Error("RGB button id must not be empty.");
  }

  if (!Number.isFinite(input.width) || input.width <= 0) {
    throw new Error("RGB button width must be greater than zero.");
  }

  if (!Number.isFinite(input.height) || input.height <= 0) {
    throw new Error("RGB button height must be greater than zero.");
  }

  if (!Number.isFinite(input.x) || !Number.isFinite(input.y)) {
    throw new Error("RGB button origin must be finite.");
  }
}