import { html, type TemplateResult } from "lit";
import { BaseGameObjectShapeTemplate } from '@monorepo/game-objects';

export class ColorMangmentPreviewShapeTemplate extends BaseGameObjectShapeTemplate {
  public override render(): TemplateResult {
    return html`
      <svg width="180" height="120" viewBox="-90 -60 180 120" role="img" aria-label="Color management preview object">
        <defs>
          <linearGradient id="color-mangment-preview-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="var(--color-mangment-gradient-0, #38bdf8)"></stop>
            <stop offset="52%" stop-color="var(--color-mangment-gradient-1, #a78bfa)"></stop>
            <stop offset="100%" stop-color="var(--color-mangment-gradient-2, #f97316)"></stop>
          </linearGradient>
        </defs>

        <rect
          x="-78"
          y="-48"
          width="156"
          height="96"
          rx="18"
          fill="url(#color-mangment-preview-gradient)"
          stroke="var(--color-mangment-secondary, #ffffff)"
          stroke-width="4"
        ></rect>

        <circle
          cx="-38"
          cy="0"
          r="18"
          fill="var(--color-mangment-accent, #ffffff)"
          opacity="0.95"
        ></circle>

        <path
          d="M -8 24 C 16 -28 42 -28 66 24"
          fill="none"
          stroke="var(--color-mangment-primary, #ffffff)"
          stroke-width="8"
          stroke-linecap="round"
        ></path>
      </svg>
    `;
  }
}