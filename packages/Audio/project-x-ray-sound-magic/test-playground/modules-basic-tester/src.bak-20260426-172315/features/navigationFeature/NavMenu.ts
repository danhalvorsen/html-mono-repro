// src/features/navigationFeature/NavMenu.ts

import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

import { Style } from "../../infrastructure/Style";

@customElement("nav-menu")
export class NavMenu extends LitElement {
  public static readonly styles = Style.navMenu;

  public render() {
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