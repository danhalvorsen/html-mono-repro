import { LitElement, css, html, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("falling-note-wc")
export class FallingNoteWc extends LitElement {
  public static override styles = css`
    :host {
      position: absolute;
      display: block;
      border-radius: 4px;
      box-sizing: border-box;
      box-shadow: inset 0 0 0 1px rgba(19, 32, 56, 0.45);
      background: #f59e0b;
      pointer-events: none;
    }
  `;

  @property({ type: Number })
  public leftPercent = 0;

  @property({ type: Number })
  public widthPercent = 0;

  @property({ type: Number })
  public topPx = 0;

  @property({ type: Number })
  public heightPx = 10;

  protected override render(): TemplateResult {
    const safeLeftPercent = Math.max(0, Math.min(100, this.leftPercent));
    const safeWidthPercent = Math.max(0, this.widthPercent);
    const safeTopPx = Math.max(0, this.topPx);
    const safeHeightPx = Math.max(1, this.heightPx);

    this.style.left = `calc(${safeLeftPercent}% + 1px)`;
    this.style.width = `max(0px, calc(${safeWidthPercent}% - 2px))`;
    this.style.top = `${safeTopPx}px`;
    this.style.height = `${safeHeightPx}px`;

    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "falling-note-wc": FallingNoteWc;
  }
}

