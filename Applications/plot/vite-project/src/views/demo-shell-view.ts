import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { DEMO_SHELL_VIEW_STYLES } from "@monorepo/core-plot";

export class DemoShellView extends LitElement {
  public static override styles = [DEMO_SHELL_VIEW_STYLES];

  @property({ type: String })
  public currentRoute = "sprint-1";

  protected override render() {
    return html`
      <div class="app-shell">
        <header class="topbar">
          <div class="brand">
            <div class="eyebrow">Core Plot Demo Host</div>
            <div class="title">Multi-view Lit application for sprint deliveries</div>
          </div>
          <nav>
            <!-- TODO: Add Sprint 5 navigation link when Sprint 5 demo features are ready. -->
            <a href="#sprint-1" data-active=${String(this.currentRoute === "sprint-1")}>
              Sprint 1 Delivery
            </a>
            <a href="#sprint-2" data-active=${String(this.currentRoute === "sprint-2")}>
              Sprint 2 Delivery
            </a>
            <a href="#sprint-3" data-active=${String(this.currentRoute === "sprint-3")}>
              Sprint 3 Delivery
            </a>
            <a href="#sprint-3-1" data-active=${String(this.currentRoute === "sprint-3-1")}>
              Sprint 3.1 Delivery
            </a>
            <a href="#sprint-4" data-active=${String(this.currentRoute === "sprint-4")}>
              Sprint 4 Delivery
            </a>
          </nav>
        </header>

        <slot></slot>
      </div>
    `;
  }
}

customElements.define("demo-shell-view", DemoShellView);
