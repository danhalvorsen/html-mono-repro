// src/home-view.ts

import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("home-view")
export class HomeView extends LitElement {
  public static readonly styles = css`
    :host {
      display: block;
      padding: 2rem;
    }
  `;

  protected override render() {
    return html`
      <section>
        <h1>Home</h1>
        <p>Welcome to the Home view.</p>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "home-view": HomeView;
  }
}