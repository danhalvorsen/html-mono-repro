import {
  type IButtonFrameSvgStyle,
  type IButtonGeometry,
} from "./svgButton.js";
import { controlStyles } from "./styleSystem.js";

export type TransportButtonVariant = "play" | "stop" | "record";

/**
 * Visual style properties for transport buttons.
 * Extends IButtonFrameSvgStyle (fill/stroke/strokeWidth) for the shell,
 * and adds icon-specific properties.
 */
export interface ITransportButtonSvgStyle extends IButtonFrameSvgStyle {
  readonly iconFill: string;
  readonly iconStroke: string;
  readonly iconStrokeWidth: number;
  readonly labelColor: string;
  readonly fontFamily: string;
  readonly fontSize: number;
}

/**
 * Geometric properties for transport button layout.
 * Extends the standard button geometry contract from svgButton.
 */
export type ITransportButtonGeometry = IButtonGeometry;

/**
 * Complete transport button configuration.
 * @deprecated Separate style and geometry concerns; use ITransportButtonSvgStyle + ITransportButtonGeometry.
 */
export type ITransportButtonStyle = ITransportButtonSvgStyle & ITransportButtonGeometry;

export interface ICreateTransportButtonSvgInput {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly variant: TransportButtonVariant;
  readonly label?: string;
  readonly style?: Partial<ITransportButtonStyle>;
}

export interface ITransportButtonSvgResource {
  readonly variant: TransportButtonVariant;
  readonly svg: string;
}

const defaultStyle = controlStyles.transportButton.create();

export function createTransportButtonSvg(
  input: ICreateTransportButtonSvgInput,
): ITransportButtonSvgResource {
  validateInput(input);

  const style = { ...defaultStyle, ...input.style };

  const cx = input.x + input.width / 2;
  const radius = Math.min(style.borderRadius, input.width / 2, input.height / 2);
  const hasLabel = input.label !== undefined && input.label.trim().length > 0;

  const iconCy = hasLabel
    ? input.y + input.height * 0.42
    : input.y + input.height / 2;
  const labelY = input.y + input.height * 0.82;
  const iconSize = Math.min(input.width, input.height) * 0.3;

  const ariaLabel = escapeXml(
    `${input.variant} button${input.label ? ` ${input.label}` : ""}`,
  );

  const shell = `  <rect x="${input.x}" y="${input.y}" width="${input.width}" height="${input.height}" rx="${radius}" ry="${radius}" fill="${style.fill}" stroke="${style.stroke}" stroke-width="${style.strokeWidth}"/>`;

  const icon = buildIcon(input.variant, cx, iconCy, iconSize, style);

  const labelEl = hasLabel
    ? `  <text x="${cx}" y="${labelY}" fill="${style.labelColor}" font-family="${style.fontFamily}" font-size="${style.fontSize}" text-anchor="middle" dominant-baseline="central">${escapeXml(input.label!)}</text>`
    : "";

  const svgParts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${input.width}" height="${input.height}" viewBox="${input.x} ${input.y} ${input.width} ${input.height}" role="img" aria-label="${ariaLabel}">`,
    `  <title>${ariaLabel}</title>`,
    shell,
    icon,
    labelEl,
    `</svg>`,
  ].filter((part) => part.length > 0);

  return Object.freeze({ variant: input.variant, svg: svgParts.join("\n") });
}

function buildIcon(
  variant: TransportButtonVariant,
  cx: number,
  cy: number,
  size: number,
  style: ITransportButtonStyle,
): string {
  const half = size / 2;

  switch (variant) {
    case "stop":
      return `  <rect x="${cx - half}" y="${cy - half}" width="${size}" height="${size}" fill="${style.iconFill}" rx="1.5" ry="1.5"/>`;

    case "record":
      return `  <circle cx="${cx}" cy="${cy}" r="${half}" fill="none" stroke="${style.iconStroke}" stroke-width="${style.iconStrokeWidth}"/>`;

    case "play":
      return `  <polygon points="${cx - half} ${cy - half} ${cx - half} ${cy + half} ${cx + half} ${cy}" fill="${style.iconFill}"/>`;
  }
}

function validateInput(input: ICreateTransportButtonSvgInput): void {
  if (input.id.trim().length === 0) {
    throw new Error("Transport button id must not be empty.");
  }

  if (!Number.isFinite(input.x) || !Number.isFinite(input.y)) {
    throw new Error("Transport button origin must be finite.");
  }

  if (!Number.isFinite(input.width) || input.width <= 0) {
    throw new Error("Transport button width must be greater than zero.");
  }

  if (!Number.isFinite(input.height) || input.height <= 0) {
    throw new Error("Transport button height must be greater than zero.");
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
