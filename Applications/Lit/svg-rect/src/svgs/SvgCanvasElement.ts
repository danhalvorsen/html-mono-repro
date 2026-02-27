import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("svg-canvas")
export class SvgCanvasElement extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 400px;
      overflow: hidden;
    }

    .layout {
      display: flex;
      align-items: stretch;
      width: 100%;
      height: 100%;
    }

    svg-rectangle {
      display: block;
      flex: 1 1 auto;
      min-width: 0;
    }

    ::slotted(mr-panel) {
      flex: 0 0 auto;
      height: 100%;
      z-index: 1;
    }
  `;

  render() {
    return html`
      <div class="layout">
        <slot></slot>
        <svg-rectangle></svg-rectangle>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "svg-canvas": SvgCanvasElement;
  }
}
