import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

import type { IComposite } from "@monorepo/core-composition-abstract-new";

@customElement("anchor-inspector")
export class AnchorInspector extends LitElement {
  static styles = css`
    .anchor {
      font-size: 12px;
      margin: 4px 0;
    }
  `;

  @property({ attribute: false })
  scene!: IComposite;

  render() {
    return html`
      <h4>Anchors</h4>
      <div class="anchor">rectangle.Top.Midpoint</div>
      <div class="anchor">rectangle.Center.Midpoint</div>
      <div class="anchor">parent.Right.Midpoint</div>
    `;
  }
}
