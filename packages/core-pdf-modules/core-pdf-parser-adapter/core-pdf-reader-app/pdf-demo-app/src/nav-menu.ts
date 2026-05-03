// packages/core-pdf-reader-app/pdf-demo-app/src/nav-menu.ts

import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("nav-menu")
export class NavMenu extends LitElement {
  public static readonly styles = css`
    nav {
      margin-bottom: 1.5rem;
    }

    a {
      margin-right: 1rem;
    }
  `;

  protected override render() {
    return html`
      <nav>
        <a href="/index.html">Home</a>
        <a href="/pdf-viewer.html">PDF Viewer</a>
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "nav-menu": NavMenu;
  }
}