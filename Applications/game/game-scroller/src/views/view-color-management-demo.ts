import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import "../ColorManagement/ColorManagement.js";
import "@monorepo/game-objects";

@customElement("view-color-management-demo")
export class ViewColorManagementDemo extends LitElement {
  protected override render() {
    return html`
      <color-management preset="aurora">
        <vector-field-game-object
          .positionX=${750}
          .positionY=${150}
        ></vector-field-game-object>
      </color-management>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "view-color-management-demo": ViewColorManagementDemo;
  }
}