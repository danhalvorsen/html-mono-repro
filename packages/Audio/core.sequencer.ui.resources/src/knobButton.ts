export type KnobVariant = "matte" | "glossy" | "ribbed" | "beveled";

import { controlStyles } from "./styleSystem.js";

export interface ICreateKnobButtonSvgInput {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly on?: boolean;
  readonly variant?: KnobVariant;
}

export interface IKnobButtonSvgResource {
  readonly on: boolean;
  readonly variant: KnobVariant;
  readonly svg: string;
}

export class KnobButtonSvgFactory {
  public create(input: ICreateKnobButtonSvgInput): IKnobButtonSvgResource {
    this.validateInput(input);

    const on = input.on ?? true;
    const variant = input.variant ?? "matte";

    const cx = input.x + input.width / 2;
    const cy = input.y + input.height / 2;
    const radius = Math.max(4, Math.min(input.width, input.height) / 2 - 3);
    const ringRadius = Math.max(2, radius - 2);
    const bodyRadius = Math.max(2, radius - 6);

    const palette = controlStyles.knobButton.create();

    const bodyFill = on ? palette.bodyFillOn : palette.bodyFillOff;
    const ringStroke = on ? palette.ringStrokeOn : palette.ringStrokeOff;
    const highlightOpacity = on ? 0.8 : 0.38;

    const defs = [
      `  <defs>`,
      `    <radialGradient id="${input.id}-body-grad" cx="35%" cy="30%" r="75%">`,
      `      <stop offset="0%" stop-color="#101726"/>`,
      `      <stop offset="62%" stop-color="${bodyFill}"/>`,
      `      <stop offset="100%" stop-color="#00020a"/>`,
      `    </radialGradient>`,
      `    <linearGradient id="${input.id}-rim-grad" x1="0%" y1="0%" x2="100%" y2="100%">`,
      `      <stop offset="0%" stop-color="#8b95ab" stop-opacity="${highlightOpacity}"/>`,
      `      <stop offset="50%" stop-color="${palette.rimGradientMiddle}" stop-opacity="0.5"/>`,
      `      <stop offset="100%" stop-color="#d5ddec" stop-opacity="0.25"/>`,
      `    </linearGradient>`,
      `  </defs>`,
    ];

    const rings = [
      `  <circle cx="${cx}" cy="${cy}" r="${ringRadius}" fill="none" stroke="${ringStroke}" stroke-width="${palette.ringStrokeWidth}"/>`,
      `  <circle cx="${cx}" cy="${cy}" r="${ringRadius}" fill="none" stroke="url(#${input.id}-rim-grad)" stroke-width="1.4"/>`,
    ];

    const body = [
      `  <circle cx="${cx}" cy="${cy}" r="${bodyRadius}" fill="url(#${input.id}-body-grad)"/>`,
    ];

    const centerGloss = [
      `  <ellipse cx="${cx - bodyRadius * 0.2}" cy="${cy - bodyRadius * 0.24}" rx="${bodyRadius * 0.55}" ry="${bodyRadius * 0.36}" fill="#7e8aa2" fill-opacity="${on ? 0.08 : 0.03}"/>`,
    ];

    const indicator = [
      `  <path d="M ${cx + bodyRadius * 0.12} ${cy - bodyRadius * 0.72} L ${cx + bodyRadius * 0.48} ${cy - bodyRadius * 0.34}" stroke="${on ? palette.indicatorStrokeOn : palette.indicatorStrokeOff}" stroke-opacity="${on ? 0.86 : 0.48}" stroke-width="2" stroke-linecap="round"/>`,
    ];

    const variantLayer = this.buildVariantLayer(variant, cx, cy, bodyRadius, on);

    const ariaLabel = `Knob button ${variant} ${on ? "on" : "off"}`;

    const svg = [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${input.width}" height="${input.height}" viewBox="${input.x} ${input.y} ${input.width} ${input.height}" role="img" aria-label="${ariaLabel}">`,
      `  <title>${ariaLabel}</title>`,
      ...defs,
      ...rings,
      ...body,
      ...variantLayer,
      ...centerGloss,
      ...indicator,
      `</svg>`,
    ].join("\n");

    return Object.freeze({ on, variant, svg });
  }

  private buildVariantLayer(
    variant: KnobVariant,
    cx: number,
    cy: number,
    bodyRadius: number,
    on: boolean,
  ): string[] {
    if (variant === "glossy") {
      return [
        `  <ellipse cx="${cx - bodyRadius * 0.24}" cy="${cy - bodyRadius * 0.22}" rx="${bodyRadius * 0.62}" ry="${bodyRadius * 0.42}" fill="#f5f8ff" fill-opacity="${on ? 0.1 : 0.04}"/>`,
      ];
    }

    if (variant === "ribbed") {
      const lines: string[] = [];
      for (let i = -4; i <= 4; i += 1) {
        const x = cx + (i * bodyRadius) / 10;
        lines.push(
          `  <line x1="${x}" y1="${cy - bodyRadius * 0.82}" x2="${x}" y2="${cy + bodyRadius * 0.82}" stroke="#9ca7be" stroke-opacity="${on ? 0.1 : 0.06}" stroke-width="0.8"/>`,
        );
      }
      return lines;
    }

    if (variant === "beveled") {
      return [
        `  <circle cx="${cx}" cy="${cy}" r="${bodyRadius * 0.78}" fill="none" stroke="#d8e1f0" stroke-opacity="${on ? 0.2 : 0.1}" stroke-width="1.2"/>`,
        `  <circle cx="${cx}" cy="${cy}" r="${bodyRadius * 0.52}" fill="none" stroke="#0f1624" stroke-opacity="0.8" stroke-width="1"/>`,
      ];
    }

    return [
      `  <circle cx="${cx}" cy="${cy}" r="${bodyRadius * 0.68}" fill="#090d17" fill-opacity="0.24"/>`,
    ];
  }

  private validateInput(input: ICreateKnobButtonSvgInput): void {
    if (input.id.trim().length === 0) {
      throw new Error("Knob button id must not be empty.");
    }

    if (!Number.isFinite(input.width) || input.width <= 0) {
      throw new Error("Knob button width must be greater than zero.");
    }

    if (!Number.isFinite(input.height) || input.height <= 0) {
      throw new Error("Knob button height must be greater than zero.");
    }

    if (!Number.isFinite(input.x) || !Number.isFinite(input.y)) {
      throw new Error("Knob button origin must be finite.");
    }
  }
}
