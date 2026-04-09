export interface IRgbButtonStyle {
  readonly borderRadius: number;
  readonly borderWidth: number;
  readonly shellFill: string;
  readonly offOpacity: number;
}

import {
  resolveTokenStyle,
  styleColorOr,
  styleNumberOr,
} from "./styleSystem.js";

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

const axisStyle = resolveTokenStyle({ token: "axis" });

const defaultStyle: IRgbButtonStyle = Object.freeze({
  borderRadius: 12,
  borderWidth: styleNumberOr(axisStyle.stroke?.width, 2),
  shellFill: styleColorOr(axisStyle.stroke?.color, "#161c24"),
  offOpacity: 0.35,
});

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
