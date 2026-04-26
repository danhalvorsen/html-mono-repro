import { LitElement, html, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

import { NavigationEvents } from "../../infrastructure/NavigationEvents.js";
import { Style } from "../../infrastructure/Style.js";

export interface NavMenuItemSelectedDetail {
  readonly view: string;
}

@customElement("nav-menu-item")
export class NavMenuItem extends LitElement {
  public static readonly styles = Style.navMenuItem;

  @property({ type: String, attribute: "view-id" })
  public viewId = "";

  @property({ type: Boolean, reflect: true })
  public selected = false;

  @property({ attribute: false })
  public template: TemplateResult = html``;

  private readonly handleClick = (): void => {
    this.dispatchEvent(
      new CustomEvent<NavMenuItemSelectedDetail>(NavigationEvents.ViewChange, {
        detail: { view: this.viewId },
        bubbles: true,
        composed: true,
      }),
    );
  };

  public render() {
    return html`
      <button
        class=${this.selected ? "active" : ""}
        type="button"
        @click=${this.handleClick}
      >
        ${this.template}
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "nav-menu-item": NavMenuItem;
  }
}
