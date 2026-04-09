import {
  getDesignSystemFontFamily,
} from "./styleSystem.js";

export const TONE_SCALE = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

export type ToneLabel = (typeof TONE_SCALE)[number];

export interface IToneLabelStyle {
  /**
   * CSS-like percentage shorthand: "a%", "a% b%", "a% b% c%", "a% b% c% d%"
   */
  readonly margin: string;
  /**
   * @deprecated Use margin.
   */
  readonly marginPercentX?: number;
  /**
   * @deprecated Use margin.
   */
  readonly marginPercentY?: number;
  readonly borderRadius: number;
  readonly fillColor: string;
  readonly textColor: string;
  readonly strokeColor: string;
  readonly strokeWidth: number;
  readonly fontFamily: string;
  readonly fontSize: number;
  readonly fontWeight: number;
}

export interface ICreateToneLabelSvgInput {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly buttonWidth: number;
  readonly buttonHeight: number;
  readonly tone: ToneLabel;
  readonly style?: Partial<IToneLabelStyle>;
}

export interface IToneLabelSvgResource {
  readonly tone: ToneLabel;
  readonly labelWidth: number;
  readonly labelHeight: number;
  readonly svg: string;
}

export interface ICreateToneScaleLabelsSvgInput {
  readonly idPrefix: string;
  readonly startX: number;
  readonly startY: number;
  readonly buttonWidth: number;
  readonly buttonHeight: number;
  readonly gap?: number;
  readonly tones?: readonly ToneLabel[];
}

const defaultStyle: IToneLabelStyle = Object.freeze({
  margin: "12% 6%",
  borderRadius: 7,
  fillColor: "#12161f",
  textColor: "#f1efe6",
  strokeColor: "#d8d3c4",
  strokeWidth: 0,
  fontFamily: getDesignSystemFontFamily(),
  fontSize: 12,
  fontWeight: 700,
});

export function createToneLabelSvg(
  input: ICreateToneLabelSvgInput,
): IToneLabelSvgResource {
  validateInput(input);

  const style = {
    ...defaultStyle,
    ...input.style,
  };

  const labelWidth = input.buttonWidth;
  const labelHeight = input.buttonHeight * 0.2;
  const margins = resolveMargins(style, labelWidth, labelHeight);
  const rectX = input.x + margins.left;
  const rectY = input.y + margins.top;
  const rectWidth = Math.max(0, labelWidth - margins.left - margins.right);
  const rectHeight = Math.max(0, labelHeight - margins.top - margins.bottom);
  const fill = style.fillColor;

  const textX = rectX + rectWidth / 2;
  const textY = rectY + rectHeight / 2;
  const radius = Math.min(style.borderRadius, rectWidth / 2, rectHeight / 2);
  const safeTone = escapeXml(input.tone);
  const ariaLabel = escapeXml(`Tone ${input.tone}`);

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${labelWidth}" height="${labelHeight}" viewBox="${input.x} ${input.y} ${labelWidth} ${labelHeight}" role="img" aria-label="${ariaLabel}">`,
    `  <title>${ariaLabel}</title>`,
    `  <rect x="${rectX}" y="${rectY}" width="${rectWidth}" height="${rectHeight}" rx="${radius}" ry="${radius}" fill="${fill}" stroke="${style.strokeColor}" stroke-width="${style.strokeWidth}"/>`,
    `  <text x="${textX}" y="${textY}" fill="${style.textColor}" font-family="${style.fontFamily}" font-size="${style.fontSize}" font-weight="${style.fontWeight}" text-anchor="middle" dominant-baseline="central">${safeTone}</text>`,
    `</svg>`,
  ].join("\n");

  return Object.freeze({
    tone: input.tone,
    labelWidth,
    labelHeight,
    svg,
  });
}

export function createToneScaleLabelsSvg(
  input: ICreateToneScaleLabelsSvgInput,
): readonly IToneLabelSvgResource[] {
  validateId(input.idPrefix);

  const tones = input.tones ?? TONE_SCALE;
  const gap = input.gap ?? 8;

  return Object.freeze(
    tones.map((tone, index) =>
      createToneLabelSvg({
        id: `${input.idPrefix}-${tone}`,
        x: input.startX + index * (input.buttonWidth + gap),
        y: input.startY,
        buttonWidth: input.buttonWidth,
        buttonHeight: input.buttonHeight,
        tone,
      }),
    ),
  );
}

function validateInput(input: ICreateToneLabelSvgInput): void {
  validateId(input.id);

  if (!Number.isFinite(input.buttonWidth) || input.buttonWidth <= 0) {
    throw new Error("Tone label buttonWidth must be greater than zero.");
  }

  if (!Number.isFinite(input.buttonHeight) || input.buttonHeight <= 0) {
    throw new Error("Tone label buttonHeight must be greater than zero.");
  }

  if (!Number.isFinite(input.x) || !Number.isFinite(input.y)) {
    throw new Error("Tone label origin must be finite.");
  }
}

function validateId(value: string): void {
  if (value.trim().length === 0) {
    throw new Error("Tone label id must not be empty.");
  }
}

function clampMargin(size: number, percent: number): number {
  if (!Number.isFinite(percent) || percent < 0) {
    return 0;
  }

  const margin = (size * percent) / 100;
  return Math.min(size / 2, margin);
}

function resolveMargins(
  style: IToneLabelStyle,
  width: number,
  height: number,
): { top: number; right: number; bottom: number; left: number } {
  if (style.marginPercentX !== undefined || style.marginPercentY !== undefined) {
    const horizontal = clampMargin(width, style.marginPercentX ?? 0);
    const vertical = clampMargin(height, style.marginPercentY ?? 0);
    return {
      top: vertical,
      right: horizontal,
      bottom: vertical,
      left: horizontal,
    };
  }

  return parseMargin(style.margin, width, height);
}

function parseMargin(
  margin: string,
  width: number,
  height: number,
): { top: number; right: number; bottom: number; left: number } {
  const normalized = margin.trim();
  if (normalized.length === 0) {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  const parts = normalized.split(/\s+/);
  const values = parts
    .map((part) => parsePercent(part))
    .filter((value): value is number => value !== null);

  if (values.length === 0) {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  const [a, b, c, d] = values;

  const topPercent = a ?? 0;
  const rightPercent = b ?? a ?? 0;
  const bottomPercent = c ?? a ?? 0;
  const leftPercent = d ?? b ?? a ?? 0;

  return {
    top: clampMargin(height, topPercent),
    right: clampMargin(width, rightPercent),
    bottom: clampMargin(height, bottomPercent),
    left: clampMargin(width, leftPercent),
  };
}

function parsePercent(value: string): number | null {
  const match = /^(-?\d+(?:\.\d+)?)%$/.exec(value);
  if (!match) {
    return null;
  }

  const parsed = Number(match[1]);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
