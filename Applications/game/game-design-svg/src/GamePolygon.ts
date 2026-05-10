
import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ISvgTemplate } from '@monorepo/game-assets-shapes';

@customElement('game-polygon')
export class GamePolygon extends LitElement {
  @property({ type: Number })
  public width = 300;

  @property({ type: Number })
  public height = 150;

  @property({ attribute: false })
  public polygon: ISvgTemplate | null = null;

  protected override render(): TemplateResult {
    return html`
      <svg
        width=${this.width}
        height=${this.height}
        viewBox=${`0 0 ${this.width} ${this.height}`}
        aria-hidden="true"
      >
        ${this.polygon?.svg ?? null}
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'game-polygon': GamePolygon;
  }
}
