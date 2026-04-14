import { LitElement, html } from "lit";
import { state } from "lit/decorators.js";
import { CORE_PLOT_THEME } from "../../../../packages/core-plot/src/index.ts";

import "./views/sprint-one-view.ts";
import "./views/sprint-two-view.ts";

type DemoRoute = "sprint-1" | "sprint-2";

function readRoute(): DemoRoute {
  const hash = window.location.hash.replace(/^#/, "");
  return hash === "sprint-2" ? "sprint-2" : "sprint-1";
}

export class MyElement extends LitElement {
  @state()
  private currentRoute: DemoRoute = readRoute();

  public override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("hashchange", this.handleHashChange);
  }

  public override disconnectedCallback(): void {
    window.removeEventListener("hashchange", this.handleHashChange);
    super.disconnectedCallback();
  }

  protected override render() {
    return html`
      <style>
        :host {
          display: block;
          min-height: 100svh;
          color: #efe8d9;
          color: ${CORE_PLOT_THEME.colors.textPrimary};
          background:
            radial-gradient(circle at top, rgba(245, 159, 70, 0.18), transparent 26%),
            linear-gradient(180deg, #15161a 0%, #0f1012 100%);
        }

        .app-shell {
          max-width: 1240px;
          margin: 0 auto;
          padding: 28px 32px 40px;
          display: grid;
          gap: 24px;
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 14px 18px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(239, 232, 217, 0.1);
          backdrop-filter: blur(14px);
        }

        .brand {
          display: grid;
          gap: 4px;
        }

        .eyebrow {
          font: 12px/1.2 ${CORE_PLOT_THEME.typography.fontFamily.ui};
          text-transform: uppercase;
          letter-spacing: 0.24em;
          color: ${CORE_PLOT_THEME.colors.textAccent};
        }

        .title {
          font: 600 20px/1 ${CORE_PLOT_THEME.typography.fontFamily.ui};
          color: ${CORE_PLOT_THEME.colors.textPrimary};
        }

        nav {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        a {
          padding: 10px 14px;
          border-radius: 999px;
          text-decoration: none;
          font: 13px/1 "IBM Plex Mono", "Fira Code", monospace;
          color: ${CORE_PLOT_THEME.colors.textSecondary};
          border: 1px solid ${CORE_PLOT_THEME.colors.panelBorder};
          background: rgba(255, 255, 255, 0.03);
        }

        a[data-active="true"] {
          color: #16161a;
          background: ${CORE_PLOT_THEME.colors.routeActive};
          border-color: ${CORE_PLOT_THEME.colors.routeActiveBorder};
        }

        @media (max-width: 760px) {
          .topbar {
            align-items: start;
            flex-direction: column;
          }
        }
      </style>
      <div class="app-shell">
        <header class="topbar">
          <div class="brand">
            <div class="eyebrow">Core Plot Demo Host</div>
            <div class="title">Multi-view Lit application for sprint deliveries</div>
          </div>
          <nav>
            <a href="#sprint-1" data-active=${String(this.currentRoute === "sprint-1")}>
              Sprint 1 Delivery
            </a>
            <a href="#sprint-2" data-active=${String(this.currentRoute === "sprint-2")}>
              Sprint 2 Delivery
            </a>
          </nav>
        </header>

        ${this.currentRoute === "sprint-1"
          ? html`<sprint-one-view></sprint-one-view>`
          : html`<sprint-two-view></sprint-two-view>`}
      </div>
    `;
  }

  private readonly handleHashChange = (): void => {
    this.currentRoute = readRoute();
  };
}

customElements.define("my-element", MyElement);
