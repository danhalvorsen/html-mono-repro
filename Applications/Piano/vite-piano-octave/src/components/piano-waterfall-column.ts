import { LitElement, css, html, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("column-wc")
export class ColumnWc extends LitElement {
  public static override styles = css`
    :host {
      display: block;
      height: 100%;
      box-sizing: border-box;
    }

    svg {
      display: block;
      width: 100%;
      height: 100%;
    }
  `;

  @property({ type: Number })
  public index = 0;

  protected override render(): TemplateResult {
    const isBlackColumn = this.isBlackColumn(this.index);
    const fill = isBlackColumn
      ? "rgba(30, 34, 46, 0.55)"
      : "rgba(255, 255, 255, 0.02)";
    const stroke = "rgba(200,210,230,0.12)";

    return html`
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <rect x="0" y="0" width="100" height="100" fill=${fill}></rect>
        <line
          x1="100"
          y1="0"
          x2="100"
          y2="100"
          stroke=${stroke}
          stroke-width="1"
          vector-effect="non-scaling-stroke"
        ></line>
      </svg>
    `;
  }

  private isBlackColumn(index: number): boolean {
    const normalized = ((index % 12) + 12) % 12;
    return normalized === 1 || normalized === 3 || normalized === 6 || normalized === 8 || normalized === 10;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "column-wc": ColumnWc;
  }
}
