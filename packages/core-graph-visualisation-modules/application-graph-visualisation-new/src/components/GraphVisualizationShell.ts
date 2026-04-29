import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("graph-visualization-shell")
export class GraphVisualizationShell extends LitElement {
  @property({ type: String })
  eyebrow = "MonoRepro";

  @property({ type: String })
  heading = "DAG Visualisation Demo";

  @property({ type: String })
  lede = "The app composes DagGraph from @monorepo/core-graph with the Lit 3 visualisation library through explicit contracts and Reactive Controllers.";

  override render() {
    return html`
      <section class="shell">
        <header class="masthead">
          <p class="eyebrow">${this.eyebrow}</p>
          <h1>${this.heading}</h1>
          <p class="lede">${this.lede}</p>
          <slot name="toolbar"></slot>
        </header>

        <slot name="workspace"></slot>
        <slot name="statusbar"></slot>
      </section>
    `;
  }

  static override styles = css`
    :host {
      display: block;
      min-height: 100svh;
      color: #11243d;
      background:
        radial-gradient(circle at top, rgba(210, 227, 243, 0.9), transparent 38%),
        linear-gradient(180deg, #edf3f8 0%, #dbe6ef 100%);
      font-family: "Segoe UI", sans-serif;
    }

    .shell {
      width: calc(100vw - 8px);
      max-width: none;
      margin: 0 auto;
      padding: 8px 0 10px;
      min-height: 100svh;
      display: grid;
      grid-template-rows: auto 1fr auto;
      gap: 8px;
    }

    .masthead {
      margin-bottom: 0;
      padding: 8px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.6);
      border: 1px solid rgba(76, 107, 143, 0.2);
      backdrop-filter: blur(8px);
    }

    .eyebrow {
      margin: 0 0 2px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #4c6b8f;
    }

    h1 {
      margin: 0;
      font-size: clamp(1.5rem, 2.4vw, 2.4rem);
      line-height: 1.05;
    }

    .lede {
      max-width: 72rem;
      margin: 6px 0 0;
      font-size: 0.92rem;
      color: #2d4969;
    }

    @media (max-width: 900px) {
      .shell {
        width: calc(100vw - 6px);
        padding: 8px 0 10px;
      }

      .masthead {
        padding: 8px;
      }

      .lede {
        display: none;
      }
    }
  `;
}
