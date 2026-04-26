// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/styleFeature/StyleWebComponent.ts

import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

export type StyleWebComponentVariant = "app-shell" | "nav-stack";

@customElement("style-web-component")
export class StyleWebComponent extends LitElement {
  @property({ type: String, reflect: true })
  public variant: StyleWebComponentVariant = "app-shell";

  public render() {
    if (this.variant === "nav-stack") {
      return html`
        <div class="nav-stack">
          <slot></slot>
        </div>
      `;
    }

    return html`
      <section class="app-shell">
        <aside class="navigation-column">
          <slot name="navigation"></slot>
        </aside>

        <main class="view-column">
          <slot name="view"></slot>
        </main>
      </section>
    `;
  }

  public static readonly styles = css`
    :host {
      display: block;
      width: 100%;
      min-height: 100svh;
    }

    .app-shell {
      display: grid;
      grid-template-columns: 15% 85%;
      width: 100%;
      min-height: 100svh;
    }

    .navigation-column {
      box-sizing: border-box;
      padding: 1rem;
      border-right: 1px solid #d7d7d7;
      background: #f7f7f9;
    }

    .view-column {
      box-sizing: border-box;
      min-width: 0;
      padding: 2rem;
      background: #ffffff;
      color: #222222;
    }

    .nav-stack {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 0.75rem;
      width: 100%;
    }

    ::slotted(nav-menu) {
      display: block;
      width: 100%;
    }

    ::slotted(nav-menu-item) {
      display: block;
      width: 100%;
    }

    ::slotted([slot="view"]) {
      display: block;
      min-width: 0;
    }

    @media (prefers-color-scheme: dark) {
      .navigation-column {
        border-right-color: #343743;
        background: #1c1e26;
      }

      .view-column {
        background: #22242c;
        color: #ffffff;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "style-web-component": StyleWebComponent;
  }
}