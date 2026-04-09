import {
  createButtonSvg,
  type IButtonSvgResource,
  type IButtonWithTextSvgStyle,
} from "./svgButton.js";
import {
  resolveTokenStyle,
  getDesignSystemFontFamily,
  styleColorOr,
  styleNumberOr,
} from "./styleSystem.js";

export type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface IDigitButtonStyle extends IButtonWithTextSvgStyle {
  readonly shellFill: string;
  readonly faceFill: string;
  readonly onFrameColor: string;
  readonly offFrameColor: string;
  readonly onInnerFrameColor: string;
  readonly offInnerFrameColor: string;
  readonly onAccentColor: string;
  readonly offAccentColor: string;
  readonly rimWidth: number;
  readonly innerFrameWidth: number;
  readonly edgeInset: number;
  readonly faceInset: number;
  readonly numberVerticalOffset: number;
  readonly onFill: string;
  readonly onStroke: string;
  readonly onTextColor: string;
  readonly offFill: string;
  readonly offStroke: string;
  readonly offTextColor: string;
  readonly accentColor: string;
  readonly accentHeight: number;
  readonly accentInsetX: number;
  readonly accentInsetBottom: number;
}

export interface ICreateDigitButtonSvgInput {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly digit: Digit;
  readonly on?: boolean;
  /**
   * @deprecated Use on.
   */
  readonly active?: boolean;
  readonly style?: Partial<IDigitButtonStyle>;
}

export interface IDigitButtonSvgResource extends IButtonSvgResource {
  readonly digit: Digit;
  readonly on: boolean;
}

export interface ICreateDigitButtonsSvgInput {
  readonly idPrefix: string;
  readonly startX: number;
  readonly startY: number;
  readonly buttonWidth: number;
  readonly buttonHeight: number;
  readonly gap?: number;
  readonly onDigit?: Digit;
  /**
   * @deprecated Use onDigit.
   */
  readonly activeDigit?: Digit;
  readonly style?: Partial<IDigitButtonStyle>;
}

const surfaceStyle = resolveTokenStyle({ token: "surface" });
const axisStyle = resolveTokenStyle({ token: "axis" });
const lineStyle = resolveTokenStyle({ token: "line" });

const defaultDigitButtonStyle: IDigitButtonStyle = Object.freeze({
  fill: styleColorOr(surfaceStyle.fill?.color, "#202734"),
  stroke: styleColorOr(surfaceStyle.stroke?.color, "#dff0ff"),
  strokeWidth: styleNumberOr(surfaceStyle.stroke?.width, 2.6),
  borderRadius: 11,
  textColor: "#f5fbff",
  shellFill: styleColorOr(axisStyle.stroke?.color, "#252c37"),
  faceFill: "#1a202b",
  onFrameColor: styleColorOr(surfaceStyle.stroke?.color, "#ecf4ff"),
  offFrameColor: "#7a8499",
  onInnerFrameColor: styleColorOr(lineStyle.stroke?.color, "#9edcff"),
  offInnerFrameColor: "#556179",
  onAccentColor: styleColorOr(lineStyle.stroke?.color, "#19d8ff"),
  offAccentColor: "#4d6778",
  rimWidth: 2.6,
  innerFrameWidth: 1.8,
  edgeInset: 2,
  faceInset: 9,
  numberVerticalOffset: -2,
  onFill: "#202734",
  onStroke: styleColorOr(surfaceStyle.stroke?.color, "#ecf4ff"),
  onTextColor: "#f7fbff",
  offFill: "#181e28",
  offStroke: "#6f788d",
  offTextColor: "#8b95a8",
  fontFamily: getDesignSystemFontFamily(),
  fontSize: 34,
  fontWeight: 600,
  accentColor: styleColorOr(lineStyle.stroke?.color, "#19d8ff"),
  accentHeight: 4,
  accentInsetX: 14,
  accentInsetBottom: 12,
});

const digits: readonly Digit[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export function createDigitButtonSvg(
  input: ICreateDigitButtonSvgInput,
): IDigitButtonSvgResource {
  validateId(input.id);

  const on = input.on ?? input.active ?? false;

  const style = {
    ...defaultDigitButtonStyle,
    ...input.style,
  };

  const stateStyle: IButtonWithTextSvgStyle = on
    ? {
        ...style,
        fill: style.onFill,
        stroke: style.onStroke,
        textColor: style.onTextColor,
      }
    : {
        ...style,
        fill: style.offFill,
        stroke: style.offStroke,
        textColor: style.offTextColor,
      };

  const button = createButtonSvg({
    id: input.id,
    x: input.x,
    y: input.y,
    width: input.width,
    height: input.height,
    label: String(input.digit),
    ariaLabel: `Digit ${input.digit}`,
    style: stateStyle,
  });

  const svg = buildDigitButtonSvg(input, style, on);

  return Object.freeze({
    digit: input.digit,
    on,
    shape: button.shape,
    svg,
  });
}

export function createDigitButtonsSvg(
  input: ICreateDigitButtonsSvgInput,
): readonly IDigitButtonSvgResource[] {
  validateId(input.idPrefix);

  const onDigit = input.onDigit ?? input.activeDigit;
  const gap = input.gap ?? 8;
  const resources = digits.map((digit) =>
    createDigitButtonSvg({
      id: `${input.idPrefix}-${digit}`,
      digit,
      x: input.startX + digit * (input.buttonWidth + gap),
      y: input.startY,
      width: input.buttonWidth,
      height: input.buttonHeight,
      on: onDigit === digit,
      ...(input.style ? { style: input.style } : {}),
    }),
  );

  return Object.freeze(resources);
}

function buildDigitButtonSvg(
  input: ICreateDigitButtonSvgInput,
  style: IDigitButtonStyle,
  on: boolean,
): string {
  const frameColor = on ? style.onFrameColor : style.offFrameColor;
  const innerFrameColor = on ? style.onInnerFrameColor : style.offInnerFrameColor;
  const accentColor = on ? style.onAccentColor : style.offAccentColor;
  const textColor = on ? style.onTextColor : style.offTextColor;

  const edgeInset = style.edgeInset;
  const faceInset = style.faceInset;
  const innerInset = faceInset - style.innerFrameWidth;

  const outerX = input.x + edgeInset;
  const outerY = input.y + edgeInset;
  const outerW = Math.max(0, input.width - edgeInset * 2);
  const outerH = Math.max(0, input.height - edgeInset * 2);

  const faceX = input.x + faceInset;
  const faceY = input.y + faceInset;
  const faceW = Math.max(0, input.width - faceInset * 2);
  const faceH = Math.max(0, input.height - faceInset * 2);

  const innerX = input.x + innerInset;
  const innerY = input.y + innerInset;
  const innerW = Math.max(0, input.width - innerInset * 2);
  const innerH = Math.max(0, input.height - innerInset * 2);

  const accentWidth = Math.max(0, input.width - style.accentInsetX * 2);
  const accentY = input.y + input.height - style.accentInsetBottom - style.accentHeight;
  const textX = input.x + input.width / 2;
  const textY = input.y + input.height / 2 + style.numberVerticalOffset;

  const outerRadius = Math.min(style.borderRadius, outerW / 2, outerH / 2);
  const innerRadius = Math.max(0, outerRadius - 3);
  const faceRadius = Math.max(0, outerRadius - 7);
  const label = escapeXml(String(input.digit));
  const ariaLabel = escapeXml(`Digit ${input.digit}`);

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${input.width}" height="${input.height}" viewBox="${input.x} ${input.y} ${input.width} ${input.height}" role="img" aria-label="${ariaLabel}">`,
    `  <title>${ariaLabel}</title>`,
    `  <rect x="${input.x}" y="${input.y}" width="${input.width}" height="${input.height}" rx="${style.borderRadius}" ry="${style.borderRadius}" fill="${style.shellFill}"/>`,
    `  <rect x="${outerX}" y="${outerY}" width="${outerW}" height="${outerH}" rx="${outerRadius}" ry="${outerRadius}" fill="none" stroke="${frameColor}" stroke-width="${style.rimWidth}"/>`,
    `  <rect x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}" rx="${innerRadius}" ry="${innerRadius}" fill="none" stroke="${innerFrameColor}" stroke-width="${style.innerFrameWidth}"/>`,
    `  <rect x="${faceX}" y="${faceY}" width="${faceW}" height="${faceH}" rx="${faceRadius}" ry="${faceRadius}" fill="${style.faceFill}"/>`,
    `  <text x="${textX}" y="${textY}" fill="${textColor}" font-family="${style.fontFamily}" font-size="${style.fontSize}" font-weight="${style.fontWeight}" text-anchor="middle" dominant-baseline="central">${label}</text>`,
    `  <rect x="${input.x + style.accentInsetX}" y="${accentY}" width="${accentWidth}" height="${style.accentHeight}" fill="${accentColor}" rx="${style.accentHeight / 2}" ry="${style.accentHeight / 2}"/>`,
    `</svg>`,
  ].join("\n");
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function validateId(value: string): void {
  if (value.trim().length === 0) {
    throw new Error("Digit button id must not be empty.");
  }
}