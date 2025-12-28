import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

import type { Constraint } from "@monorepo/core-composition-abstract-new";

@customElement("constraint-inspector")
export class ConstraintInspector extends LitElement {
  static styles = css`
    .constraint {
      font-size: 12px;
      padding: 4px;
      background: #333;
      margin-bottom: 4px;
      border-radius: 4px;
    }
  `;

  @property({ attribute: false })
  scene!: unknown;

  render() {
    return html`
      <h4>Constraints</h4>
      <div class="constraint">
        connect rectangle.Top.Midpoint → parent.Right.Midpoint
      </div>
    `;
  }
}
