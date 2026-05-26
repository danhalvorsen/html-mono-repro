import { LitElement, css, html } from "lit";
import type { AstarStats } from "../contracts/AstarVisualizerContracts.js";
import { createIdleStats } from "../contracts/AstarVisualizerContracts.js";

export class AstarStatsElement extends LitElement {
  public static override readonly properties = {
    stats: { attribute: false },
  };

  public static override readonly styles = css`
    :host {
      display: block;
      font-family: ui-sans-serif, system-ui, sans-serif;
    }

    dl {
      display: grid;
      grid-template-columns: max-content max-content;
      gap: 0.25rem 0.75rem;
      margin: 0;
    }

    dt {
      font-weight: 700;
    }

    dd {
      margin: 0;
    }
  `;

  public declare stats: AstarStats;

  public constructor() {
    super();
    this.stats = createIdleStats();
  }

  protected override render() {
    return html`
      <dl aria-label="A star statistics">
        <dt>Status</dt>
        <dd>${this.stats.status}</dd>

        <dt>Evaluated</dt>
        <dd>${this.stats.evaluatedNodes}</dd>

        <dt>Open</dt>
        <dd>${this.stats.openSize}</dd>

        <dt>Closed</dt>
        <dd>${this.stats.closedSize}</dd>

        <dt>Path length</dt>
        <dd>${this.stats.pathLength ?? "-"}</dd>

        <dt>Elapsed</dt>
        <dd>${this.stats.elapsedMs} ms</dd>
      </dl>
    `;
  }
}

if (!customElements.get("astar-stats")) {
  customElements.define("astar-stats", AstarStatsElement);
}

declare global {
  interface HTMLElementTagNameMap {
    "astar-stats": AstarStatsElement;
  }
}
