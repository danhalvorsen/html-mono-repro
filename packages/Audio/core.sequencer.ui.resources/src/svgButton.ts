import { type IRectangleShape } from "@monorepo/core-semantic-model-shapes";

/**
 * Visual style properties for button frame and text.
 * All properties are driven by @monorepo/core-style-system tokens.
 */
export interface IButtonFrameSvgStyle {
  readonly fill: string;
  readonly stroke: string;
  readonly strokeWidth: number;
}

export interface IButtonTextSvgStyle {
  readonly textColor: string;
  readonly fontFamily: string;
  readonly fontSize: number;
  readonly fontWeight: number;
}

export interface IButtonVisualStyle
  extends IButtonFrameSvgStyle,
    IButtonTextSvgStyle {}

/**
 * Geometric properties for button layout.
 * Component-specific, not tokenized.
 */
export interface IButtonGeometry {
  readonly borderRadius: number;
}

/**
 * Complete button configuration.
 * @deprecated Separate style and geometry concerns; use IButtonVisualStyle + IButtonGeometry.
 */
export interface IButtonWithTextSvgStyle
  extends IButtonVisualStyle,
    IButtonGeometry {}

/**
 * @deprecated Use IButtonFrameSvgStyle, IButtonTextSvgStyle, or IButtonWithTextSvgStyle.
 */
export type IButtonSvgStyle = IButtonWithTextSvgStyle;

export interface ICreateButtonSvgInput {
  readonly shape: IRectangleShape;
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly label: string;
  readonly ariaLabel?: string;
  readonly style?: Partial<IButtonWithTextSvgStyle>;
}

export interface IButtonSvgResource {
  readonly shape: IRectangleShape;
  readonly svg: string;
}

/**
 * Default button style configuration.
 * Visual properties (colors, text) are driven by style tokens.
 * Geometric properties (borderRadius) are component-specific and not tokenized.
 */
const defaultButtonStyle: IButtonWithTextSvgStyle = Object.freeze({
  fill: "#0b6cff",
  stroke: "#084cc0",
  strokeWidth: 1.5,
  borderRadius: 8,
  textColor: "#ffffff",
  fontFamily: "Verdana, Geneva, sans-serif",
  fontSize: 14,
  fontWeight: 600,
});

export function createButtonSvg(
  input: ICreateButtonSvgInput,
): IButtonSvgResource {
  validateInput(input);

  const style = {
    ...defaultButtonStyle,
    ...input.style,
  };

  const radius = Math.min(style.borderRadius, input.width / 2, input.height / 2);
  const textX = input.x + input.width / 2;
  const textY = input.y + input.height / 2;
  const label = escapeXml(input.label);
  const ariaLabel = escapeXml(input.ariaLabel ?? input.label);

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${input.width}" height="${input.height}" viewBox="${input.x} ${input.y} ${input.width} ${input.height}" role="img" aria-label="${ariaLabel}">`,
    `  <title>${ariaLabel}</title>`,
    `  <rect x="${input.x}" y="${input.y}" width="${input.width}" height="${input.height}" rx="${radius}" ry="${radius}" fill="${style.fill}" stroke="${style.stroke}" stroke-width="${style.strokeWidth}"/>`,
    `  <text x="${textX}" y="${textY}" fill="${style.textColor}" font-family="${style.fontFamily}" font-size="${style.fontSize}" font-weight="${style.fontWeight}" text-anchor="middle" dominant-baseline="central">${label}</text>`,
    `</svg>`,
  ].join("\n");

  return Object.freeze({
    shape: input.shape,
    svg,
  });
}

function validateInput(input: ICreateButtonSvgInput): void {
  if (input.id.trim().length === 0) {
    throw new Error("Button id must not be empty.");
  }

  if (input.label.trim().length === 0) {
    throw new Error("Button label must not be empty.");
  }

  if (!Number.isFinite(input.x) || !Number.isFinite(input.y)) {
    throw new Error("Button origin must be finite.");
  }

  if (!Number.isFinite(input.width) || input.width <= 0) {
    throw new Error("Button width must be greater than zero.");
  }

  if (!Number.isFinite(input.height) || input.height <= 0) {
    throw new Error("Button height must be greater than zero.");
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