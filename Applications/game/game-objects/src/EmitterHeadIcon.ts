import { css, html, LitElement, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("emitter-head-icon")
export class EmitterHeadIcon extends LitElement {
  public static override styles = css`
    :host {
      position: absolute;
      display: block;
      width: 0;
      height: 0;
      pointer-events: none;
      contain: layout paint;
      z-index: 10;
    }

    .icon {
      position: absolute;
      left: 0;
      top: 0;
      transform: translate(-50%, -50%);
      overflow: visible;
    }
  `;

  @property({ type: Number })
  public x = 0;

  @property({ type: Number })
  public y = 0;

  @property({ type: Number })
  public size = 18;

  @property({ type: String })
  public fill = "#f59e0b";

  @property({ type: String })
  public stroke = "#111827";

  @property({ type: Number })
  public strokeWidth = 2;

  protected override updated(): void {
    this.style.left = `${this.x}px`;
    this.style.top = `${this.y}px`;
  }

  protected override render(): TemplateResult {
    const size = this.normalizePositiveFinite(this.size, 18);
    const half = size / 2;
    const center = half;

    return html`
      <svg
        class="icon"
        width=${size}
        height=${size}
        viewBox="0 0 ${size} ${size}"
        aria-hidden="true"
      >
        <circle
          cx=${center}
          cy=${center}
          r=${Math.max(1, half - this.strokeWidth)}
          fill=${this.fill}
          stroke=${this.stroke}
          stroke-width=${this.strokeWidth}
        ></circle>
        <line
          x1=${center}
          y1=${0}
          x2=${center}
          y2=${size}
          stroke=${this.stroke}
          stroke-width=${this.strokeWidth}
        ></line>
        <line
          x1=${0}
          y1=${center}
          x2=${size}
          y2=${center}
          stroke=${this.stroke}
          stroke-width=${this.strokeWidth}
        ></line>
      </svg>
    `;
  }

  private normalizePositiveFinite(value: number, fallback: number): number {
    if (!Number.isFinite(value) || value <= 0) {
      return fallback;
    }

    return value;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "emitter-head-icon": EmitterHeadIcon;
  }
}