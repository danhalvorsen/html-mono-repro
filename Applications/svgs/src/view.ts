import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

import type { IComposite } from "@monorepo/core-composition-abstract-new";
import { SvgTreeWalker } from "../src/traversal/SvgTreeWalker.js";

@customElement("svgs-view")
export class SvgsView extends LitElement {
  static styles = css`
    svg {
      width: 100%;
      height: 100%;
      background: #111;
    }
  `;

  @property({ attribute: false })
  scene!: IComposite;

  firstUpdated() {
    const svg = this.renderRoot.querySelector("svg")!;
    const walker = new SvgTreeWalker();
    walker.walk(this.scene, svg as any);
  }

  render() {
    return html`
      <svg viewBox="0 0 800 600">
        <g id="root"></g>
      </svg>
    `;
  }
}
