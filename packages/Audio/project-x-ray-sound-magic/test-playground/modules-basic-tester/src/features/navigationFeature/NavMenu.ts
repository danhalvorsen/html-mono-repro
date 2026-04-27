import { LitElement, html, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

import { Style } from "../../infrastructure/Style.js";

@customElement("nav-menu")
export class NavMenu extends LitElement {
  public static override readonly styles = Style.navMenu;

  public override render(): TemplateResult {
    return html`
      <nav aria-label="Application views">
        <slot></slot>
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "nav-menu": NavMenu;
  }
}
