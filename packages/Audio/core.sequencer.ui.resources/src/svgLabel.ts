import { controlStyles } from "./styleSystem.js";

export interface ISvgLabelStyle {
  readonly fillColor: string;
  readonly fillOpacity: number;
  readonly textColor: string;
  readonly strokeColor: string;
  readonly strokeWidth: number;
  readonly fontFamily: string;
  readonly fontSize: number;
  readonly fontWeight: number;
}

export interface ISvgLabelGeometry {
  readonly borderRadius: number;
  readonly margin: string;
  readonly marginPercent?: number;
  readonly marginPercentX?: number;
  readonly marginPercentY?: number;
}

export interface ICreateSvgLabelSvgInput {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly buttonWidth: number;
  readonly buttonHeight: number;
  readonly label: string;
  readonly style?: Partial<ISvgLabelStyle & ISvgLabelGeometry>;
}

export interface ISvgLabelSvgResource {
  readonly label: string;
  readonly labelWidth: number;
  readonly labelHeight: number;
  readonly svg: string;
}

const defaultStyle = controlStyles.toneLabel.create();
const defaultMarginPercent = 8;

export function createSvgLabelSvg(
  input: ICreateSvgLabelSvgInput,
): ISvgLabelSvgResource {
  validateId(input.id);
  validateSize(input.buttonWidth, "buttonWidth");
  validateSize(input.buttonHeight, "buttonHeight");

  if (!Number.isFinite(input.x) || !Number.isFinite(input.y)) {
    throw new Error("SVG label origin must be finite.");
  }

  const style: ISvgLabelStyle & ISvgLabelGeometry = {
    ...defaultStyle,
    fillOpacity: 1,
    ...input.style,
  };
  const fillOpacity = clamp01(style.fillOpacity);

  const label = normalizeLabel(input.label);
  const labelWidth = input.buttonWidth;
  const labelHeight = input.buttonHeight * 0.2;
  const margins = resolveMargins(style, labelWidth, labelHeight);
  const rectX = input.x + margins.left;
  const rectY = input.y + margins.top;
  const rectWidth = Math.max(0, labelWidth - margins.left - margins.right);
  const rectHeight = Math.max(0, labelHeight - margins.top - margins.bottom);
  const textX = rectX + rectWidth / 2;
  const textY = rectY + rectHeight / 2;
  const radius = Math.min(style.borderRadius, rectWidth / 2, rectHeight / 2);
  const safeLabel = escapeXml(label);
  const ariaLabel = escapeXml(`Label ${label}`);

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${labelWidth}" height="${labelHeight}" viewBox="${input.x} ${input.y} ${labelWidth} ${labelHeight}" role="img" aria-label="${ariaLabel}">`,
    `  <title>${ariaLabel}</title>`,
    `  <rect x="${rectX}" y="${rectY}" width="${rectWidth}" height="${rectHeight}" rx="${radius}" ry="${radius}" fill="${style.fillColor}" fill-opacity="${fillOpacity}" stroke="${style.strokeColor}" stroke-width="${style.strokeWidth}"/>`,
    `  <text x="${textX}" y="${textY}" fill="${style.textColor}" font-family="${style.fontFamily}" font-size="${style.fontSize}" font-weight="${style.fontWeight}" text-anchor="middle" dominant-baseline="central">${safeLabel}</text>`,
    `</svg>`,
  ].join("\n");

  return Object.freeze({
    label,
    labelWidth,
    labelHeight,
    svg,
  });
}

function normalizeLabel(value: string): string {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : "C";
}

function validateId(value: string): void {
  if (value.trim().length === 0) {
    throw new Error("SVG label id must not be empty.");
  }
}

function validateSize(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`SVG label ${name} must be greater than zero.`);
  }
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.min(1, Math.max(0, value));
}

function clampMargin(size: number, percent: number): number {
  if (!Number.isFinite(percent) || percent < 0) {
    return 0;
  }

  return Math.min(size / 2, (size * percent) / 100);
}

function resolveMargins(
  style: ISvgLabelStyle & ISvgLabelGeometry,
  width: number,
  height: number,
): { top: number; right: number; bottom: number; left: number } {
  if (style.marginPercentX !== undefined || style.marginPercentY !== undefined) {
    const horizontal = clampMargin(width, style.marginPercentX ?? defaultMarginPercent);
    const vertical = clampMargin(height, style.marginPercentY ?? defaultMarginPercent);
    return {
      top: vertical,
      right: horizontal,
      bottom: vertical,
      left: horizontal,
    };
  }

  if (style.marginPercent !== undefined) {
    const insetX = clampMargin(width, style.marginPercent);
    const insetY = clampMargin(height, style.marginPercent);
    return {
      top: insetY,
      right: insetX,
      bottom: insetY,
      left: insetX,
    };
  }

  const parsed = parseMargin(style.margin, width, height);
  if (
    parsed.top !== 0
    || parsed.right !== 0
    || parsed.bottom !== 0
    || parsed.left !== 0
  ) {
    return parsed;
  }

  return {
    top: clampMargin(height, defaultMarginPercent),
    right: clampMargin(width, defaultMarginPercent),
    bottom: clampMargin(height, defaultMarginPercent),
    left: clampMargin(width, defaultMarginPercent),
  };
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

  const values = normalized
    .split(/\s+/)
    .map((part) => {
      const match = /^(-?\d+(?:\.\d+)?)%$/.exec(part);
      if (!match) {
        return null;
      }

      const percent = Number(match[1]);
      return Number.isFinite(percent) && percent >= 0 ? percent : 0;
    })
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

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
