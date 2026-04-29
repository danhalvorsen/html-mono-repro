import { LitElement, html, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

import { NavigationEvents } from "../../infrastructure/NavigationEvents.js";
import { Style } from "../../infrastructure/Style.js";

export interface NavMenuItemSelectedDetail {
  readonly view: string;
}

@customElement("nav-menu-item")
export class NavMenuItem extends LitElement {
  public static override readonly styles = Style.navMenuItem;

  @property({ type: String, attribute: "view-id" })
  public viewId = "";

  @property({ type: Boolean, reflect: true })
  public selected = false;

  @property({ attribute: false })
  public template: TemplateResult = html``;

  public override render(): TemplateResult {
    return html`
      <button
        type="button"
        class=${this.selected ? "active" : ""}
        aria-current=${this.selected ? "page" : "false"}
        @click=${this.handleClick}
      >
        ${this.template}
      </button>
    `;
  }

  private readonly handleClick = (): void => {
    const view = this.viewId.trim();

    if (view.length === 0) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent<NavMenuItemSelectedDetail>(NavigationEvents.ViewChange, {
        detail: { view },
        bubbles: true,
        composed: true,
      }),
    );
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "nav-menu-item": NavMenuItem;
  }
}
