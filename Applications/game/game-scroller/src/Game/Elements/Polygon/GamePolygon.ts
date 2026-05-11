import { LitElement, css, html, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { ISvgTemplate } from "@monorepo/game-design-svg";

@customElement("game-polygon")
export class GamePolygonElement extends LitElement {
  public static override styles = css`
    :host {
      display: block;
    }

    svg {
      display: block;
    }
  `;

  @property({ type: Number })
  public width = 300;

  @property({ type: Number })
  public height = 150;

  @property({ attribute: false })
  public polygon: ISvgTemplate | null | undefined;

  protected override render(): TemplateResult {
    return html`
      <svg
        width=${this.width}
        height=${this.height}
        viewBox=${`0 0 ${this.width} ${this.height}`}
        preserveAspectRatio="none"
      >
        ${this.polygon?.svg ?? null}
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "game-polygon": GamePolygonElement;
  }
}
